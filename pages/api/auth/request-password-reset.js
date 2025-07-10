
// pages/api/auth/request-password-reset.js
import { connectToDatabase } from '@/lib/mongodb'; // Your DB connection utility
import crypto from 'crypto'; // Built-in Node module for secure random bytes
import bcrypt from 'bcrypt'; // For hashing the token
import nodemailer from 'nodemailer'; // For sending emails

// Nodemailer transporter setup (using environment variables)
// Ensure these variables are set in your .env.local
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10), // Default to 587 if not set
  secure: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    // IMPORTANT: Always return a generic success message even if user not found
    // This prevents attackers from discovering which emails are registered.
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If an account exists for this email, a password reset link has been sent.' });
    }

    // Generate a secure random token (e.g., 32 bytes -> 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing it in the database
    const saltRounds = 10; // Salt rounds for token hashing (can be lower than password)
    const hashedToken = await bcrypt.hash(resetToken, saltRounds);

    // Set token expiry (e.g., 1 hour from now)
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour in milliseconds

    // Update the user document with the hashed token and expiry
    // Assumes fields 'resetTokenHash' and 'resetTokenExpiry' exist in your user schema
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetTokenHash: hashedToken,
          resetTokenExpiry: tokenExpiry,
        },
      }
    );

    // Construct the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address (e.g., '"Your App" <noreply@yourapp.com>')
      to: user.email, // List of receivers
      subject: 'Password Reset Request', // Subject line
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email. This link will expire in 1 hour.`, // Plain text body
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email. This link will expire in 1 hour.</p>`, // HTML body
    };

    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Decide if you want to inform the user about email failure
      // For security, might still return the generic success message
      // Or return a specific server error:
      // return res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
    }

    // Send generic success response
    return res.status(200).json({ message: 'If an account exists for this email, a password reset link has been sent.' });

  } catch (error) {
    console.error("Request Password Reset API Error:", error);
    return res.status(500).json({ message: 'An unexpected server error occurred.' });
  }
}


