import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:ilps_mobile/config/app_config.dart';

class QuestionDetailScreen extends StatefulWidget {
  final int questionId;

  const QuestionDetailScreen({
    super.key,
    required this.questionId,
  });

  @override
  State<QuestionDetailScreen> createState() => _QuestionDetailScreenState();
}

class _QuestionDetailScreenState extends State<QuestionDetailScreen> {
  bool isLoading = true;
  Map<String, dynamic>? question;

  @override
  void initState() {
    super.initState();
    fetchQuestionDetails();
  }

  Future<void> fetchQuestionDetails() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse(
          "${AppConfig.baseUrl}/questions/getQuestion/${widget.questionId}",
        ),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        setState(() {
          question = Map<String, dynamic>.from(data["question"]);
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load question details");
      }
    } catch (e) {
      showSnackBar("Error loading question details");
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
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

  String formatDifficulty(String? value) {
    if (value == null || value.isEmpty) return "-";
    return value[0].toUpperCase() + value.substring(1).toLowerCase();
  }

  String formatDate(String? isoDate) {
    if (isoDate == null || isoDate.isEmpty) return "-";

    try {
      final dt = DateTime.parse(isoDate).toLocal();
      return "${dt.day.toString().padLeft(2, '0')}/"
          "${dt.month.toString().padLeft(2, '0')}/"
          "${dt.year}  "
          "${dt.hour.toString().padLeft(2, '0')}:"
          "${dt.minute.toString().padLeft(2, '0')}";
    } catch (_) {
      return isoDate;
    }
  }

  String joinStringList(dynamic value) {
    if (value is List) {
      final items = value
          .map((e) => e.toString().trim())
          .where((e) => e.isNotEmpty)
          .toList();
      if (items.isEmpty) return "-";
      return items.join(", ");
    }

    if (value == null) return "-";

    final text = value.toString().trim();
    return text.isEmpty ? "-" : text;
  }

  String getLatestOccurrenceValue(
    Map<String, dynamic> q,
    String fieldName,
    String fallbackFieldName,
  ) {
    final latestOccurrence =
        q["latest_occurrence"] is Map<String, dynamic>
            ? Map<String, dynamic>.from(q["latest_occurrence"])
            : <String, dynamic>{};

    final latestValue = latestOccurrence[fieldName];
    if (latestValue != null && latestValue.toString().trim().isNotEmpty) {
      return latestValue.toString().trim();
    }

    return joinStringList(q[fallbackFieldName]);
  }

  String getDifficultyValue(Map<String, dynamic> q) {
    final latestOccurrence =
        q["latest_occurrence"] is Map<String, dynamic>
            ? Map<String, dynamic>.from(q["latest_occurrence"])
            : <String, dynamic>{};

    final latestDifficulty = latestOccurrence["difficulty_level"]?.toString();
    if (latestDifficulty != null && latestDifficulty.trim().isNotEmpty) {
      return latestDifficulty.trim();
    }

    final levels = q["difficulty_levels"];
    if (levels is List && levels.isNotEmpty) {
      return levels.first.toString();
    }

    return "-";
  }

  String getCompanyValue(Map<String, dynamic> q) {
    final latestOccurrence =
        q["latest_occurrence"] is Map<String, dynamic>
            ? Map<String, dynamic>.from(q["latest_occurrence"])
            : <String, dynamic>{};

    final latestCompany = latestOccurrence["company_name"]?.toString();
    if (latestCompany != null && latestCompany.trim().isNotEmpty) {
      return latestCompany.trim();
    }

    return joinStringList(q["company_names"]);
  }

  Widget buildTag(String text, {Color? bgColor, Color? textColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor ?? const Color(0xffEEF2FF),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor ?? const Color(0xff4F46E5),
        ),
      ),
    );
  }

  Widget buildInfoTile({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xffECEFFC)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: const Color(0xffEEF2FF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              size: 18,
              color: const Color(0xff4F46E5),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value.isEmpty ? "-" : value,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xff1F2937),
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: const Color(0xff1F2937),
      ),
    );
  }

  Widget buildOptionCard(Map<String, dynamic> option, int index) {
    final bool isCorrect = option["is_correct"] == true;
    final optionLabel = String.fromCharCode(65 + index);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isCorrect ? const Color(0xffEAF8EE) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isCorrect ? const Color(0xff38A169) : const Color(0xffECEFFC),
          width: 1.2,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isCorrect
                  ? const Color(0xff38A169)
                  : const Color(0xffEEF2FF),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Text(
              optionLabel,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isCorrect ? Colors.white : const Color(0xff4F46E5),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              option["option_text"]?.toString() ?? "-",
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: const Color(0xff1F2937),
                height: 1.35,
              ),
            ),
          ),
          if (isCorrect) ...[
            const SizedBox(width: 8),
            const Icon(
              Icons.check_circle,
              color: Color(0xff38A169),
              size: 20,
            ),
          ]
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final q = question;

    final difficultyValue =
        q == null ? "-" : formatDifficulty(getDifficultyValue(q));
    final companyValue = q == null ? "-" : getCompanyValue(q);
    final technologyValue =
        q == null ? "-" : getLatestOccurrenceValue(q, "technology", "technologies");
    final languageValue =
        q == null ? "-" : getLatestOccurrenceValue(q, "language", "languages");
    final yearValue =
        q == null ? "-" : getLatestOccurrenceValue(q, "year", "years");
    final appearanceCount =
        q == null ? 0 : (q["appearance_count"] ?? 0);

    return Scaffold(
      backgroundColor: const Color(0xffF6F8FC),
      appBar: AppBar(
        backgroundColor: const Color(0xff4F46E5),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          "Question Details",
          style: GoogleFonts.inter(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : q == null
              ? Center(
                  child: Text(
                    "Question not found",
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey,
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: fetchQuestionDetails,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(18),
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
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF5F8CFF).withOpacity(0.18),
                                blurRadius: 14,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  if (difficultyValue != "-")
                                    buildTag(
                                      difficultyValue,
                                      bgColor: Colors.white.withOpacity(0.20),
                                      textColor: Colors.white,
                                    ),
                                  if ((q["type_name"] ?? "").toString().isNotEmpty)
                                    buildTag(
                                      q["type_name"].toString(),
                                      bgColor: Colors.white.withOpacity(0.20),
                                      textColor: Colors.white,
                                    ),
                                  if (companyValue != "-")
                                    buildTag(
                                      companyValue,
                                      bgColor: Colors.white.withOpacity(0.20),
                                      textColor: Colors.white,
                                    ),
                                  if (appearanceCount > 0)
                                    buildTag(
                                      "$appearanceCount times",
                                      bgColor: Colors.white.withOpacity(0.20),
                                      textColor: Colors.white,
                                    ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Text(
                                q["question_string"]?.toString() ?? "-",
                                style: GoogleFonts.inter(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 22),

                        buildSectionTitle("Question Information"),
                        const SizedBox(height: 12),

                        buildInfoTile(
                          icon: Icons.code_rounded,
                          label: "Technology",
                          value: technologyValue,
                        ),
                        buildInfoTile(
                          icon: Icons.language_rounded,
                          label: "Language",
                          value: languageValue,
                        ),
                        buildInfoTile(
                          icon: Icons.calendar_today_rounded,
                          label: "Year",
                          value: yearValue,
                        ),
                        buildInfoTile(
                          icon: Icons.business_rounded,
                          label: "Companies",
                          value: companyValue,
                        ),
                        buildInfoTile(
                          icon: Icons.person_rounded,
                          label: "Created By",
                          value: q["creator_name"]?.toString() ?? "-",
                        ),
                        buildInfoTile(
                          icon: Icons.repeat_rounded,
                          label: "Appearance Count",
                          value: appearanceCount.toString(),
                        ),
                        buildInfoTile(
                          icon: Icons.access_time_rounded,
                          label: "Created At",
                          value: formatDate(q["created_at"]?.toString()),
                        ),
                        buildInfoTile(
                          icon: Icons.update_rounded,
                          label: "Updated At",
                          value: formatDate(q["updated_at"]?.toString()),
                        ),

                        const SizedBox(height: 22),

                        buildSectionTitle("Topics"),
                        const SizedBox(height: 12),

                        if ((q["topics"] as List?) == null ||
                            (q["topics"] as List).isEmpty)
                          Text(
                            "No topics available",
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: Colors.grey,
                              fontWeight: FontWeight.w500,
                            ),
                          )
                        else
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: (q["topics"] as List).map((topic) {
                              return buildTag(
                                topic["topic_name"]?.toString() ?? "-",
                              );
                            }).toList(),
                          ),

                        const SizedBox(height: 22),

                        buildSectionTitle("Options"),
                        const SizedBox(height: 12),

                        if ((q["options"] as List?) == null ||
                            (q["options"] as List).isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xffECEFFC)),
                            ),
                            child: Text(
                              "No options available for this question.",
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: Colors.grey.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          )
                        else
                          Column(
                            children: List.generate(
                              (q["options"] as List).length,
                              (index) => buildOptionCard(
                                (q["options"] as List)[index]
                                    as Map<String, dynamic>,
                                index,
                              ),
                            ),
                          ),

                        if ((q["occurrences"] as List?) != null &&
                            (q["occurrences"] as List).isNotEmpty) ...[
                          const SizedBox(height: 22),
                          buildSectionTitle("Occurrences"),
                          const SizedBox(height: 12),
                          Column(
                            children: List.generate(
                              (q["occurrences"] as List).length,
                              (index) {
                                final occurrence = (q["occurrences"] as List)[index]
                                    as Map<String, dynamic>;

                                final occCompany =
                                    occurrence["company_name"]?.toString() ?? "-";
                                final occDifficulty = formatDifficulty(
                                  occurrence["difficulty_level"]?.toString(),
                                );
                                final occYear =
                                    occurrence["year"]?.toString() ?? "-";
                                final occLanguage =
                                    occurrence["language"]?.toString() ?? "-";
                                final occTechnology =
                                    occurrence["technology"]?.toString() ?? "-";
                                final occCreator =
                                    occurrence["creator_name"]?.toString() ?? "-";
                                final occCreatedAt = formatDate(
                                  occurrence["created_at"]?.toString(),
                                );

                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: const Color(0xffECEFFC),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Wrap(
                                        spacing: 8,
                                        runSpacing: 8,
                                        children: [
                                          if (occDifficulty != "-")
                                            buildTag(occDifficulty),
                                          if (occCompany != "-")
                                            buildTag(occCompany),
                                          if (occYear != "-")
                                            buildTag(occYear),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        "Language: $occLanguage",
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          color: const Color(0xff374151),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        "Technology: $occTechnology",
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          color: const Color(0xff374151),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        "Created by: $occCreator",
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          color: const Color(0xff374151),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        "Created at: $occCreatedAt",
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          color: const Color(0xff374151),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
    );
  }
}