import 'package:flutter/material.dart';

class ComputerNetworkTopicsScreen extends StatelessWidget {
  const ComputerNetworkTopicsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Computer Network Topics")),
      body: const Center(
        child: Text("OSI Model, TCP/IP, Routing, DNS"),
      ),
    );
  }
}