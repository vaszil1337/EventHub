package hu.eventhub.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Domain pricing strategy rule governing how ticket prices adapt to occupancy and tier type.
 * Critical business rule: "az ár szabály szerint változik" (price changes according to rule).
 */
public enum PricingRule {
    /**
     * Standard pricing: base price applies normally, but when event reaches high demand (>= 80% full),
     * a +15% dynamic high-demand surge is applied.
     */
    STANDARD {
        @Override
        public Money calculatePrice(Money basePrice, Capacity eventCapacity) {
            Objects.requireNonNull(basePrice, "basePrice cannot be null");
            Objects.requireNonNull(eventCapacity, "eventCapacity cannot be null");
            if (eventCapacity.isHighDemand()) {
                BigDecimal surged = basePrice.amount()
                        .multiply(BigDecimal.valueOf(1.15))
                        .setScale(2, RoundingMode.HALF_UP)
                        .stripTrailingZeros();
                if (surged.scale() < 0) {
                    surged = surged.setScale(0, RoundingMode.UNNECESSARY);
                }
                return new Money(surged, basePrice.currency());
            }
            return basePrice;
        }
    },

    /**
     * Early Bird pricing: 20% discount off base price while event occupancy is below 50%.
     * Once 50% or more of the venue is filled, early bird discount expires and base price applies.
     */
    EARLY_BIRD {
        @Override
        public Money calculatePrice(Money basePrice, Capacity eventCapacity) {
            Objects.requireNonNull(basePrice, "basePrice cannot be null");
            Objects.requireNonNull(eventCapacity, "eventCapacity cannot be null");
            if (eventCapacity.occupancyRatio() < 0.50) {
                BigDecimal discounted = basePrice.amount()
                        .multiply(BigDecimal.valueOf(0.80))
                        .setScale(2, RoundingMode.HALF_UP)
                        .stripTrailingZeros();
                if (discounted.scale() < 0) {
                    discounted = discounted.setScale(0, RoundingMode.UNNECESSARY);
                }
                return new Money(discounted, basePrice.currency());
            }
            return basePrice;
        }
    },

    /**
     * Dynamic Surge pricing: +20% surge when occupancy >= 80%, otherwise base price.
     */
    DYNAMIC_SURGE {
        @Override
        public Money calculatePrice(Money basePrice, Capacity eventCapacity) {
            Objects.requireNonNull(basePrice, "basePrice cannot be null");
            Objects.requireNonNull(eventCapacity, "eventCapacity cannot be null");
            if (eventCapacity.isHighDemand()) {
                BigDecimal surged = basePrice.amount()
                        .multiply(BigDecimal.valueOf(1.20))
                        .setScale(2, RoundingMode.HALF_UP)
                        .stripTrailingZeros();
                if (surged.scale() < 0) {
                    surged = surged.setScale(0, RoundingMode.UNNECESSARY);
                }
                return new Money(surged, basePrice.currency());
            }
            return basePrice;
        }
    },

    /**
     * VIP Pass pricing: Fixed premium rate, +10% scarcity premium when occupancy >= 90%.
     */
    VIP {
        @Override
        public Money calculatePrice(Money basePrice, Capacity eventCapacity) {
            Objects.requireNonNull(basePrice, "basePrice cannot be null");
            Objects.requireNonNull(eventCapacity, "eventCapacity cannot be null");
            if (eventCapacity.occupancyRatio() >= 0.90) {
                BigDecimal premium = basePrice.amount()
                        .multiply(BigDecimal.valueOf(1.10))
                        .setScale(2, RoundingMode.HALF_UP)
                        .stripTrailingZeros();
                if (premium.scale() < 0) {
                    premium = premium.setScale(0, RoundingMode.UNNECESSARY);
                }
                return new Money(premium, basePrice.currency());
            }
            return basePrice;
        }
    },

    /**
     * Fixed pricing: Always charges exact basePrice regardless of occupancy.
     */
    FIXED {
        @Override
        public Money calculatePrice(Money basePrice, Capacity eventCapacity) {
            Objects.requireNonNull(basePrice, "basePrice cannot be null");
            return basePrice;
        }
    };

    public abstract Money calculatePrice(Money basePrice, Capacity eventCapacity);
}
