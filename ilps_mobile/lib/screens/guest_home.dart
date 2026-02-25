import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart';
import 'registration_screen.dart';

class GuestHome extends StatefulWidget {
  const GuestHome({super.key});

  @override
  State<GuestHome> createState() => _GuestHomeState();
}

class _GuestHomeState extends State<GuestHome>
    with SingleTickerProviderStateMixin {
  final PageController _controller = PageController();
  int _currentPage = 0;

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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                  child: Row(
                    children: [
                      SizedBox(
                        height: 85,
                        child: Image.asset(
                          "assets/images/logo.png",
                          fit: BoxFit.contain,
                        ),
                      ),
                      const Spacer(),
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
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    children: [
                      _heroPage(),
                      _featurePage(),
                      _subjectPage(),
                      _finalPage(),
                    ],
                  ),
                ),

                /// ================= DOT INDICATOR =================
                const SizedBox(height: 15),
                _buildDotIndicator(),
                const SizedBox(height: 50),
              ],
            ),
          ),
        ],
      ),
    );
  }

  ///
  late AnimationController _borderController;

@override
void initState() {
  super.initState();
  _borderController = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 6), // slower = premium
  )..repeat();
}

@override
void dispose() {
  _borderController.dispose();
  super.dispose();
}

Widget _premiumBorderButton({
  required String text,
  required VoidCallback onTap,
  required double radius,
  EdgeInsets padding =
      const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
}) {
  return GestureDetector(
    onTap: onTap,
    child: AnimatedBuilder(
      animation: _borderController,
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.all(2.5),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(radius),
            gradient: SweepGradient(
              colors: const [
                Colors.transparent,
                Color.fromARGB(255, 129, 79, 246),
                Color.fromARGB(255, 39, 42, 238),
                Color.fromARGB(255, 117, 71, 222),
                Colors.transparent,
              ],
              stops: const [0.0, 0.25, 0.5, 0.75, 1.0],
              transform:
                  GradientRotation(_borderController.value * 6.3),
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF8B5CF6)
                    .withOpacity(0.5),
                blurRadius: 25,
                spreadRadius: 1,
              ),
            ],
          ),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF6366F1),
                  Color(0xFF8B5CF6),
                ],
              ),
              borderRadius:
                  BorderRadius.circular(radius - 2.5),
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
      },
    ),
  );
}

  /// ================= DOT INDICATOR =================
  Widget _buildDotIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        4, // because you have 5 pages
        (index) => AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.symmetric(horizontal: 6),
          height: 8,
          width: _currentPage == index ? 28 : 8,
          decoration: BoxDecoration(
            color: _currentPage == index ? Colors.white : Colors.white38,
            borderRadius: BorderRadius.circular(20),
          ),
        ),
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
          _subjectCard("Data Structures & Algorithms", "assets/images/dsa.png"),
          const SizedBox(height: 20),
          _subjectCard("Computer Networks", "assets/images/cn.png"),
          const SizedBox(height: 20),
          _subjectCard("Operating Systems", "assets/images/os.png"),
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
  return _premiumBorderButton(
    text: "Sign In",
    radius: 30,
    padding:
        const EdgeInsets.symmetric(horizontal: 25, vertical: 8),
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    },
  );
}
 Widget _registerButton(String text) {
  return _premiumBorderButton(
    text: text,
    radius: 40,
    padding:
        const EdgeInsets.symmetric(horizontal: 45, vertical: 16),
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(
            builder: (_) => const RegistrationScreen()),
      );
    },
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
                        color: Colors.white, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Text(subtitle,
                    style: GoogleFonts.poppins(
                        color: Colors.white70, fontSize: 13)),
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
                    color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}
