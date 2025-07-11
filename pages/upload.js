// /pages/upload.js
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
  const [progress, setProgress] = useState({});
  const [message, setMessage] = useState('');
  const [listing, setListing] = useState([]);

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
    setMessage('');
    const progressMap = {};
    selectedFiles.forEach(file => progressMap[file.name] = 0);
    setProgress(progressMap);

    await Promise.all(selectedFiles.map(file => uploadFile(file)));
    await loadFiles();
  }

  async function uploadFile(file) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        }
      });

      xhr.onreadystatechange = async () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            setMessage((prev) => prev + `✅ ${file.name} uploaded\n`);
          } else {
            const error = JSON.parse(xhr.responseText)?.error || 'Upload failed';
            setMessage((prev) => prev + `❌ ${file.name} failed: ${error}\n`);
          }
          resolve();
        }
      };

      xhr.open('POST', '/api/upload-to-gdrive');
      xhr.send(formData);
    });
  }

  async function loadFiles() {
    const res = await fetch('/api/list-uploads');
    const j = await res.json();
    if (res.ok) setListing(j.files);
    else setMessage(`❌ Failed to load files: ${j.error}`);
  }

  function handleDrop(e) {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelected(droppedFiles);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  }

  async function handleDelete(fileId) {
    if (!confirm('Are you sure you want to delete this file from Drive?')) return;
    const res = await fetch(`/api/delete-from-gdrive?id=${fileId}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage(prev => prev + `🗑️ Deleted ${fileId}\n`);
      await loadFiles();
    } else {
      const err = await res.json();
      setMessage(prev => prev + `❌ Delete failed: ${err.error}\n`);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow px-6 py-12 max-w-3xl mx-auto">
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

        {message && <pre className="mb-4 text-xs text-gray-700 whitespace-pre-wrap">{message}</pre>}

        {/* Progress list */}
        {Object.keys(progress).length > 0 && (
          <div className="mb-6">
            {Object.entries(progress).map(([name, pct]) => (
              <div key={name} className="mb-2">
                <div className="text-sm text-gray-600">{name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold mt-6 mb-2">Files in Google Drive</h2>
        {listing.length === 0 ? (
          <p className="text-sm text-gray-500">No files found in Drive.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {listing.map((f) => (
              <li key={f.id} className="bg-white rounded shadow p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium"
                    >
                      {f.name}
                    </a>
                    <div className="text-xs text-gray-500">
                      {formatSize(f.size)}
                      {f.uploadedBy && ` · Uploaded by ${f.uploadedBy}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(f.webViewLink)}
                      className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                    >
                      🔗 Copy Link
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
