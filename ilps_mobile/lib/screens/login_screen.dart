import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/io_client.dart';
import 'package:ilps_mobile/screens/dashboard_screen.dart';
import 'package:ilps_mobile/screens/guest_home.dart';
import 'registration_screen.dart';
import 'forget_password/verify_code_screen.dart';
import 'package:ilps_mobile/config/app_config.dart';

final GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['email'],
  serverClientId:
      "734249540796-a2o85k8cnufm4uibmsq07ccgtb2l9bsq.apps.googleusercontent.com",
);

// SSL bypass for dev/ngrok (DO NOT use in production!)
final IOClient ioClient = IOClient(
  HttpClient()..badCertificateCallback = (cert, host, port) => true,
);

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool obscurePassword = true;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> signInWithGoogle(BuildContext context) async {
    try {
      await _googleSignIn.signOut();
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        print("User cancelled login");
        return;
      }

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final accessToken = googleAuth.accessToken;

      if (accessToken == null) {
        print("Access token null");
        return;
      }

      final response = await ioClient.post(
        Uri.parse(
            "${AppConfig.baseUrl}/users/login"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "authprovider": "google",
          "access_token": accessToken,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        print("Google Login success");
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      } else {
        print("Backend error: ${data["message"]}");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? "Login failed")),
        );
      }
    } catch (e) {
      print("Google Sign-In error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Google Sign-In failed")),
      );
    }
  }

  Future<void> loginManually(BuildContext context) async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Email and password cannot be empty")),
      );
      return;
    }

    try {
      final response = await ioClient.post(
        Uri.parse(
            "${AppConfig.baseUrl}/users/login"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "authprovider": "local",
          "email": email,
          "password": password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        print("Manual login success");
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      } else {
        print("Login failed: ${data['message']}");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? "Login failed")),
        );
      }
    } catch (e) {
      print("Login error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Login failed")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF5F8CFF), // from
                  Color(0xFF7B8CFF), // via
                  Color(0xFF9AD7F5), // to
                ],
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 100),
                  // Login Card
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 25),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 25, vertical: 23),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(45),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.5),
                          blurRadius: 28,
                          spreadRadius: 3,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        const Text(
                          "Sign in",
                          style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          "Enter your email and password to sign in!",
                          style: TextStyle(
                              color: Color.fromARGB(255, 112, 111, 111),
                              fontSize: 13),
                        ),
                        const SizedBox(height: 35),
                        // Email Field
                        _buildTextField(
                          hint: "Email",
                          icon: Icons.email_outlined,
                          controller: _emailController,
                        ),
                        const SizedBox(height: 20),
                        // Password Field
                        _buildTextField(
                          hint: "Password",
                          icon: Icons.lock_outline,
                          obscure: obscurePassword,
                          controller: _passwordController,
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
                        // Forgot password
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: const [
                            Text(
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
                        // Login button
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: () => loginManually(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.black87,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(35)),
                            ),
                            child: const Text(
                              "Sign In",
                              style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.6),
                            ),
                          ),
                        ),
                        const SizedBox(height: 25),
                        // OR divider
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

                        const SizedBox(height: 20),

                        /// GOOGLE BUTTON
                        SizedBox(
                          width: double.infinity,
                          height: 45,
                          child: Container(
                            padding:
                                const EdgeInsets.all(1), // border thickness
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15),
                              gradient: const LinearGradient(
                                colors: [
                                  Color.fromARGB(255, 82, 3, 151),
                                  Color(0xFF3F3DFF),
                                ],
                              ),
                            ),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide.none,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                ),
                                onPressed: () => signInWithGoogle(context),
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
                        // Register
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text("Not registered yet? ",
                                style: TextStyle(fontSize: 13)),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) =>
                                          const RegistrationScreen()),
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
              child: CircleAvatar(
                backgroundColor: Colors.white.withOpacity(0.2),
                child: IconButton(
                  icon:
                      const Icon(Icons.arrow_back_ios_new, color: Colors.white),
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const GuestHome()),
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

//widget for textfield
  Widget _buildTextField({
    required String hint,
    required IconData icon,
    bool obscure = false,
    Widget? suffixIcon,
    TextEditingController? controller,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      cursorColor: Color.fromARGB(255, 82, 3, 151),
      decoration: InputDecoration(
        labelText: hint,
        floatingLabelBehavior: FloatingLabelBehavior.auto,
        prefixIcon: Icon(icon, color: const Color(0xFF7B6CFF)),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: const Color(0xFFF4F6FF),
        contentPadding: const EdgeInsets.symmetric(vertical: 18),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: Color(0xFF7B6CFF), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: Color(0xFF3F3DFF), width: 2),
        ),
        floatingLabelStyle: const TextStyle(
            color: Color(0xFF3F3DFF), fontWeight: FontWeight.w600),
      ),
    );
  }
}
