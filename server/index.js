const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; // Use process.env.PORT for deployment

// CORS Configuration
const corsOptions = {
  origin: "https://nexuraa.netlify.app/",
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Email Sending Function
function sendEmail({ email }) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL || "sarthakshelke044@gmail.com", // Use environment variables for credentials
        pass: process.env.PASSWORD || "zxnuraqbieicgxqf",
      },
    });

    const mailConfigs = {
      from: process.env.EMAIL || "sarthakshelke044@gmail.com",
      to: email,
      subject: "Nexura",
      html: `
        <p>Your form has been submitted successfully. Please ensure that all details are correct.</p>
        <p>Your app will be live on the website in 2-3 business working days.</p>
        <p>Thank you for choosing Nexura.<br />We will inform you once the app is uploaded.</p>
        <p>Best Regards</p>
      `,
    };

    transporter.sendMail(mailConfigs, (error, info) => {
      if (error) {
        console.error("Email error:", error);
        return reject({ message: "An error has occurred" });
      }
      console.log("Email sent:", info.response);
      return resolve({ message: "Email sent successfully" });
    });
  });
}

// Routes
app.get("/", (req, res) => {
  res.send("Server is Live!");
});

// Email Sending Route
app.post("/send-email", (req, res) => {
  sendEmail(req.body)
    .then((response) => res.status(200).send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
