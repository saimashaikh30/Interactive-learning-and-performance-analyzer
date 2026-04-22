import re
import difflib
import requests

LANGUAGETOOL_URL = "https://api.languagetool.org/v2/check"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_model = None
_st_model_available = None


def is_sentence_transformer_available():
    global _st_model_available
    if _st_model_available is not None:
        return _st_model_available

    try:
        from sentence_transformers import SentenceTransformer, util  # noqa: F401
        _st_model_available = True
    except Exception:
        _st_model_available = False

    return _st_model_available


def get_embedding_model():
    global _model

    if _model is not None:
        return _model

    if not is_sentence_transformer_available():
        return None

    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
        return _model
    except Exception:
        return None


def normalize_question_text(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s]", "", text)
    return text


def ensure_question_mark(text: str) -> str:
    text = text.strip()
    if text and not text.endswith("?"):
        text += "?"
    return text


def capitalize_first(text: str) -> str:
    text = text.strip()
    if not text:
        return text
    return text[0].upper() + text[1:]


def add_indefinite_article(word: str) -> str:
    if not word:
        return word

    word = word.strip()
    lower_word = word.lower()

    if lower_word.startswith("a ") or lower_word.startswith("an ") or lower_word.startswith("the "):
        return word

    if word.isupper():
        return word

    article = "an" if word[0].lower() in "aeiou" else "a"
    return f"{article} {word}"


def looks_like_incomplete_or_invalid_question(text: str) -> bool:
    normalized = normalize_question_text(text)

    invalid_patterns = [
        r".+\s+what$",
        r".+\s+is$",
        r".+\s+define$",
        r".+\s+explain$",
        r"what$",
        r"is$",
        r"define$",
        r"explain$",
        r".+\s+what\s+what$",
        r".+\s+is\s+what\s+is$"
    ]

    return any(re.fullmatch(pattern, normalized) for pattern in invalid_patterns)


def is_obviously_valid_question(text: str) -> bool:
    normalized = normalize_question_text(text)

    valid_patterns = [
        r"what\s+is\s+(a|an|the)?\s*.+",
        r"define\s+.+",
        r"explain\s+.+",
        r"how\s+does\s+.+",
        r"how\s+would\s+.+",
        r"how\s+can\s+.+",
        r"how\s+is\s+.+",
        r"why\s+does\s+.+",
        r"why\s+is\s+.+",
        r"what\s+are\s+.+",
        r"which\s+.+",
        r"when\s+.+",
        r"where\s+.+"
    ]

    return any(re.fullmatch(pattern, normalized) for pattern in valid_patterns)


def heuristic_question_rewrite(text: str):
    normalized = normalize_question_text(text)

    m = re.fullmatch(r"(.+?)\s+is\s+what", normalized)
    if m:
        subject = m.group(1).strip()
        return capitalize_first(f"What is {add_indefinite_article(subject)}?")

    m = re.fullmatch(r"(.+?)\s+what", normalized)
    if m:
        subject = m.group(1).strip()
        return capitalize_first(f"What is {add_indefinite_article(subject)}?")

    m = re.fullmatch(r"(.+?)\s+define", normalized)
    if m:
        subject = m.group(1).strip()
        return capitalize_first(f"Define {subject}.")

    m = re.fullmatch(r"define\s+(.+)", normalized)
    if m:
        subject = m.group(1).strip()
        return capitalize_first(f"Define {subject}.")

    m = re.fullmatch(r"explain\s+(.+)", normalized)
    if m:
        subject = m.group(1).strip()
        return capitalize_first(f"Explain {subject}.")

    m = re.fullmatch(r"what\s+(.+)", normalized)
    if m:
        subject = m.group(1).strip()
        if not subject.startswith(("is ", "are ", "was ", "were ")):
            return capitalize_first(f"What is {add_indefinite_article(subject)}?")

    m = re.fullmatch(r"(.+?)\s+what\s+is", normalized)
    if m:
        subject = m.group(1).strip()
        return capitalize_first(f"What is {add_indefinite_article(subject)}?")

    m = re.fullmatch(r"what\s+is\s+(.+)", normalized)
    if m:
        subject = m.group(1).strip()
        if subject.startswith(("a ", "an ", "the ")):
            return capitalize_first(f"What is {subject}?")
        return capitalize_first(f"What is {add_indefinite_article(subject)}?")

    m = re.fullmatch(r"meaning\s+of\s+(.+)", normalized)
    if m:
        subject = m.group(1).strip()
        return capitalize_first(f"What is the meaning of {subject}?")

    return None


