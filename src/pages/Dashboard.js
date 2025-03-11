import React from "react";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-3xl font-semibold mb-8">Manage Profiles</h1>
      
      <button className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-gray-900 border-4 border-white hover:bg-gray-700 transition-all">
        <span className="text-5xl">+</span>
        <span className="text-sm mt-2 text-gray-400">Add Profile</span>
      </button>
    </div>
  );
}
