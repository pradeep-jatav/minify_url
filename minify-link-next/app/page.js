"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl, customAlias }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const data = await response.json();
      if (data && data.shortUrl) {
        setShortUrl(data.shortUrl);
      } else {
        setError("Failed to shorten URL.");
      }
    } catch (err) {
      setError(err.message || "Failed to shorten the URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-6">
      <div className="max-w-3xl w-full bg-gray-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-6">URL Shortener</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="originalUrl" className="block text-sm font-medium">Enter the URL to shorten:</label>
            <input
              type="url"
              id="originalUrl"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="customAlias" className="block text-sm font-medium">Custom Alias (Optional):</label>
            <input
              type="text"
              id="customAlias"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              placeholder="Enter custom alias (e.g., my-link)"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-center">
            <button
              type="submit"
              className={`w-full p-4 bg-blue-600 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Shortening..." : "Shorten URL"}
            </button>
          </div>
        </form>

        {/* Display shortened URL */}
        {shortUrl && (
          <div className="mt-6 text-center">
            <p className="text-lg font-medium">Shortened URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline mt-2 block"
            >
              {shortUrl}
            </a>

            {/* QR Code */}
            <div className="mt-4">
              <p className="text-lg font-medium">QR Code:</p>
              <QRCode value={shortUrl} className="mt-2 inline-block" size={150} bgColor="#1a202c" fgColor="#ffffff" />
            </div>
          </div>
        )}

        {/* Placeholder for upcoming features */}
        <div className="mt-8">
          <p className="text-center text-gray-400">Upcoming Features:</p>
          <ul className="space-y-2 text-gray-500 mt-2">
            <li>🔧 URL Analytics</li>
            <li>🔧 Custom Short Links</li>
            <li>🔧 Link Expiry Options</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
