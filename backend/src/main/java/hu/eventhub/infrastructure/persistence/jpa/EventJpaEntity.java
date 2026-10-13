package hu.eventhub.infrastructure.persistence.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "events")
public class EventJpaEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "event_date", nullable = false)
    private Instant date;

    @Column(name = "venue_id", nullable = false, length = 100)
    private String venueId;

    @Column(name = "venue_name", nullable = false)
    private String venueName;

    @Column(name = "venue_address", nullable = false)
    private String venueAddress;

    @Column(name = "venue_capacity", nullable = false)
    private int venueCapacity;

    @Column(name = "sold_tickets_count", nullable = false)
    private int soldTicketsCount;

    @Column(name = "price_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "price_currency", nullable = false, length = 10)
    private String priceCurrency;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    public EventJpaEntity() {}

    public EventJpaEntity(
            String id,
            String title,
            String description,
            Instant date,
            String venueId,
            String venueName,
            String venueAddress,
            int venueCapacity,
            int soldTicketsCount,
            BigDecimal priceAmount,
            String priceCurrency,
            String category,
            String imageUrl
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.venueId = venueId;
        this.venueName = venueName;
        this.venueAddress = venueAddress;
        this.venueCapacity = venueCapacity;
        this.soldTicketsCount = soldTicketsCount;
        this.priceAmount = priceAmount;
        this.priceCurrency = priceCurrency;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getDate() { return date; }
    public void setDate(Instant date) { this.date = date; }

    public String getVenueId() { return venueId; }
    public void setVenueId(String venueId) { this.venueId = venueId; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public String getVenueAddress() { return venueAddress; }
    public void setVenueAddress(String venueAddress) { this.venueAddress = venueAddress; }

    public int getVenueCapacity() { return venueCapacity; }
    public void setVenueCapacity(int venueCapacity) { this.venueCapacity = venueCapacity; }

    public int getSoldTicketsCount() { return soldTicketsCount; }
    public void setSoldTicketsCount(int soldTicketsCount) { this.soldTicketsCount = soldTicketsCount; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public String getPriceCurrency() { return priceCurrency; }
    public void setPriceCurrency(String priceCurrency) { this.priceCurrency = priceCurrency; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
