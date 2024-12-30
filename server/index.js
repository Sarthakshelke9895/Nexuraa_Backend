import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

// The handler function to handle POST requests for sending the form data and email
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

      // Setup nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER, // Your Gmail address
          pass: process.env.GMAIL_PASS, // Your Gmail app password
        },
      });

      // Client email options
      const clientMailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "App Upload Information",
        text: `Hello ${name},\n\nYour app, ${appname}, has been successfully uploaded.\n\nApp Description: ${appdesc}\n\nOwner: ${owner}\n\nRegards,\nYour App Upload Team`,
      };

      // Admin email options (you, the app owner)
      const adminMailOptions = {
        from: process.env.GMAIL_USER,
        to: "sarthakshelke044@gmail.com", // Your email address to receive submissions
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
          <p><strong>APK File:</strong> ${apkFile ? `<a href="${apkFile.path}">${apkFile.originalFilename}</a>` : "No file uploaded"}</p>
          <p><strong>App Logo:</strong> ${appLogoFile ? `<a href="${appLogoFile.path}">${appLogoFile.originalFilename}</a>` : "No file uploaded"}</p>
        `,
        attachments: [
          {
            filename: apkFile.originalFilename,
            path: apkFile.path,
          },
          {
            filename: appLogoFile.originalFilename,
            path: appLogoFile.path,
          },
        ],
      };

      // Send emails
      try {
        await transporter.sendMail(clientMailOptions); // Send to client
        await transporter.sendMail(adminMailOptions); // Send to admin
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
