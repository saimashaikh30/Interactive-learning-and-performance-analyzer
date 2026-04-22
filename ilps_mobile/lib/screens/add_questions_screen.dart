import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ilps_mobile/config/app_config.dart';

class AddQuestions extends StatefulWidget {
  final int? questionId;

  const AddQuestions({super.key, this.questionId});

  @override
  State<AddQuestions> createState() => _AddQuestionsState();
}

class _AddQuestionsState extends State<AddQuestions> {
  final TextEditingController questionController = TextEditingController();
  final TextEditingController languageController = TextEditingController();
  final TextEditingController technologyController = TextEditingController();
  final TextEditingController topicSearchController = TextEditingController();

  final List<TextEditingController> optionControllers = List.generate(
    4,
    (_) => TextEditingController(),
  );

  final List<bool> optionCorrect = [false, false, false, false];

  List<Map<String, dynamic>> questionTypes = [];
  List<Map<String, dynamic>> companies = [];
  List<Map<String, dynamic>> subjects = [];
  List<Map<String, dynamic>> allSubjectTopics = [];
  List<Map<String, dynamic>> topicSuggestions = [];
  List<Map<String, dynamic>> selectedTopics = [];

  String? selectedDifficulty;
  int? selectedTypeId;
  int? selectedCompanyId;
  int? selectedSubjectId;
  String? selectedYear;

  bool isLoading = false;
  bool isSaving = false;

  int? createdBy;

  String? errorMessage;
  String? successMessage;
  String? suggestedQuestion;
  String? serverAction;
  double? similarityScore;

  bool alignmentIssue = false;
  double? alignmentScore;
  String? matchedTopic;
  String? alignmentDetails;

  List<Map<String, dynamic>> grammarIssues = [];
  Map<String, dynamic>? matchedQuestion;

  final List<String> difficultyLevels = ["easy", "medium", "hard"];

  bool get isEdit => widget.questionId != null;

  int get currentYear => DateTime.now().year;

  List<String> get years =>
      List.generate(30, (index) => (currentYear - index).toString());

  Map<String, dynamic>? get selectedType {
    try {
      return questionTypes.firstWhere(
        (t) => (t["type_id"] as int) == selectedTypeId,
      );
    } catch (_) {
      return null;
    }
  }

  bool get isMcqType {
    final name = (selectedType?["type_name"] ?? "").toString().toLowerCase();
    return name == "mcq" || name == "multiple choice";
  }

  bool get shouldShowSuggestion {
    final suggestion = suggestedQuestion?.trim();
    final current = questionController.text.trim();
    if (suggestion == null || suggestion.isEmpty) return false;
    return suggestion.toLowerCase() != current.toLowerCase();
  }

  @override
  void initState() {
    super.initState();
    initializeScreen();
  }

  Future<void> initializeScreen() async {
    await loadUserId();
    await fetchFilters();
    if (isEdit) {
      await fetchQuestion();
    }
  }

  Future<void> loadUserId() async {
    final prefs = await SharedPreferences.getInstance();

    final storedUserId = prefs.getInt("user_id") ??
        prefs.getInt("id") ??
        (prefs.getString("user_id") != null
            ? int.tryParse(prefs.getString("user_id")!)
            : null) ??
        (prefs.getString("id") != null
            ? int.tryParse(prefs.getString("id")!)
            : null);

    if (!mounted) return;

    setState(() {
      createdBy = storedUserId;
    });
  }

  void clearServerFeedback() {
    setState(() {
      errorMessage = null;
      successMessage = null;
      suggestedQuestion = null;
      serverAction = null;
      similarityScore = null;
      alignmentIssue = false;
      alignmentScore = null;
      matchedTopic = null;
      alignmentDetails = null;
      grammarIssues = [];
      matchedQuestion = null;
    });
  }

