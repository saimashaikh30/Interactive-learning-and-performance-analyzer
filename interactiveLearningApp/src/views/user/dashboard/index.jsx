import React from "react";

const UserDashboard = () => {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back 👋
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose a subject, practice problems, and track your placement readiness.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Subjects Selected</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">0</p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Problems Solved</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">0</p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Accuracy</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">0%</p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Current Streak</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">0 days</p>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">
          Your Subjects
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Select a subject to explore topics and start practicing.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border p-4 hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-800">Data Structures</h3>
            <p className="text-xs text-gray-500">Arrays, Strings, Trees</p>
          </div>

          <div className="rounded-md border p-4 hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-800">Algorithms</h3>
            <p className="text-xs text-gray-500">Searching, Sorting, DP</p>
          </div>

          <div className="rounded-md border p-4 hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-800">Operating Systems</h3>
            <p className="text-xs text-gray-500">Processes, Memory</p>
          </div>
        </div>
      </div>

      {/* Practice CTA */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">
          Start Practicing
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Practice MCQs, fill-in-the-blanks, or coding problems.
        </p>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Practice Now
          </button>

          <button className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            View Topics
          </button>
        </div>
      </div>

      {/* Frequently Asked / Modal Concepts */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">
          Frequently Asked Problems
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Based on company-wise and year-wise interview analysis.
        </p>

        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Two Sum (Arrays)
            </span>
            <span className="text-xs text-gray-500">
              Asked in 12 companies
            </span>
          </li>

          <li className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Binary Search Variants
            </span>
            <span className="text-xs text-gray-500">
              Repeated 8 times
            </span>
          </li>

          <li className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Recursion Tree Problems
            </span>
            <span className="text-xs text-gray-500">
              High frequency
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;