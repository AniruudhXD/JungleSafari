CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    package TEXT NOT NULL,
    adults INTEGER NOT NULL,
    children INTEGER NOT NULL,
    special_requests TEXT
);