  Future<void> fetchFilters() async {
    try {
      setState(() {
        isLoading = true;
      });

      final responses = await Future.wait([
        http.get(
          Uri.parse("${AppConfig.baseUrl}/questionTypes/getQuestionTypes"),
          headers: {"Content-Type": "application/json"},
        ),
        http.get(
          Uri.parse("${AppConfig.baseUrl}/companies/getCompanies"),
          headers: {"Content-Type": "application/json"},
        ),
        http.get(
          Uri.parse("${AppConfig.baseUrl}/subjects/getSubjects"),
          headers: {"Content-Type": "application/json"},
        ),
      ]);

      final typesRes = responses[0];
      final companiesRes = responses[1];
      final subjectsRes = responses[2];

      final typesData = jsonDecode(typesRes.body);
      final companiesData = jsonDecode(companiesRes.body);
      final subjectsData = jsonDecode(subjectsRes.body);

      if (typesRes.statusCode == 200 &&
          companiesRes.statusCode == 200 &&
          subjectsRes.statusCode == 200) {
        if (!mounted) return;

        setState(() {
          questionTypes = List<Map<String, dynamic>>.from(
            typesData["question_types"] ?? [],
          );
          companies = List<Map<String, dynamic>>.from(
            companiesData["companies"] ?? [],
          );
          subjects = List<Map<String, dynamic>>.from(
            subjectsData["subjects"] ?? [],
          );
        });
      } else {
        showSnackBar("Failed to load form data");
      }
    } catch (e) {
      showSnackBar("Failed to load form data");
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Future<void> fetchQuestion() async {
    if (widget.questionId == null) return;

    try {
      setState(() {
        isLoading = true;
      });

      clearServerFeedback();

      final response = await http.get(
        Uri.parse(
          "${AppConfig.baseUrl}/questions/getQuestion/${widget.questionId}",
        ),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode != 200) {
        showSnackBar(data["message"] ?? "Failed to load question");
        return;
      }

      final q = data["question"];

      questionController.text = (q["question_string"] ?? "").toString().trim();
      selectedTypeId = q["type_id"];

      final latestOccurrence = q["latest_occurrence"];
      if (latestOccurrence != null) {
        selectedDifficulty = latestOccurrence["difficulty_level"]?.toString();
        selectedCompanyId = latestOccurrence["company_id"];
        selectedYear = latestOccurrence["year"]?.toString();
        languageController.text =
            (latestOccurrence["language"] ?? "").toString().trim();
        technologyController.text =
            (latestOccurrence["technology"] ?? "").toString().trim();
      }

      final topics = List<Map<String, dynamic>>.from(q["topics"] ?? []);
      selectedTopics = topics;

      if (topics.isNotEmpty) {
        selectedSubjectId = topics.first["subject_id"];
        await fetchTopicsBySubject(selectedSubjectId!);
      }

      final options = List<Map<String, dynamic>>.from(q["options"] ?? []);
      if (options.isNotEmpty) {
        for (int i = 0; i < optionControllers.length; i++) {
          if (i < options.length) {
            optionControllers[i].text =
                (options[i]["option_text"] ?? "").toString().trim();
            optionCorrect[i] = options[i]["is_correct"] == true;
          } else {
            optionControllers[i].clear();
            optionCorrect[i] = false;
          }
        }
      }

      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      showSnackBar("Failed to load question");
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Future<void> fetchTopicsBySubject(int subjectId) async {
    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/topics/getTopicsBySubject/$subjectId"),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        setState(() {
          allSubjectTopics =
              List<Map<String, dynamic>>.from(data["topics"] ?? []);
        });
        filterTopicSuggestions(topicSearchController.text);
      } else {
        setState(() {
          allSubjectTopics = [];
          topicSuggestions = [];
        });
      }
    } catch (e) {
      setState(() {
        allSubjectTopics = [];
        topicSuggestions = [];
      });
    }
  }

  String normalizeText(String value) {
    return value.trim().replaceAll(RegExp(r'\s+'), ' ');
  }

  bool isValidSimpleText(String value) {
    return RegExp(r"^[A-Za-z0-9\s.+#&,_/\-()]+$").hasMatch(value);
  }

  bool isValidQuestionText(String value) {
    return value.trim().length >= 8;
  }

  void filterTopicSuggestions(String value) {
    final query = value.trim().toLowerCase();

    if (query.isEmpty) {
      setState(() {
        topicSuggestions = [];
      });
      return;
    }

    final filtered = allSubjectTopics.where((topic) {
      final name = (topic["topic_name"] ?? "").toString().toLowerCase();
      final alreadySelected = selectedTopics.any(
        (t) => t["topic_id"] == topic["topic_id"],
      );
      return name.contains(query) && !alreadySelected;
    }).toList();

    setState(() {
      topicSuggestions = filtered;
    });
  }

