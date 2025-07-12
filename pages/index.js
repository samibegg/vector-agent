// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const phrases = [
  'Intelligent Uploads',
  'Research-Driven AI',
  'Secure Cloud Integration',
  'Automated Insight Generation',
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 4000); // slowed transition for polish
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex flex-col text-gray-800">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-24">
        {/* Hero */}
        <div className="text-center max-w-3xl">
          <h1 className="text-8xl font-extrabold tracking-tight leading-tight mb-4">
            <span className="text-blue-700">Vector Agent</span>
          </h1>
          <p className="text-gray-400 text-xl md:text-4xl h-10 relative">
            <span
              key={phrases[index]}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 animate-fade"
            >
              {phrases[index]}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <Link
            href="/upload"
            className="group flex flex-col items-center justify-center bg-white border border-blue-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl px-8 py-10 text-center text-2xl font-semibold text-blue-700 hover:animate-pulse"
          >
            <div className="text-5xl mb-4">📤</div>
            Upload Documents
          </Link>

          <Link
            href="/researcher"
            className="group flex flex-col items-center justify-center bg-white border border-teal-200 hover:border-teal-400 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl px-8 py-10 text-center text-2xl font-semibold text-teal-700 hover:animate-pulse"
          >
            <div className="text-5xl mb-4">🧠</div>
            AI Interrogation
          </Link>

          <Link
            href="/results"
            className="group flex flex-col items-center justify-center bg-white border border-emerald-200 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl px-8 py-10 text-center text-2xl font-semibold text-emerald-700 hover:animate-pulse"
          >
            <div className="text-5xl mb-4">📊</div>
            Saved Analysis
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
