import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:ilps_mobile/config/app_config.dart';
import 'package:ilps_mobile/screens/question_details_screen.dart';

class CompanyQuestionsScreen extends StatefulWidget {
  final int companyId;
  final String companyName;

  const CompanyQuestionsScreen({
    super.key,
    required this.companyId,
    required this.companyName,
  });

  @override
  State<CompanyQuestionsScreen> createState() => _CompanyQuestionsScreenState();
}

class _CompanyQuestionsScreenState extends State<CompanyQuestionsScreen> {
  bool isSearching = false;
  bool isLoadingQuestions = false;
  bool isLoadingQuestionTypes = false;

  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> questions = [];
  List<Map<String, dynamic>> filteredQuestions = [];
  List<Map<String, dynamic>> questionTypes = [];

  final List<String> difficultyLevels = ["easy", "medium", "hard"];

  String? difficulty;
  String? questionType;

  @override
  void initState() {
    super.initState();
    loadInitialData();
  }

  Future<void> loadInitialData() async {
    await Future.wait([
      fetchQuestionTypes(),
      fetchQuestionsByCompany(),
    ]);
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

  Future<void> fetchQuestionsByCompany() async {
    setState(() {
      isLoadingQuestions = true;
    });

    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/questions/getQuestions"),
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
            "company_id": item["company_id"],
            "technology": item["technology"],
            "language": item["language"],
            "year": item["year"],
          };
        }).where((q) {
          final matchesCompany = q["company_id"] == widget.companyId;
          final matchesDifficulty =
              difficulty == null || q["difficulty_level"] == difficulty;
          final matchesType =
              questionType == null || q["type_name"] == questionType;

          return matchesCompany && matchesDifficulty && matchesType;
        }).toList();

        setState(() {
          questions = loadedQuestions;
          filteredQuestions = loadedQuestions;
        });

        if (searchController.text.trim().isNotEmpty) {
          searchQuestions(searchController.text);
        }
      } else {
        setState(() {
          questions = [];
          filteredQuestions = [];
        });
        showSnackBar(data["message"] ?? "Failed to load questions");
      }
    } catch (e) {
      setState(() {
        questions = [];
        filteredQuestions = [];
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

  void searchQuestions(String query) {
    final search = query.toLowerCase().trim();

    if (search.isEmpty) {
      setState(() {
        filteredQuestions = List.from(questions);
      });
      return;
    }

    final results = questions.where((question) {
      final questionText = (question["question"] ?? "").toString().toLowerCase();
      final typeName = (question["type_name"] ?? "").toString().toLowerCase();
      final difficultyLevel =
          (question["difficulty_level"] ?? "").toString().toLowerCase();
      final technology = (question["technology"] ?? "").toString().toLowerCase();
      final language = (question["language"] ?? "").toString().toLowerCase();
      final year = (question["year"] ?? "").toString().toLowerCase();

      return questionText.contains(search) ||
          typeName.contains(search) ||
          difficultyLevel.contains(search) ||
          technology.contains(search) ||
          language.contains(search) ||
          year.contains(search);
    }).toList();

    setState(() {
      filteredQuestions = results;
    });
  }

  Future<void> onRefresh() async {
    searchController.clear();
    setState(() {
      isSearching = false;
      difficulty = null;
      questionType = null;
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
                      if ((question["technology"] ?? "").toString().isNotEmpty)
                        buildTag(question["technology"].toString()),
                      if ((question["language"] ?? "").toString().isNotEmpty)
                        buildTag(question["language"].toString()),
                      if ((question["year"] ?? "").toString().isNotEmpty)
                        buildTag(question["year"].toString()),
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
    final bool initialLoading = isLoadingQuestions || isLoadingQuestionTypes;

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
                    searchQuestions(value);
                    setState(() {});
                  },
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  decoration: InputDecoration(
                    hintText: "Search question...",
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
                              searchQuestions("");
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
                widget.companyName,
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
                  filteredQuestions = List.from(questions);
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
                      buildSectionTitle("Filters"),
                      const SizedBox(height: 12),

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
                                  await fetchQuestionsByCompany();
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
                                  await fetchQuestionsByCompany();
                                },
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 26),

                      buildSectionTitle("Questions"),
                      const SizedBox(height: 12),

                      if (filteredQuestions.isEmpty)
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
                          itemCount: filteredQuestions.length,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 18),
                          itemBuilder: (context, index) {
                            final question = filteredQuestions[index];
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