"use client";

import { useState, useEffect } from "react";

export default function LinkAnalytics() {
  const [links, setLinks] = useState([]); // Stores all links
  const [filteredLinks, setFilteredLinks] = useState([]); // Filtered links based on search
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const [selectedLink, setSelectedLink] = useState(null); // Link selected for popup
  const [loading, setLoading] = useState(false); // Loading state for fetch operations

  useEffect(() => {
    fetchLinks();
  }, []);

  // Fetches all links or based on query params
  const fetchLinks = async (query = "") => {
    console.log("Query:", query);
    setLoading(true);
    try {
      const url = query
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/links/${query}` // If there's a query, add it to the URL
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/links`; // If no query, just fetch all links

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }

      const data = await response.json();

      // Process the data and sort by `updatedAt` to show the most recent links first
      if (data.link) {
        const sortedLink = [data.link].sort(
          (a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)
        );
        setLinks(sortedLink);
        setFilteredLinks(sortedLink);
      } else if (Array.isArray(data.links)) {
        const sortedLinks = data.links.sort(
          (a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)
        );
        setLinks(sortedLinks);
        setFilteredLinks(sortedLinks);
      } else {
        console.error("Unexpected data format:", data);
        setLinks([]);
        setFilteredLinks([]);
      }
    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handles search functionality
  const handleSearch = () => {
    console.log("Search term before fetch:", searchTerm); // Log the search term
    fetchLinks(searchTerm);
  };

  // Handles link click to show details in a popup
  const handleLinkClick = (link) => {
    setSelectedLink(link);
  };

  // Closes the popup
  const handleClosePopup = () => {
    setSelectedLink(null);
  };

  // Function to validate URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Delete the selected link
  const handleDelete = async (linkId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this link?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/links/${linkId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      // Remove the deleted link from the links and filteredLinks state
      setLinks(links.filter((link) => link._id !== linkId));
      setFilteredLinks(filteredLinks.filter((link) => link._id !== linkId));

      alert("Link deleted successfully!");
      handleClosePopup(); // Close the popup after deletion
    } catch (error) {
      console.error("Error deleting link:", error);
      alert("Failed to delete the link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
        Link Analytics
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-4 w-full sm:w-1/2 lg:w-1/3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          placeholder="Search by custom alias"
        />
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-center mt-6 animate-pulse">Loading...</p>}

      <ul className="space-y-4 mt-6">
        {filteredLinks.map((link) => (
          <li
            key={link._id}
            className="p-4 bg-gray-800 rounded-md shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => handleLinkClick(link)}
          >
            <p>
              <strong>Shortened URL: </strong>
              <a
                href={`${link.longUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-all duration-300 no-underline"
              >
                {`https://minify-url.onrender.com/${link.shortCode}`}
              </a>
            </p>
            <p>
              <strong>Original URL: </strong>
              <a
                href={`${link.longUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-all duration-300 no-underline break-words"
              >
                {link.longUrl}
              </a>
            </p>
          </li>
        ))}
      </ul>

      {selectedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-500 ease-in-out opacity-100">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-xl transform transition-all duration-500 scale-95 hover:scale-100">
            <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              Link Details
            </h2>
            <p className="mb-2">
              <strong>Shortcode: </strong>
              <a
                href={`${selectedLink.longUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 break-words w-full transition-all duration-300 no-underline"
              >
                {selectedLink.shortCode}
              </a>
            </p>
            <p className="mb-2">
              <strong>Original URL: </strong>
              <span className="break-words">{selectedLink.longUrl}</span>
            </p>
            <p className="mb-2">
              <strong>Custom Alias:</strong> {selectedLink.customAlias || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Created At:</strong>{" "}
              {new Date(selectedLink.createdAt).toLocaleString()}
            </p>
            <p className="mb-2">
              <strong>Last Accessed:</strong>{" "}
              {selectedLink.lastAccessed
                ? new Date(selectedLink.lastAccessed).toLocaleString()
                : "N/A"}
            </p>
            <p className="mb-2">
              <strong>Expiration Date:</strong>{" "}
              {selectedLink.expirationDate
                ? new Date(selectedLink.expirationDate).toLocaleString()
                : "N/A"}
            </p>
            <p className="mb-4">
              <strong>Click Count:</strong> {selectedLink.clickCount}
            </p>
            <button
              onClick={() => handleDelete(selectedLink.shortCode)}
              className="mt-4 w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
            >
              Delete Link
            </button>
            <button
              onClick={handleClosePopup}
              className="mt-4 w-full p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
