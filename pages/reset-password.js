// pages/reset-password.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Header from '@/components/Header'; // Adjust path if needed
import Footer from '@/components/Footer'; // Adjust path if needed

// Validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query; // Get token from URL query parameter

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null); // null: checking, true: valid, false: invalid

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  // Optional: Validate token existence on component mount (basic check)
  useEffect(() => {
    if (router.isReady) { // Ensure router query is populated
        if (!token) {
            setMessage('Invalid or missing password reset token.');
            setIsError(true);
            setIsValidToken(false);
        } else {
            // Basic check passed, allow form submission for server validation
            setIsValidToken(true);
        }
    }
  }, [router.isReady, token]);


  const onSubmit = async (data) => {
    if (!token || !isValidToken) {
        setMessage('Invalid or missing password reset token.');
        setIsError(true);
        return;
    }

    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(result.message || 'Failed to reset password. The link may be invalid or expired.');
      } else {
        setIsError(false);
        setMessage(result.message || 'Password reset successfully! You can now log in with your new password.');
        reset();
        // Optionally redirect to login after a delay
        // setTimeout(() => router.push('/'), 3000); // Redirect to home/login
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      setIsError(true);
      setMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render different states based on token validity check
  let content;
  if (isValidToken === null) {
    content = <p className="text-center text-gray-600">Verifying token...</p>;
  } else if (isValidToken === false) {
    content = <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">{message}</div>;
  } else {
    content = (
        <>
            {message && (
              <div className={`p-3 rounded-md text-sm mb-6 ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {message}
                {!isError && ( // Show login link on success
                    <Link href="/" passHref>
                        <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer ml-2">
                            Login Now
                        </span>
                    </Link>
                )}
              </div>
            )}
            {!message || isError ? ( // Only show form if no success message or if there's an error
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <input type="hidden" name="token" value={token || ''} />
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            {...register("password")}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                            aria-invalid={errors.password ? "true" : "false"}
                        />
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            {...register("confirmPassword")}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                            aria-invalid={errors.confirmPassword ? "true" : "false"}
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            ) : null}
        </>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-md rounded-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset Your Password
            </h2>
          </div>
          <div className="mt-8">
              {content}
          </div>
           <div className="text-sm text-center mt-4">
            <Link href="/" passHref>
              <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                Back to Home
              </span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;

