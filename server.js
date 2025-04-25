const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Serve static pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/booking', (req, res) => res.sendFile(path.join(__dirname, 'public', 'booking.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'public', 'gallery.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));

// ===========================
// ADMIN ROUTES
// ===========================

// Serve Admin Login Page
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Handle Admin Login POST
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USER || 'admin';
  const adminPassword = process.env.ADMIN_PASS || 'password123';

  if (username === adminUsername && password === adminPassword) {
    req.session.admin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.status(401).send('Invalid credentials. <a href="/admin/login">Try again</a>.');
  }
});

// Serve Admin Dashboard (Protected)
app.get('/admin/dashboard', (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }

  const dbPath = path.join(__dirname, 'safari_booking.db');
  const db = new sqlite3.Database(dbPath);

  const sql = `SELECT * FROM bookings ORDER BY id DESC`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Failed to load bookings.");
    }

    let bookingsHTML = rows.map(row => `
      <tr>
        <td>${row.id}</td>
        <td>${row.name}</td>
        <td>${row.email}</td>
        <td>${row.phone}</td>
        <td>${row.package}</td>
        <td>${row.preferred_date}</td>
        <td>${row.adults}</td>
        <td>${row.children}</td>
        <td>${row.special_requests || '-'}</td>
        <td><a href="#">Cancel</a></td>
      </tr>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Dashboard - Full Bookings</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Poppins', sans-serif; background: #1a1a1a; color: white; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; border: 1px solid #444; font-size: 14px; }
          th { background: #4CAF50; }
          tr:nth-child(even) { background: #2a2a2a; }
          a { color: #4CAF50; text-decoration: none; }
        </style>
      </head>
      <body>
        <h2>Admin Dashboard - All Bookings</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Package</th>
              <th>Date</th>
              <th>Adults</th>
              <th>Children</th>
              <th>Special Requests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${bookingsHTML}
          </tbody>
        </table>
        <p style="margin-top:20px;"><a href="/admin/logout">Logout</a></p>
      </body>
      </html>
    `);
  });

  db.close();
});



// Logout route
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ===========================
// BOOKING ROUTE
// ===========================
app.post('/book', (req, res) => {
  const { name, email, phone, date, package: pkg, adults, children, special_requests } = req.body;

  if (!name || !email || !pkg) {
    return res.status(400).send("Missing required fields.");
  }

  const dbPath = path.join(__dirname, 'safari_booking.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Failed to open DB:", err);
      return res.status(500).send("Database connection error.");
    }
  });

  const sql = `
    INSERT INTO bookings (name, email, phone, preferred_date, package, adults, children, special_requests)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, email, phone, date, pkg, adults, children, special_requests], function (err) {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).send("Database insert error.");
    }

    // Send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎫 Your Wild Trails Safari Booking Pass!',
      html: `
        <div style="font-family: Arial, sans-serif; border: 2px dashed #4CAF50; padding: 20px; background-color: #f9fff4;">
          <h2 style="color: #2E7D32;">🐾 Wild Trails Safari Pass 🐾</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Package:</strong> ${pkg}</p>
          <p><strong>Adults:</strong> ${adults}</p>
          <p><strong>Children:</strong> ${children}</p>
          <p><strong>Special Requests:</strong> ${special_requests || 'None'}</p>
          <hr>
          <p>Show this pass at the entrance 🛻<br>Thank you for choosing Wild Trails Safari!</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error);
        return res.status(500).send("Booking saved but email failed.");
      } else {
        console.log('Booking email sent:', info.response);
        return res.send("Booking successful! Check your email for confirmation.");
      }
    });
  });

  db.close();
});

// ===========================
// START SERVER
// ===========================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
