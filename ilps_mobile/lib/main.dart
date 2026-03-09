import 'package:flutter/material.dart';
import 'screens/guest_home.dart';
import 'colors/colors.dart';
import 'screens/splash_screen.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "",
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.background,
      ),
      home: const DashboardScreen(),
    );
  }
}
