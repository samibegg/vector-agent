'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { useEffect, useState } from 'react';

// You can also import this from a separate file
const heroTexts = [
  ["Intelligence in Every Layer", "Forging AI That Drives Results"],
  ["Strategic by Design", "AI and Data Aligned to Your Goals"]
];

export default function HomePage() {

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade out

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % heroTexts.length);
        setFade(true); // Fade back in
      }, 500); // Wait for fade-out before changing
    }, 3100);

    return () => clearInterval(interval);
  }, []);

  const [line1, line2] = heroTexts[index];


  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col justify-center items-center px-6 py-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl">
          <h1
            className={`text-5xl font-extrabold text-gray-900 mb-6 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
          >
            {line1} <br /> {line2}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We specialize in cloud migration, big data engineering, cutting-edge app development, and AI strategy — guiding enterprises across industries through modern technological transformation.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/knowledge-base" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md text-lg transition">
              Access Knowledge Base
            </Link>
            <Link href="/ai/solutions" className="bg-red-500 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-md text-lg transition">
              Unlock Your AI Advantage
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
