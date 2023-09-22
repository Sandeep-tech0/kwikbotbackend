const express = require("express");
const mailSender = express();
const nodemailer = require("nodemailer");

mailSender.post("/sendmail", async (req, res) => {
  try {
    const { name, email, subject, message} = req.body;
    let testAccount = await nodemailer.createTestAccount();

    // connect with the smtp
    let transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "mailnoreply.acmp@gmail.com",
        pass: "xpbistrzlsnsmigt",
      },
    });

    let info = await transporter.sendMail({
      from: "mailnoreply.acmp@gmail.com", // sender address
      to: email, // list of receivers
      cc:"kksoni@acompworld.com",
      subject: subject, // Subject line
      text: "", // plain text body
      html: message, // html body
    });

    console.log("Message sent: %s", info.messageId);
    //res.json(info);
    res.json({status:"mail sent"});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = mailSender;
