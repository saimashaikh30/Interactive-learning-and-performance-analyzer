import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';

import 'package:ilps_mobile/config/app_config.dart';
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
  bool isSearching = false;
  bool isLoading = false;

  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> allSubjects = [];
  List<Map<String, dynamic>> filteredSubjects = [];

  @override
  void initState() {
    super.initState();
    fetchSubjectsByDomain();
  }

  Future<void> fetchSubjectsByDomain() async {
    setState(() => isLoading = true);

    try {
      final response = await http.get(
        Uri.parse(
            "${AppConfig.baseUrl}/subjects/getSubjectsByDomain/${widget.domainId}"),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List list = data["subjects"] ?? [];

        final loaded = list.map((item) {
          return {
            "id": item["subject_id"],
            "name": item["subject_name"],
            "code": item["subject_code"],
            "topics_count": item["topics_count"]
          };
        }).toList();

        setState(() {
          allSubjects = List<Map<String, dynamic>>.from(loaded);
          filteredSubjects = allSubjects;
        });
      }
    } catch (e) {
      showSnackBar("Error loading subjects");
    }

    setState(() => isLoading = false);
  }

  void searchData(String query) {
    String q = query.toLowerCase();

    if (q.isEmpty) {
      setState(() => filteredSubjects = allSubjects);
      return;
    }

    setState(() {
      filteredSubjects = allSubjects.where((s) {
        return s["name"].toLowerCase().contains(q) ||
            s["code"].toLowerCase().contains(q);
      }).toList();
    });
  }

  void showSnackBar(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg)));
  }

  Widget infoChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xffEEF1FF),
        borderRadius: BorderRadius.circular(10),
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

  Widget subjectCard(Map subject, int index) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SubjectTopicsScreen(
              subjectId: subject["id"],
              subjectName: subject["name"],
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: const Color.fromARGB(255, 107, 100, 238),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                "${index + 1}",
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),

            const SizedBox(width: 10),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  Text(
                    subject["name"],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),

                  const SizedBox(height: 5),

                  Row(
                    children: [
                      if (subject["code"] != null)
                        infoChip(subject["code"]),

                      const SizedBox(width: 6),

                      infoChip("${subject["topics_count"]} topics"),
                    ],
                  )
                ],
              ),
            ),

            const Icon(
              Icons.arrow_forward_ios,
              size: 14,
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF6F7FB),

      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 104, 97, 239),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),

        title: isSearching
            ? TextField(
                controller: searchController,
                autofocus: true,
                onChanged: searchData,
                decoration: InputDecoration(
                  hintText: "Search subject",
                  hintStyle: GoogleFonts.inter(fontSize: 13),
                  border: InputBorder.none,
                ),
                style: GoogleFonts.inter(color: Colors.white),
              )
            : Text(
                widget.domainName,
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),

        actions: [
          IconButton(
            icon: Icon(isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                if (isSearching) {
                  searchController.clear();
                  filteredSubjects = allSubjects;
                }
                isSearching = !isSearching;
              });
            },
          )
        ],
      ),

      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),

        child: Column(
          children: [

            const SizedBox(height: 15),

            Row(
              children: [
                Text(
                  "Subjects",
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                const Spacer(),

                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xffECEBFF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    filteredSubjects.length.toString(),
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xff4F46E5),
                    ),
                  ),
                )
              ],
            ),

            const SizedBox(height: 12),

            if (isLoading)
              const Expanded(
                child: Center(child: CircularProgressIndicator()),
              )

            else if (filteredSubjects.isEmpty)
              Expanded(
                child: Center(
                  child: Text(
                    "No subjects found",
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                ),
              )

            else
              Expanded(
                child: ListView.builder(
                  itemCount: filteredSubjects.length,
                  itemBuilder: (context, index) =>
                      subjectCard(filteredSubjects[index], index),
                ),
              ),
          ],
        ),
      ),
    );
  }
}