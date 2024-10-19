const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'asheeshsahu6367@gmail.com',
        pass: 'tdhd nhyu yqym zcvb'
    }
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text version of the email body
 * @param {string} html - HTML version of the email body (optional)
 */
exports.sendEmail = async (email, subject, text, html) => {
  try {
    if (!email) {
      console.log(email)
      throw new Error('No email recipient defined'); // Added check for undefined email
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email, // Directly pass the email value
      subject,
      text,
      html: html || text, // Use HTML if provided, otherwise use plain text
    };

    console.log('Recipient email:', email); // Log recipient email for debugging
    console.log('Mail Options:', mailOptions); // Log full mail options for debugging

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error; // Rethrow the error to handle it further up the call stack
  }
};

/**
 * Send a verification email with OTP
 * @param {string} to - Recipient email address
 * @param {string} otp - The OTP code for verification
 */
exports.sendEmailOTP = async (to, otp) => {
  const subject = 'Your Email OTP Verification Code';
  const text = `Your One-Time Password (OTP) for email verification is: ${otp}. This OTP is valid for 10 minutes.`;
  const html = `
    <h1>Email OTP Verification</h1>
    <p>Your One-Time Password (OTP) for email verification is:</p>
    <h2>${otp}</h2>
    <p>This OTP is valid for 10 minutes.</p>
  `;

  // Send the email with the OTP instead of a link
  return await this.sendEmail(to, subject, text, html);
};



/**
 * Send a job alert email
 * @param {string} to - Recipient email address
 * @param {string} jobTitle - The job title
 * @param {string} companyName - The company name
 * @param {string} jobDescription - The job description
 */
exports.sendJobAlert = async (to, jobTitle, companyName, jobDescription) => {
  const subject = `New Job Alert: ${jobTitle}`;
  const text = `
    New Job Opportunity at ${companyName}

    Job Title: ${jobTitle}
    Company: ${companyName}

    Job Description:
    ${jobDescription}

    To apply or learn more, please visit our job board.
  `;
  const html = `
    <h1>New Job Opportunity at ${companyName}</h1>
    <h2>${jobTitle}</h2>
    <p><strong>Company:</strong> ${companyName}</p>
    <h3>Job Description:</h3>
    <p>${jobDescription}</p>
    <p>To apply or learn more, please visit our job board.</p>
  `;

  // Ensure to await the sendEmail function
  return await this.sendEmail(to, subject, text, html);
};
