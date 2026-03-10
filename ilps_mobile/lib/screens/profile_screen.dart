import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ilps_mobile/config/app_config.dart';
import 'login_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String username = "User";
  String role = "user";
  String email = "";
  bool isGoogleUser = false;
  String accessToken = "";

  bool isLoading = true;
  bool isRefreshing = false;

  @override
  void initState() {
    super.initState();
    initializeProfile();
  }

  Future<void> initializeProfile() async {
    await loadUserDataFromPrefs();
    await fetchProfileFromBackend();
  }

  String normalizeRole(String? value) {
    final roleValue = (value ?? "").toLowerCase().trim();

    if (roleValue == "contributor") return "Contributor";
    return "User";
  }

  Future<void> loadUserDataFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();

    final storedName =
        prefs.getString("user_name") ??
        prefs.getString("name") ??
        prefs.getString("username") ??
        "User";

    final storedRole =
        prefs.getString("role") ?? prefs.getString("user_role") ?? "user";

    final storedEmail = prefs.getString("email") ?? "";

    final storedToken =
        prefs.getString("access_token") ??
        prefs.getString("token") ??
        prefs.getString("accessToken") ??
        prefs.getString("jwt") ??
        "";

    final storedGoogleUser =
        prefs.getBool("isGoogleUser") ??
        (prefs.getString("auth_provider")?.toLowerCase() == "google");

    if (!mounted) return;

    setState(() {
      username = storedName.trim().isNotEmpty ? storedName.trim() : "User";
      role = normalizeRole(storedRole);
      email = storedEmail;
      accessToken = storedToken.trim();
      isGoogleUser = storedGoogleUser;
      isLoading = false;
    });
  }

  Future<void> fetchProfileFromBackend() async {
    if (accessToken.trim().isEmpty) return;

    if (mounted) {
      setState(() {
        isRefreshing = true;
      });
    }

    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/users/getProfile"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer ${accessToken.trim()}",
        },
      );

      debugPrint("Profile API status: ${response.statusCode}");
      debugPrint("Profile API body: ${response.body}");

      if (response.statusCode == 401) {
        await logout(context, showMessage: true);
        return;
      }

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data["user"] != null) {
        final user = data["user"];

        final freshName = (user["name"] ?? "User").toString().trim();
        final freshRoleRaw = (user["role"] ?? "user").toString();
        final freshEmail = (user["email"] ?? "").toString().trim();

        bool freshGoogleUser = false;
        if (user["auth_provider"] != null) {
          freshGoogleUser =
              user["auth_provider"].toString().toLowerCase() == "google";
        } else {
          freshGoogleUser = isGoogleUser;
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("user_name", freshName);
        await prefs.setString("username", freshName);
        await prefs.setString("name", freshName);
        await prefs.setString("role", freshRoleRaw.toLowerCase().trim());
        await prefs.setString("email", freshEmail);
        await prefs.setBool("isGoogleUser", freshGoogleUser);

        if (!mounted) return;

        setState(() {
          username = freshName.isNotEmpty ? freshName : "User";
          role = normalizeRole(freshRoleRaw);
          email = freshEmail;
          isGoogleUser = freshGoogleUser;
        });
      }
    } catch (e) {
      debugPrint("fetchProfileFromBackend error: $e");
      showSnackBar("Failed to refresh profile");
    } finally {
      if (mounted) {
        setState(() {
          isRefreshing = false;
        });
      }
    }
  }

  Future<void> onRefresh() async {
    await loadUserDataFromPrefs();
    await fetchProfileFromBackend();
  }

  void showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Logout"),
          content: const Text("Are you sure you want to logout?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                logout(context);
              },
              child: const Text("Logout"),
            ),
          ],
        );
      },
    );
  }

  Future<void> logout(
    BuildContext context, {
    bool showMessage = false,
  }) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove('isLoggedIn');
    await prefs.remove('user_name');
    await prefs.remove('name');
    await prefs.remove('username');
    await prefs.remove('role');
    await prefs.remove('user_role');
    await prefs.remove('email');
    await prefs.remove('user_id');
    await prefs.remove('id');
    await prefs.remove('access_token');
    await prefs.remove('token');
    await prefs.remove('accessToken');
    await prefs.remove('jwt');
    await prefs.remove('isGoogleUser');
    await prefs.remove('auth_provider');

    if (!mounted) return;

    if (showMessage) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Session expired. Please login again."),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
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
  Widget build(BuildContext context) {
    final String firstLetter =
        username.trim().isNotEmpty ? username.trim()[0].toUpperCase() : "?";

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xff4F46E5),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        titleSpacing: 0,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Profile",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 22,
              ),
            ),
            if (isRefreshing) ...[
              const SizedBox(width: 10),
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              ),
            ],
          ],
        ),
        actions: [
          IconButton(
            onPressed: isRefreshing ? null : onRefresh,
            icon: const Icon(Icons.refresh, color: Colors.white),
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: onRefresh,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minHeight: MediaQuery.of(context).size.height - 160,
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xff4F46E5),
                            width: 3,
                          ),
                        ),
                        child: CircleAvatar(
                          radius: 50,
                          backgroundColor: Colors.blue.shade100,
                          child: Text(
                            firstLetter,
                            style: const TextStyle(
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 15),
                      Text(
                        username,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        role,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                      if (email.trim().isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          email,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                      const SizedBox(height: 30),
                      Card(
                        color: Colors.white,
                        elevation: 2,
                        child: ListTile(
                          leading: const Icon(Icons.edit),
                          title: const Text("Edit Profile"),
                          subtitle: Text(
                            isGoogleUser
                                ? "Google account linked"
                                : "Manage your profile details",
                          ),
                          trailing:
                              const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => EditProfileScreen(
                                  username: username,
                                  email: email,
                                  isGoogleUser: isGoogleUser,
                                ),
                              ),
                            ).then((_) async {
                              await loadUserDataFromPrefs();
                              await fetchProfileFromBackend();
                            });
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      Card(
                        color: Colors.white,
                        elevation: 2,
                        child: ListTile(
                          leading: const Icon(Icons.mail_outline),
                          title: const Text("Email"),
                          subtitle: Text(
                            email.trim().isEmpty ? "No email found" : email,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.logout),
                          label: const Text("Logout"),
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                            backgroundColor: const Color(0xff4F46E5),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: showLogoutDialog,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}