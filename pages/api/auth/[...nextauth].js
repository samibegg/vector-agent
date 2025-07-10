// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
// Import the specifically exported clientPromise for the adapter
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcrypt';

// Basic check for essential environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("Missing Google OAuth environment variables (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)");
}
if (!process.env.NEXTAUTH_SECRET) {
    console.warn("Missing NEXTAUTH_SECRET environment variable");
}
if (!process.env.MONGODB_URI) {
    console.warn("Missing MONGODB_URI environment variable");
}
// Use the database name from your mongodb.js or env var
const dbName = process.env.MONGODB_DB_NAME || 'forge';

/** @type {import('next-auth').NextAuthOptions} */
export const authOptions = {
  // Use MongoDB adapter with the exported clientPromise
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: dbName // Specify the database name
  }),

  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Optional: Request profile scope if needed
      // authorization: { params: { scope: 'openid email profile' } },
    }),
    CredentialsProvider({
      name: 'Credentials',
      // The credentials object is used to generate a form on the default sign-in page.
      // You don't need it if you build your own login form.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        if (!credentials?.email || !credentials?.password) {
          console.log("Authorize attempt missing email or password");
          // Throw an error or return null
          // Returning null is generally safer as it doesn't leak info
          return null;
        }

        try {
          const client = await clientPromise; // Get connected client via the promise
          const db = client.db(dbName);
          const usersCollection = db.collection('users'); // Default collection name

          // Find user by email (case-insensitive recommended in real app)
          const user = await usersCollection.findOne({ email: credentials.email });

          if (!user) {
            console.log('Authorize: No user found with email:', credentials.email);
            return null; // User not found
          }

          // Check if the user signed up via OAuth (no local password)
          if (!user.password) {
             console.log('Authorize: User signed up via OAuth, no password stored for email:', credentials.email);
             // Prevent login via credentials if they used OAuth
             // You could throw an error to give specific feedback, but null is safer
             // throw new Error('Please log in using the method you signed up with.');
             return null;
          }

          // Compare provided password with the stored hash
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            console.log('Authorize: Invalid password for user:', credentials.email);
            return null; // Invalid password
          }

          console.log('Authorize: Credentials validation successful for:', credentials.email);
          // Return user object expected by NextAuth
          // Any object returned will be saved in `user` property of the JWT
          return {
              id: user._id.toString(), // Map _id to id
              name: user.name,
              email: user.email,
              image: user.image,
              // Add other user properties if needed (e.g., roles)
          };
        } catch (error) {
            console.error("Error during authorization:", error);
            return null; // Return null on any unexpected error
        }
      }
    })
  ],

  // Session strategy
  session: {
    strategy: 'jwt', // Use JSON Web Tokens for session management
  },

  // Callbacks to control JWT and session content
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the user id (and potentially role) to the token right after signin/signup
      // The 'user' object is only passed on sign-in/sign-up
      if (user) {
        token.id = user.id;
         // If using Google provider, account object is available
         // if (account?.provider === "google" && profile?.email_verified) {
         //   token.emailVerified = profile.email_verified;
         // }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties from the token to the client-side session object
      // The token object contains the data added in the jwt callback
      if (token && session.user) {
        session.user.id = token.id; // Make user ID available in useSession()
        // Add other fields if needed: session.user.role = token.role;
      }
      return session;
    },
  },

  // Define custom pages if needed (optional)
  // pages: {
  //   signIn: '/auth/signin', // Custom sign-in page path
  //   signOut: '/auth/signout',
  //   error: '/auth/error', // Error code passed in query string as ?error=
  //   verifyRequest: '/auth/verify-request', // (used for email provider)
  //   newUser: null // Redirect new users to the homepage (or specify a path like '/welcome')
  // },

  // Secret for JWT signing - MUST match .env.local
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

// Export the NextAuth handler
export default NextAuth(authOptions);

