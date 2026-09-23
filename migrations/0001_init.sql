-- Migration number: 0001 	 2026-09-23T16:02:03.399Z
CREATE TABLE campaigns (
    id TEXT PRIMARY KEY,

    slug TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,
    game TEXT,

    source TEXT,
    medium TEXT,
    content TEXT,

    destination_url TEXT NOT NULL,

    is_active INTEGER NOT NULL DEFAULT 1,

    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);


CREATE TABLE events (
    id TEXT PRIMARY KEY,

    campaign_id TEXT NOT NULL,

    kind TEXT NOT NULL,

    visitor_id TEXT,

    referrer TEXT,
    user_agent TEXT,
    country TEXT,

    metadata TEXT,

    created_at INTEGER NOT NULL DEFAULT (unixepoch()),

    FOREIGN KEY (campaign_id)
        REFERENCES campaigns(id)
);


CREATE INDEX idx_events_campaign_created
ON events(campaign_id, created_at);


CREATE INDEX idx_events_campaign_kind_created
ON events(campaign_id, kind, created_at);