import 'package:flutter/material.dart';

class DataStructureTopicsScreen extends StatelessWidget {
  const DataStructureTopicsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Data Structures Topics")),
      body: const Center(
        child: Text("Array, Stack, Queue, Linked List, Tree"),
      ),
    );
  }
}