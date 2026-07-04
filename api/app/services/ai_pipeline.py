from app.services.question_ai_service import process_question


def validate_question(
    question,
    subject_name,
    topic_names,
    existing_questions
):
    return process_question(
        question,
        subject_name,
        topic_names,
        existing_questions
    )