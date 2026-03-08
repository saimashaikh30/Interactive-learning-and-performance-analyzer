import GuestNavbar from "../../components/GuestNavbar";
import SubjectCard from "../../components/SubjectCard";
import "../../styles/guest.css";

import dsa from "../../assets/img/landing/dsa.png";
import cn from "../../assets/img/landing/cn.png";
import os from "../../assets/img/landing/os.png";

function GuestHome() {
  return (
    <>
      <GuestNavbar />

      {/* HERO SECTION */}
      <section className="hero" id="hero">
        <div className="hero-left">
          <h1>
            Interactive Learning <br />
            & Performance System
          </h1>

          <p>
            Prepare for placements with subject-wise, topic-wise and
            difficulty-based questions. Analyze your performance and
            improve faster.
          </p>

          <a href="/auth/sign-up" className="glow-btn big-btn">
            Get Started
          </a>
        </div>

        <div className="hero-right">
          <img src={require("../../assets/img/landing/hero.png")} alt="Hero Illustration" />
        </div>

        <div className="hero-blur one"></div>
        <div className="hero-blur two"></div>
      </section>

      {/* SUBJECT SECTION */}
      <section className="subjects-section" id="subjects">
        <h2 className="section-title">Explore Our Core Subjects</h2>
        <p className="section-subtitle">
          Master the most important placement subjects with structured practice.
        </p>

        <div className="subjects">
          <SubjectCard title="Data Structures & Algorithms" image={dsa} />
          <SubjectCard title="Computer Networks" image={cn} />
          <SubjectCard title="Operating Systems" image={os} />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" id="features">
        <h2 className="section-title">What ILPS Provides</h2>

        <div className="feature-grid">
          <div className="feature-card">
            📊 Performance Analytics
            <p>Track subject-wise and topic-wise performance.</p>
          </div>

          <div className="feature-card">
            🏢 Company Wise Questions
            <p>Practice previous year interview questions.</p>
          </div>

          <div className="feature-card">
            🎯 Difficulty Filtering
            <p>Easy, Medium and Hard level selection.</p>
          </div>

          {/* <div className="feature-card">
            🧠 Coding + MCQ Support
            <p>Practice MCQs, Fill in blanks and coding problems.</p>
          </div> */}
        </div>
      </section>

      

      {/* STATS - NOW BELOW HOW IT WORKS */}
      <section className="stats-bar" id="stats">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Practice Questions</div>
        </div>

        <div className="divider"></div>

        <div className="stat-item">
          <div className="stat-number">50+</div>
          <div className="stat-label">Company-wise Sets</div>
        </div>

        <div className="divider"></div>

        <div className="stat-item">
          <div className="stat-number">3</div>
          <div className="stat-label">Core Subjects</div>
        </div>

        <div className="divider"></div>

        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Access Anywhere</div>
        </div>
      </section>

      {/* PREMIUM CTA SECTION */}
      <section className="cta-premium" id='cta'>

        <div className="cta-box">
          <h2>Ready to Crack Your Dream Placement?</h2>
          <p>Start structured preparation with ILPS and boost your confidence today.</p>

          <a href="/auth/sign-up" className="cta-btn">
            Start Learning Now
          </a>
        </div>

      </section>

      {/* FOOTER SECTION */}
      <footer className="footer">
        <h2>Made with ❤️ for Future Engineers</h2>

        <p>
          ILPS helps students master DSA, Computer Networks and Operating Systems
          with structured practice, company-wise questions and performance analytics.
        </p>

        <hr />

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/subjects">Subjects</a>
          <a href="/features">Features</a>
          <a href="/stats">Stats</a>
        </div>

        <div className="footer-copy">
          © 2026 ILPS — Interactive Learning & Performance System
        </div>
      </footer>
    </>
  );
}

export default GuestHome;