def grammar_check_question(text: str):
    text = text.strip()
    normalized = normalize_question_text(text)

    if not normalized:
        return {
            "ok": False,
            "issues": [
                {
                    "message": "Question cannot be empty.",
                    "offset": 0,
                    "length": 0,
                    "replacement": None
                }
            ],
            "suggested_text": text
        }

    if looks_like_incomplete_or_invalid_question(text):
        heuristic_fix = heuristic_question_rewrite(text)
        return {
            "ok": False,
            "issues": [
                {
                    "message": "Question is incomplete or not in proper grammatical form.",
                    "offset": 0,
                    "length": len(text),
                    "replacement": heuristic_fix
                }
            ],
            "suggested_text": heuristic_fix if heuristic_fix else text
        }

    heuristic_fix = heuristic_question_rewrite(text)
    if heuristic_fix and normalize_question_text(heuristic_fix) != normalized:
        return {
            "ok": False,
            "issues": [
                {
                    "message": "Question wording is not in proper English question format.",
                    "offset": 0,
                    "length": len(text),
                    "replacement": heuristic_fix
                }
            ],
            "suggested_text": heuristic_fix
        }

    if is_obviously_valid_question(text):
        cleaned = capitalize_first(text)
        if any(cleaned.lower().startswith(prefix) for prefix in ["what ", "how ", "why ", "which ", "when ", "where "]):
            cleaned = ensure_question_mark(cleaned)
        return {
            "ok": True,
            "issues": [],
            "suggested_text": cleaned
        }

    try:
        response = requests.post(
            LANGUAGETOOL_URL,
            data={"text": text, "language": "en-US"},
            timeout=10
        )
        response.raise_for_status()
        result = response.json()
    except Exception:
        return {
            "ok": False,
            "issues": [
                {
                    "message": "Could not confidently verify grammar. Please enter the question in proper format.",
                    "offset": 0,
                    "length": len(text),
                    "replacement": heuristic_fix
                }
            ],
            "suggested_text": heuristic_fix if heuristic_fix else text
        }

    matches = result.get("matches", [])
    issues = []
    corrected_text = text
    offset_shift = 0

    for match in matches:
        message = match.get("message")
        offset = match.get("offset", 0)
        length = match.get("length", 0)
        replacements = match.get("replacements", [])
        replacement_value = replacements[0]["value"] if replacements else None

        issues.append({
            "message": message,
            "offset": offset,
            "length": length,
            "replacement": replacement_value
        })

        if replacement_value is not None:
            start = offset + offset_shift
            end = start + length
            corrected_text = corrected_text[:start] + replacement_value + corrected_text[end:]
            offset_shift += len(replacement_value) - length

    corrected_text = capitalize_first(corrected_text.strip())
    if any(corrected_text.lower().startswith(prefix) for prefix in ["what ", "how ", "why ", "which ", "when ", "where "]):
        corrected_text = ensure_question_mark(corrected_text)

    if normalize_question_text(corrected_text) == normalize_question_text(text):
        return {
            "ok": True,
            "issues": [],
            "suggested_text": corrected_text
        }

    serious_issue_count = sum(
        1 for issue in issues
        if issue["replacement"] is not None or "grammar" in (issue["message"] or "").lower()
    )

    if serious_issue_count > 0:
        return {
            "ok": False,
            "issues": issues,
            "suggested_text": corrected_text
        }

    if not is_obviously_valid_question(corrected_text):
        heuristic_fix = heuristic_question_rewrite(text)
        return {
            "ok": False,
            "issues": [
                {
                    "message": "Question is not in a clear grammatical form.",
                    "offset": 0,
                    "length": len(text),
                    "replacement": heuristic_fix
                }
            ],
            "suggested_text": heuristic_fix if heuristic_fix else corrected_text
        }

    return {
        "ok": True,
        "issues": [],
        "suggested_text": corrected_text
    }


def find_exact_duplicate(input_text: str, existing_questions):
    normalized_input = normalize_question_text(input_text)

    for q in existing_questions:
        if normalize_question_text(q.question_string) == normalized_input:
            return q

    return None


def fallback_similarity_score(text1: str, text2: str) -> float:
    n1 = normalize_question_text(text1)
    n2 = normalize_question_text(text2)
    return difflib.SequenceMatcher(None, n1, n2).ratio()


def find_semantic_duplicate(input_text: str, existing_questions, threshold=0.85):
    if not existing_questions:
        return None, 0.0

    model = get_embedding_model()

    if model is not None:
        try:
            from sentence_transformers import util

            input_embedding = model.encode(input_text, convert_to_tensor=True)
            existing_texts = [q.question_string for q in existing_questions]
            existing_embeddings = model.encode(existing_texts, convert_to_tensor=True)

            scores = util.cos_sim(input_embedding, existing_embeddings)[0]
            best_index = int(scores.argmax())
            best_score = float(scores[best_index])

            if best_score >= threshold:
                return existing_questions[best_index], best_score

            return None, best_score
        except Exception:
            pass

    best_question = None
    best_score = 0.0

    for q in existing_questions:
        score = fallback_similarity_score(input_text, q.question_string)
        if score > best_score:
            best_score = score
            best_question = q

    fallback_threshold = 0.82
    if best_question and best_score >= fallback_threshold:
        return best_question, best_score

    return None, best_score


def validate_question_subject_topic_alignment(question_text: str, subject_name: str, topic_names: list[str]):
    if not question_text or not subject_name or not topic_names:
        return {
            "ok": True,
            "score": None,
            "matched_topic": None,
            "message": None
        }

    model = get_embedding_model()

    label_texts = [f"{subject_name} - {topic_name}" for topic_name in topic_names]

    if model is not None:
        try:
            from sentence_transformers import util

            question_embedding = model.encode(question_text, convert_to_tensor=True)
            label_embeddings = model.encode(label_texts, convert_to_tensor=True)

            scores = util.cos_sim(question_embedding, label_embeddings)[0]
            best_index = int(scores.argmax())
            best_score = float(scores[best_index])
            best_label = label_texts[best_index]

            if best_score < 0.30:
                return {
                    "ok": False,
                    "score": round(best_score, 4),
                    "matched_topic": best_label,
                    "message": f"The question does not appear to match the selected subject/topic. Best semantic match score: {round(best_score, 4)}"
                }

            return {
                "ok": True,
                "score": round(best_score, 4),
                "matched_topic": best_label,
                "message": None
            }
        except Exception:
            pass

    normalized_question = normalize_question_text(question_text)
    for topic_name in topic_names:
        if normalize_question_text(topic_name) in normalized_question:
            return {
                "ok": True,
                "score": None,
                "matched_topic": topic_name,
                "message": None
            }

    return {
        "ok": False,
        "score": None,
        "matched_topic": None,
        "message": "The question does not appear to match the selected subject/topic."
    }