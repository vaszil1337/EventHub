package hu.eventhub.infrastructure.persistence.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tickets")
public class TicketJpaEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "event_id", nullable = false, length = 100)
    private String eventId;

    @Column(name = "participant_name", nullable = false)
    private String participantName;

    @Column(name = "participant_email", nullable = false)
    private String participantEmail;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 50)
    private String ticketCode;

    @Column(name = "price_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "price_currency", nullable = false, length = 10)
    private String priceCurrency;

    @Column(name = "purchase_date", nullable = false)
    private Instant purchaseDate;

    public TicketJpaEntity() {}

    public TicketJpaEntity(
            String id,
            String eventId,
            String participantName,
            String participantEmail,
            String ticketCode,
            BigDecimal priceAmount,
            String priceCurrency,
            Instant purchaseDate
    ) {
        this.id = id;
        this.eventId = eventId;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
        this.ticketCode = ticketCode;
        this.priceAmount = priceAmount;
        this.priceCurrency = priceCurrency;
        this.purchaseDate = purchaseDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }

    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public String getPriceCurrency() { return priceCurrency; }
    public void setPriceCurrency(String priceCurrency) { this.priceCurrency = priceCurrency; }

    public Instant getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(Instant purchaseDate) { this.purchaseDate = purchaseDate; }
}
