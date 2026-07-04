from app.services.grammar_service import grammar_check_question
from app.services.alignment_service import validate_question_subject_topic_alignment
from app.services.duplicate_service import (
    find_exact_duplicate,
    find_semantic_duplicate
)


def process_question(
    question,
    subject_name,
    topic_names,
    existing_questions
):
    grammar_result = grammar_check_question(question)

    if not grammar_result["ok"]:
        return {
            "success": False,
            "stage": "grammar",
            "message": "Grammar correction required.",
            "data": grammar_result
        }

    corrected_question = grammar_result["corrected_text"]

    alignment_result = validate_question_subject_topic_alignment(
        corrected_question,
        subject_name,
        topic_names
    )

    if not alignment_result["ok"]:
        return {
            "success": False,
            "stage": "alignment",
            "message": alignment_result["message"],
            "data": alignment_result
        }

    exact_duplicate = find_exact_duplicate(
        corrected_question,
        existing_questions
    )

    if exact_duplicate:
        return {
            "success": False,
            "stage": "duplicate",
            "message": "Exact duplicate question.",
            "duplicate": exact_duplicate
        }

    semantic_duplicate, score = find_semantic_duplicate(
        corrected_question,
        existing_questions
    )

    if semantic_duplicate:
        return {
            "success": False,
            "stage": "duplicate",
            "message": "Similar question already exists.",
            "duplicate": semantic_duplicate,
            "similarity": round(score, 4)
        }

    return {
        "success": True,
        "question": corrected_question,
        "alignment": alignment_result
    }