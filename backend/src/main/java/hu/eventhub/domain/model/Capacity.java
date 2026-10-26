package hu.eventhub.domain.model;

import java.util.Objects;

/**
 * Value Object representing venue or ticket-tier capacity and current occupancy.
 * Enforces the invariant that sold seats cannot be negative or exceed maximum capacity.
 */
public record Capacity(int maxSeats, int soldSeats) {

    public Capacity {
        if (maxSeats <= 0) {
            throw new IllegalArgumentException("Maximum capacity must be greater than zero");
        }
        if (soldSeats < 0) {
            throw new IllegalArgumentException("Sold seats cannot be negative");
        }
        if (soldSeats > maxSeats) {
            throw new IllegalArgumentException("Sold seats cannot exceed maximum capacity");
        }
    }

    public static Capacity of(int maxSeats, int soldSeats) {
        return new Capacity(maxSeats, soldSeats);
    }

    public int availableSeats() {
        return Math.max(0, maxSeats - soldSeats);
    }

    public boolean hasAvailableSeats() {
        return soldSeats < maxSeats;
    }

    public boolean isFull() {
        return soldSeats >= maxSeats;
    }

    public double occupancyRatio() {
        return (double) soldSeats / maxSeats;
    }

    public boolean isHighDemand() {
        return occupancyRatio() >= 0.80;
    }

    public Capacity increment() {
        if (isFull()) {
            throw new IllegalStateException("Cannot increment capacity: already at maximum (" + maxSeats + ")");
        }
        return new Capacity(maxSeats, soldSeats + 1);
    }

    public Capacity decrement() {
        if (soldSeats <= 0) {
            return this;
        }
        return new Capacity(maxSeats, soldSeats - 1);
    }

    @Override
    public String toString() {
        return soldSeats + "/" + maxSeats;
    }
}
