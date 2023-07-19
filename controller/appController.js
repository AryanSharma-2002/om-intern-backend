const mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

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
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLEINT_SECRET,
      process.env.REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    console.log("sending mail");
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.user,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLEINT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.accessToken,
      },
    });

    const mailData = generateEmail(name, email, message);
    const mailOptions = {
      from: `Om Website <${process.env.user}>`,
      to: `${process.env.COMPANY_MAIL}`,
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
