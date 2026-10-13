CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue_id VARCHAR(100) NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    venue_address VARCHAR(255) NOT NULL,
    venue_capacity INT NOT NULL,
    sold_tickets_count INT NOT NULL DEFAULT 0,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(10) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(1000)
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
