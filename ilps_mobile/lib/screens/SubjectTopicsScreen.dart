import 'package:flutter/material.dart';

class SubjectTopicsScreen extends StatefulWidget {
  final int subjectId;
  final String subjectName;

  const SubjectTopicsScreen({
    super.key,
    required this.subjectId,
    required this.subjectName,
  });

  @override
  State<SubjectTopicsScreen> createState() => _SubjectTopicsScreenState();
}

class _SubjectTopicsScreenState extends State<SubjectTopicsScreen> {
  // SEARCH VARIABLES
  bool isSearching = false;
  TextEditingController searchController = TextEditingController();

  List filteredTopics = [];

  // Static topics
  List<Map<String, dynamic>> topics = [
    {"id": 1, "name": "Arrays"},
    {"id": 2, "name": "Linked List"},
    {"id": 3, "name": "Stack"},
    {"id": 4, "name": "Queue"},
  ];

  // Static questions
  List<Map<String, dynamic>> questions = [
    {"question": "What is the time complexity of Binary Search?"},
    {"question": "Explain the difference between TCP and UDP."},
    {"question": "What is Deadlock in Operating System?"}
  ];

  // Dropdown data
  List<String> difficultyLevels = ["Easy", "Medium", "Hard"];
  List<String> questionTypes = ["MCQ"];

  String difficulty = "Easy";
  String questionType = "MCQ";

  @override
  void initState() {
    super.initState();
    filteredTopics = topics;
  }

  // SEARCH FUNCTION
  void searchData(String query) {
    String search = query.toLowerCase().trim();

    if (search.isEmpty) {
      setState(() {
        filteredTopics = topics;
      });
      return;
    }

    final topicResults = topics.where((topic) {
      final topicName = topic["name"].toString().toLowerCase();
      return topicName.contains(search);
    }).toList();

    setState(() {
      filteredTopics = topicResults;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FF),
      appBar: AppBar(
        backgroundColor: const Color(0xff4F46E5),
        elevation: 0,
        iconTheme: const IconThemeData(
          color: Colors.white, // makes back arrow white
        ),
        title: isSearching
            ? Container(
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                ),
                child: TextField(
                  controller: searchController,
                  autofocus: true,
                  decoration: const InputDecoration(
                    hintText: "Search topic...",
                    border: InputBorder.none,
                    prefixIcon: Icon(Icons.search),
                    contentPadding: EdgeInsets.symmetric(vertical: 10),
                  ),
                  onChanged: (value) {
                    searchData(value);
                  },
                ),
              )
            : Text(
                widget.subjectName,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
        actions: [
          IconButton(
            icon: Icon(isSearching ? Icons.close : Icons.search),
            color: Colors.white,
            onPressed: () {
              setState(() {
                if (isSearching) {
                  searchController.clear();
                  filteredTopics = topics;
                }

                isSearching = !isSearching;
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),

            if (filteredTopics.isEmpty)
              const Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  "Topic not found",
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),

            // TOPIC TITLE
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Topics",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 10),

            // TOPIC LIST
            SizedBox(
              height: 80,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: filteredTopics.length,
                itemBuilder: (context, index) {
                  final topic = filteredTopics[index];

                  return Container(
                    width: 150,
                    margin: const EdgeInsets.only(right: 12),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xffE8EDFF),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: const Color(0xff4F46E5),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: Text(
                      topic["name"],
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 30),

            // FILTER DROPDOWNS
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: difficulty,
                      decoration: InputDecoration(
                        labelText: "Difficulty",
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      items: difficultyLevels
                          .map((level) => DropdownMenuItem(
                              value: level, child: Text(level)))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          difficulty = value!;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: questionType,
                      decoration: InputDecoration(
                        labelText: "Question Type",
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      items: questionTypes
                          .map((type) =>
                              DropdownMenuItem(value: type, child: Text(type)))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          questionType = value!;
                        });
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 25),

            // QUESTION TITLE
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Questions",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 10),

            // QUESTION LIST
            ListView.builder(
              itemCount: questions.length,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemBuilder: (context, index) {
                final question = questions[index];

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xff4F46E5).withOpacity(0.18),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          question["question"],
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
