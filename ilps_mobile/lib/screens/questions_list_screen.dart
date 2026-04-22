import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ilps_mobile/config/app_config.dart';
import 'package:ilps_mobile/screens/add_questions_screen.dart';

class QuestionsList extends StatefulWidget {
  const QuestionsList({super.key});

  @override
  State<QuestionsList> createState() => _QuestionsListState();
}

class _QuestionsListState extends State<QuestionsList> {
  final TextEditingController searchController = TextEditingController();

  int? userId;
  String userName = "Contributor";

  bool isLoading = false;

  List<Map<String, dynamic>> questions = [];
  List<Map<String, dynamic>> filteredQuestions = [];

  @override
  void initState() {
    super.initState();
    initializeScreen();
  }

  Future<void> initializeScreen() async {
    await loadUserData();
    await fetchContributorQuestions();
  }

  Future<void> loadUserData() async {
    final prefs = await SharedPreferences.getInstance();

    final storedUserId =
        prefs.getInt("user_id") ??
        prefs.getInt("id") ??
        (prefs.getString("user_id") != null
            ? int.tryParse(prefs.getString("user_id")!)
            : null) ??
        (prefs.getString("id") != null
            ? int.tryParse(prefs.getString("id")!)
            : null);

    final storedName =
        prefs.getString("user_name") ??
        prefs.getString("name") ??
        prefs.getString("username") ??
        "Contributor";

    if (!mounted) return;

    setState(() {
      userId = storedUserId == 0 ? null : storedUserId;
      userName = storedName;
    });
  }

