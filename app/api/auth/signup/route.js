// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getDb } from '/lib/mongodb'; // Adjust path if needed

const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

export async function POST(request) {
  try {
    const data = await request.json();
    const { firstName, lastName, telephone, email, username, password } = data;

    // --- Server-side Validation ---
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    // Add more validation (e.g., email format, password strength) here if needed

    const db = await getDb();
    const usersCollection = db.collection('users'); // Or your desired collection name

    // --- Check if user already exists (optional but recommended) ---
    //const existingUser = await usersCollection.findOne({
    //  $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    //});

    //if (existingUser) {
    //  let message = 'User already exists.';
    //  if (existingUser.email === email.toLowerCase()) {
    //    message = 'An account with this email already exists.';
    //  } else if (existingUser.username === username.toLowerCase()) {
    //    message = 'This username is already taken.';
    //  }
    //  return NextResponse.json({ message }, { status: 409 }); // 409 Conflict
    //}

    // --- Hash the password ---
    //if (typeof password !== 'string' || password.length === 0) {
    //     return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    //}
    //const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Insert user into database ---
    const newUser = {
      firstName,
      lastName,
      telephone: telephone || null, // Store null if empty, or handle differently
      email: email.toLowerCase(), // Store email in lowercase for consistency
      //username: username.toLowerCase(), // Store username in lowercase
      //password: hashedPassword, // Store the HASHED password
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // console.log('User inserted:', result); // Log result for debugging

    // Don't send back sensitive info like the insertedId or the user object itself unless necessary
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Signup API Error:', error);
    // Check for specific MongoDB errors if needed, otherwise send generic error
    // if (error.code === 11000) { // Example: Duplicate key error
    //    return NextResponse.json({ message: 'Username or Email already exists (duplicate key).' }, { status: 409 });
    // }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
  // Note: The MongoDB client connection is managed by the utility function.
  // We don't explicitly close it here to allow connection reuse.
  // It will close automatically when the Node.js process terminates or can be managed more explicitly if needed.
}