  void addTopic(Map<String, dynamic> topic) {
    final exists =
        selectedTopics.any((t) => t["topic_id"] == topic["topic_id"]);
    if (!exists) {
      setState(() {
        selectedTopics.add(topic);
        topicSearchController.clear();
        topicSuggestions = [];
      });
    }
  }

  void removeTopic(int topicId) {
    setState(() {
      selectedTopics.removeWhere((t) => t["topic_id"] == topicId);
    });
  }

  void handleCorrectOption(int index) {
    for (int i = 0; i < optionCorrect.length; i++) {
      optionCorrect[i] = i == index;
    }
    setState(() {});
  }

  bool validateForm() {
    final question = normalizeText(questionController.text);
    final language = normalizeText(languageController.text);
    final technology = normalizeText(technologyController.text);

    if (question.isEmpty) {
      showSnackBar("Question is required");
      return false;
    }

    if (!isValidQuestionText(question)) {
      showSnackBar("Question must be at least 8 characters");
      return false;
    }

    if (question.length > 1000) {
      showSnackBar("Question is too long");
      return false;
    }

    if (selectedDifficulty == null || selectedDifficulty!.trim().isEmpty) {
      showSnackBar("Difficulty is required");
      return false;
    }

    if (!difficultyLevels.contains(selectedDifficulty)) {
      showSnackBar("Please select a valid difficulty");
      return false;
    }

    if (selectedTypeId == null) {
      showSnackBar("Question type is required");
      return false;
    }

    if (selectedType == null) {
      showSnackBar("Please select a valid question type");
      return false;
    }

    if (selectedSubjectId == null) {
      showSnackBar("Subject is required");
      return false;
    }

    final subjectExists = subjects.any(
      (subject) => subject["subject_id"] == selectedSubjectId,
    );
    if (!subjectExists) {
      showSnackBar("Please select a valid subject");
      return false;
    }

    if (selectedTopics.isEmpty) {
      showSnackBar("Please select at least one topic");
      return false;
    }

    final validTopicIds =
        allSubjectTopics.map((topic) => topic["topic_id"]).toSet();

    for (final topic in selectedTopics) {
      if (!validTopicIds.contains(topic["topic_id"])) {
        showSnackBar("Selected topics do not belong to the chosen subject");
        return false;
      }
    }

    final uniqueTopicIds = selectedTopics.map((t) => t["topic_id"]).toSet();
    if (uniqueTopicIds.length != selectedTopics.length) {
      showSnackBar("Duplicate topics are not allowed");
      return false;
    }

    if (selectedCompanyId != null) {
      final companyExists = companies.any(
        (company) => company["company_id"] == selectedCompanyId,
      );
      if (!companyExists) {
        showSnackBar("Please select a valid company");
        return false;
      }
    }

    if (selectedYear != null && selectedYear!.trim().isNotEmpty) {
      final year = int.tryParse(selectedYear!);
      if (year == null || year < 1900 || year > currentYear) {
        showSnackBar("Please select a valid year");
        return false;
      }
    }

    if (language.isNotEmpty) {
      if (language.length < 2 || language.length > 50) {
        showSnackBar("Language must be between 2 and 50 characters");
        return false;
      }
      if (!isValidSimpleText(language)) {
        showSnackBar("Language contains invalid characters");
        return false;
      }
    }

    if (technology.isNotEmpty) {
      if (technology.length < 2 || technology.length > 50) {
        showSnackBar("Technology must be between 2 and 50 characters");
        return false;
      }
      if (!isValidSimpleText(technology)) {
        showSnackBar("Technology contains invalid characters");
        return false;
      }
    }

    if (isMcqType) {
      final trimmedOptions = optionControllers
          .map((controller) => normalizeText(controller.text))
          .toList();

      for (int i = 0; i < trimmedOptions.length; i++) {
        if (trimmedOptions[i].isEmpty) {
          showSnackBar("All MCQ options must be filled");
          return false;
        }

        if (trimmedOptions[i].length < 1 || trimmedOptions[i].length > 250) {
          showSnackBar("Each option must be between 1 and 250 characters");
          return false;
        }
      }

      final lowerOptions = trimmedOptions.map((e) => e.toLowerCase()).toList();
      if (lowerOptions.toSet().length != lowerOptions.length) {
        showSnackBar("Duplicate options are not allowed");
        return false;
      }

      final correctCount = optionCorrect.where((value) => value).length;
      if (correctCount == 0) {
        showSnackBar("Please select the correct answer");
        return false;
      }

      if (correctCount > 1) {
        showSnackBar("Only one correct answer is allowed");
        return false;
      }
    } else {
      for (final controller in optionControllers) {
        if (controller.text.trim().isNotEmpty) {
          showSnackBar("Options are allowed only for MCQ type");
          return false;
        }
      }
    }

    if (!isEdit && createdBy == null) {
      showSnackBar("User not found. Please login again.");
      return false;
    }

    return true;
  }

