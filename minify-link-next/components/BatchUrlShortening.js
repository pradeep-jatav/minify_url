"use client";

import { useState } from "react";

export default function BatchUrlShortening() {
  const [urls, setUrls] = useState(""); // Input URLs
  const [shortenedUrls, setShortenedUrls] = useState([]); // Results
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBatchSubmit = async () => {
    if (!urls.trim()) {
      setError("Please enter at least one URL.");
      return;
    }

    setLoading(true);
    setError("");

    // Prepare URLs with optional alias/expiration
    const urlArray = urls
      .split("\n")
      .filter((url) => url.trim() !== "")
      .map((url) => {
        const [originalUrl, customAlias = "", validity = ""] = url.split(",").map((item) => item.trim());
        return { originalUrl, customAlias: customAlias || undefined, validity };
      });
    console.log("Prepared Request:", { urls: urlArray });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/batch-shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urlArray }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process URLs");
      }

      const data = await response.json();
      console.log("Backend Response:", data); // Debugging log
      setShortenedUrls(data.shortenedUrls || []);
      if (data.errors && data.errors.length > 0) {
        setError(data.errors.map(err => `${err.originalUrl}: ${err.error}`).join("\n"));
      }
    } catch (err) {
      console.error("Error:", err); // Log the error for debugging
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6  p-9 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white min-x-screen">
      <textarea
        rows={10}
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        className="w-full p-4 bg-gray-700 text-white border border-gray-600 rounded-md"
        placeholder="Enter one URL per line. Optionally, add alias and validity, separated by commas.\nExample:\nhttps://example.com, my-alias, days"
      ></textarea>
  
      {error && <p className="text-red-500 text-sm whitespace-pre-line">{error}</p>}
  
      <button
        onClick={handleBatchSubmit}
        className={`w-full p-4 bg-blue-600 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Processing..." : "Shorten URLs"}
      </button>
  
      {shortenedUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium">Shortened URLs:</h3>
          <ul className="space-y-4 mt-4">
            {shortenedUrls.map((url, index) => (
              <li key={index} className="p-4 bg-gray-800 rounded-md">
                <p>Original: {url.originalUrl}</p>
                <p>
                  Shortened:{" "}
                  <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {url.shortUrl}
                  </a>
                </p>
                {url.expirationDate && <p>Expires: {url.expirationDate}</p>}
                {url.qrCode && (
                  <div>
                    <p>QR Code:</p>
                    <img src={url.qrCode} alt="QR Code" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
}