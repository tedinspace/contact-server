const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
var cors = require("cors");
require("dotenv").config();

/* set up application with middleware */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // this is to handle URL encoded data
app.use(express.static(path.join(__dirname, "public")));

let allowedOrigins = ["http://localhost:3000", "http://tedsite.com"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
/* - send email endpoint - */
app.post("/email", function (request, response) {
  // 1. create transport
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // 2. define message to send
  let textBody = `FROM: ${request.body.name} EMAIL: ${request.body.email} MESSAGE: ${request.body.message}`;
  let htmlBody = `<h2>Mail From Contact Form</h2><p>from: ${request.body.name} <a href="mailto:${request.body.email}">${request.body.email}</a></p><p>${request.body.message}</p>`;
  let mail = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: "Mail From Contact Form", // TODO: changethis
    text: textBody,
    html: htmlBody,
  };

  // 3. send mail
  transporter.sendMail(mail, function (err, info) {
    if (err) {
      console.log(err);
      response.json({
        message:
          "message not sent: an error occured; check the server's console log",
      });
    } else {
      response.json({ message: `message sent: ${info.messageId}` });
    }
  });
});

/* set up port */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
