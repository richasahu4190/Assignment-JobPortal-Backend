const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Company = require('../models/Company');
const {sendEmailOTP} = require('../services/emailService');
const {sendMobileOTP} = require('../services/mobileServices');
exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if the company is already registered with the given email
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate an OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Create a new company with OTP and expiry time (10 minutes)
    const company = new Company({
      name,
      email,
      password,
      phoneNumber,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
    });

    await company.save();

    await sendEmailOTP(email, otp);

  
    await sendMobileOTP(phoneNumber, otp);

    res.status(201).json({ message: 'Company registered. Please verify your account using the OTP sent to your email and mobile.' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error registering company', error: error.message });
  }
};

/**
 * Verify the OTP sent via email or SMS
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body; // Get email and OTP from the request body

    // Find the company by email and check if the OTP is still valid
    const company = await Company.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }, // Ensure OTP has not expired
    });

    if (!company) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark the company as verified
    company.isVerified = true;
    company.otp = undefined; // Clear the OTP after successful verification
    company.otpExpires = undefined; // Clear the OTP expiration time
    await company.save();

    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    // Handle any errors that occur during verification
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

/**
 * Verify the OTP sent to the mobile phone
 */
exports.verifyMobileOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body; // Get phone number and OTP from the request body

    // Find the company by phone number and check if the OTP is valid and not expired
    const company = await Company.findOne({
      phoneNumber,
      otp,
      otpExpires: { $gt: Date.now() }, // Ensure OTP has not expired
    });

    if (!company) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark the company as verified via mobile
    company.isMobileVerified = true; // Separate flag for mobile verification
    company.otp = undefined; // Clear the OTP after successful verification
    company.otpExpires = undefined; // Clear the OTP expiration time
    await company.save();

    res.json({ message: 'Mobile number verified successfully' });
  } catch (error) {
    // Handle any errors that occur during mobile OTP verification
    res.status(500).json({ message: 'Error verifying mobile OTP', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });

    if (!company || !(await company.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!company.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, company: { id: company._id, name: company.name, email: company.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.logout = (req, res) => {
  // Since we're using JWT, we don't need to do anything server-side for logout
  res.json({ message: 'Logged out successfully' });
};