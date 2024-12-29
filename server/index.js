const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();
const port = 5000;

// Use environment variables for sensitive data
const EMAIL_USER = process.env.EMAIL_USER || "sarthakshelke044@gmail.com"; // Replace with your email
const EMAIL_PASS = process.env.EMAIL_PASS || "zxnuraqbieicgxqf"; // Replace with your app password

// CORS configuration
var corsOptions = {
  origin: "https://nexuraa.netlify.app/",
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));

// Email sending function
async function sendEmail({ email }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailConfigs = {
      from: EMAIL_USER,
      to: email,
      subject: "Nexura",
      html: `
        <p>Your form has been submitted successfully. Please ensure that every detail is correct.<br>
        Your App will be live on the website in 2-3 business working days.</p>
        <p>Thank you for choosing Nexura. We will inform you once your app is uploaded.</p>
        <p>Best Regards,</p>
      `,
    };

    await transporter.sendMail(mailConfigs);
    return { message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

// Define the email endpoint
app.get("/", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send("Email is required");
  }

  try {
    const response = await sendEmail({ email });
    res.send(response.message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app; // Export the app for serverless environments
