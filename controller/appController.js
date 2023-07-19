const mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const {
  user,
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
} = require("../env.js");

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

function generateEmail(name, email, message) {
  const mailGenerator = new mailgen({
    theme: "default", // Choose the email theme (options: 'default', 'cerberus', 'salted', 'seventies')
    product: {
      name: "Om Website",
      link: "https://yourwebsite.com/",
    },
  });

  const emailBody = {
    body: {
      name: "Om Technology website",
      intro: "You have received a new message from a website visitor:",
      table: {
        data: [
          {
            key: "Name:",
            value: name,
          },
          {
            key: "Email:",
            value: email,
          },
          {
            key: "Message:",
            value: message,
          },
        ],
        columns: {
          // Optionally, customize the table columns
          customWidth: {
            key: "20%",
            value: "80%",
          },
        },
      },
      outro: "Thank you for using our website!",
    },
  };

  const emailTemplate = mailGenerator.generate(emailBody);

  const emailText = mailGenerator.generatePlaintext(emailBody);
  const emailHTML = mailGenerator.generate(emailBody);

  return {
    subject: `New Contact Message from ${name} with email ${email}`,
    text: emailText,
    html: emailHTML,
  };
}

async function sendMail(name, email, message) {
  try {
    console.log("sending mail");
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: user,
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailData = generateEmail(name, email, message);
    const mailOptions = {
      from: `Om Website <${user}>`,
      to: "ue203025.aryan.cse@gmail.com",
      subject: mailData.subject,
      text: mailData.text,
      html: mailData.html,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}
const send = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const result = await sendMail(name, email, message);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = { send };
