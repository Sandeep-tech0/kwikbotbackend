const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: "mailnoreply.acmp@gmail.com",
    pass: "xpbistrzlsnsmigt",
  },
});

function getMailOptions(toEmail, subject, textBody) {
  return {
    from: "mailnoreply.acmp@gmail.com",
    to: toEmail,
    subject: subject,
    html: textBody,
  };
}

function sendMail(toEmail, subject, textBody) {
  const mailOptions = getMailOptions(toEmail, subject, textBody);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function checkIfEmailInString(text) {
  var re =
    /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  return re.test(text);
}

module.exports = {
  sendMail,
  checkIfEmailInString,
};
