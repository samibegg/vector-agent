// components/SignUpModal.js
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Optional: for a close icon
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for App Router

export default function SignUpModal({ isOpen, closeModal, linkToNextPage }) {
  // --- Form State and Logic (copied from SignUpForm) ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleClose = () => {
      // Optionally reset form state when closing
      // setFirstName(''); setLastName(''); ... setError('');
      closeModal(); // Call the function passed via props
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!firstName || !lastName || !email) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    console.log({ firstName, lastName, telephone, email });

    try {
      const response = await fetch('/api/auth/signup', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          telephone,
          email,
          username,
          password, // Send the plain password to the API
        }),
      });

      const result = await response.json(); // Always parse the JSON response

      if (!response.ok) {
        // Handle errors returned from the API (e.g., validation, user exists)
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      // --- Placeholder logic ---
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Simulated API call successful from modal');
      //alert('Sign up successful! (Check console) ' + linkToNextPage);
      router.push(linkToNextPage);
      // Example: window.gtag('event', eventName, eventData);

       // --- End Placeholder ---

       // Clear form on success
       setFirstName(''); setLastName(''); setTelephone(''); setEmail(''); setUsername(''); setPassword('');

       handleClose(); // Close modal on successful submission

    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  // --- End Form State and Logic ---


  // --- Styling constants (can be customized) ---
  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const labelStyle = "block text-sm font-medium text-slate-700";
  // ---

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  Access The Full Report
                   <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 p-1 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                   </button>
                </Dialog.Title>

                {/* --- Form Content --- */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="modal-firstName" className={labelStyle}>First Name <span className="text-red-500">*</span></label>
                      <input type="text" id="modal-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputStyle} disabled={isLoading} />
                    </div>
                    <div>
                      <label htmlFor="modal-lastName" className={labelStyle}>Last Name <span className="text-red-500">*</span></label>
                      <input type="text" id="modal-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputStyle} disabled={isLoading} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="modal-telephone" className={labelStyle}>Telephone</label>
                    <input type="tel" id="modal-telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={inputStyle} placeholder="Optional" disabled={isLoading} />
                  </div>

                  <div>
                    <label htmlFor="modal-email" className={labelStyle}>Email Address <span className="text-red-500">*</span></label>
                    <input type="email" id="modal-email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyle} disabled={isLoading} />
                  </div>

                  {/* --- Login fields --- 
                  <div>
                    <label htmlFor="modal-username" className={labelStyle}>Username <span className="text-red-500">*</span></label>
                    <input type="text" id="modal-username" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputStyle} disabled={isLoading} />
                  </div>

                  <div>
                    <label htmlFor="modal-password" className={labelStyle}>Password <span className="text-red-500">*</span></label>
                    <input type="password" id="modal-password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyle} disabled={isLoading} />
                  </div>
                  */}
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
                    >
                      {isLoading ? 'Accessing' : 'Access'}
                    </button>
                  </div>
                </form>
                {/* --- End Form Content --- */}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}