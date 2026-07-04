from sentence_transformers import util
from app.services.embedding_service import get_embedding_model
import re


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def find_exact_duplicate(input_question, existing_questions):
    normalized = normalize_text(input_question)

    for question in existing_questions:
        if normalize_text(question.question_string) == normalized:
            return question

    return None


def find_semantic_duplicate(
    input_question,
    existing_questions,
    threshold=0.80
):
    if not existing_questions:
        return None, 0.0

    model = get_embedding_model()

    input_embedding = model.encode(
        input_question,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    existing_texts = [
        q.question_string
        for q in existing_questions
    ]

    existing_embeddings = model.encode(
        existing_texts,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    similarities = util.cos_sim(
        input_embedding,
        existing_embeddings
    )[0]

    best_index = similarities.argmax().item()
    best_score = similarities[best_index].item()

    if best_score >= threshold:
        return existing_questions[best_index], best_score

    return None, best_score