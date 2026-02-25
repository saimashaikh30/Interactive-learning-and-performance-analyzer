import 'package:flutter/material.dart';

class OperatingSystemTopicsScreen extends StatelessWidget {
  const OperatingSystemTopicsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Operating System Topics")),
      body: const Center(
        child: Text("Process, Deadlock, Scheduling, Memory Management"),
      ),
    );
  }
}