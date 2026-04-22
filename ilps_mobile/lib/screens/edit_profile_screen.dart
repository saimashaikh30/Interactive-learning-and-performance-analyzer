import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ilps_mobile/config/app_config.dart';

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
  late TextEditingController passwordController;

  bool isSaving = false;

  @override
  void initState() {
    super.initState();
    usernameController = TextEditingController(text: widget.username);
    emailController = TextEditingController(text: widget.email);
    passwordController = TextEditingController();
  }

  String normalizeText(String value) {
    return value.trim().replaceAll(RegExp(r'\s+'), ' ');
  }

  bool isValidName(String value) {
    return RegExp(r'^[A-Za-z ]+$').hasMatch(value);
  }

  bool isValidEmail(String value) {
    return RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(value);
  }

  bool isStrongPassword(String value) {
    return RegExp(
      r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
    ).hasMatch(value);
  }

  bool validateForm() {
    final username = normalizeText(usernameController.text);
    final email = normalizeText(emailController.text).toLowerCase();
    final password = passwordController.text.trim();

    if (username.isEmpty) {
      showSnackBar("Username is required");
      return false;
    }

    if (username.length < 2 || username.length > 50) {
      showSnackBar("Username must be between 2 and 50 characters");
      return false;
    }

    if (!isValidName(username)) {
      showSnackBar("Username must contain only letters and spaces");
      return false;
    }

    if (!widget.isGoogleUser) {
      if (email.isEmpty) {
        showSnackBar("Email is required");
        return false;
      }

      if (!isValidEmail(email)) {
        showSnackBar("Invalid email format");
        return false;
      }

      if (password.isNotEmpty && !isStrongPassword(password)) {
        showSnackBar(
          "Password must be at least 8 characters and include letter, number and special character",
        );
        return false;
      }
    }

    return true;
  }

  Future<void> saveProfile() async {
    if (!validateForm()) return;

    final prefs = await SharedPreferences.getInstance();

    final accessToken =
        prefs.getString("access_token") ??
        prefs.getString("token") ??
        prefs.getString("accessToken") ??
        prefs.getString("jwt") ??
        "";

    if (accessToken.trim().isEmpty) {
      showSnackBar("Session expired. Please login again.");
      return;
    }

    try {
      setState(() {
        isSaving = true;
      });

      final payload = {
        "name": normalizeText(usernameController.text),
        "email": normalizeText(emailController.text).toLowerCase(),
        "password": passwordController.text.trim(),
      };

      final response = await http.put(
        Uri.parse("${AppConfig.baseUrl}/users/editProfile"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer ${accessToken.trim()}",
        },
        body: jsonEncode(payload),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final user = data["user"];

        await prefs.setString("user_name", (user["name"] ?? "User").toString());
        await prefs.setString("name", (user["name"] ?? "User").toString());
        await prefs.setString("username", (user["name"] ?? "User").toString());
        await prefs.setString("email", (user["email"] ?? "").toString());
        await prefs.setString("role", (user["role"] ?? "student").toString());

        if (!mounted) return;

        showSnackBar(data["message"] ?? "Profile updated successfully");
        Navigator.pop(context, true);
      } else if (response.statusCode == 401) {
        showSnackBar("Session expired. Please login again.");
      } else {
        showSnackBar(data["message"] ?? "Failed to update profile");
      }
    } catch (e) {
      showSnackBar("Failed to update profile");
    } finally {
      if (mounted) {
        setState(() {
          isSaving = false;
        });
      }
    }
  }

  void showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: usernameController,
              decoration: const InputDecoration(
                labelText: "Username",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
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
            TextField(
              controller: passwordController,
              enabled: !widget.isGoogleUser,
              obscureText: true,
              decoration: InputDecoration(
                labelText: "New Password",
                border: const OutlineInputBorder(),
                helperText: widget.isGoogleUser
                    ? "Google users cannot change password"
                    : "Leave blank if you do not want to change password",
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isSaving ? null : saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xff4F46E5),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: Text(
                  isSaving ? "Saving..." : "Save Changes",
                  style: const TextStyle(
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