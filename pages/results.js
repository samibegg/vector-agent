// pages/results.js
import Head from 'next/head';
import { Fragment } from 'react';
import connectToDatabase from '../lib/mongodb';   // your cached helper
import Header from '../components/Header';
import Footer from '../components/Footer';

export async function getServerSideProps() {
  const { db } = await connectToDatabase();
  const data = await db
    .collection('research_contacts')
    .find({})
    .limit(200)            // pull the most recent 200; adjust as you wish
    .sort({ _id: -1 })
    .toArray();

  // Next.js can’t serialize ObjectId; convert to string
  const contacts = data.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
  }));

  return { props: { contacts } };
}

export default function Results({ contacts }) {
  return (
    <>
      <Head>
        <title>Results</title>
      </Head>

    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col justify-center items-center px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold">Research Results</h1>

          {contacts.length === 0 && (
            <p className="text-gray-600">No saved results yet.</p>
          )}

          <ul className="space-y-5">
            {contacts.map((item) => (
              <li
                key={item._id}
                className="relative flex rounded-xl bg-white shadow ring-1 ring-gray-200"
              >
                {/* Accent bar */}
                <div className="w-1 rounded-l-xl bg-blue-600" />

                <div className="flex-1 p-5">
                  {/* Prominent name/title if available */}
                  {(item.name || item.person_name || item.organization) && (
                    <h2 className="text-lg font-semibold text-gray-900">
                      {item.name || item.person_name || item.organization}
                    </h2>
                  )}

                  {/* Render every key/value pair */}
                  <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
                    {Object.entries(item).map(([key, val]) =>
                      key.startsWith('_') ? null : (
                        <Fragment key={key}>
                          <dt className="font-medium text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}
                          </dt>
                          <dd className="break-words text-gray-800">
                            {typeof val === 'object' ? (
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(val, null, 2)}
                              </pre>
                            ) : (
                              val
                            )}
                          </dd>
                        </Fragment>
                      )
                    )}
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </div>
        </main>

      <Footer />
    </div>
    </>
  );
}

