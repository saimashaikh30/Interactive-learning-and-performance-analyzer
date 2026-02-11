import React from "react";

const Home = () => {
  return (
    <div>

      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-indigo-50">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Interactive Learning & Performance Analyzer
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Practice MCQs, Fill-in-the-Blanks, and Coding Problems
          organized by topic and difficulty. Prepare smarter with
          company-specific question analysis and performance grading.
        </p>

        <a
          href="/auth/sign-up"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-700"
        >
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-8">
        <h3 className="text-3xl font-bold text-center mb-12">Features</h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="shadow-lg p-6 rounded-xl">
            <h4 className="text-xl font-semibold mb-3">Topic-wise Learning</h4>
            <p className="text-gray-600">
              Questions categorized by topic and difficulty level.
            </p>
          </div>

          <div className="shadow-lg p-6 rounded-xl">
            <h4 className="text-xl font-semibold mb-3">Company Analysis</h4>
            <p className="text-gray-600">
              Interview questions graded based on company frequency.
            </p>
          </div>

          <div className="shadow-lg p-6 rounded-xl">
            <h4 className="text-xl font-semibold mb-3">Performance Tracking</h4>
            <p className="text-gray-600">
              Real-time analytics and grading system.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