  Future<void> fetchContributorQuestions() async {
    if (userId == null) {
      showSnackBar("User ID not found. Please login again.");
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/questions/getQuestionsByCreator/$userId"),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> questionList = data["questions"] ?? [];

        final List<Map<String, dynamic>> loadedQuestions =
            questionList.map<Map<String, dynamic>>((item) {
          final latestOccurrence =
              item["latest_occurrence"] is Map<String, dynamic>
                  ? Map<String, dynamic>.from(item["latest_occurrence"])
                  : <String, dynamic>{};

          final companyNames = List<String>.from(item["company_names"] ?? []);
          final difficultyLevels =
              List<String>.from(item["difficulty_levels"] ?? []);
          final years = List<String>.from(
            (item["years"] ?? []).map((e) => e.toString()),
          );
          final languages = List<String>.from(item["languages"] ?? []);
          final technologies = List<String>.from(item["technologies"] ?? []);

          return {
            "id": item["question_id"],
            "question": item["question_string"] ?? "",
            "type_name": item["type_name"] ?? "",
            "creator_name": item["creator_name"] ?? "",
            "topics": List<Map<String, dynamic>>.from(item["topics"] ?? []),
            "options": List<Map<String, dynamic>>.from(item["options"] ?? []),
            "appearance_count": item["appearance_count"] ?? 0,
            "difficulty_level":
                latestOccurrence["difficulty_level"] ??
                (difficultyLevels.isNotEmpty ? difficultyLevels.first : ""),
            "company_name":
                latestOccurrence["company_name"] ??
                (companyNames.isNotEmpty ? companyNames.join(", ") : ""),
            "technology":
                latestOccurrence["technology"] ??
                (technologies.isNotEmpty ? technologies.join(", ") : ""),
            "language":
                latestOccurrence["language"] ??
                (languages.isNotEmpty ? languages.join(", ") : ""),
            "year":
                latestOccurrence["year"]?.toString() ??
                (years.isNotEmpty ? years.join(", ") : ""),
            "company_names": companyNames,
            "difficulty_levels": difficultyLevels,
            "years": years,
            "languages": languages,
            "technologies": technologies,
            "latest_occurrence": latestOccurrence,
          };
        }).toList();

        setState(() {
          questions = loadedQuestions;
          filteredQuestions = loadedQuestions;
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load questions");
      }
    } catch (e) {
      showSnackBar("Error loading questions");
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  void filterQuestions(String query) {
    final search = query.toLowerCase().trim();

    if (search.isEmpty) {
      setState(() {
        filteredQuestions = questions;
      });
      return;
    }

    final results = questions.where((q) {
      final questionText = (q["question"] ?? "").toString().toLowerCase();
      final difficulty = (q["difficulty_level"] ?? "").toString().toLowerCase();
      final typeName = (q["type_name"] ?? "").toString().toLowerCase();
      final companyName = (q["company_name"] ?? "").toString().toLowerCase();
      final technology = (q["technology"] ?? "").toString().toLowerCase();
      final language = (q["language"] ?? "").toString().toLowerCase();
      final year = (q["year"] ?? "").toString().toLowerCase();
      final appearanceCount =
          (q["appearance_count"] ?? "").toString().toLowerCase();

      final List topics = q["topics"] ?? [];
      final topicNames = topics
          .map((t) => (t["topic_name"] ?? "").toString().toLowerCase())
          .join(" ");

      return questionText.contains(search) ||
          difficulty.contains(search) ||
          typeName.contains(search) ||
          companyName.contains(search) ||
          technology.contains(search) ||
          language.contains(search) ||
          year.contains(search) ||
          appearanceCount.contains(search) ||
          topicNames.contains(search);
    }).toList();

    setState(() {
      filteredQuestions = results;
    });
  }

  Future<void> onRefresh() async {
    searchController.clear();
    await loadUserData();
    await fetchContributorQuestions();
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

  Widget buildTag(
    String text, {
    Color? color,
    Color? textColor,
    double maxWidth = 140,
  }) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: maxWidth),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color ?? const Color(0xffEEEAFE),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          softWrap: false,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: textColor ?? const Color(0xff6246EA),
          ),
        ),
      ),
    );
  }

  Color getDifficultyBg(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return const Color(0xffE8F5E9);
      case "medium":
        return const Color(0xffFFF8E1);
      case "hard":
        return const Color(0xffFDECEA);
      default:
        return const Color(0xffEEEAFE);
    }
  }

  Color getDifficultyText(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return const Color(0xff2E7D32);
      case "medium":
        return const Color(0xffEF6C00);
      case "hard":
        return const Color(0xffC62828);
      default:
        return const Color(0xff6246EA);
    }
  }

  String getTopicsText(List topics) {
    if (topics.isEmpty) return "No topics";
    return topics
        .map((t) => (t["topic_name"] ?? "").toString())
        .where((name) => name.isNotEmpty)
        .join(", ");
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final tagMaxWidth = (screenWidth - 80) / 2;

    return Scaffold(
      backgroundColor: const Color(0xffF4F6FA),
      body: RefreshIndicator(
        onRefresh: onRefresh,
        child: Column(
          children: [
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Color(0xff6246EA),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(28),
                  bottomRight: Radius.circular(28),
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "My Questions",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        "Questions added by $userName",
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: TextField(
                          controller: searchController,
                          onChanged: (value) {
                            filterQuestions(value);
                            setState(() {});
                          },
                          decoration: InputDecoration(
                            icon: const Icon(Icons.search),
                            hintText: "Search questions",
                            border: InputBorder.none,
                            suffixIcon: searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.close),
                                    onPressed: () {
                                      searchController.clear();
                                      filterQuestions("");
                                      setState(() {});
                                    },
                                  )
                                : null,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const AddQuestions(),
                              ),
                            );
                            await onRefresh();
                          },
                          icon: const Icon(Icons.add),
                          label: const Text(
                            "Add Question",
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xff6246EA),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filteredQuestions.isEmpty
                      ? SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          child: SizedBox(
                            height: MediaQuery.of(context).size.height * 0.5,
                            child: const Center(
                              child: Text(
                                "No questions found",
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ),
                        )
                      : ListView.builder(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredQuestions.length,
                          itemBuilder: (context, index) {
                            final question = filteredQuestions[index];
                            final List topics = question["topics"] ?? [];

                            return Container(
                              margin: const EdgeInsets.only(bottom: 14),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xff6246EA).withOpacity(0.10),
                                    blurRadius: 12,
                                    offset: const Offset(0, 5),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    question["question"] ?? "",
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: [
                                      if ((question["difficulty_level"] ?? "")
                                          .toString()
                                          .isNotEmpty)
                                        buildTag(
                                          question["difficulty_level"],
                                          maxWidth: tagMaxWidth,
                                          color: getDifficultyBg(
                                            question["difficulty_level"],
                                          ),
                                          textColor: getDifficultyText(
                                            question["difficulty_level"],
                                          ),
                                        ),
                                      if ((question["type_name"] ?? "")
                                          .toString()
                                          .isNotEmpty)
                                        buildTag(
                                          question["type_name"],
                                          maxWidth: tagMaxWidth,
                                        ),
                                      if ((question["company_name"] ?? "")
                                          .toString()
                                          .isNotEmpty)
                                        buildTag(
                                          question["company_name"],
                                          maxWidth: tagMaxWidth,
                                        ),
                                      if ((question["year"] ?? "")
                                          .toString()
                                          .isNotEmpty)
                                        buildTag(
                                          question["year"],
                                          maxWidth: tagMaxWidth,
                                        ),
                                      if ((question["appearance_count"] ?? 0) > 0)
                                        buildTag(
                                          "${question["appearance_count"]} times",
                                          maxWidth: tagMaxWidth,
                                          color: const Color(0xffE0F2FE),
                                          textColor: const Color(0xff0369A1),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  if ((question["technology"] ?? "")
                                      .toString()
                                      .isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 6),
                                      child: Text(
                                        "Technology: ${question["technology"]}",
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: Colors.black87,
                                        ),
                                      ),
                                    ),
                                  if ((question["language"] ?? "")
                                      .toString()
                                      .isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 6),
                                      child: Text(
                                        "Language: ${question["language"]}",
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: Colors.black87,
                                        ),
                                      ),
                                    ),
                                  Text(
                                    "Topics: ${getTopicsText(topics)}",
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: Colors.black87,
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}