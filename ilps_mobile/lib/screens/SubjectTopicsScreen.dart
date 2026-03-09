import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:ilps_mobile/config/app_config.dart';
import 'package:ilps_mobile/screens/question_details_screen.dart';

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
  bool isSearching = false;
  bool isLoadingTopics = false;
  bool isLoadingQuestions = false;
  bool isLoadingQuestionTypes = false;

  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> topics = [];
  List<Map<String, dynamic>> filteredTopics = [];
  List<Map<String, dynamic>> questions = [];
  List<Map<String, dynamic>> questionTypes = [];

  final List<String> difficultyLevels = ["easy", "medium", "hard"];

  String? difficulty;
  String? questionType;
  int? selectedTopicId;

  @override
  void initState() {
    super.initState();
    loadInitialData();
  }

  Future<void> loadInitialData() async {
    await Future.wait([
      fetchTopicsBySubject(),
      fetchQuestionTypes(),
    ]);

    await fetchQuestionsBySubject();
  }

  Future<void> fetchTopicsBySubject() async {
    setState(() {
      isLoadingTopics = true;
    });

    try {
      final response = await http.get(
        Uri.parse(
          "${AppConfig.baseUrl}/topics/getTopicsBySubject/${widget.subjectId}",
        ),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> topicList = data["topics"] ?? [];

        final List<Map<String, dynamic>> loadedTopics =
            topicList.map<Map<String, dynamic>>((item) {
          return {
            "id": item["topic_id"],
            "name": item["topic_name"],
            "subject_id": item["subject_id"],
          };
        }).toList();

        setState(() {
          topics = loadedTopics;
          filteredTopics = loadedTopics;
          selectedTopicId = null;
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load topics");
      }
    } catch (e) {
      showSnackBar("Error loading topics");
    } finally {
      if (mounted) {
        setState(() {
          isLoadingTopics = false;
        });
      }
    }
  }

  Future<void> fetchQuestionTypes() async {
    setState(() {
      isLoadingQuestionTypes = true;
    });

    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/questionTypes/getQuestionTypes"),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> typeList = data["question_types"] ?? [];

        final List<Map<String, dynamic>> loadedTypes =
            typeList.map<Map<String, dynamic>>((item) {
          return {
            "id": item["type_id"],
            "name": item["type_name"],
          };
        }).toList();

        setState(() {
          questionTypes = loadedTypes;
          questionType = null;
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load question types");
      }
    } catch (e) {
      showSnackBar("Error loading question types");
    } finally {
      if (mounted) {
        setState(() {
          isLoadingQuestionTypes = false;
        });
      }
    }
  }

  int? get selectedQuestionTypeId {
    if (questionType == null) return null;

    final matches =
        questionTypes.where((type) => type["name"] == questionType).toList();

    if (matches.isEmpty) return null;
    return matches.first["id"] as int;
  }

  Future<void> fetchQuestionsBySubject() async {
    setState(() {
      isLoadingQuestions = true;
    });

    try {
      final queryParams = <String, String>{};

      if (selectedTopicId != null) {
        queryParams["topic_id"] = selectedTopicId.toString();
      }

      if (selectedQuestionTypeId != null) {
        queryParams["type_id"] = selectedQuestionTypeId.toString();
      }

      if (difficulty != null && difficulty!.isNotEmpty) {
        queryParams["difficulty_level"] = difficulty!;
      }

      final uri = Uri.parse(
        "${AppConfig.baseUrl}/questions/getQuestionsBySubject/${widget.subjectId}",
      ).replace(
        queryParameters: queryParams.isEmpty ? null : queryParams,
      );

      final response = await http.get(
        uri,
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> questionList = data["questions"] ?? [];

        final List<Map<String, dynamic>> loadedQuestions =
            questionList.map<Map<String, dynamic>>((item) {
          return {
            "id": item["question_id"],
            "question": item["question_string"],
            "difficulty_level": item["difficulty_level"],
            "type_name": item["type_name"],
            "company_name": item["company_name"],
            "technology": item["technology"],
            "language": item["language"],
            "year": item["year"],
          };
        }).toList();

        setState(() {
          questions = loadedQuestions;
        });
      } else {
        setState(() {
          questions = [];
        });
        showSnackBar(data["message"] ?? "Failed to load questions");
      }
    } catch (e) {
      setState(() {
        questions = [];
      });
      showSnackBar("Error loading questions");
    } finally {
      if (mounted) {
        setState(() {
          isLoadingQuestions = false;
        });
      }
    }
  }

  void searchData(String query) {
    final search = query.toLowerCase().trim();

    if (search.isEmpty) {
      setState(() {
        filteredTopics = List.from(topics);
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

  Future<void> onRefresh() async {
    searchController.clear();
    setState(() {
      isSearching = false;
      selectedTopicId = null;
      questionType = null;
      difficulty = null;
    });
    await loadInitialData();
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

  String formatDifficulty(String value) {
    if (value.isEmpty) return value;
    return value[0].toUpperCase() + value.substring(1).toLowerCase();
  }

  InputDecoration buildDropdownDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: Colors.grey.shade700,
      ),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: const OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(14)),
        borderSide: BorderSide(
          color: Color(0xff5F8CFF),
          width: 1.2,
        ),
      ),
    );
  }

  Widget buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 19,
            fontWeight: FontWeight.w700,
            color: const Color(0xff1F2937),
          ),
        ),
      ),
    );
  }

  Widget buildTopicCard(Map<String, dynamic> topic) {
    final bool isSelected = selectedTopicId == topic["id"];

    return GestureDetector(
      onTap: () async {
        setState(() {
          if (selectedTopicId == topic["id"]) {
            selectedTopicId = null;
          } else {
            selectedTopicId = topic["id"];
          }
        });
        await fetchQuestionsBySubject();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        constraints: const BoxConstraints(minWidth: 120, maxWidth: 155),
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF5F8CFF),
                    Color(0xFF7B8CFF),
                    Color(0xFF9AD7F5),
                  ],
                )
              : null,
          color: isSelected ? null : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? Colors.transparent : const Color(0xffDCE4FF),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected
                  ? const Color(0xFF5F8CFF).withOpacity(0.18)
                  : Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: Text(
            topic["name"],
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : const Color(0xff1F2937),
              height: 1.25,
            ),
          ),
        ),
      ),
    );
  }

  Widget buildTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xffEEF2FF),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: const Color(0xff4F46E5),
        ),
      ),
    );
  }

 Widget buildQuestionCard(Map<String, dynamic> question, int index) {
  return GestureDetector(
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => QuestionDetailScreen(
            questionId: question["id"],
          ),
        ),
      );
    },
    child: Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xffEEF2FF)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xff4F46E5).withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: const Color(0xffEEF2FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              "${index + 1}",
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: const Color(0xff4F46E5),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  question["question"] ?? "",
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xff1F2937),
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if ((question["difficulty_level"] ?? "")
                        .toString()
                        .isNotEmpty)
                      buildTag(
                        formatDifficulty(
                          question["difficulty_level"].toString(),
                        ),
                      ),
                    if ((question["type_name"] ?? "").toString().isNotEmpty)
                      buildTag(question["type_name"].toString()),
                    if ((question["company_name"] ?? "").toString().isNotEmpty)
                      buildTag(question["company_name"].toString()),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(
            Icons.arrow_forward_ios_rounded,
            size: 16,
            color: Colors.grey,
          ),
        ],
      ),
    ),
  );
}

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool initialLoading = isLoadingTopics || isLoadingQuestionTypes;

    return Scaffold(
      backgroundColor: const Color(0xffF6F8FC),
      appBar: AppBar(
        backgroundColor: const Color(0xff4F46E5),
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: Colors.white),
        titleSpacing: 0,
        title: isSearching
            ? Container(
                height: 42,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFF5F8CFF),
                      Color(0xFF7B8CFF),
                      Color(0xFF9AD7F5),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: searchController,
                  autofocus: true,
                  onChanged: (value) {
                    searchData(value);
                    setState(() {});
                  },
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  decoration: InputDecoration(
                    hintText: "Search topic...",
                    hintStyle: GoogleFonts.inter(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                    border: InputBorder.none,
                    prefixIcon: const Icon(
                      Icons.search,
                      color: Colors.white,
                      size: 19,
                    ),
                    suffixIcon: searchController.text.isNotEmpty
                        ? IconButton(
                            onPressed: () {
                              searchController.clear();
                              searchData("");
                              setState(() {});
                            },
                            icon: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 19,
                            ),
                          )
                        : null,
                  ),
                ),
              )
            : Text(
                widget.subjectName,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
        actions: [
          IconButton(
            icon: Icon(isSearching ? Icons.close : Icons.search),
            color: Colors.white,
            iconSize: 21,
            onPressed: () {
              setState(() {
                if (isSearching) {
                  searchController.clear();
                  filteredTopics = List.from(topics);
                }
                isSearching = !isSearching;
              });
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: onRefresh,
        child: initialLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.only(top: 18, bottom: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (filteredTopics.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 8,
                          ),
                          child: Center(
                            child: Text(
                              "Topic not found",
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: Colors.grey,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),

                      buildSectionTitle("Topics"),
                      const SizedBox(height: 12),

                      SizedBox(
                        height: 85,
                        child: filteredTopics.isEmpty
                            ? Center(
                                child: Text(
                                  "No topics available",
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    color: Colors.grey,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              )
                            : ListView.builder(
                                scrollDirection: Axis.horizontal,
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 18),
                                itemCount: filteredTopics.length,
                                itemBuilder: (context, index) {
                                  final topic = filteredTopics[index];
                                  return buildTopicCard(topic);
                                },
                              ),
                      ),

                      const SizedBox(height: 26),

                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        child: Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String?>(
                                value: difficulty,
                                iconSize: 21,
                                borderRadius: BorderRadius.circular(12),
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xff1F2937),
                                ),
                                decoration:
                                    buildDropdownDecoration("Difficulty"),
                                items: [
                                  DropdownMenuItem<String?>(
                                    value: null,
                                    child: Text(
                                      "All",
                                      style: GoogleFonts.inter(fontSize: 14),
                                    ),
                                  ),
                                  ...difficultyLevels.map(
                                    (level) => DropdownMenuItem<String?>(
                                      value: level,
                                      child: Text(
                                        formatDifficulty(level),
                                        style: GoogleFonts.inter(fontSize: 14),
                                      ),
                                    ),
                                  ),
                                ],
                                onChanged: (value) async {
                                  setState(() {
                                    difficulty = value;
                                  });
                                  await fetchQuestionsBySubject();
                                },
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: DropdownButtonFormField<String?>(
                                value: questionType,
                                iconSize: 21,
                                borderRadius: BorderRadius.circular(12),
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xff1F2937),
                                ),
                                decoration:
                                    buildDropdownDecoration("Question Type"),
                                items: [
                                  DropdownMenuItem<String?>(
                                    value: null,
                                    child: Text(
                                      "All",
                                      style: GoogleFonts.inter(fontSize: 14),
                                    ),
                                  ),
                                  ...questionTypes.map(
                                    (type) => DropdownMenuItem<String?>(
                                      value: type["name"] as String,
                                      child: Text(
                                        type["name"] as String,
                                        style: GoogleFonts.inter(fontSize: 14),
                                      ),
                                    ),
                                  ),
                                ],
                                onChanged: (value) async {
                                  setState(() {
                                    questionType = value;
                                  });
                                  await fetchQuestionsBySubject();
                                },
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 26),

                      buildSectionTitle("Questions"),
                      const SizedBox(height: 12),

                      if (isLoadingQuestions)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 30),
                          child: Center(
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else if (questions.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 8,
                          ),
                          child: Center(
                            child: Text(
                              "No questions found",
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: Colors.grey,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        )
                      else
                        ListView.builder(
                          itemCount: questions.length,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 18),
                          itemBuilder: (context, index) {
                            final question = questions[index];
                            return buildQuestionCard(question, index);
                          },
                        ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}