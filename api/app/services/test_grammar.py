from app.services.grammar_service import grammar_check_question

questions = [
    "What is array?",
    "Define array.",
    "Array what",
    "What is meant by an array?",
    "Explain linked list."
]

for q in questions:
    result = grammar_check_question(q)

    print("=" * 50)
    print("Input      :", q)
    print("Corrected  :", result["corrected_text"])
    print("Valid      :", result["ok"])
    print("Errors     :", result["errors"])