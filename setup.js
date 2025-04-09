const sqlite3 = require('sqlite3').verbose();

// Create or open the database file
const db = new sqlite3.Database('bookings.db');

// Create the table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("Error creating table:", err.message);
  } else {
    console.log("Bookings table created or already exists.");
  }
  db.close();
});
