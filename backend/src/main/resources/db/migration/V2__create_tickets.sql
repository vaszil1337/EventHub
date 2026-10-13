CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(10) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code);
