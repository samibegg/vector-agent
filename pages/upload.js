// pages/upload.js
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

export default function Upload() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated') loadFiles();
  }, [status]);

  if (status === 'loading') return <p className="p-6">Loading session...</p>;
  if (!session)
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Header />

          <main className="flex-grow flex flex-col justify-center items-center px-6 py-16">
          <p className="mb-4">You must log in to upload files to Google Drive.</p>
          <button onClick={() => signIn('google')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Login with Google
          </button>
          </main>
        <Footer />
      </div>
    );

  async function handleFilesSelected(selectedFiles) {
    setUploading(true);
    setMessage('');

    for (const file of selectedFiles) {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/upload-to-gdrive', {
        method: 'POST',
        body,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage((prev) => prev + `❌ ${file.name} failed: ${result.error}\n`);
      } else {
        setMessage((prev) => prev + `✅ ${file.name} uploaded\n`);
      }
    }

    await loadFiles();
    setUploading(false);
  }

  async function loadFiles() {
    const res = await fetch('/api/list-gdrive');
    const j = await res.json();
    if (res.ok) {
      setFiles(j.files);
    } else {
      setMessage(`❌ Failed to load files: ${j.error}`);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelected(droppedFiles);
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

        <main className="flex-grow flex flex-col justify-center items-center px-6 py-16">
          <h1 className="text-2xl font-bold mb-4">Upload to Google Drive</h1>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center bg-blue-50 mb-4"
          >
            <p className="text-sm text-blue-700">Drag & drop files here</p>
            <p className="text-sm text-gray-500 mt-1">or</p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFilesSelected(Array.from(e.target.files))}
              className="mt-2 text-sm"
            />
          </div>

          {uploading && <p className="text-sm text-blue-600 mb-2">Uploading...</p>}
          {message && <pre className="mb-4 text-xs text-gray-700 whitespace-pre-wrap">{message}</pre>}

          <h2 className="text-lg font-semibold mt-6 mb-2">Files in Google Drive</h2>
          {files.length === 0 ? (
            <p className="text-sm text-gray-500">No files found in Drive.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {files.map((f) => (
                <li key={f.id} className="bg-white rounded shadow p-3 flex justify-between items-center">
                  <div>
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {f.name}
                    </a>
                  </div>
                  <div className="text-gray-500">{formatSize(f.size)}</div>
                </li>
              ))}
            </ul>
          )}
        </main>
      <Footer />
    </div>
  );
}

