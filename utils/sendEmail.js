const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env,
      service: process.env,
      port: "000",
      auth: {
        user: process.env,
        pass: process.env,
      },
    });

    transporter.sendMail({
      from: process.env,
      to: email,
      subject: subject,
      text: text,
    });

    console.log("email sent successfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = sendEmail;
