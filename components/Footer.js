// /components/Footer.js
import Link from 'next/link';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-12 text-sm text-gray-600">
      <div className="mt-12 text-center text-gray-400">
        &copy; {new Date().getFullYear()} VectorAgent. All rights reserved.
      </div>
    </footer>
  );
}
