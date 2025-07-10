// pages/api/register.js
import bcrypt from 'bcrypt';
// Import the function that returns { client, db }
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Zod schema for input validation
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // 1. Validate request body using Zod
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      console.log("Registration validation failed:", validation.error.flatten().fieldErrors);
      // Return detailed validation errors
      return res.status(400).json({
        message: "Validation failed",
        // Send flattened errors for easier frontend handling
        errors: validation.error.flatten().fieldErrors
      });
    }

    const { name, email, password } = validation.data;

    // 2. Connect to database using your existing utility
    const { db } = await connectToDatabase(); // Get the db instance
    const usersCollection = db.collection('users'); // Standard collection name

    // 3. Check if user already exists (case-insensitive email check recommended)
    // The email is already lowercased by Zod validation
    const existingUser = await usersCollection.findOne({ email: email });
    if (existingUser) {
      console.log("Registration attempt for existing email:", email);
      return res.status(409).json({ // 409 Conflict
        message: "An account with this email already exists. Please log in or use a different email."
      });
    }

    // 4. Hash the password securely
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Create the new user document in the database
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      emailVerified: null,     // Standard field for adapters, null initially
      image: null,             // Default image or handle uploads separately
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add any other default fields for new users (e.g., role: 'user')
    });

    console.log("User registered successfully:", result.insertedId);
    // Respond with success status (201 Created)
    return res.status(201).json({
        message: "Account created successfully! Please log in.",
        userId: result.insertedId
    });

  } catch (error) {
    console.error("Registration API Error:", error);
    // Handle potential Zod errors if they somehow bypass the initial check
    if (error instanceof z.ZodError) {
         return res.status(400).json({
            message: "Data validation error.", errors: error.flatten().fieldErrors
         });
    }
    // Generic server error for unexpected issues
    return res.status(500).json({
      message: "An unexpected error occurred during registration. Please try again later."
    });
  }
}

