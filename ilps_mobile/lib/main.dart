import 'package:flutter/material.dart';
import 'screens/guest_home.dart';
import 'colors/colors.dart';
import 'screens/splash_screen.dart';
import 'screens/dashboard_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  // Required for calling async code before runApp
  WidgetsFlutterBinding.ensureInitialized(); 
  
  final prefs = await SharedPreferences.getInstance();
  final bool isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

  runApp(MyApp(isLoggedIn: isLoggedIn));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;
  const MyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.background,
      ),
      // If logged in, go to Dashboard. Otherwise, show Splash or Login.
      // home: isLoggedIn ? const DashboardScreen() : const SplashScreen(),
      home: const DashboardScreen(),
    );
  }
}



//Logout code
// Future<void> logout(BuildContext context) async {
//   final prefs = await SharedPreferences.getInstance();
//   await prefs.remove('isLoggedIn'); // Or prefs.clear() to wipe everything

//   if (!mounted) return;
//   Navigator.pushAndRemoveUntil(
//     context,
//     MaterialPageRoute(builder: (_) => const LoginScreen()),
//     (route) => false,
//   );
// }