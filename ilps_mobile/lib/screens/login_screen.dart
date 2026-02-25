import 'package:flutter/material.dart';
import 'package:ilps_mobile/screens/guest_home.dart';
import 'registration_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // bool rememberMe = false;
  bool obscurePassword = true;

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
                  Color.fromARGB(255, 124, 126, 242),
                  Color.fromARGB(255, 40, 49, 146),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 100),

                  /// ===== LOGIN CARD =====
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 25),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 25, vertical: 35),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(45),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.7),
                          blurRadius: 40,
                          spreadRadius: 5,
                          offset: const Offset(0, 20),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        /// TITLE
                        const Text(
                          "Sign in",
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Color.fromARGB(255, 11, 11, 11),
                          ),
                        ),

                        const SizedBox(height: 8),

                        const Text(
                          "Enter your email and password to sign in!",
                          style: TextStyle(
                            color: Color.fromARGB(255, 112, 111, 111),
                            fontSize: 13,
                          ),
                        ),

                        const SizedBox(height: 35),

                        /// EMAIL FIELD
                        _buildTextField(
                          hint: "email",
                          icon: Icons.email_outlined,
                        ),

                        const SizedBox(height: 20),

                        /// PASSWORD FIELD
                        _buildTextField(
                          hint: "password",
                          icon: Icons.lock_outline,
                          obscure: obscurePassword,
                          suffixIcon: IconButton(
                            icon: Icon(
                              obscurePassword
                                  ? Icons.visibility_off
                                  : Icons.visibility,
                              color: Colors.grey,
                            ),
                            onPressed: () {
                              setState(() {
                                obscurePassword = !obscurePassword;
                              });
                            },
                          ),
                        ),

                        const SizedBox(height: 12),

                        /// REMEMBER + FORGOT
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                // Checkbox(
                                //   value: rememberMe,
                                //   activeColor: const Color(0xFF3F3DFF),
                                //   onChanged: (value) {
                                //     setState(() {
                                //       rememberMe = value ?? false;
                                //     });
                                //   },
                                // ),
                                // const Text(
                                //   "Remember me",
                                //   style: TextStyle(fontSize: 13),
                                // ),
                              ],
                            ),
                            const Text(
                              "Forgot password?",
                              style: TextStyle(
                                fontSize: 13,
                                color: Color(0xFF7B6CFF),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 25),

                        /// LOGIN BUTTON
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(35),
                              gradient: const LinearGradient(
                                colors: [
                                  Color.fromARGB(255, 8, 8, 8),
                                  Color.fromARGB(255, 8, 8, 8),
                                  Color.fromARGB(255, 4, 4, 4),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Color(0xFF5C5BFF).withOpacity(0.8),
                                  blurRadius: 30,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                borderRadius: BorderRadius.circular(35),
                                onTap: () {},
                                child: const Center(
                                  child: Text(
                                    "Sign In",
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                      letterSpacing: 0.6,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 25),

                        /// OR
                        Row(
                          children: const [
                            Expanded(child: Divider(thickness: 1)),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 10),
                              child: Text(
                                "OR",
                                style: TextStyle(
                                    color: Color.fromARGB(255, 99, 99, 99)),
                              ),
                            ),
                            Expanded(child: Divider(thickness: 1)),
                          ],
                        ),

                        const SizedBox(height: 25),

                        /// GOOGLE BUTTON
                        SizedBox(
                          width: double.infinity,
                          height: 45,
                          child: Container(
                            padding:
                                const EdgeInsets.all(1.5), // border thickness
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(35),
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFF7B6CFF),
                                  Color(0xFF3F3DFF),
                                ],
                              ),
                            ),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(35),
                              ),
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide.none,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(35),
                                  ),
                                ),
                                onPressed: () {},
                                icon: Image.asset(
                                  "assets/images/google.png",
                                  height: 22,
                                ),
                                label: const Text(
                                  "Sign in with Google",
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 25),

                        /// REGISTER
                        /// REGISTER
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              "Not registered yet? ",
                              style: TextStyle(fontSize: 13),
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const RegistrationScreen(),
                                  ),
                                );
                              },
                              child: const Text(
                                "Create an account",
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF7B6CFF),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
          /// BACK BUTTON
          Positioned(
            top: 20,
            left: 15,
            child: SafeArea(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(
                    Icons.arrow_back_ios_new,
                    color: Colors.white,
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const GuestHome(),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String hint,
    required IconData icon,
    bool obscure = false,
    Widget? suffixIcon,
  }) {
    return TextField(
      obscureText: obscure,
      cursorColor: const Color(0xFF7B6CFF),
      decoration: InputDecoration(
        labelText: hint, // 👈 floating label
        floatingLabelBehavior: FloatingLabelBehavior.auto,

        prefixIcon: Icon(icon, color: const Color(0xFF7B6CFF)),
        suffixIcon: suffixIcon,

        filled: true,
        fillColor: const Color(0xFFF4F6FF),
        contentPadding: const EdgeInsets.symmetric(vertical: 18),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(
            color: Color(0xFF7B6CFF),
            width: 1,
          ),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(
            color: Color(0xFF3F3DFF),
            width: 2,
          ),
        ),

        floatingLabelStyle: const TextStyle(
          color: Color(0xFF3F3DFF),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
