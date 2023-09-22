require('dotenv').config();

//by sendgrid
const sgMail = require('@sendgrid/mail');

// Set your SendGrid API key
sgMail.setApiKey('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');

const MAILUSERID = process.env.MAIL_USERID;
const MAILPASSWORD = process.env.MAIL_PASSWORD


function getMailOptions(toEmail, subject, textBody) {
  return {
    to: toEmail,
    from: MAILUSERID,
    subject: subject,
    html: textBody
  };
}

function sendMail(toEmail, subject, textBody) {
  const mailOptions = getMailOptions(toEmail, subject, textBody);

   sgMail.send(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
} 


module.exports = {
  sendMail
}

