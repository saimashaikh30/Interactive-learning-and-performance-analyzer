import 'package:flutter/material.dart';
import 'success_screen.dart';
import 'package:http/io_client.dart';
import 'package:ilps_mobile/config/app_config.dart';
import 'dart:convert';
import 'dart:io';

final IOClient ioClient = IOClient(
  HttpClient()..badCertificateCallback = (cert, host, port) => true,
);

class ResetPasswordScreen extends StatefulWidget {
  final String email;
  const ResetPasswordScreen({super.key, required this.email});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  bool _isPasswordHidden = true;
  bool _isConfirmHidden = true;
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

//fix needed
  Future<void> chnagePassword(BuildContext context) async {
    final password = _passwordController.text.trim();
    final confirmpassword = _confirmController.text;
    if (confirmpassword.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill the passwords")),
      );
      return;
    } else if (confirmpassword != password) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Passwords do not match")),
      );
      return;
    }
    try {
      final response = await ioClient.put(
        Uri.parse("${AppConfig.baseUrl}/users/changePassword"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "password": password,
          "email": widget.email,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const SuccessScreen()),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? "Password Change failed")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Password Change failed")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
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
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(25),
            width: 350,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Reset Password",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 8),

                const Text(
                  "Enter your new password below.",
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),

                const SizedBox(height: 20),

                // 🔐 NEW PASSWORD FIELD
                _buildTextField(
                  hint: "New Password",
                  icon: Icons.lock_outline,
                  obscure: _isPasswordHidden,
                  controller: _passwordController,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordHidden
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: Colors.grey,
                    ),
                    onPressed: () {
                      setState(() {
                        _isPasswordHidden = !_isPasswordHidden;
                      });
                    },
                  ),
                ),

                const SizedBox(height: 15),

                // 🔐 CONFIRM PASSWORD FIELD
                _buildTextField(
                  hint: "Confirm Password",
                  icon: Icons.lock_outline,
                  obscure: _isConfirmHidden,
                  controller: _confirmController,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isConfirmHidden
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: Colors.grey,
                    ),
                    onPressed: () {
                      setState(() {
                        _isConfirmHidden = !_isConfirmHidden;
                      });
                    },
                  ),
                ),

                const SizedBox(height: 20),

                // 🔵 BUTTON
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color.fromARGB(255, 78, 62, 247),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                     chnagePassword(context);
                    },
                    child: const Text(
                      "Reset Password",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

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
      cursorColor: const Color.fromARGB(255, 82, 3, 151),
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
          borderSide: const BorderSide(
            color: Color.fromARGB(255, 82, 3, 151),
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(
            color: Color.fromARGB(255, 82, 3, 151),
            width: 2,
          ),
        ),
        floatingLabelStyle: const TextStyle(
          color: Color.fromARGB(255, 82, 3, 151),
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
