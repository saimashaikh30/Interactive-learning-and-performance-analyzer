import React from "react";
import { motion } from "framer-motion";
import { MdMemory, MdRouter, MdDeveloperBoard } from "react-icons/md";

const subjects = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    short: "DSA",
    description:
      "Master problem-solving with arrays, trees, graphs, DP, and algorithms frequently asked in interviews.",
    icon: <MdMemory size={42} />,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    id: "cn",
    title: "Computer Networks",
    short: "CN",
    description:
      "Learn OSI, TCP/IP, routing, congestion control, and networking concepts asked by top companies.",
    icon: <MdRouter size={42} />,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "os",
    title: "Operating Systems",
    short: "OS",
    description:
      "Understand processes, threads, scheduling, memory management, and synchronization deeply.",
    icon: <MdDeveloperBoard size={42} />,
    gradient: "from-orange-500 to-amber-500",
  },
];

const Subjects = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Popular Subjects
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Choose a subject to start structured, placement-oriented preparation
          with real interview questions and analytics.
        </p>
      </div>

      {/* Subjects Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="group relative rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-xl"
          >
            {/* Gradient Strip */}
            <div
              className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${subject.gradient}`}
            />

            {/* Icon */}
            <div
              className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${subject.gradient} text-white`}
            >
              {subject.icon}
            </div>

            {/* Title */}
            <h3 className="mt-5 text-xl font-semibold text-gray-900">
              {subject.short}
            </h3>

            <p className="mt-1 text-sm font-medium text-gray-500">
              {subject.title}
            </p>

            {/* Description */}
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {subject.description}
            </p>

            {/* Action */}
            <div className="mt-6">
              <button
                className={`w-full rounded-xl bg-gradient-to-r ${subject.gradient} py-2.5 text-sm font-medium text-white transition hover:opacity-90`}
              >
                Explore
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;