package hu.eventhub.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CapacityValueObjectTest {

    @Test
    @DisplayName("Should create valid Capacity and calculate correct metrics")
    void shouldCreateValidCapacity() {
        Capacity cap = Capacity.of(100, 25);

        assertEquals(100, cap.maxSeats());
        assertEquals(25, cap.soldSeats());
        assertEquals(75, cap.availableSeats());
        assertTrue(cap.hasAvailableSeats());
        assertFalse(cap.isFull());
        assertEquals(0.25, cap.occupancyRatio(), 0.001);
        assertFalse(cap.isHighDemand());
    }

    @Test
    @DisplayName("Should enforce invariants: maxSeats > 0, soldSeats >= 0, soldSeats <= maxSeats")
    void shouldEnforceInvariants() {
        assertThrows(IllegalArgumentException.class, () -> Capacity.of(0, 0));
        assertThrows(IllegalArgumentException.class, () -> Capacity.of(-10, 0));
        assertThrows(IllegalArgumentException.class, () -> Capacity.of(100, -1));
        assertThrows(IllegalArgumentException.class, () -> Capacity.of(100, 101));
    }

    @Test
    @DisplayName("Should increment and decrement capacity cleanly")
    void shouldIncrementAndDecrement() {
        Capacity cap = Capacity.of(10, 8);

        Capacity inc1 = cap.increment();
        assertEquals(9, inc1.soldSeats());

        Capacity inc2 = inc1.increment();
        assertEquals(10, inc2.soldSeats());
        assertTrue(inc2.isFull());

        assertThrows(IllegalStateException.class, inc2::increment);

        Capacity dec = inc2.decrement();
        assertEquals(9, dec.soldSeats());
    }
}
