package hu.eventhub.infrastructure.notification;

import hu.eventhub.application.port.out.EmailNotificationPort;
import hu.eventhub.domain.exception.EmailDeliveryException;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.Ticket;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Outbound infrastructure adapter for external e-mail confirmation delivery.
 * Supports SMTP delivery (e.g. Mailpit in development), bilingual templates (EN default / HU),
 * and simulated resilience testing.
 */
@Component
public class SmtpEmailNotificationAdapter implements EmailNotificationPort {
    private static final Logger log = LoggerFactory.getLogger(SmtpEmailNotificationAdapter.class);

    private static final DateTimeFormatter DATE_FORMATTER_HU = DateTimeFormatter
            .ofPattern("yyyy. MMMM d., HH:mm", Locale.forLanguageTag("hu"))
            .withZone(ZoneId.of("Europe/Budapest"));

    private static final DateTimeFormatter DATE_FORMATTER_EN = DateTimeFormatter
            .ofPattern("MMMM d, yyyy, HH:mm", Locale.ENGLISH)
            .withZone(ZoneId.of("Europe/Budapest"));

    public record SentEmailRecord(
            String recipientEmail,
            String recipientName,
            String ticketCode,
            String eventTitle,
            String tierName,
            Instant sentAt,
            String locale
    ) {
        public SentEmailRecord(
                String recipientEmail,
                String recipientName,
                String ticketCode,
                String eventTitle,
                String tierName,
                Instant sentAt
        ) {
            this(recipientEmail, recipientName, ticketCode, eventTitle, tierName, sentAt, "en");
        }
    }

    private final List<SentEmailRecord> sentEmails = new CopyOnWriteArrayList<>();
    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final boolean emailEnabled;
    private volatile boolean simulateProviderOutage = false;

    public SmtpEmailNotificationAdapter() {
        this(null, "noreply@eventhub.hu", true);
    }

    public SmtpEmailNotificationAdapter(JavaMailSender mailSender) {
        this(mailSender, "noreply@eventhub.hu", true);
    }

    @Autowired
    public SmtpEmailNotificationAdapter(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${eventhub.mail.from:noreply@eventhub.hu}") String fromEmail,
            @Value("${eventhub.mail.enabled:true}") boolean emailEnabled
    ) {
        this.mailSender = mailSender;
        this.fromEmail = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "noreply@eventhub.hu";
        this.emailEnabled = emailEnabled;
    }

    @Override
    public void sendTicketConfirmation(Ticket ticket, Event event) {
        sendTicketConfirmation(ticket, event, "en");
    }

