package hu.eventhub.infrastructure.notification;

import hu.eventhub.domain.exception.EmailDeliveryException;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Money;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketCode;
import hu.eventhub.domain.model.TicketId;
import hu.eventhub.domain.model.Venue;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.Instant;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SmtpEmailNotificationAdapterTest {

    private JavaMailSender mailSender;
    private Event sampleEvent;
    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));

        sampleEvent = new Event(
                EventId.of("evt-spring-boot-2026"),
                "Spring Boot Masterclass",
                "Deep dive into modern microservices and clean architecture.",
                Instant.parse("2026-11-20T09:00:00Z"),
                Venue.of("ven-akvarium", "Akvárium Klub", "Budapest, Erzsébet tér 12.", 500),
                10,
                Money.of(15000, "HUF"),
                "TECHNOLOGY",
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
        );

        sampleTicket = new Ticket(
                TicketId.of("tck-test-101"),
                sampleEvent.getId(),
                "evt-spring-boot-2026-vip",
                "VIP Ticket",
                "Kiss János",
                "janos.kiss@example.com",
                TicketCode.of("EVT-2026-ABCD"),
                Money.of(22500, "HUF"),
                Instant.now(),
                hu.eventhub.domain.model.TicketStatus.VALID,
                hu.eventhub.domain.model.EmailDeliveryStatus.SENT
        );
    }

    @Test
    @DisplayName("Should format and send default English HTML email via JavaMailSender and record it")
    void shouldSendEnglishEmailByDefaultViaJavaMailSender() throws Exception {
        SmtpEmailNotificationAdapter adapter = new SmtpEmailNotificationAdapter(
                mailSender,
                "noreply@eventhub.hu",
                true
        );

        adapter.sendTicketConfirmation(sampleTicket, sampleEvent);

        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());
        MimeMessage sentMessage = messageCaptor.getValue();
        assertEquals("Ticket Confirmation: Spring Boot Masterclass [EVT-2026-ABCD]", sentMessage.getSubject());

        assertEquals(1, adapter.getSentEmails().size());
        SmtpEmailNotificationAdapter.SentEmailRecord record = adapter.getSentEmails().get(0);
        assertEquals("janos.kiss@example.com", record.recipientEmail());
        assertEquals("Kiss János", record.recipientName());
        assertEquals("EVT-2026-ABCD", record.ticketCode());
        assertEquals("Spring Boot Masterclass", record.eventTitle());
        assertEquals("VIP Ticket", record.tierName());
        assertEquals("en", record.locale());
    }

    @Test
    @DisplayName("Should format and send Hungarian HTML email when 'hu' locale is requested")
    void shouldSendHungarianEmailWhenHuLocaleRequested() throws Exception {
        SmtpEmailNotificationAdapter adapter = new SmtpEmailNotificationAdapter(
                mailSender,
                "noreply@eventhub.hu",
                true
        );

        adapter.sendTicketConfirmation(sampleTicket, sampleEvent, "hu");

        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());
        MimeMessage sentMessage = messageCaptor.getValue();
        assertEquals("Jegy-visszaigazolás: Spring Boot Masterclass [EVT-2026-ABCD]", sentMessage.getSubject());

        assertEquals(1, adapter.getSentEmails().size());
        assertEquals("hu", adapter.getSentEmails().get(0).locale());
    }

    @Test
    @DisplayName("Should throw EmailDeliveryException when JavaMailSender fails")
    void shouldThrowEmailDeliveryExceptionWhenSmtpFails() {
        doThrow(new MailSendException("SMTP connection refused: connection timed out"))
                .when(mailSender).send(any(MimeMessage.class));

        SmtpEmailNotificationAdapter adapter = new SmtpEmailNotificationAdapter(
                mailSender,
                "noreply@eventhub.hu",
                true
        );

        EmailDeliveryException ex = assertThrows(
                EmailDeliveryException.class,
                () -> adapter.sendTicketConfirmation(sampleTicket, sampleEvent)
        );

        assertTrue(ex.getMessage().contains("SMTP message"));
        assertEquals(0, adapter.getSentEmails().size());
    }

    @Test
    @DisplayName("Should throw EmailDeliveryException for @fail-email.test without invoking SMTP")
    void shouldThrowEmailDeliveryExceptionForFailDomain() {
        Ticket failingTicket = new Ticket(
                TicketId.of("tck-test-fail"),
                sampleEvent.getId(),
                "evt-spring-boot-2026-standard",
                "Standard",
                "Kovács Béla",
                "bela@fail-email.test",
                TicketCode.of("EVT-2026-FAIL"),
                Money.of(15000, "HUF"),
                Instant.now(),
                hu.eventhub.domain.model.TicketStatus.VALID,
                hu.eventhub.domain.model.EmailDeliveryStatus.SENT
        );

        SmtpEmailNotificationAdapter adapter = new SmtpEmailNotificationAdapter(
                mailSender,
                "noreply@eventhub.hu",
                true
        );

        assertThrows(
                EmailDeliveryException.class,
                () -> adapter.sendTicketConfirmation(failingTicket, sampleEvent)
        );

        verify(mailSender, never()).send(any(MimeMessage.class));
        assertEquals(0, adapter.getSentEmails().size());
    }

    @Test
    @DisplayName("Should work gracefully when JavaMailSender is null (standalone unit test mode)")
    void shouldWorkGracefullyWhenJavaMailSenderIsNull() {
        SmtpEmailNotificationAdapter adapter = new SmtpEmailNotificationAdapter();

        adapter.sendTicketConfirmation(sampleTicket, sampleEvent, "hu");

        assertEquals(1, adapter.getSentEmails().size());
        assertEquals("EVT-2026-ABCD", adapter.getSentEmails().get(0).ticketCode());
        assertEquals("hu", adapter.getSentEmails().get(0).locale());
    }
}
