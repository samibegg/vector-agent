// context/AuthModalContext.js
import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
// The initial value 'undefined' helps catch setup errors if consumed outside the provider.
const AuthModalContext = createContext(undefined);

// 2. Create the Provider component
// This component will wrap parts of your app that need access to the modal state.
export const AuthModalProvider = ({ children }) => {
  // State to track if the modal is open or closed
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  }

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  }

  // The value object contains the state and functions to be shared
  const value = { isModalOpen, openModal, closeModal };

  // Provide the value to consuming components
  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

// 3. Create a custom hook for easy access to the context
// This hook simplifies using the context in functional components.
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    // Throw an error if the hook is used outside of the AuthModalProvider's scope
    // This helps ensure the context is set up correctly in the component tree.
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context; // Return the context value (isModalOpen, openModal, closeModal)
};

