import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:ilps_mobile/screens/SubjectTopicsScreen.dart';
import 'package:ilps_mobile/screens/DomainSubjectsScreen.dart';
import 'package:ilps_mobile/screens/login_screen.dart';
import 'package:ilps_mobile/screens/request_main_screen..dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ilps_mobile/config/app_config.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  String username = "User";
  int _selectedIndex = 0;

  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> domains = [];
  List<Map<String, dynamic>> filteredDomains = [];
  List<Map<String, dynamic>> subjects = [];
  List<Map<String, dynamic>> latestQuestions = [];

  bool isLoadingDomains = false;
  bool isLoadingSubjects = false;
  bool isLoadingQuestions = false;

  late AnimationController _controller;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    await Future.wait([
      fetchDomains(),
      fetchSubjects(),
      fetchLatestQuestions(),
    ]);
  }

  Future<void> fetchDomains() async {
    setState(() {
      isLoadingDomains = true;
    });

    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/domains/getDomain"),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> domainList = data["domains"] ?? [];

        final List<Map<String, dynamic>> loadedDomains = domainList.map((item) {
          return {
            "id": item["domain_id"],
            "name": item["domain_name"],
          };
        }).toList();

        setState(() {
          domains = loadedDomains;
          filteredDomains = loadedDomains;
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load domains");
      }
    } catch (e) {
      showSnackBar("Error loading domains");
    } finally {
      if (mounted) {
        setState(() {
          isLoadingDomains = false;
        });
      }
    }
  }

  Future<void> fetchSubjects() async {
    setState(() {
      isLoadingSubjects = true;
    });

    try {
      final response = await http.get(
        Uri.parse("${AppConfig.baseUrl}/subjects/getSubjects"),
        headers: {"Content-Type": "application/json"},
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final List<dynamic> subjectList = data["subjects"] ?? [];

        final List<Map<String, dynamic>> loadedSubjects =
            subjectList.map((item) {
          return {
            "id": item["subject_id"],
            "name": item["subject_name"],
            "code": item["subject_code"],
            "domain_id": item["domain_id"],
            "domain_name": item["domain_name"],
            "topics_count": item["topics_count"] ?? 0,
          };
        }).toList();

        setState(() {
          subjects = loadedSubjects;
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load subjects");
      }
    } catch (e) {
      showSnackBar("Error loading subjects");
    } finally {
      if (mounted) {
        setState(() {
          isLoadingSubjects = false;
        });
      }
    }
  }

  Future<void> fetchLatestQuestions() async {
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
            questionList.take(15).map((item) {
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
          latestQuestions = loadedQuestions;
        });
      } else {
        showSnackBar(data["message"] ?? "Failed to load questions");
      }
    } catch (e) {
      showSnackBar("Error loading questions");
    } finally {
      if (mounted) {
        setState(() {
          isLoadingQuestions = false;
        });
      }
    }
  }

  void searchDomain(String query) {
    String search = query.toLowerCase().trim();

    if (search.isEmpty) {
      setState(() {
        filteredDomains = domains;
      });
      return;
    }

    final results = domains.where((domain) {
      final name = domain["name"].toString().toLowerCase();
      return name.contains(search);
    }).toList();

    setState(() {
      filteredDomains = results;
    });

    if (results.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("⚠️ Domain not found"),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 1),
        ),
      );
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

  @override
  void dispose() {
    _controller.dispose();
    searchController.dispose();
    super.dispose();
  }

  // ---------------- LOGOUT ----------------
  void showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Logout"),
          content: const Text("Are you sure you want to logout?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                logout(context);
              },
              child: const Text("Logout"),
            ),
          ],
        );
      },
    );
  }

  Future<void> logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('isLoggedIn');

    if (!mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  // ---------------- GREETING ----------------
  String getGreeting() {
    final hour = DateTime.now().hour;

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  }

  String getGreetingImage() {
    final hour = DateTime.now().hour;

    if (hour >= 5 && hour < 12) {
      return "assets/images/morning.png";
    } else if (hour >= 12 && hour < 17) {
      return "assets/images/afternoon.png";
    } else if (hour >= 17 && hour < 21) {
      return "assets/images/evening.png";
    } else {
      return "assets/images/night.png";
    }
  }

  Future<void> onRefresh() async {
    searchController.clear();
    await fetchDashboardData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF4F6FA),

      body: [
        buildHomeScreen(),
        const Center(child: Text("Topic Screen")),
        const RequestMainScreen(),
        const Center(child: Text("Profile Screen")),
      ][_selectedIndex],

      // ---------------- NAVBAR ----------------
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Container(
          height: 70,
          decoration: BoxDecoration(
            color: const Color(0xff6246EA),
            borderRadius: BorderRadius.circular(40),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              buildNavItem(Icons.home_rounded, "Home", 0),
              buildNavItem(Icons.menu_book_rounded, "Topic", 1),
              buildNavItem(Icons.request_page_rounded, "Request", 2),
              buildNavItem(Icons.person_rounded, "Profile", 3),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xffEEEAFE),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: Color(0xff6246EA),
        ),
      ),
    );
  }

  Widget buildNavItem(IconData icon, String label, int index) {
    bool isSelected = _selectedIndex == index;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.black : Colors.white,
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              )
            ]
          ],
        ),
      ),
    );
  }

  // ---------------- HOME SCREEN ----------------
  Widget buildHomeScreen() {
    return SingleChildScrollView(
      child: Column(
        children: [
          // HEADER
          Container(
            width: double.infinity,
            height: 250,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: AssetImage(getGreetingImage()),
                fit: BoxFit.cover,
              ),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(35),
                bottomRight: Radius.circular(35),
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.45),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(35),
                  bottomRight: Radius.circular(35),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 60, 20, 25),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Hello 👋",
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              getGreeting(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        PopupMenuButton<String>(
                          onSelected: (value) {
                            if (value == "logout") {
                              showLogoutDialog();
                            }
                          },
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: "logout",
                              child: Text("Logout"),
                            ),
                          ],
                          child: CircleAvatar(
                            radius: 22,
                            backgroundColor: Colors.white,
                            child: Text(
                              (username.isNotEmpty ? username[0] : "?")
                                  .toUpperCase(),
                              style: const TextStyle(
                                color: Colors.blue,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 30),

                    // SEARCH BAR
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 15),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: TextField(
                        controller: searchController,
                        onChanged: (value) {
                          searchDomain(value);
                        },
                        decoration: InputDecoration(
                          icon: const Icon(Icons.search),
                          hintText: "Search Domain",
                          border: InputBorder.none,
                          suffixIcon: searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.close),
                                  onPressed: () {
                                    searchController.clear();
                                    searchDomain("");
                                    setState(() {});
                                  },
                                )
                              : null,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // DOMAIN TITLE
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Domain",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // DOMAIN LIST
          SizedBox(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: filteredDomains.length,
              itemBuilder: (context, index) {
                final domain = filteredDomains[index];

                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DomainSubjectsScreen(
                          domainId: domain["id"],
                          domainName: domain["name"],
                        ),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xff6246EA),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Text(
                      domain["name"],
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 25),

          // SUBJECT TITLE
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Subjects",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // SUBJECT LIST
          SizedBox(
            height: 90,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: subjects.length,
              itemBuilder: (context, index) {
                final subject = subjects[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 14),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(20),
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
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 150,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color.fromARGB(255, 152, 172, 245),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: const Color.fromARGB(255, 105, 124, 245),
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
                      child: Center(
                        child: Text(
                          subject["name"],
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color.fromARGB(255, 250, 251, 251),
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 25),

          // LATEST QUESTION TITLE
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Latest Questions",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          const SizedBox(height: 10),

          ListView.builder(
            itemCount: latestQuestions.length,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemBuilder: (context, index) {
              final question = latestQuestions[index];

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () {
                    // Later open question detail screen
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color.fromARGB(255, 85, 52, 249)
                              .withOpacity(0.27),
                          blurRadius: 13,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.help_outline_rounded,
                          color: Color(0xff6246EA),
                        ),
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
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }
}
