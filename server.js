console.log("✅ Running the REAL server.js from:", __filename);
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express(); // ✅ THIS LINE MUST BE HERE before using `app.use`

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Route to handle form submission
app.post('/book', (req, res) => {
  const { name, email, phone, date } = req.body;

  // Save to database
  const db = new sqlite3.Database('bookings.db');
  db.run(
    `INSERT INTO bookings (name, email, phone, date) VALUES (?, ?, ?, ?)`,
    [name, email, phone, date],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send("Database error");
      } else {
        console.log("Booking saved:", name);

        // Send confirmation email
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
          subject: 'Jungle Safari Booking Confirmation',
          text: `Hi ${name},\n\nYour Jungle Safari booking on ${date} has been confirmed!\n\nSee you soon! 🐾`
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
