import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart';
import 'registration_screen.dart';

class GuestHome extends StatefulWidget {
  const GuestHome({super.key});

  @override
  State<GuestHome> createState() => _GuestHomeState();
}

class _GuestHomeState extends State<GuestHome> {
  final PageController _controller = PageController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [

          /// Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFF0F172A),
                  Color(0xFF1E293B),
                  Color(0xFF312E81),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [

                /// ================= TOP BAR =================
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                  child: Row(
                    children: [

                      /// Logo (Left)
                      SizedBox(
                        height: 85,
                        child: Image.asset(
                          "assets/images/logo.png",
                          fit: BoxFit.contain,
                        ),
                      ),

                      const Spacer(),

                      /// Sign In Button
                      SizedBox(
                        height: 40,
                        child: _signInButton(),
                      ),
                    ],
                  ),
                ),

                /// ================= PAGE VIEW =================
                Expanded(
                  child: PageView(
                    controller: _controller,
                    children: [
                      _heroPage(),
                      _featurePage(),
                      _subjectPage(),
                      _howItWorksPage(),
                      _finalPage(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// ================= PAGE 1 =================
  Widget _heroPage() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [

          Text(
            "Interactive Learning\n& Performance System",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 30,
              fontWeight: FontWeight.bold,
              height: 1.3,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 25),

          Text(
            "Prepare smarter for placements with company-focused and difficulty-based questions.",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: Colors.white70,
            ),
          ),

          const SizedBox(height: 40),

          _registerButton("Get Started"),
        ],
      ),
    );
  }

  /// ================= PAGE 2 =================
  Widget _featurePage() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 25),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [

          Text(
            "Why Choose ILPS?",
            style: GoogleFonts.poppins(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 10),

          Text(
            "Powerful features designed to boost your placement preparation.",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.white60,
            ),
          ),

          const SizedBox(height: 35),

          _featureCard(
            "Performance Analytics",
            "Track strengths & weaknesses intelligently.",
            Icons.auto_graph,
          ),

          const SizedBox(height: 20),

          _featureCard(
            "Company-wise Questions",
            "Practice frequently asked interview questions.",
            Icons.school,
          ),

          const SizedBox(height: 20),

          _featureCard(
            "Coding Practice",
            "Solve DSA, CN & OS problems interactively.",
            Icons.code,
          ),
        ],
      ),
    );
  }

  /// ================= PAGE 3 =================
  Widget _subjectPage() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 25),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [

          Text(
            "Subjects",
            style: GoogleFonts.poppins(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 30),

          _subjectCard("Data Structures & Algorithms",
              "assets/images/dsa.png"),

          const SizedBox(height: 20),

          _subjectCard("Computer Networks",
              "assets/images/cn.png"),

          const SizedBox(height: 20),

          _subjectCard("Operating Systems",
              "assets/images/os.png"),
        ],
      ),
    );
  }

  /// ================= PAGE 4 =================
  Widget _howItWorksPage() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 25),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [

          Text(
            "How It Works?",
            style: GoogleFonts.poppins(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 35),

          _modernStepCard("Select Subject",
              "Choose topic and difficulty level."),

          const SizedBox(height: 20),

          _modernStepCard("Solve Questions",
              "Practice MCQs and coding problems."),

          const SizedBox(height: 20),

          _modernStepCard("Track Progress",
              "Analyze performance and improve."),
        ],
      ),
    );
  }

  /// ================= PAGE 5 =================
  Widget _finalPage() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [

          Text(
             "Start your placement preparation journey today and achieve your dream job with ILPS 🚀",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 40),

          _registerButton("Create Account"),
        ],
      ),
    );
  }

  /// ================= BUTTONS =================

  Widget _signInButton() {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 25),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
          ),
          borderRadius: BorderRadius.circular(30),
        ),
        alignment: Alignment.center,
        child: Text(
          "Sign In",
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _registerButton(String text) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const RegistrationScreen()),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 45, vertical: 16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
          ),
          borderRadius: BorderRadius.circular(40),
        ),
        child: Text(
          text,
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  /// ================= CARDS =================

  Widget _featureCard(String title, String subtitle, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Text(subtitle,
                    style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _subjectCard(String title, String image) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.asset(
              image,
              width: 80,
              height: 60,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Text(title,
                style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _modernStepCard(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E293B), Color(0xFF312E81)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(subtitle,
              style: GoogleFonts.poppins(
                  color: Colors.white70,
                  fontSize: 13)),
        ],
      ),
    );
  }
}