// pages/researcher.js
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSession, signIn } from 'next-auth/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* ---------- shared polling settings ---------- */
const pollInterval = 5000;   // 5 s between polls
const maxTries     = 90;     // 90 × 5 s = 7.5 min

export default function Researcher() {
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalErr, setGlobalErr] = useState('');
  const [pollStatus, setPollStatus] = useState('');
  const sessionRef = useRef(null);

  useEffect(() => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem('sessionId', sid);
    }
    sessionRef.current = sid;
  }, []);

  // Redirect to home if not logged in
  if (status === 'loading') {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center text-center">
          <p className="text-gray-600 text-lg">Checking authentication…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  /* ------------ submit prompt ------------- */
  async function submitPrompt() {
    setLoading(true);
    setGlobalErr('');
    setResults([]);
    setPollStatus('');

    try {
      const r = await fetch('/api/researcher', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ prompt })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const sessionId = j.sessionId;

      /* -------- polling loop -------- */
      let tries = 0, data = null;
      while (tries < maxTries) {
        await new Promise(res => setTimeout(res, pollInterval));
        setPollStatus(`Waiting for results… ${((tries + 1) * pollInterval / 1000).toFixed(0)} s`); // NEW

        const poll = await fetch('/api/status-check', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ sessionId })
        });
        const pj = await poll.json();

        if (poll.status === 200 && pj.status === 'complete') {
          data = pj.data;
          break;
        }
        tries++;
      }
      setPollStatus('');

      if (!data) throw new Error('Timed out waiting for n8n');

      const finalResults = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [data]);
      setResults(finalResults);
    } catch (e) {
      setGlobalErr(e.message);
    }
    setLoading(false);
  }

  /* ---------- per‑card web search ---------- */
  async function doWebSearch(idx, doc) {
    const upd = [...results];
    upd[idx]._busy = 'search';
    setResults(upd);

    try {
      const r = await fetch('/api/tavily-search', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ doc })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      upd[idx] = { ...upd[idx], web_results: j.web_results, _query: j.query };
    } catch (e) {
      upd[idx]._err = e.message;
    }
    upd[idx]._busy = null;
    setResults([...upd]);
  }

  /* -------- per‑card enrich via n8n -------- */
  async function enrichEntity(idx, doc) {
    const upd = [...results];
    upd[idx]._busy = 'enrich';
    setResults(upd);

    try {
      const r = await fetch('/api/entity-enrich', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ doc })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const sessionId = j.sessionId;

      /* ------ polling loop ------ */
      let tries = 0, enriched = null;
      while (tries < maxTries) {
        await new Promise(res => setTimeout(res, pollInterval));
        upd[idx]._poll = `(${((tries + 1) * pollInterval / 1000).toFixed(0)} s)`; // per‑card progress
        setResults([...upd]);

        const poll = await fetch('/api/status-check', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ sessionId })
        });
        const pj = await poll.json();

        if (poll.status === 200 && pj.status === 'complete') {
          enriched = pj.data;
          break;
        }
        tries++;
      }
      delete upd[idx]._poll;

      if (!enriched) throw new Error('Timed out waiting for enrichment');

      upd[idx] = { ...upd[idx], n8n_enriched: enriched, _enriched: true };
    } catch (e) {
      upd[idx]._err = e.message;
    }

    upd[idx]._busy = null;
    setResults([...upd]);
  }

  /* ------------ save to Mongo ------------- */
  async function saveToMongo(idx) {
    const upd = [...results];
    upd[idx]._busy = 'save';
    setResults(upd);

    const { _busy, _saved, _err, ...payload } = upd[idx];
    try {
      const r = await fetch('/api/save', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ doc: payload })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      upd[idx]._saved = true;
    } catch (e) {
      upd[idx]._err = e.message;
    }

    upd[idx]._busy = null;
    setResults([...upd]);
  }

  /* ------------------- UI ------------------ */
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col justify-center items-center px-6 py-16">

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Research Assistant</h1>

          <textarea
            className="w-full p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter your research prompt…"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />

          <button
            onClick={submitPrompt}
            disabled={loading || !prompt}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing…' : 'Submit Prompt'}
          </button>

          {pollStatus && <p className="mt-2 text-gray-500 text-sm">{pollStatus}</p>}   {/* NEW */}

          {globalErr && <p className="mt-4 text-red-500">{globalErr}</p>}

          {results.length > 0 && (
            <ul className="mt-6 space-y-4">
              {results.map((item, idx) => (
                <li key={idx} className="bg-gray-50 rounded-xl p-4 shadow">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => doWebSearch(idx, item)}
                      disabled={item._busy}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      {item._busy === 'search' ? 'Searching…' : '🔎 Perform Web Search'}
                    </button>

                    <button
                      onClick={() => enrichEntity(idx, item)}
                      disabled={item._busy || item._enriched}
                      className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      {item._busy === 'enrich'
                        ? `Enriching… ${item._poll || ''}`
                        : item._enriched
                        ? '✅ Enriched'
                        : '🔄 Enrich with Deep Research'}
                    </button>

                    <button
                      onClick={() => saveToMongo(idx)}
                      disabled={item._busy || item._saved}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      {item._saved
                        ? '✅ Saved'
                        : item._busy === 'save'
                        ? 'Saving…'
                        : '💾 Save to Document Store'}
                    </button>
                  </div>

                  {item._err && <p className="text-red-500 text-xs mt-1">{item._err}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        </main>

      <Footer />
    </div>
  );
}
