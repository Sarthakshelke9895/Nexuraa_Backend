const nodemailer = require("nodemailer");
const formidable = require("formidable");
const fs = require("fs");

export default function handler(req, res) {
  if (req.method === "POST") {
    // Handling file upload using Formidable
    const form = new formidable.IncomingForm();
    form.uploadDir = "./temp"; // temporary directory
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).send("Error in file upload");
        return;
      }

      const { name, email, phone, address, appname, owner, apkfile, applogo, appdesc, slogan } = fields;
      const { apkfile: apkFile, applogo: appLogoFile } = files;

      // Ensure all required fields are filled
      if (!name || !email || !phone || !address || !appname || !owner || !appdesc) {
        return res.status(400).json({ error: "Please fill all the fields." });
      }

      // Send Email to Client
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER, // your Gmail address
          pass: process.env.GMAIL_PASS, // your Gmail password or app-specific password
        },
      });

      const clientMailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "App Upload Information",
        text: `Hello ${name},\n\nYour app, ${appname}, has been successfully uploaded.\n\nApp Description: ${appdesc}\n\nOwner: ${owner}\n\nRegards,\nYour App Upload Team`,
      };

      // Send Email to Admin (You)
      const adminMailOptions = {
        from: process.env.GMAIL_USER,
        to: "sarthakshelke044@gmail.com", // your email address
        subject: "New App Upload Submission",
        html: `
          <h1>New App Upload Submitted</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>App Name:</strong> ${appname}</p>
          <p><strong>Owner:</strong> ${owner}</p>
          <p><strong>App Description:</strong> ${appdesc}</p>
          <p><strong>App Slogan:</strong> ${slogan}</p>
          <h3>Files:</h3>
          <p><strong>APK File:</strong> <a href="file://${apkFile.path}">${apkFile.originalFilename}</a></p>
          <p><strong>App Logo:</strong> <a href="file://${appLogoFile.path}">${appLogoFile.originalFilename}</a></p>
        `,
        attachments: [
          {
            filename: apkFile.originalFilename,
            path: apkFile.path, // You may need to upload this to a service like AWS S3
          },
          {
            filename: appLogoFile.originalFilename,
            path: appLogoFile.path, // Similarly, upload this image to a storage service
          },
        ],
      };

      // Sending emails
      try {
        await transporter.sendMail(clientMailOptions);
        await transporter.sendMail(adminMailOptions);
        res.status(200).send("Form submitted successfully");
      } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Error sending email");
      }
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
