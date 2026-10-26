package hu.eventhub.domain.model;

import hu.eventhub.domain.exception.CapacityExceededException;

import java.util.Objects;

/**
 * Domain Entity representing a specific ticket tier (e.g., Early Bird, Standard, VIP Pass)
 * belonging to an Event aggregate.
 */
public class TicketType {
    private final TicketTypeId id;
    private final String name;
    private final String description;
    private final Money basePrice;
    private final int quota;
    private int soldCount;
    private final PricingRule pricingRule;

    public TicketType(
            TicketTypeId id,
            String name,
            String description,
            Money basePrice,
            int quota,
            int soldCount,
            PricingRule pricingRule
    ) {
        this.id = Objects.requireNonNull(id, "TicketType id cannot be null");
        this.name = Objects.requireNonNull(name, "TicketType name cannot be null");
        if (name.isBlank()) {
            throw new IllegalArgumentException("TicketType name cannot be blank");
        }
        this.description = description != null ? description : "";
        this.basePrice = Objects.requireNonNull(basePrice, "TicketType basePrice cannot be null");
        if (quota <= 0) {
            throw new IllegalArgumentException("TicketType quota must be positive");
        }
        if (soldCount < 0 || soldCount > quota) {
            throw new IllegalArgumentException("TicketType soldCount must be between 0 and quota");
        }
        this.quota = quota;
        this.soldCount = soldCount;
        this.pricingRule = pricingRule != null ? pricingRule : PricingRule.STANDARD;
    }

    public boolean hasAvailableQuota() {
        return soldCount < quota;
    }

    public int availableQuota() {
        return Math.max(0, quota - soldCount);
    }

    public Money effectivePrice(Capacity eventCapacity) {
        return pricingRule.calculatePrice(basePrice, eventCapacity);
    }

    public void recordSale() {
        if (!hasAvailableQuota()) {
            throw new CapacityExceededException(
                    String.format("Ticket tier \"%s\" is sold out (%d/%d quota reached).", name, soldCount, quota)
            );
        }
        this.soldCount++;
    }

    public void cancelSale() {
        if (this.soldCount > 0) {
            this.soldCount--;
        }
    }

    public TicketType copy() {
        return new TicketType(id, name, description, basePrice, quota, soldCount, pricingRule);
    }

    public TicketTypeId getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Money getBasePrice() {
        return basePrice;
    }

    public int getQuota() {
        return quota;
    }

    public int getSoldCount() {
        return soldCount;
    }

    public PricingRule getPricingRule() {
        return pricingRule;
    }
}
