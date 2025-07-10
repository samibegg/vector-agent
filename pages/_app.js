// pages/_app.js
import Script from 'next/script';
import Head from 'next/head';
import '../styles/globals.css';
import 'leaflet/dist/leaflet.css'; // Add this line
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config'; // Assuming this file exists

import { SessionProvider } from 'next-auth/react'; // NextAuth session management
import { AuthModalProvider } from '@/context/AuthModalContext'; // Context for modal state
import { AuthModal } from '@/components/AuthModal'; // The actual modal component

// Optional: Import Header if it's part of every page layout
// import Header from '@/components/Header';
// Optional: Import Footer if you have one

function MyApp({ Component, pageProps: { session, ...pageProps } }) { // Destructure session
  return (
    // --- WRAP WITH PROVIDERS ---
    <SessionProvider session={session}>
      <AuthModalProvider>
        {/* Keep existing Head, SEO, Scripts */}
        <Head>
          <link rel="icon" href="/images/logo.png" />
          {/* Add other meta tags if needed */}
        </Head>
        <DefaultSeo {...SEO} />
        {/* Google Analytics Scripts */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-NBF36V0CS8`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NBF36V0CS8', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* Optional: Add wrapper for layout structure (e.g., sticky footer) */}
        <div className="flex flex-col min-h-screen">
          {/* Render Header globally 
          <Header />*/}

          {/* Main page content area */}
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>

          {/* Optional: Render Footer globally */}
          {/* <Footer /> */}
        </div>

        {/* --- RENDER GLOBAL MODAL (controlled by context) --- */}
        <AuthModal />
        {/* --- END GLOBAL MODAL --- */}

      </AuthModalProvider>
    </SessionProvider>
    // --- END PROVIDER WRAPPERS ---
  );
}

export default MyApp;