    @Override
    public void sendTicketConfirmation(Ticket ticket, Event event, String locale) {
        String normalizedLocale = (locale != null && locale.trim().toLowerCase().startsWith("hu")) ? "hu" : "en";
        String email = ticket.getParticipantEmail().toLowerCase();

        if (simulateProviderOutage
                || email.endsWith("@fail-email.test")
                || email.endsWith("@error.test")
                || email.endsWith("@smtp-down.io")) {
            throw new EmailDeliveryException(
                    "External Email Gateway Error (503 Service Unavailable): Failed to deliver ticket confirmation to "
                            + ticket.getParticipantEmail()
            );
        }

        if (mailSender != null && emailEnabled) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                helper.setFrom(fromEmail, "EventHub");
                helper.setTo(ticket.getParticipantEmail());

                String subject = buildSubject(ticket, event, normalizedLocale);
                helper.setSubject(subject);

                String htmlContent = buildHtmlContent(ticket, event, normalizedLocale);
                String plainTextContent = buildPlainTextContent(ticket, event, normalizedLocale);
                helper.setText(plainTextContent, htmlContent);

                mailSender.send(mimeMessage);
                log.info("[SMTP-EMAIL] Successfully dispatched confirmation email ({}) to {} via SMTP",
                        normalizedLocale, ticket.getParticipantEmail());
            } catch (Exception ex) {
                log.error("[SMTP-EMAIL-ERROR] Failed to send email via SMTP to {}: {}", ticket.getParticipantEmail(), ex.getMessage(), ex);
                throw new EmailDeliveryException(
                        "External Email Gateway Error: Failed to dispatch SMTP message to " + ticket.getParticipantEmail() + ": " + ex.getMessage(),
                        ex
                );
            }
        }

        SentEmailRecord record = new SentEmailRecord(
                ticket.getParticipantEmail(),
                ticket.getParticipantName(),
                ticket.getTicketCode().value(),
                event.getTitle(),
                ticket.getTicketTypeName(),
                Instant.now(),
                normalizedLocale
        );
        sentEmails.add(record);

        log.info("[EXTERNAL-EMAIL-GATEWAY] Delivered ticket confirmation ({}) to {} | Code: {} | Event: {} ({})",
                normalizedLocale,
                ticket.getParticipantEmail(),
                ticket.getTicketCode().value(),
                event.getTitle(),
                ticket.getTicketTypeName());
    }

    private String buildSubject(Ticket ticket, Event event, String locale) {
        if ("hu".equalsIgnoreCase(locale)) {
            return "Jegy-visszaigazolás: " + event.getTitle() + " [" + ticket.getTicketCode().value() + "]";
        }
        return "Ticket Confirmation: " + event.getTitle() + " [" + ticket.getTicketCode().value() + "]";
    }

    private String buildHtmlContent(Ticket ticket, Event event, String locale) {
        boolean isHu = "hu".equalsIgnoreCase(locale);
        DateTimeFormatter formatter = isHu ? DATE_FORMATTER_HU : DATE_FORMATTER_EN;
        String formattedDate = formatter.format(event.getDate());
        String venueInfo = String.format("%s (%s)", event.getVenue().name(), event.getVenue().address());
        String priceFormatted = ticket.getPrice().amount().toPlainString() + " " + ticket.getPrice().currency();

        if (isHu) {
            return """
                    <!DOCTYPE html>
                    <html lang="hu">
                    <head>
                        <meta charset="UTF-8">
                        <title>Jegy-visszaigazolás</title>
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                            <div style="background: linear-gradient(135deg, #0f172a 0%%, #1e293b 100%%); padding: 32px 24px; text-align: center; color: #ffffff;">
                                <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">EventHub</h1>
                                <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Sikeres Jegyfoglalás</p>
                            </div>
                            <div style="padding: 32px 24px;">
                                <p style="margin: 0 0 16px 0; font-size: 16px;">Kedves <strong>%s</strong>!</p>
                                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                                    Köszönjük a foglalásodat! A jegyed sikeresen kiállításra került. Kérjük, őrizd meg ezt a levelet vagy a benne szereplő jegykódot a rendezvényre való belépéshez.
                                </p>
                                <div style="background-color: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1; padding: 20px; margin-bottom: 24px;">
                                    <table style="width: 100%%; border-collapse: collapse; font-size: 14px;">
                                        <tr>
                                            <td style="padding: 6px 0; color: #64748b; width: 120px;">Esemény:</td>
                                            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 6px 0; color: #64748b;">Időpont:</td>
                                            <td style="padding: 6px 0; font-weight: 500; color: #334155;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 6px 0; color: #64748b;">Helyszín:</td>
                                            <td style="padding: 6px 0; font-weight: 500; color: #334155;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 6px 0; color: #64748b;">Jegytípus:</td>
                                            <td style="padding: 6px 0; font-weight: 500; color: #334155;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 6px 0; color: #64748b;">Ár:</td>
                                            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">%s</td>
                                        </tr>
                                    </table>
                                </div>
                                <div style="text-align: center; margin: 24px 0; padding: 18px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Egyedi Belépőkód</div>
                                    <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 22px; font-weight: 700; color: #2563eb; letter-spacing: 2px;">%s</div>
                                </div>
                                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                    💡 <em>Tipp: Ha regisztrálsz vagy bejelentkezel a <strong>%s</strong> e-mail címeddel az EventHub weboldalán, a jegyed automatikusan megjelenik a Saját Jegyek menüpontban is!</em>
                                </p>
                            </div>
                            <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                                EventHub Rendszer &bull; Automatikusan generált értesítés
                            </div>
                        </div>
                    </body>
                    </html>
                    """.formatted(
                    escapeHtml(ticket.getParticipantName()),
                    escapeHtml(event.getTitle()),
                    escapeHtml(formattedDate),
                    escapeHtml(venueInfo),
                    escapeHtml(ticket.getTicketTypeName()),
                    escapeHtml(priceFormatted),
                    escapeHtml(ticket.getTicketCode().value()),
                    escapeHtml(ticket.getParticipantEmail())
            );
        }

        // Default: English template
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Ticket Confirmation</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                        <div style="background: linear-gradient(135deg, #0f172a 0%%, #1e293b 100%%); padding: 32px 24px; text-align: center; color: #ffffff;">
                            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">EventHub</h1>
                            <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Booking Confirmed</p>
                        </div>
                        <div style="padding: 32px 24px;">
                            <p style="margin: 0 0 16px 0; font-size: 16px;">Dear <strong>%s</strong>,</p>
                            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                                Thank you for your booking! Your ticket has been successfully issued. Please keep this email or your unique passcode below for entry to the event.
                            </p>
                            <div style="background-color: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1; padding: 20px; margin-bottom: 24px;">
                                <table style="width: 100%%; border-collapse: collapse; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748b; width: 120px;">Event:</td>
                                        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">%s</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748b;">Date & Time:</td>
                                        <td style="padding: 6px 0; font-weight: 500; color: #334155;">%s</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748b;">Venue:</td>
                                        <td style="padding: 6px 0; font-weight: 500; color: #334155;">%s</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748b;">Ticket Type:</td>
                                        <td style="padding: 6px 0; font-weight: 500; color: #334155;">%s</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748b;">Price:</td>
                                        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">%s</td>
                                    </tr>
                                </table>
                            </div>
                            <div style="text-align: center; margin: 24px 0; padding: 18px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Unique Passcode</div>
                                <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 22px; font-weight: 700; color: #2563eb; letter-spacing: 2px;">%s</div>
                            </div>
                            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                💡 <em>Tip: If you sign up or log in with your email (<strong>%s</strong>) on EventHub, your tickets will automatically show up under My Tickets!</em>
                            </p>
                        </div>
                        <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                            EventHub System &bull; Automated notification
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                escapeHtml(ticket.getParticipantName()),
                escapeHtml(event.getTitle()),
                escapeHtml(formattedDate),
                escapeHtml(venueInfo),
                escapeHtml(ticket.getTicketTypeName()),
                escapeHtml(priceFormatted),
                escapeHtml(ticket.getTicketCode().value()),
                escapeHtml(ticket.getParticipantEmail())
        );
    }

    private String buildPlainTextContent(Ticket ticket, Event event, String locale) {
        boolean isHu = "hu".equalsIgnoreCase(locale);
        DateTimeFormatter formatter = isHu ? DATE_FORMATTER_HU : DATE_FORMATTER_EN;
        String formattedDate = formatter.format(event.getDate());
        String venueInfo = String.format("%s (%s)", event.getVenue().name(), event.getVenue().address());
        String priceFormatted = ticket.getPrice().amount().toPlainString() + " " + ticket.getPrice().currency();

        if (isHu) {
            return String.format("""
                    Kedves %s!

                    Köszönjük a foglalásodat! A jegyed sikeresen kiállításra került.

                    Esemény: %s
                    Időpont: %s
                    Helyszín: %s
                    Jegytípus: %s
                    Ár: %s
                    Belépőkód: %s

                    Kérjük, érkezéskor mutasd fel a fenti jegykódot a belépéshez.
                    Ha regisztrálsz ugyanezzel az e-mail címmel (%s), a jegyed a weboldalon a Saját Jegyek menüpontban is megjelenik.

                    Üdvözlettel,
                    EventHub Csapat
                    """,
                    ticket.getParticipantName(),
                    event.getTitle(),
                    formattedDate,
                    venueInfo,
                    ticket.getTicketTypeName(),
                    priceFormatted,
                    ticket.getTicketCode().value(),
                    ticket.getParticipantEmail()
            );
        }

        return String.format("""
                Dear %s,

                Thank you for your booking! Your ticket has been successfully issued.

                Event: %s
                Date & Time: %s
                Venue: %s
                Ticket Type: %s
                Price: %s
                Passcode: %s

                Please present this passcode at the entrance upon arrival.
                If you sign up or log in with this email address (%s), your tickets will automatically appear under My Tickets on EventHub.

                Best regards,
                EventHub Team
                """,
                ticket.getParticipantName(),
                event.getTitle(),
                formattedDate,
                venueInfo,
                ticket.getTicketTypeName(),
                priceFormatted,
                ticket.getTicketCode().value(),
                ticket.getParticipantEmail()
        );
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    public void setSimulateProviderOutage(boolean simulateProviderOutage) {
        this.simulateProviderOutage = simulateProviderOutage;
    }

    public List<SentEmailRecord> getSentEmails() {
        return Collections.unmodifiableList(sentEmails);
    }

    public void clearSentEmails() {
        sentEmails.clear();
    }
}
