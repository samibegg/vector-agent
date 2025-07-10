// pages/api/auth/reset-password.js
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { token, password } = req.body;

  // Basic validation
  if (!token) {
    return res.status(400).json({ message: 'Reset token is missing.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find the user associated with the hashed token
    // IMPORTANT: We cannot query by the raw token directly. We need to find users
    // who have a resetTokenHash set and then compare the provided token later.
    // This query is intentionally broad for security - find users with potentially valid tokens.
    const potentialUser = await usersCollection.findOne({
      resetTokenHash: { $exists: true }, // Find users who have a reset token hash
      resetTokenExpiry: { $gt: new Date() }, // Check if the token expiry is in the future
    });

    // If no user found with an unexpired token hash field, the token is likely invalid/expired
    if (!potentialUser) {
        console.log(`Reset attempt with invalid/expired token pattern.`);
        return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Now, compare the provided token with the stored hash
    const isTokenValid = await bcrypt.compare(token, potentialUser.resetTokenHash);

    if (!isTokenValid) {
        console.log(`Reset attempt with mismatched token for user: ${potentialUser.email}`);
        return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // --- Token is valid and not expired ---

    // Hash the new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const newHashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password and remove the reset token fields
    await usersCollection.updateOne(
      { _id: potentialUser._id },
      {
        $set: { password: newHashedPassword }, // Set the new password
        $unset: { // Remove the token fields so it can't be reused
          resetTokenHash: "",
          resetTokenExpiry: "",
        },
        $currentDate: { updatedAt: true } // Update the 'updatedAt' timestamp
      }
    );

    console.log(`Password successfully reset for user: ${potentialUser.email}`);
    // Send success response
    return res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error("Reset Password API Error:", error);
    return res.status(500).json({ message: 'An unexpected server error occurred.' });
  }
}

