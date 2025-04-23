console.log("✅ Running the REAL server.js from:", __filename);
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files first
app.use(bodyParser.urlencoded({ extended: false }));

// Routing static HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Booking form handler
app.post('/book', (req, res) => {
  const { name, email, phone, date, package } = req.body; // Include package

  const db = new sqlite3.Database('bookings.db');
  db.run(
    `INSERT INTO bookings (name, email, phone, date, package) VALUES (?, ?, ?, ?, ?)`, // Include package in insert
    [name, email, phone, date, package],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send("Database error");
      } else {
        console.log("Booking saved:", name, "Package:", package);

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
          from: 'animp4sem@gmail.com',
          to: email,
          subject: 'Wild Trails Safari Booking Confirmation', // Updated name
          text: `Hi ${name},\n\nYour booking for the ${package} package with Wild Trails Safari on ${date} has been confirmed!\n\nSee you soon! 🐾` // Updated name and included package
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Email error:", error);
            res.status(500).send("Email not sent");
          } else {
            console.log('Email sent:', info.response);
            res.send("Booking successful! Check your email for confirmation.");
          }
        });
      }
      db.close();
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});