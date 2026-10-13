package hu.eventhub.infrastructure.persistence;

import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Money;
import hu.eventhub.domain.model.Venue;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class SampleEventData {

    private SampleEventData() {}

    public static List<Event> initialEvents() {
        List<Event> events = new ArrayList<>();

        events.add(new Event(
                EventId.of("evt-tech-summit-2026"),
                "Tech Horizons Summit 2026",
                "Join leading engineers, product innovators, and researchers for keynotes on cutting-edge cloud architectures, TypeScript, and modern web platforms.",
                Instant.parse("2026-10-18T09:00:00Z"),
                Venue.of("venue-grand-hall", "Grand Tech Arena", "101 Innovation Way, Silicon Quarter", 100),
                45,
                Money.of(120, "USD"),
                "Technology",
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"
        ));

        events.add(new Event(
                EventId.of("evt-jazz-night-2026"),
                "Smooth Jazz & Soul Evening",
                "An intimate acoustic evening featuring world-class jazz musicians and soul vocalists in an acoustic-tuned venue.",
                Instant.parse("2026-11-05T19:30:00Z"),
                Venue.of("venue-blue-note", "Blue Note Lounge", "42 Harmon Street, Downtown Arts District", 30),
                28,
                Money.of(35, "USD"),
                "Music",
                "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1000&q=80"
        ));

        events.add(new Event(
                EventId.of("evt-ai-masterclass-2026"),
                "Executive AI & Deep Learning Masterclass",
                "Intensive hands-on masterclass on neural architecture design, reasoning models, and enterprise deployment strategies.",
                Instant.parse("2026-11-20T10:00:00Z"),
                Venue.of("venue-silicon-hub", "Silicon Conference Hub", "740 AI Parkway, Building B", 50),
                50, // Fully booked to test capacity limits!
                Money.of(250, "USD"),
                "Workshop",
                "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80"
        ));

        return events;
    }
}
