import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EditProfileScreen extends StatefulWidget {
  final String username;
  final String email;
  final bool isGoogleUser;

  const EditProfileScreen({
    super.key,
    required this.username,
    required this.email,
    required this.isGoogleUser,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController usernameController;
  late TextEditingController emailController;
  TextEditingController passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();

    usernameController = TextEditingController(text: widget.username);
    emailController = TextEditingController(text: widget.email);
  }

  Future<void> saveProfile() async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.setString("username", usernameController.text);
    await prefs.setString("email", emailController.text);

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      /// White Screen
      backgroundColor: Colors.white,

      /// Same AppBar Style as other screens
      appBar: AppBar(
        backgroundColor: const Color(0xff4F46E5),
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: Colors.white),
        titleSpacing: 0,
        title: const Text(
          "Edit Profile",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            /// Username
            TextField(
              controller: usernameController,
              decoration: const InputDecoration(
                labelText: "Username",
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 20),

            /// Email
            TextField(
              controller: emailController,
              enabled: !widget.isGoogleUser,
              decoration: InputDecoration(
                labelText: "Email",
                border: const OutlineInputBorder(),
                helperText: widget.isGoogleUser
                    ? "Google users cannot change email"
                    : null,
              ),
            ),

            const SizedBox(height: 20),

            /// Password
            TextField(
              controller: passwordController,
              enabled: !widget.isGoogleUser,
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
                border: const OutlineInputBorder(),
                helperText: widget.isGoogleUser
                    ? "Google users cannot change password"
                    : null,
              ),
            ),

            const SizedBox(height: 30),

            /// Save Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xff4F46E5),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text(
                  "Save Changes",
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
