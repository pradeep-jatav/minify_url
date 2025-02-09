"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

export default function SingleUrlShortening() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const qrRef = useRef(null);

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
        body: JSON.stringify({ originalUrl, customAlias, expirationDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const data = await response.json();
      console.log("Shortened URL response:", data);
      
      if (data && data.shortUrl) {
        const fixedShortUrl = data.shortUrl.replace(/([^:]\/)\/+/g, "$1");
        setShortUrl(fixedShortUrl);
      } else {
        setError("Failed to URL.");
      }
    } catch (err) {
      setError(err.message || "Failed to shorten the URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to download QR code
  const downloadQrCode = async () => {
    if (qrRef.current) {
      try {
        const dataUrl = await toPng(qrRef.current);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "qrcode.png";
        link.click();
      } catch (err) {
        console.error("Failed to download QR code:", err);
        setError("Failed to download QR code. Please try again.");
      }
    }
  };
  // Function to share QR code and URL
  const shareQrCode = async () => {
    if (navigator.share && shortUrl) {
      try {
        await navigator.share({
          title: "Shortened URL",
          text: `Check out this shortened URL: ${shortUrl}`,
          url: shortUrl,
        });
      } catch (err) {
        console.error("Failed to share URL:", err);
        setError("Failed to share the URL. Please try again.");
      }
    } else {
      setError("Sharing is not supported on your device or browser.");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto p-9 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white min-x-screen">
      <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
        <div>
          <label htmlFor="originalUrl" className="block text-sm font-semibold text-gray-300">
            Enter the URL to shorten:
          </label>
          <input
            type="url"
            id="originalUrl"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="w-full p-4 mt-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            required
          />
        </div>
  
        <div >
          <label htmlFor="customAlias" className="block text-sm font-semibold text-gray-300">
            Custom Alias (Optional):
          </label>
          <input
            type="text"
            id="customAlias"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            className="w-full p-4 mt-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter custom alias (e.g., my-link)"
          />
        </div>
  
        <div>
          <label htmlFor="expirationDate" className="block text-sm font-semibold text-gray-300">
            Set Expiration Date (Optional):
          </label>
          <input
            type="datetime-local"
            id="expirationDate"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full p-4 mt-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  
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
    
      {shortUrl && (
        <div className="mt-8 text-center bg-gray-800 p-6 rounded-xl shadow-md">
          <p className="text-lg font-medium text-gray-300">Shortened URL:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline mt-2 block"
          >
            {shortUrl}
          </a>
  
          <div className="mt-6">
            <div ref={qrRef} className="inline-block">
              <QRCode value={shortUrl.replace(/\/\/+/g, '/')} size={150} bgColor="#1a202c" fgColor="#ffffff" />
            </div>
  
            <div className="mt-6 space-x-4">
              <button
                onClick={downloadQrCode}
                className="p-3 bg-green-600 rounded-md text-white transition-all duration-300 transform hover:scale-105"
              >
                Download QR Code
              </button>
              <button
                onClick={shareQrCode}
                className="p-3 bg-blue-600 rounded-md text-white transition-all duration-300 transform hover:scale-105"
              >
                Share QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );  
}