  Future<void> handleSubmit() async {
    if (!validateForm()) return;

    clearServerFeedback();

    final payload = {
      "question_string": normalizeText(questionController.text),
      "difficulty_level": selectedDifficulty,
      "type_id": selectedTypeId,
      "company_id": selectedCompanyId,
      "year": selectedYear,
      "language": normalizeText(languageController.text).isEmpty
          ? null
          : normalizeText(languageController.text),
      "technology": normalizeText(technologyController.text).isEmpty
          ? null
          : normalizeText(technologyController.text),
      "topic_ids": selectedTopics.map((t) => t["topic_id"]).toList(),
      "options": isMcqType
          ? List.generate(optionControllers.length, (index) {
              return {
                "option_text": normalizeText(optionControllers[index].text),
                "is_correct": optionCorrect[index],
              };
            })
          : [],
    };

    if (!isEdit) {
      payload["created_by"] = createdBy;
    }

    try {
      setState(() {
        isSaving = true;
      });

      late http.Response response;

      if (isEdit) {
        response = await http.put(
          Uri.parse("${AppConfig.baseUrl}/questions/editQuestion"),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode({
            "question_id": widget.questionId,
            ...payload,
          }),
        );
      } else {
        response = await http.post(
          Uri.parse("${AppConfig.baseUrl}/questions/addQuestion"),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode(payload),
        );
      }

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final action = data["action"]?.toString();
        final matched =
            data["matched_question"] is Map<String, dynamic>
                ? Map<String, dynamic>.from(data["matched_question"])
                : null;

        if (mounted) {
          setState(() {
            serverAction = action;
            matchedQuestion = matched;
            similarityScore =
                data["similarity_score"] is num
                    ? (data["similarity_score"] as num).toDouble()
                    : null;
          });
        }

        if (action == "duplicate_merged" ||
            action == "semantic_duplicate_merged") {
          setState(() {
            successMessage =
                data["message"]?.toString() ??
                "A similar question already exists.";
          });
          return;
        }

        showSnackBar(
          isEdit
              ? "Question updated successfully"
              : "Question added successfully",
        );

        if (!mounted) return;
        Navigator.pop(context, true);
      } else {
        if (!mounted) return;

        setState(() {
          errorMessage = data["message"]?.toString() ?? "Failed to save question";

          suggestedQuestion = data["suggested_question"]?.toString();

          grammarIssues =
              (data["issues"] is List)
                  ? List<Map<String, dynamic>>.from(data["issues"])
                  : [];

          alignmentIssue = data["alignment_issue"] == true;

          alignmentScore =
              data["alignment_score"] is num
                  ? (data["alignment_score"] as num).toDouble()
                  : null;

          matchedTopic = data["matched_topic"]?.toString();
          alignmentDetails = data["details"]?.toString();

          serverAction = data["action"]?.toString();
          matchedQuestion =
              data["matched_question"] is Map<String, dynamic>
                  ? Map<String, dynamic>.from(data["matched_question"])
                  : null;

          similarityScore =
              data["similarity_score"] is num
                  ? (data["similarity_score"] as num).toDouble()
                  : null;
        });
      }
    } catch (e) {
      showSnackBar("Failed to save question");
    } finally {
      if (mounted) {
        setState(() {
          isSaving = false;
        });
      }
    }
  }

  void applySuggestion() {
    final suggestion = suggestedQuestion?.trim();
    if (suggestion == null || suggestion.isEmpty) return;

    setState(() {
      questionController.text = suggestion;
      suggestedQuestion = null;
      grammarIssues = [];
      errorMessage = null;
    });
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

  Widget buildSectionCard({required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xffE8ECF4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget buildInputLabel(String text, {bool required = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: RichText(
        text: TextSpan(
          text: text,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
          children:
              required
                  ? const [
                    TextSpan(
                      text: " *",
                      style: TextStyle(color: Colors.red),
                    ),
                  ]
                  : [],
        ),
      ),
    );
  }

  Widget buildTextField({
    required TextEditingController controller,
    String? hint,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.black87),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xffD9D9D9)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xffD9D9D9)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xff6246EA), width: 1.5),
        ),
      ),
    );
  }

  Widget buildDropdown<T>({
    required T? value,
    required List<DropdownMenuItem<T>> items,
    required String hint,
    required void Function(T?) onChanged,
  }) {
    return DropdownButtonFormField<T>(
      value: value,
      isExpanded: true,
      items: items,
      onChanged: onChanged,
      style: const TextStyle(color: Colors.black87),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xffD9D9D9)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xffD9D9D9)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xff6246EA), width: 1.5),
        ),
      ),
    );
  }

  Widget buildFeedbackCard({
    required Color bgColor,
    required Color borderColor,
    required IconData icon,
    required Color iconColor,
    required String title,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: iconColor),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: iconColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  Widget buildIssueItem(Map<String, dynamic> issue) {
    final message = (issue["message"] ?? "").toString().trim();
    final replacement = (issue["replacement"] ?? "").toString().trim();

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xffF1D8A7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message.isEmpty ? "Grammar issue found" : message,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black87,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (replacement.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              "Suggestion: $replacement",
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xff8A5A00),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget buildMatchedQuestionCard() {
    if (matchedQuestion == null) return const SizedBox.shrink();

    final text = (matchedQuestion!["question_string"] ?? "").toString();
    final typeName = (matchedQuestion!["type_name"] ?? "").toString();
    final appearances = matchedQuestion!["appearance_count"]?.toString();

    return buildFeedbackCard(
      bgColor: const Color(0xffECFDF3),
      borderColor: const Color(0xffB7E4C7),
      icon: Icons.check_circle_outline,
      iconColor: const Color(0xff1E7A46),
      title: "Similar question found",
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xffD7F0DE)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              text,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.black87,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (typeName.isNotEmpty)
                  _buildMiniBadge(typeName, const Color(0xffEEF2FF),
                      const Color(0xff4F46E5)),
                if (appearances != null && appearances.isNotEmpty)
                  _buildMiniBadge("$appearances appearances",
                      const Color(0xffF0FDF4), const Color(0xff15803D)),
                if (similarityScore != null)
                  _buildMiniBadge(
                    "Similarity ${similarityScore!.toStringAsFixed(2)}",
                    const Color(0xffFFF7ED),
                    const Color(0xffC2410C),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniBadge(String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          color: fg,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget buildTopFeedback() {
    final widgets = <Widget>[];

    if (errorMessage != null && errorMessage!.trim().isNotEmpty) {
      widgets.add(
        buildFeedbackCard(
          bgColor: const Color(0xffFEF2F2),
          borderColor: const Color(0xffF8CACA),
          icon: Icons.error_outline,
          iconColor: const Color(0xffC62828),
          title: "Could not save question",
          child: Text(
            errorMessage!,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black87,
            ),
          ),
        ),
      );
    }

    if (grammarIssues.isNotEmpty) {
      widgets.add(
        buildFeedbackCard(
          bgColor: const Color(0xffFFF8E8),
          borderColor: const Color(0xffF1D8A7),
          icon: Icons.spellcheck_rounded,
          iconColor: const Color(0xffA15C00),
          title: "Grammar feedback",
          child: Column(
            children: grammarIssues.map(buildIssueItem).toList(),
          ),
        ),
      );
    }

    if (shouldShowSuggestion) {
      widgets.add(
        buildFeedbackCard(
          bgColor: const Color(0xffEFF6FF),
          borderColor: const Color(0xffBFDBFE),
          icon: Icons.auto_fix_high_outlined,
          iconColor: const Color(0xff1D4ED8),
          title: "Suggested question",
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xffD6E4FF)),
                ),
                child: Text(
                  suggestedQuestion ?? "",
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.black87,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: applySuggestion,
                icon: const Icon(Icons.check, size: 18),
                label: const Text("Use this suggestion"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xff2563EB),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (alignmentIssue) {
      widgets.add(
        buildFeedbackCard(
          bgColor: const Color(0xffFFF7ED),
          borderColor: const Color(0xffFED7AA),
          icon: Icons.account_tree_outlined,
          iconColor: const Color(0xffC2410C),
          title: "Subject / topic mismatch",
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (alignmentDetails != null && alignmentDetails!.isNotEmpty)
                Text(
                  alignmentDetails!,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Colors.black87,
                  ),
                ),
              if (matchedTopic != null && matchedTopic!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  "Best match: $matchedTopic",
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xff9A3412),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
              if (alignmentScore != null) ...[
                const SizedBox(height: 6),
                Text(
                  "Score: ${alignmentScore!.toStringAsFixed(2)}",
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xff9A3412),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          ),
        ),
      );
    }

    if (successMessage != null && successMessage!.trim().isNotEmpty) {
      widgets.add(
        buildFeedbackCard(
          bgColor: const Color(0xffECFDF3),
          borderColor: const Color(0xffB7E4C7),
          icon: Icons.check_circle_outline,
          iconColor: const Color(0xff1E7A46),
          title: "Update",
          child: Text(
            successMessage!,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black87,
            ),
          ),
        ),
      );
    }

    if (matchedQuestion != null) {
      widgets.add(buildMatchedQuestionCard());
    }

    if (widgets.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        ...widgets.expand((widget) => [widget, const SizedBox(height: 14)]),
      ],
    );
  }

  @override
  void dispose() {
    questionController.dispose();
    languageController.dispose();
    technologyController.dispose();
    topicSearchController.dispose();
    for (final controller in optionControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FB),
      appBar: AppBar(
        backgroundColor: const Color(0xff6246EA),
        foregroundColor: Colors.white,
        elevation: 0,
        title: Text(isEdit ? "Edit Question" : "Add Question"),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  buildTopFeedback(),
                  buildSectionCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        buildInputLabel("Question", required: true),
                        buildTextField(
                          controller: questionController,
                          hint: "Enter your question",
                          maxLines: 5,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  buildSectionCard(
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  buildInputLabel("Type", required: true),
                                  buildDropdown<int>(
                                    value: selectedTypeId,
                                    hint: "Select Type",
                                    items: questionTypes.map((type) {
                                      return DropdownMenuItem<int>(
                                        value: type["type_id"],
                                        child: Text(
                                          type["type_name"] ?? "",
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 1,
                                        ),
                                      );
                                    }).toList(),
                                    onChanged: (value) {
                                      setState(() {
                                        selectedTypeId = value;
                                        if (!isMcqType) {
                                          for (int i = 0;
                                              i < optionCorrect.length;
                                              i++) {
                                            optionCorrect[i] = false;
                                            optionControllers[i].clear();
                                          }
                                        }
                                      });
                                    },
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  buildInputLabel("Difficulty", required: true),
                                  buildDropdown<String>(
                                    value: selectedDifficulty,
                                    hint: "Select Difficulty",
                                    items: difficultyLevels.map((difficulty) {
                                      return DropdownMenuItem<String>(
                                        value: difficulty,
                                        child: Text(
                                          difficulty[0].toUpperCase() +
                                              difficulty.substring(1),
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 1,
                                        ),
                                      );
                                    }).toList(),
                                    onChanged: (value) {
                                      setState(() {
                                        selectedDifficulty = value;
                                      });
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  buildInputLabel("Subject", required: true),
                                  buildDropdown<int>(
                                    value: selectedSubjectId,
                                    hint: "Select Subject",
                                    items: subjects.map((subject) {
                                      return DropdownMenuItem<int>(
                                        value: subject["subject_id"],
                                        child: Text(
                                          subject["subject_name"] ?? "",
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 1,
                                        ),
                                      );
                                    }).toList(),
                                    onChanged: (value) async {
                                      setState(() {
                                        selectedSubjectId = value;
                                        selectedTopics = [];
                                        topicSuggestions = [];
                                        topicSearchController.clear();
                                        allSubjectTopics = [];
                                      });
                                      if (value != null) {
                                        await fetchTopicsBySubject(value);
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            buildInputLabel("Topics", required: true),
                            TextField(
                              controller: topicSearchController,
                              enabled: selectedSubjectId != null,
                              onChanged: filterTopicSuggestions,
                              style: const TextStyle(color: Colors.black87),
                              decoration: InputDecoration(
                                hintText: selectedSubjectId != null
                                    ? "Type to search topics"
                                    : "Select subject first",
                                hintStyle: const TextStyle(color: Colors.grey),
                                filled: true,
                                fillColor: selectedSubjectId != null
                                    ? Colors.white
                                    : Colors.grey.shade100,
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 12,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xffD9D9D9),
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xffD9D9D9),
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xff6246EA),
                                    width: 1.5,
                                  ),
                                ),
                              ),
                            ),
                            if (topicSuggestions.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Container(
                                constraints:
                                    const BoxConstraints(maxHeight: 180),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xffE0E0E0),
                                  ),
                                ),
                                child: ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: topicSuggestions.length,
                                  itemBuilder: (context, index) {
                                    final topic = topicSuggestions[index];
                                    return ListTile(
                                      dense: true,
                                      title: Text(topic["topic_name"] ?? ""),
                                      onTap: () => addTopic(topic),
                                    );
                                  },
                                ),
                              ),
                            ],
                            if (selectedTopics.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: selectedTopics.map((topic) {
                                  return Chip(
                                    label: Text(topic["topic_name"] ?? ""),
                                    onDeleted: () =>
                                        removeTopic(topic["topic_id"]),
                                    deleteIcon:
                                        const Icon(Icons.close, size: 18),
                                    backgroundColor: const Color(0xffEEF2FF),
                                    side: const BorderSide(
                                      color: Color(0xffC7D2FE),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (isMcqType)
                    buildSectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "MCQ Options",
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...List.generate(4, (index) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: buildTextField(
                                      controller: optionControllers[index],
                                      hint: "Option ${index + 1}",
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Row(
                                    children: [
                                      Radio<int>(
                                        value: index,
                                        groupValue:
                                            optionCorrect.indexWhere((e) => e),
                                        onChanged: (_) =>
                                            handleCorrectOption(index),
                                      ),
                                      const Text(
                                        "Correct",
                                        style: TextStyle(color: Colors.black87),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  if (isMcqType) const SizedBox(height: 16),
                  buildSectionCard(
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: buildDropdown<int>(
                                value: selectedCompanyId,
                                hint: "Select Company",
                                items: companies.map((company) {
                                  return DropdownMenuItem<int>(
                                    value: company["company_id"],
                                    child: Text(
                                      company["company_name"] ?? "",
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                  );
                                }).toList(),
                                onChanged: (value) {
                                  setState(() {
                                    selectedCompanyId = value;
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: buildDropdown<String>(
                                value: selectedYear,
                                hint: "Select Year",
                                items: years.map((year) {
                                  return DropdownMenuItem<String>(
                                    value: year,
                                    child: Text(
                                      year,
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                  );
                                }).toList(),
                                onChanged: (value) {
                                  setState(() {
                                    selectedYear = value;
                                  });
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: buildTextField(
                                controller: languageController,
                                hint: "Language",
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: buildTextField(
                                controller: technologyController,
                                hint: "Technology",
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton(
                        onPressed: isSaving
                            ? null
                            : () {
                                Navigator.pop(context);
                              },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text("Cancel"),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: isSaving ? null : handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xff2563EB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(
                          isSaving
                              ? "Saving..."
                              : isEdit
                                  ? "Update Question"
                                  : "Add Question",
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}