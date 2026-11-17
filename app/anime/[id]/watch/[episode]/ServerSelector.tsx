
"use client";

import { useState } from "react";

export default function ServerSelector({
  servers,
}: {
  servers: string[];
}) {
  const [selected, setSelected] = useState(servers[0] || "");

  if (servers.length === 0) {
    return <p className="text-gray-500">No servers available.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="mb-3 font-bold">Available Servers</h2>

      <div className="flex flex-wrap gap-3">
        {servers.map((server) => (
          <button
            key={server}
            onClick={() => setSelected(server)}
            className={`rounded-lg px-5 py-3 font-semibold ${
              selected === server
                ? "bg-red-600 text-white"
                : "bg-[#252530] text-gray-300 hover:bg-red-600"
            }`}
          >
            {server}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Selected server: {selected}
      </p>
    </div>
  );
}
