const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('Server is Live!');
});

// Email Sending Route
app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email provider
            auth: {
                user: process.env.EMAIL, // Set in .env file
                pass: process.env.PASSWORD, // Set in .env file
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        res.status(500).send('Failed to send email');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
