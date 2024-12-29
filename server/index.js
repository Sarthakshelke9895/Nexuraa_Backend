require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const app = express();
const cors = require('cors');

// Enable CORS
app.use(cors());

// Setup storage for multer (for handling file uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

// Serve the uploads directory as static
app.use('/uploads', express.static('uploads'));

// Endpoint to handle the form submission
app.post('/send-email', upload.fields([{ name: 'apkfile' }, { name: 'applogo' }]), (req, res) => {
  const { name, email, phone, address, appname, slogan, owner, appdesc } = req.body;

  const clientEmail = email;
  const adminEmail = 'sarthakshelke044@gmail.com';

  const apkfile = req.files['apkfile'][0]; // Path to uploaded APK
  const applogo = req.files['applogo'][0]; // Path to uploaded App Logo

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    }
  });

  // Email to client (App upload info)
  const clientMailOptions = {
    from: process.env.EMAIL,
    to: clientEmail,
    subject: 'App Upload Information',
    text: `Hello ${name},\n\nYour app upload details have been received.\n\nThank you for submitting your app.\n\nBest regards,\nNexura`
  };

  // Email to admin with form data and attachments
  const adminMailOptions = {
    from: process.env.EMAIL,
    to: adminEmail,
    subject: 'New App Upload Submission',
    text: `
      New app submission received:
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Address: ${address}
      App Name: ${appname}
      Slogan: ${slogan}
      Owner: ${owner}
      Description: ${appdesc}
    `,
    attachments: [
      {
        filename: apkfile.filename,
        path: apkfile.path,
      },
      {
        filename: applogo.filename,
        path: applogo.path,
      }
    ]
  };

  // Send both emails
  transporter.sendMail(clientMailOptions, (err, info) => {
    if (err) {
      return res.status(500).send('Error sending email to client');
    }

    transporter.sendMail(adminMailOptions, (err, info) => {
      if (err) {
        return res.status(500).send('Error sending email to admin');
      }

      res.status(200).send('Emails sent successfully');
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
