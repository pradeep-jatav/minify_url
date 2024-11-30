  import { useState } from "react";

  export default function Sidebar({ activeFeature, setActiveFeature }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const features = [
      { id: "single", label: "Single URL Shortening" },
      { id: "batch", label: "Batch URL Shortening" },
      { id: "analytics", label: "Link Analytics" },
    ];

    return (
      <div className="relative">
        {/* Hamburger Button for Mobile */}
        <button
          className="absolute top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-md md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "✖" : "☰"}
        </button>

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-br from-blue-900 via-gray-900 to-gray-900 text-white shadow-xl p-6 transform transition-transform duration-300 ease-in-out z-50 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static`}
        >
          <h2 className="text-3xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            MinifyLink
          </h2>
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature.id}>
                <button
                  onClick={() => {
                    setActiveFeature(feature.id); // Switch the active feature
                    setIsSidebarOpen(false); // Close the sidebar on mobile
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    activeFeature === feature.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  }`}
                >
                  {feature.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Backdrop for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)} // Closes sidebar when clicking on backdrop
          ></div>
        )}
      </div>
    );
  }
