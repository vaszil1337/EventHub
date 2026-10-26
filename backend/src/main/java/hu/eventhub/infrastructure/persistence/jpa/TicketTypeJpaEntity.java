package hu.eventhub.infrastructure.persistence.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "ticket_types")
public class TicketTypeJpaEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "event_id", nullable = false, length = 100)
    private String eventId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "price_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "price_currency", nullable = false, length = 10)
    private String priceCurrency;

    @Column(name = "quota", nullable = false)
    private int quota;

    @Column(name = "sold_count", nullable = false)
    private int soldCount;

    @Column(name = "pricing_rule", nullable = false, length = 50)
    private String pricingRule;

    public TicketTypeJpaEntity() {}

    public TicketTypeJpaEntity(
            String id,
            String eventId,
            String name,
            String description,
            BigDecimal priceAmount,
            String priceCurrency,
            int quota,
            int soldCount,
            String pricingRule
    ) {
        this.id = id;
        this.eventId = eventId;
        this.name = name;
        this.description = description;
        this.priceAmount = priceAmount;
        this.priceCurrency = priceCurrency;
        this.quota = quota;
        this.soldCount = soldCount;
        this.pricingRule = pricingRule;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public String getPriceCurrency() { return priceCurrency; }
    public void setPriceCurrency(String priceCurrency) { this.priceCurrency = priceCurrency; }

    public int getQuota() { return quota; }
    public void setQuota(int quota) { this.quota = quota; }

    public int getSoldCount() { return soldCount; }
    public void setSoldCount(int soldCount) { this.soldCount = soldCount; }

    public String getPricingRule() { return pricingRule; }
    public void setPricingRule(String pricingRule) { this.pricingRule = pricingRule; }
}
