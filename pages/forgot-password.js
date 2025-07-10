// pages/forgot-password.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Header from '@/components/Header'; // Adjust path if needed
import Footer from '@/components/Footer'; // Adjust path if needed

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim(),
});

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success/error feedback
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(result.message || 'Failed to send reset link. Please try again.');
      } else {
        setIsError(false);
        setMessage(result.message || 'If an account exists for this email, a password reset link has been sent.');
        reset(); // Clear the form on success
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setIsError(true);
      setMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-md rounded-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Forgot Your Password?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {message && (
              <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {message}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                {...register("email")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center">
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

export default ForgotPasswordPage;

