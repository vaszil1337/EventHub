package hu.eventhub.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PricingRuleTest {

    @Test
    @DisplayName("EARLY_BIRD should apply -20% discount when occupancy < 50%, base price otherwise")
    void shouldCalculateEarlyBirdPricing() {
        Money basePrice = new Money(new BigDecimal("100.00"), "USD");

        Capacity lowDemand = Capacity.of(100, 40); // 40% < 50%
        Money discounted = PricingRule.EARLY_BIRD.calculatePrice(basePrice, lowDemand);
        assertEquals(0, new BigDecimal("80.00").compareTo(discounted.amount()));

        Capacity highDemand = Capacity.of(100, 60); // 60% >= 50%
        Money regular = PricingRule.EARLY_BIRD.calculatePrice(basePrice, highDemand);
        assertEquals(0, new BigDecimal("100.00").compareTo(regular.amount()));
    }

    @Test
    @DisplayName("STANDARD should apply +15% dynamic surge when occupancy >= 80%, base price otherwise")
    void shouldCalculateStandardPricing() {
        Money basePrice = new Money(new BigDecimal("100.00"), "USD");

        Capacity normal = Capacity.of(100, 75); // 75% < 80%
        assertEquals(0, new BigDecimal("100.00").compareTo(PricingRule.STANDARD.calculatePrice(basePrice, normal).amount()));

        Capacity surged = Capacity.of(100, 85); // 85% >= 80%
        assertEquals(0, new BigDecimal("115.00").compareTo(PricingRule.STANDARD.calculatePrice(basePrice, surged).amount()));
    }

    @Test
    @DisplayName("DYNAMIC_SURGE should apply +20% surge when occupancy >= 80%, base price otherwise")
    void shouldCalculateDynamicSurgePricing() {
        Money basePrice = new Money(new BigDecimal("50.00"), "USD");

        Capacity normal = Capacity.of(100, 50);
        assertEquals(0, new BigDecimal("50.00").compareTo(PricingRule.DYNAMIC_SURGE.calculatePrice(basePrice, normal).amount()));

        Capacity surge = Capacity.of(100, 80);
        assertEquals(0, new BigDecimal("60.00").compareTo(PricingRule.DYNAMIC_SURGE.calculatePrice(basePrice, surge).amount()));
    }

    @Test
    @DisplayName("VIP should apply +10% scarcity premium when occupancy >= 90%, base price otherwise")
    void shouldCalculateVipPricing() {
        Money basePrice = new Money(new BigDecimal("200.00"), "USD");

        Capacity belowNinety = Capacity.of(100, 89);
        assertEquals(0, new BigDecimal("200.00").compareTo(PricingRule.VIP.calculatePrice(basePrice, belowNinety).amount()));

        Capacity ninetyOrAbove = Capacity.of(100, 90);
        assertEquals(0, new BigDecimal("220.00").compareTo(PricingRule.VIP.calculatePrice(basePrice, ninetyOrAbove).amount()));
    }

    @Test
    @DisplayName("FIXED pricing should always return base price regardless of occupancy")
    void shouldCalculateFixedPricing() {
        Money basePrice = new Money(new BigDecimal("75.00"), "USD");

        assertEquals(0, new BigDecimal("75.00").compareTo(PricingRule.FIXED.calculatePrice(basePrice, Capacity.of(100, 10)).amount()));
        assertEquals(0, new BigDecimal("75.00").compareTo(PricingRule.FIXED.calculatePrice(basePrice, Capacity.of(100, 99)).amount()));
    }
}
