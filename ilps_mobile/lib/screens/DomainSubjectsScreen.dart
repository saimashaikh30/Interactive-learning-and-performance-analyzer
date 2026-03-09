import 'package:flutter/material.dart';
import 'package:ilps_mobile/screens/SubjectTopicsScreen.dart';

class DomainSubjectsScreen extends StatefulWidget {
  final int domainId;
  final String domainName;

  const DomainSubjectsScreen({
    super.key,
    required this.domainId,
    required this.domainName,
  });

  @override
  State<DomainSubjectsScreen> createState() => _DomainSubjectsScreenState();
}

class _DomainSubjectsScreenState extends State<DomainSubjectsScreen> {

  // SEARCH VARIABLES
  bool isSearching = false;
  TextEditingController searchController = TextEditingController();

  List filteredSubjects = [];

  // Static subject data
  List<Map<String, dynamic>> subjects = [
    {"id": 1, "domain_id": 1, "name": "Arrays"},
    {"id": 2, "domain_id": 1, "name": "Linked List"},
    {"id": 3, "domain_id": 1, "name": "Stack"},
    {"id": 4, "domain_id": 1, "name": "Queue"},
  ];

  @override
  void initState() {
    super.initState();

    // Filter subjects based on selected domain
    filteredSubjects =
        subjects.where((s) => s["domain_id"] == widget.domainId).toList();
  }

  // SEARCH FUNCTION
  void searchData(String query) {

    String search = query.toLowerCase().trim();

    final domainSubjects =
        subjects.where((s) => s["domain_id"] == widget.domainId).toList();

    if (search.isEmpty) {
      setState(() {
        filteredSubjects = domainSubjects;
      });
      return;
    }

    final results = domainSubjects.where((subject) {
      final name = subject["name"].toString().toLowerCase();
      return name.contains(search);
    }).toList();

    setState(() {
      filteredSubjects = results;
    });
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FF),

      appBar: AppBar(
        backgroundColor: const Color(0xff4F46E5),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),

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
                    hintText: "Search subject...",
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
                widget.domainName,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
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

                  filteredSubjects = subjects
                      .where((s) => s["domain_id"] == widget.domainId)
                      .toList();
                }

                isSearching = !isSearching;
              });
            },
          ),
        ],
      ),

      body: Column(
        children: [

          const SizedBox(height: 20),

          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Subjects",
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          const SizedBox(height: 10),

          if (filteredSubjects.isEmpty)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text(
                "Subject not found",
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),

          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: filteredSubjects.length,
              itemBuilder: (context, index) {

                final subject = filteredSubjects[index];

                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => SubjectTopicsScreen(
                          subjectId: subject["id"],
                          subjectName: subject["name"],
                        ),
                      ),
                    );
                  },

                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),

                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),

                      boxShadow: [
                        BoxShadow(
                          color: const Color.fromARGB(255, 66, 8, 238)
                              .withOpacity(0.10),
                          blurRadius: 20,
                          offset: const Offset(0, 30),
                        )
                      ],
                    ),

                    child: Row(
                      children: [

                        Container(
                          width: 35,
                          height: 35,
                          alignment: Alignment.center,

                          decoration: BoxDecoration(
                            color: const Color(0xff4F46E5),
                            borderRadius: BorderRadius.circular(10),
                          ),

                          child: Text(
                            "${index + 1}",
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),

                        const SizedBox(width: 12),

                        Expanded(
                          child: Text(
                            subject["name"],
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),

                        const Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: Colors.grey,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}