import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:ilps_mobile/config/app_config.dart';
import 'package:ilps_mobile/screens/company_questions_screen.dart';

class CompanyScreen extends StatefulWidget {
  const CompanyScreen({super.key});

  @override
  State<CompanyScreen> createState() => _CompanyScreenState();
}

class _CompanyScreenState extends State<CompanyScreen> {
  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> companies = [];
  List<Map<String, dynamic>> filteredCompanies = [];

  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    fetchCompanies();
  }

  Future<void> fetchCompanies() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/companies/getCompanies"),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> companyList = data["companies"] ?? [];

        final loadedCompanies = companyList.map<Map<String, dynamic>>((item) {
          return {
            "id": item["company_id"],
            "name": item["company_name"],
          };
        }).toList();

        setState(() {
          companies = loadedCompanies;
          filteredCompanies = loadedCompanies;
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load companies");
      }
    } catch (e) {
      showSnackBar("Error loading companies");
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  void searchCompanies(String query) {
    final search = query.toLowerCase().trim();

    if (search.isEmpty) {
      setState(() {
        filteredCompanies = companies;
      });
      return;
    }

    final results = companies.where((company) {
      final name = company["name"].toString().toLowerCase();
      final id = company["id"].toString().toLowerCase();

      return name.contains(search) || id.contains(search);
    }).toList();

    setState(() {
      filteredCompanies = results;
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

  Future<void> onRefresh() async {
    searchController.clear();
    await fetchCompanies();
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

Widget buildCompanyCard(Map<String, dynamic> company, int index) {
  return GestureDetector(
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => CompanyQuestionsScreen(
            companyId: company["id"],
            companyName: company["name"],
          ),
        ),
      );
    },
    child: Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: const Color(0xff6246EA).withOpacity(0.10),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            height: 52,
            width: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xff8EA2FF),
                  Color(0xff6246EA),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.business_rounded,
              color: Colors.white,
              size: 26,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  company["name"] ?? "",
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xff1E1E1E),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  "Tap to view questions",
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xffEEEAFE),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              "#${index + 1}",
              style: const TextStyle(
                color: Color(0xff6246EA),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF4F6FA),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: onRefresh,
          color: const Color(0xff6246EA),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Companies",
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xff1E1E1E),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    "Explore all available companies",
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Search Bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: searchController,
                      onChanged: searchCompanies,
                      decoration: InputDecoration(
                        icon: const Icon(
                          Icons.search,
                          color: Color(0xff6246EA),
                        ),
                        hintText: "Search company",
                        border: InputBorder.none,
                        suffixIcon: searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.close),
                                onPressed: () {
                                  searchController.clear();
                                  searchCompanies("");
                                  setState(() {});
                                },
                              )
                            : null,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Summary box
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xff6246EA),
                          Color(0xff8EA2FF),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Total Companies",
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          "${filteredCompanies.length}",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  const Text(
                    "Company List",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 14),

                  if (isLoading)
                    const Padding(
                      padding: EdgeInsets.only(top: 40),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: Color(0xff6246EA),
                        ),
                      ),
                    )
                  else if (filteredCompanies.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 40),
                      child: Center(
                        child: Text(
                          "No companies available",
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      itemCount: filteredCompanies.length,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemBuilder: (context, index) {
                        final company = filteredCompanies[index];
                        return buildCompanyCard(company, index);
                      },
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}