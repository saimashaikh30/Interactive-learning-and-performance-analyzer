import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String username = "";
  String role = "";
  String email = "";
  bool isGoogleUser = false;

  @override
  void initState() {
    super.initState();
    loadUserData();
  }

  /// Load user data
  Future<void> loadUserData() async {
    final prefs = await SharedPreferences.getInstance();

    setState(() {
      username = prefs.getString("username") ?? "User";
      role = prefs.getString("role") ?? "Student";
      email = prefs.getString("email") ?? "";
      isGoogleUser = prefs.getBool("isGoogleUser") ?? false;
    });
  }

  /// Logout confirmation dialog
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

  /// Logout function
  Future<void> logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove('isLoggedIn');
    await prefs.remove('user_name');
    await prefs.remove('name');
    await prefs.remove('username');

    if (!mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => const LoginScreen(),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    String firstLetter = username.isNotEmpty ? username[0].toUpperCase() : "?";

    return Scaffold(
      /// WHITE BACKGROUND
      backgroundColor: Colors.white,

      appBar: AppBar(
        backgroundColor: const Color(0xff4F46E5),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        titleSpacing: 0,
        title: const Text(
          "Profile",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            /// Profile Avatar
            Container(
              padding:
                  const EdgeInsets.all(4), // space between avatar and border
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: const Color(0xff4F46E5), // same as your app theme
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

            /// Username
            Text(
              username,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            /// Role
            Text(
              role,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),

            const SizedBox(height: 30),

            /// Edit Profile Card
            Card(
              color: Colors.white,
              elevation: 2,
              child: ListTile(
                leading: const Icon(Icons.edit),
                title: const Text("Edit Profile"),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
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
                  ).then((_) => loadUserData());
                },
              ),
            ),

            const Spacer(),

            /// Logout Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.logout),
                label: const Text("Logout"),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: showLogoutDialog,
              ),
            )
          ],
        ),
      ),
    );
  }
}
