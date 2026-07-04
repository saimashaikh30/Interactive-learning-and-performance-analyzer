from app.services.question_ai_service import process_question


class Question:

    def __init__(self, question_string):
        self.question_string = question_string


database = [

    Question("What is an array?"),

    Question("Explain linked list."),

    Question("What is binary search?")
]


tests = [

    "What is array?",

    "Define an array.",

    "What is meant by an array?",

    "Explain Merge Sort.",

    "What is Gradient Descent?"
]


for q in tests:

    result = process_question(

        question=q,

        subject_name="DSA",

        topic_names=[

            "Arrays",

            "Linked List",

            "Searching",

            "Sorting"

        ],

        existing_questions=database

    )

    print("=" * 70)

    print(q)

    print(result)