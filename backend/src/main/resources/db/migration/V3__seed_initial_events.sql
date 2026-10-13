INSERT INTO events (
    id, title, description, event_date,
    venue_id, venue_name, venue_address, venue_capacity,
    sold_tickets_count, price_amount, price_currency, category, image_url
) VALUES
(
    'evt-tech-summit-2026',
    'Tech Horizons Summit 2026',
    'Join leading engineers, product innovators, and researchers for keynotes on cutting-edge cloud architectures, TypeScript, and modern web platforms.',
    '2026-10-18 09:00:00+00',
    'venue-grand-hall',
    'Grand Tech Arena',
    '101 Innovation Way, Silicon Quarter',
    100,
    45,
    120.00,
    'USD',
    'Technology',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'
),
(
    'evt-jazz-night-2026',
    'Smooth Jazz & Soul Evening',
    'An intimate acoustic evening featuring world-class jazz musicians and soul vocalists in an acoustic-tuned venue.',
    '2026-11-05 19:30:00+00',
    'venue-blue-note',
    'Blue Note Lounge',
    '42 Harmon Street, Downtown Arts District',
    30,
    28,
    35.00,
    'USD',
    'Music',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1000&q=80'
),
(
    'evt-ai-masterclass-2026',
    'Executive AI & Deep Learning Masterclass',
    'Intensive hands-on masterclass on neural architecture design, reasoning models, and enterprise deployment strategies.',
    '2026-11-20 10:00:00+00',
    'venue-silicon-hub',
    'Silicon Conference Hub',
    '740 AI Parkway, Building B',
    50,
    50,
    250.00,
    'USD',
    'Workshop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80'
);
