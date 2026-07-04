from sentence_transformers import util
from app.services.embedding_service import get_embedding_model


def validate_question_subject_topic_alignment(
    question,
    subject_name,
    topic_names,
    threshold=0.35
):
    if not question or not subject_name or not topic_names:
        return {
            "ok": True,
            "score": None,
            "matched_topic": None,
            "message": None
        }

    model = get_embedding_model()

    question_embedding = model.encode(
        question,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    labels = [
        f"{subject_name} {topic}"
        for topic in topic_names
    ]

    label_embeddings = model.encode(
        labels,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    similarities = util.cos_sim(
        question_embedding,
        label_embeddings
    )[0]

    best_index = similarities.argmax().item()
    best_score = similarities[best_index].item()
    best_label = labels[best_index]

    if best_score < threshold:
        return {
            "ok": False,
            "score": round(best_score, 4),
            "matched_topic": best_label,
            "message": "Question does not match the selected subject/topic."
        }

    return {
        "ok": True,
        "score": round(best_score, 4),
        "matched_topic": best_label,
        "message": None
    }