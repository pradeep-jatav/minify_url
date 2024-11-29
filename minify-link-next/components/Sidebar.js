export default function Sidebar({ activeFeature, setActiveFeature }) {
  const features = [
    { id: "single", label: "Single URL Shortening" },
    { id: "batch", label: "Batch URL Shortening" },
    { id: "analytics", label: "Link Analytics" },
  ];
return (
  <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-gray-900 text-white h-full w-64 p-6 shadow-xl">
    <h2 className="text-3xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
      MinifyLink
    </h2>
    <ul className="space-y-4">
      {features.map((feature) => (
        <li key={feature.id}>
          <button
            onClick={() => setActiveFeature(feature.id)}
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
);
}
