import 'package:flutter/material.dart';
import 'reset_password_screen.dart';
import 'package:http/io_client.dart';
import 'package:ilps_mobile/config/app_config.dart';
import 'dart:convert';
import 'dart:io';

final IOClient ioClient = IOClient(
  HttpClient()..badCertificateCallback = (cert, host, port) => true,
);

class VerifyCodeScreen extends StatefulWidget {
  final String email;
  const VerifyCodeScreen({super.key,required this.email});
  @override
  State<VerifyCodeScreen> createState() =>_VerifyCodeScreenState();
}

class _VerifyCodeScreenState extends State<VerifyCodeScreen> {
  final TextEditingController _otpController = TextEditingController();

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> verifyOtp(BuildContext context) async {
    final otp = _otpController.text.trim();
    if (otp.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter otp")),
      );
      return;
    }

    try {
      final response = await ioClient.post(
        Uri.parse("${AppConfig.baseUrl}/users/verifyOtp"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "email":widget.email,
          "otp": otp,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) =>  ResetPasswordScreen(email: widget.email,)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? "OTP verifiaction failed")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Otp verification failed")),
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
                  "Verify Code",
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                const Text("Enter the 6-digit code sent to your email"),
                const SizedBox(height: 20),
                //textfield
                _buildTextField(
                    hint: " 6-digit otp",
                    controller: _otpController),
                const SizedBox(height: 20),
                //button
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
                     verifyOtp(context);
                    },
                    child: const Text(
                      "Verify Code",
                      style: TextStyle(
                        color: Colors.white,
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
    TextEditingController? controller,
  }) {
    return TextField(
      controller: controller,
      maxLength: 6,
      cursorColor: const Color.fromARGB(255, 82, 3, 151),
      decoration: InputDecoration(
        labelText: hint,
        floatingLabelBehavior: FloatingLabelBehavior.auto,
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
