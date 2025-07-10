// components/AuthModal.js
import React, { useState, useEffect, Fragment } from 'react'; // Added Fragment
import { useAuthModal } from '@/context/AuthModalContext';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { FcGoogle } from 'react-icons/fc'; // Google Icon
import { AiOutlineClose } from 'react-icons/ai'; // Close Icon
import Link from 'next/link'; // Import Link for the Forgot Password link

// --- Zod Schemas ---
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim(),
  password: z.string().min(1, "Password cannot be empty"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// --- AuthModal Component ---
export const AuthModal = () => {
  // --- State & Hooks ---
  const { isModalOpen, closeModal } = useAuthModal();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null); // Error message from API/NextAuth
  const router = useRouter();

  // --- Form Handling ---
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '', confirmPassword: '' } });

  // --- Action Handlers ---
  const onLogin = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await signIn('credentials', { redirect: false, email: data.email, password: data.password });
      if (result?.error) {
        setApiError(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : 'Login failed. Please try again.');
      } else if (result?.ok) {
        closeModalAndReset();
        router.replace(router.asPath); // Refresh page data
      } else {
        setApiError('An unexpected error occurred.');
      }
    } catch (err) { setApiError('An unexpected error occurred.'); }
    finally { setIsLoading(false); }
  };

  const onRegister = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.name, email: data.email, password: data.password }) });
      const result = await response.json();
      if (!response.ok) {
        setApiError(result.message || `Registration failed (Status: ${response.status})`);
      } else {
        setActiveTab('login');
        resetSignupForm();
      }
    } catch (err) { setApiError('A network error occurred.'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setApiError(null);
    try { await signIn('google'); }
    catch (err) {
      setApiError('Failed to start Google Sign-In.');
      setIsLoading(false);
    }
  };

  // --- Modal & Form Reset ---
  const closeModalAndReset = () => {
    closeModal();
    setTimeout(() => {
      setApiError(null);
      resetLoginForm();
      resetSignupForm();
      setActiveTab('login');
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    setApiError(null);
    resetLoginForm();
    resetSignupForm();
  }, [activeTab]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModalAndReset();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);


  if (!isModalOpen) {
    return null;
  }

  // --- Render Component ---
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-[999] transition-opacity duration-300 ease-out"
        onClick={closeModalAndReset}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative bg-white w-full max-w-md p-6 sm:p-8 rounded-lg shadow-xl transform transition-all duration-300 ease-out scale-95 opacity-0 data-[open=true]:scale-100 data-[open=true]:opacity-100" data-open={isModalOpen}>
          {/* Close Button */}
          <button
            onClick={closeModalAndReset}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <AiOutlineClose size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${activeTab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign Up
            </button>
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md mb-4 text-center" role="alert">
              {apiError}
            </div>
          )}

          {/* Forms Container */}
          <div>
            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    {...registerLogin("email")}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loginErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    aria-invalid={loginErrors.email ? "true" : "false"}
                  />
                  {loginErrors.email && <p className="text-xs text-red-600 mt-1">{loginErrors.email.message}</p>}
                </div>
                <div>
                  {/* --- MODIFIED PASSWORD INPUT AREA --- */}
                  <div className="flex justify-between items-baseline mb-1">
                      <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                      {/* --- ADDED FORGOT PASSWORD LINK --- */}
                      <Link href="/forgot-password" passHref>
                          <span
                              onClick={closeModal} // Close modal when clicking link
                              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          >
                              Forgot password?
                          </span>
                      </Link>
                      {/* --- END FORGOT PASSWORD LINK --- */}
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    {...registerLogin("password")}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loginErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    aria-invalid={loginErrors.password ? "true" : "false"}
                  />
                  {loginErrors.password && <p className="text-xs text-red-600 mt-1">{loginErrors.password.message}</p>}
                  {/* --- END MODIFIED PASSWORD INPUT AREA --- */}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? 'Logging In...' : 'Login'}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit(onRegister)} className="space-y-4">
                 <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input id="signup-name" type="text" {...registerSignup("name")} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${signupErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`} aria-invalid={signupErrors.name ? "true" : "false"} />
                  {signupErrors.name && <p className="text-xs text-red-600 mt-1">{signupErrors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input id="signup-email" type="email" {...registerSignup("email")} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${signupErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`} aria-invalid={signupErrors.email ? "true" : "false"} />
                  {signupErrors.email && <p className="text-xs text-red-600 mt-1">{signupErrors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input id="signup-password" type="password" {...registerSignup("password")} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${signupErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`} aria-invalid={signupErrors.password ? "true" : "false"} />
                  {signupErrors.password && <p className="text-xs text-red-600 mt-1">{signupErrors.password.message}</p>}
                </div>
                 <div>
                  <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input id="signup-confirm-password" type="password" {...registerSignup("confirmPassword")} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${signupErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`} aria-invalid={signupErrors.confirmPassword ? "true" : "false"} />
                  {signupErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{signupErrors.confirmPassword.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-2 text-sm text-gray-500">Or</span></div>
          </div>

          {/* OAuth Providers */}
          <div>
            <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <FcGoogle className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" /><span>Sign in with Google</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
