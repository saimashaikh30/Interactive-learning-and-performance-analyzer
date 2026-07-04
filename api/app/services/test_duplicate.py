from app.services.duplicate_service import (
    find_semantic_duplicate
)

class Question:

    def __init__(self, question_string):
        self.question_string = question_string


questions = [

    Question("What is an array?"),

    Question("Explain linked list."),

    Question("What is binary search?"),

    Question("Difference between stack and queue.")
]


tests = [

    "Define linked list.",

    "What is meant by an array?",

    "Explain arrays.",

    "What is a linked list?",

    "Difference between queue and stack."
]


for t in tests:

    duplicate, score = find_semantic_duplicate(
        t,
        questions
    )

    print()

    print("Input :", t)

    print("Score :", round(score,4))

    if duplicate:
        print("Duplicate :", duplicate.question_string)
    else:
        print("No duplicate")