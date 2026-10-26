CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    ticket_type_id VARCHAR(100),
    ticket_type_name VARCHAR(100),
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(10) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'VALID',
    email_status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code);
