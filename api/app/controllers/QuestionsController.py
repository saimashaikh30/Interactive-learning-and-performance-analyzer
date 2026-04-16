from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import (
    Question,
    Topic,
    Topic_Questions,
    Option,
    Company,
    QuestionType,
    User,
    DifficultyLevelEnum,
    Subject,
    QuestionOccurrence
)
from app.services.question_ai_service import (
    grammar_check_question,
    find_exact_duplicate,
    find_semantic_duplicate,
    validate_question_subject_topic_alignment
)

from datetime import datetime

questions_bp = Blueprint("questions_bp", __name__)

MAX_TECHNOLOGY_LENGTH = 50
MAX_LANGUAGE_LENGTH = 30
MAX_YEAR_LENGTH = 4
MAX_OPTION_TEXT_LENGTH = 500


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def serialize_occurrence(occ):
    return {
        "occurrence_id": occ.occurrence_id,
        "company_id": occ.company_id,
        "company_name": occ.company.company_name if occ.company else None,
        "year": occ.year,
        "language": occ.language,
        "technology": occ.technology,
        "difficulty_level": occ.difficulty_level.value if occ.difficulty_level else None,
        "created_by": occ.created_by,
        "creator_name": occ.creator.name if occ.creator else None,
        "created_at": occ.created_at.isoformat() if occ.created_at else None
    }


def serialize_question(q):
    type_name = q.question_type.type_name if q.question_type else None
    occurrences = q.occurrences or []

    company_ids = sorted({occ.company_id for occ in occurrences if occ.company_id is not None})
    company_names = sorted({occ.company.company_name for occ in occurrences if occ.company})

    difficulty_levels = sorted({
        occ.difficulty_level.value for occ in occurrences if occ.difficulty_level
    })

    years = sorted({occ.year for occ in occurrences if occ.year})
    languages = sorted({occ.language for occ in occurrences if occ.language})
    technologies = sorted({occ.technology for occ in occurrences if occ.technology})

    fallback_dt = datetime.min

    latest_occurrence = max(
        occurrences,
        key=lambda x: x.created_at if x.created_at is not None else fallback_dt,
        default=None
    )

    return {
        "question_id": q.question_id,
        "question_string": q.question_string,
        "type_id": q.type_id,
        "type_name": type_name,
        "created_by": q.created_by,
        "creator_name": q.creator.name if q.creator else None,
        "created_at": q.created_at.isoformat() if q.created_at else None,
        "updated_at": q.updated_at.isoformat() if q.updated_at else None,
        "appearance_count": len(occurrences),
        "company_ids": company_ids,
        "company_names": company_names,
        "difficulty_levels": difficulty_levels,
        "years": years,
        "languages": languages,
        "technologies": technologies,
        "latest_occurrence": serialize_occurrence(latest_occurrence) if latest_occurrence else None,
        "topics": [
            {
                "topic_id": t.topic_id,
                "topic_name": t.topic_name,
                "subject_id": t.subject_id,
                "subject_name": t.subject.subject_name if t.subject else None
            }
            for t in q.topics
        ],
        "options": [
            {
                "option_id": o.option_id,
                "option_text": o.option_text,
                "is_correct": o.is_correct
            }
            for o in q.options
        ],
        "occurrences": [serialize_occurrence(occ) for occ in occurrences]
    }


def validate_string_field(value, field_name, max_length, required=False):
    if value is None:
        if required:
            return None, f"{field_name} is required"
        return None, None

    if not isinstance(value, str):
        return None, f"{field_name} must be a string"

    value = normalize_text(value)

    if required and not value:
        return None, f"{field_name} cannot be empty"

    if value and len(value) > max_length:
        return None, f"{field_name} cannot exceed {max_length} characters"

    return value, None


def validate_year(year):
    if year is None or year == "":
        return None, None

    if not isinstance(year, str):
        return None, "year must be a string"

    year = year.strip()

    if len(year) > MAX_YEAR_LENGTH:
        return None, f"year cannot exceed {MAX_YEAR_LENGTH} characters"

    if year and (not year.isdigit() or len(year) != 4):
        return None, "year must be a 4-digit string"

    return year, None


def validate_options(options):
    if options is None:
        return [], None

    if not isinstance(options, list):
        return None, "options must be a list"

    cleaned_options = []

    for opt in options:
        if not isinstance(opt, dict):
            return None, "each option must be an object"

        option_text = opt.get("option_text")
        is_correct = opt.get("is_correct", False)

        if option_text is None:
            continue

        if not isinstance(option_text, str):
            return None, "option_text must be a string"

        option_text = normalize_text(option_text)

        if not option_text:
            continue

        if len(option_text) > MAX_OPTION_TEXT_LENGTH:
            return None, f"option_text cannot exceed {MAX_OPTION_TEXT_LENGTH} characters"

        if not isinstance(is_correct, bool):
            return None, "is_correct must be true or false"

        cleaned_options.append({
            "option_text": option_text,
            "is_correct": is_correct
        })

    return cleaned_options, None


def get_existing_occurrence(question_id, company_id, year, language, technology, difficulty_level):
    return QuestionOccurrence.query.filter_by(
        question_id=question_id,
        company_id=company_id,
        year=year,
        language=language,
        technology=technology,
        difficulty_level=difficulty_level
    ).first()


@questions_bp.route("/addQuestion", methods=["POST"])
def addQuestion():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    question_string = data.get("question_string")
    difficulty_level = data.get("difficulty_level")
    year = data.get("year")
    technology = data.get("technology")
    language = data.get("language")
    company_id = data.get("company_id")
    type_id = data.get("type_id")
    created_by = data.get("created_by")
    topic_ids = data.get("topic_ids", [])
    options = data.get("options", [])

    question_string, error = validate_string_field(
        question_string, "question_string", 100000, required=True
    )
    if error:
        return jsonify({"message": error}), 400

    technology, error = validate_string_field(
        technology, "technology", MAX_TECHNOLOGY_LENGTH
    )
    if error:
        return jsonify({"message": error}), 400

    language, error = validate_string_field(
        language, "language", MAX_LANGUAGE_LENGTH
    )
    if error:
        return jsonify({"message": error}), 400

    year, error = validate_year(year)
    if error:
        return jsonify({"message": error}), 400

    if difficulty_level is None:
        return jsonify({"message": "difficulty_level is required"}), 400

    if difficulty_level not in [d.value for d in DifficultyLevelEnum]:
        return jsonify({"message": "Invalid difficulty_level"}), 400

    difficulty_enum = DifficultyLevelEnum(difficulty_level)

    if type_id is None or created_by is None:
        return jsonify({
            "message": "type_id, created_by and topic_ids are required"
        }), 400

    if not isinstance(topic_ids, list) or len(topic_ids) == 0:
        return jsonify({"message": "topic_ids must be a non-empty list"}), 400

    cleaned_options, error = validate_options(options)
    if error:
        return jsonify({"message": error}), 400

    creator = User.query.filter_by(id=created_by).first()
    if not creator:
        return jsonify({"message": "Creator not found"}), 404

    qtype = QuestionType.query.filter_by(type_id=type_id).first()
    if not qtype:
        return jsonify({"message": "Question type not found"}), 404

    if company_id is not None:
        company = Company.query.filter_by(company_id=company_id).first()
        if not company:
            return jsonify({"message": "Company not found"}), 404

    topics = Topic.query.filter(Topic.topic_id.in_(topic_ids)).all()
    if len(topics) != len(set(topic_ids)):
        return jsonify({"message": "One or more topic IDs are invalid"}), 404

    grammar_result = grammar_check_question(question_string)
    if not grammar_result["ok"]:
        return jsonify({
            "message": "Grammar issue detected. Question not added.",
            "can_add": False,
            "issues": grammar_result["issues"],
            "suggested_question": grammar_result["suggested_text"]
        }), 400

    subject_names = list({t.subject.subject_name for t in topics if t.subject})
    topic_names = [t.topic_name for t in topics]

    alignment_result = validate_question_subject_topic_alignment(
        question_text=question_string,
        subject_name=subject_names[0] if subject_names else "",
        topic_names=topic_names
    )

    if not alignment_result["ok"]:
        return jsonify({
            "message": "Question does not match selected subject/topic.",
            "can_add": False,
            "alignment_issue": True,
            "alignment_score": alignment_result["score"],
            "matched_topic": alignment_result["matched_topic"],
            "details": alignment_result["message"]
        }), 400

    existing_questions = Question.query.all()

    exact_match = find_exact_duplicate(question_string, existing_questions)
    if exact_match:
        try:
            existing_topic_ids = {
                row.topic_id for row in Topic_Questions.query.filter_by(
                    question_id=exact_match.question_id
                ).all()
            }

            for topic_id in set(topic_ids):
                if topic_id not in existing_topic_ids:
                    db.session.add(Topic_Questions(
                        topic_id=topic_id,
                        question_id=exact_match.question_id
                    ))

            existing_occurrence = get_existing_occurrence(
                exact_match.question_id,
                company_id,
                year,
                language,
                technology,
                difficulty_enum
            )

            if not existing_occurrence:
                db.session.add(QuestionOccurrence(
                    question_id=exact_match.question_id,
                    company_id=company_id,
                    year=year,
                    language=language,
                    technology=technology,
                    difficulty_level=difficulty_enum,
                    created_by=created_by
                ))

            db.session.commit()

            updated_question = Question.query.filter_by(
                question_id=exact_match.question_id
            ).first()

            return jsonify({
                "message": "Exact duplicate found. Existing question reused and occurrence recorded.",
                "action": "duplicate_merged",
                "matched_question": serialize_question(updated_question)
            }), 200

        except Exception as e:
            db.session.rollback()
            print("Duplicate merge error:", str(e))
            return jsonify({
                "message": "Failed to merge duplicate question",
                "error": str(e)
            }), 500

    semantic_match, similarity_score = find_semantic_duplicate(
        question_string,
        existing_questions,
        threshold=0.85
    )

    if semantic_match:
        try:
            existing_topic_ids = {
                row.topic_id for row in Topic_Questions.query.filter_by(
                    question_id=semantic_match.question_id
                ).all()
            }

            for topic_id in set(topic_ids):
                if topic_id not in existing_topic_ids:
                    db.session.add(Topic_Questions(
                        topic_id=topic_id,
                        question_id=semantic_match.question_id
                    ))

            existing_occurrence = get_existing_occurrence(
                semantic_match.question_id,
                company_id,
                year,
                language,
                technology,
                difficulty_enum
            )

            if not existing_occurrence:
                db.session.add(QuestionOccurrence(
                    question_id=semantic_match.question_id,
                    company_id=company_id,
                    year=year,
                    language=language,
                    technology=technology,
                    difficulty_level=difficulty_enum,
                    created_by=created_by
                ))

            db.session.commit()

            updated_question = Question.query.filter_by(
                question_id=semantic_match.question_id
            ).first()

            return jsonify({
                "message": "Similar question already exists. Existing question reused and occurrence recorded.",
                "action": "semantic_duplicate_merged",
                "similarity_score": round(similarity_score, 4),
                "matched_question": serialize_question(updated_question)
            }), 200

        except Exception as e:
            db.session.rollback()
            print("Semantic duplicate merge error:", str(e))
            return jsonify({
                "message": "Failed to merge similar question",
                "error": str(e)
            }), 500

    try:
        question = Question(
            question_string=question_string,
            type_id=type_id,
            created_by=created_by
        )

        db.session.add(question)
        db.session.flush()

        for topic in topics:
            db.session.add(Topic_Questions(
                topic_id=topic.topic_id,
                question_id=question.question_id
            ))

        for opt in cleaned_options:
            db.session.add(Option(
                question_id=question.question_id,
                option_text=opt["option_text"],
                is_correct=opt["is_correct"]
            ))

        db.session.add(QuestionOccurrence(
            question_id=question.question_id,
            company_id=company_id,
            year=year,
            language=language,
            technology=technology,
            difficulty_level=difficulty_enum,
            created_by=created_by
        ))

        db.session.commit()

        question = Question.query.filter_by(question_id=question.question_id).first()

        return jsonify({
            "message": "Question added successfully",
            "action": "new_question_added",
            "question": serialize_question(question)
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        print("IntegrityError in addQuestion:", str(e))
        return jsonify({
            "message": "Failed to add question",
            "error": str(e.orig)
        }), 409

    except Exception as e:
        db.session.rollback()
        print("Error in addQuestion:", str(e))
        return jsonify({
            "message": "Failed to add question",
            "error": str(e)
        }), 500


@questions_bp.route("/editQuestion", methods=["PUT"])
def editQuestion():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    question_id = data.get("question_id")
    question_string = data.get("question_string")
    difficulty_level = data.get("difficulty_level")
    year = data.get("year")
    technology = data.get("technology")
    language = data.get("language")
    company_id = data.get("company_id")
    type_id = data.get("type_id")
    topic_ids = data.get("topic_ids", [])
    options = data.get("options", [])

    if question_id is None:
        return jsonify({"message": "question_id is required"}), 400

    question_string, error = validate_string_field(
        question_string, "question_string", 100000, required=True
    )
    if error:
        return jsonify({"message": error}), 400

    technology, error = validate_string_field(
        technology, "technology", MAX_TECHNOLOGY_LENGTH
    )
    if error:
        return jsonify({"message": error}), 400

    language, error = validate_string_field(
        language, "language", MAX_LANGUAGE_LENGTH
    )
    if error:
        return jsonify({"message": error}), 400

    year, error = validate_year(year)
    if error:
        return jsonify({"message": error}), 400

    if difficulty_level is None:
        return jsonify({"message": "difficulty_level is required"}), 400

    if difficulty_level not in [d.value for d in DifficultyLevelEnum]:
        return jsonify({"message": "Invalid difficulty_level"}), 400

    difficulty_enum = DifficultyLevelEnum(difficulty_level)

    if type_id is None:
        return jsonify({"message": "type_id is required"}), 400

    if not isinstance(topic_ids, list) or len(topic_ids) == 0:
        return jsonify({"message": "topic_ids must be a non-empty list"}), 400

    cleaned_options, error = validate_options(options)
    if error:
        return jsonify({"message": error}), 400

    question = Question.query.filter_by(question_id=question_id).first()
    if not question:
        return jsonify({"message": "Question not found"}), 404

    qtype = QuestionType.query.filter_by(type_id=type_id).first()
    if not qtype:
        return jsonify({"message": "Question type not found"}), 404

    if company_id is not None:
        company = Company.query.filter_by(company_id=company_id).first()
        if not company:
            return jsonify({"message": "Company not found"}), 404

    topics = Topic.query.filter(Topic.topic_id.in_(topic_ids)).all()
    if len(topics) != len(set(topic_ids)):
        return jsonify({"message": "One or more topic IDs are invalid"}), 404

    grammar_result = grammar_check_question(question_string)
    if not grammar_result["ok"]:
        return jsonify({
            "message": "Grammar issue detected. Question not updated.",
            "can_add": False,
            "issues": grammar_result["issues"],
            "suggested_question": grammar_result["suggested_text"]
        }), 400

    subject_names = list({t.subject.subject_name for t in topics if t.subject})
    topic_names = [t.topic_name for t in topics]

    alignment_result = validate_question_subject_topic_alignment(
        question_text=question_string,
        subject_name=subject_names[0] if subject_names else "",
        topic_names=topic_names
    )

    if not alignment_result["ok"]:
        return jsonify({
            "message": "Question does not match selected subject/topic.",
            "can_add": False,
            "alignment_issue": True,
            "alignment_score": alignment_result["score"],
            "matched_topic": alignment_result["matched_topic"],
            "details": alignment_result["message"]
        }), 400

    try:
        question.question_string = question_string
        question.type_id = type_id

        Topic_Questions.query.filter_by(question_id=question_id).delete()
        for topic in topics:
            db.session.add(Topic_Questions(
                topic_id=topic.topic_id,
                question_id=question_id
            ))

        Option.query.filter_by(question_id=question_id).delete()
        for opt in cleaned_options:
            db.session.add(Option(
                question_id=question_id,
                option_text=opt["option_text"],
                is_correct=opt["is_correct"]
            ))

        latest_occurrence = QuestionOccurrence.query.filter_by(
            question_id=question_id
        ).order_by(QuestionOccurrence.created_at.desc()).first()

        if latest_occurrence:
            latest_occurrence.company_id = company_id
            latest_occurrence.year = year
            latest_occurrence.language = language
            latest_occurrence.technology = technology
            latest_occurrence.difficulty_level = difficulty_enum
        else:
            db.session.add(QuestionOccurrence(
                question_id=question_id,
                company_id=company_id,
                year=year,
                language=language,
                technology=technology,
                difficulty_level=difficulty_enum,
                created_by=question.created_by
            ))

        db.session.commit()

        updated_question = Question.query.filter_by(question_id=question_id).first()

        return jsonify({
            "message": "Question updated successfully",
            "question": serialize_question(updated_question)
        }), 200

    except IntegrityError as e:
        db.session.rollback()
        print("IntegrityError in editQuestion:", str(e))
        return jsonify({
            "message": "Failed to update question",
            "error": str(e.orig)
        }), 409

    except Exception as e:
        db.session.rollback()
        print("Error in editQuestion:", str(e))
        return jsonify({
            "message": "Failed to update question",
            "error": str(e)
        }), 500


@questions_bp.route("/deleteQuestion/<int:question_id>", methods=["DELETE"])
def deleteQuestion(question_id):
    question = Question.query.filter_by(question_id=question_id).first()

    if not question:
        return jsonify({"message": "Question not found"}), 404

    try:
        Topic_Questions.query.filter_by(question_id=question_id).delete()
        QuestionOccurrence.query.filter_by(question_id=question_id).delete()
        Option.query.filter_by(question_id=question_id).delete()

        db.session.delete(question)
        db.session.commit()

        return jsonify({"message": "Question deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error in deleteQuestion:", str(e))
        return jsonify({
            "message": "Failed to delete question",
            "error": str(e)
        }), 500


@questions_bp.route("/getQuestions", methods=["GET"])
def getQuestions():
    questions = Question.query.order_by(Question.created_at.desc()).all()

    return jsonify({
        "questions": [serialize_question(q) for q in questions]
    }), 200


@questions_bp.route("/getQuestion/<int:question_id>", methods=["GET"])
def getQuestion(question_id):
    question = Question.query.filter_by(question_id=question_id).first()

    if not question:
        return jsonify({"message": "Question not found"}), 404

    return jsonify({
        "question": serialize_question(question)
    }), 200


@questions_bp.route("/getQuestionsByTopic/<int:topic_id>", methods=["GET"])
def getQuestionsByTopic(topic_id):
    topic = Topic.query.filter_by(topic_id=topic_id).first()

    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    questions = topic.questions.order_by(Question.created_at.desc()).all()

    return jsonify({
        "topic_id": topic.topic_id,
        "topic_name": topic.topic_name,
        "questions": [serialize_question(q) for q in questions]
    }), 200


@questions_bp.route("/getQuestionsByType/<int:type_id>", methods=["GET"])
def getQuestionsByType(type_id):
    qtype = QuestionType.query.filter_by(type_id=type_id).first()

    if not qtype:
        return jsonify({"message": "Question type not found"}), 404

    questions = Question.query.filter_by(type_id=type_id).order_by(Question.created_at.desc()).all()

    return jsonify({
        "type_id": qtype.type_id,
        "type_name": qtype.type_name,
        "questions": [serialize_question(q) for q in questions]
    }), 200


@questions_bp.route("/getQuestionsByDifficulty/<string:difficulty_level>", methods=["GET"])
def getQuestionsByDifficulty(difficulty_level):
    if difficulty_level not in [d.value for d in DifficultyLevelEnum]:
        return jsonify({"message": "Invalid difficulty_level"}), 400

    questions = (
        Question.query
        .join(QuestionOccurrence, Question.question_id == QuestionOccurrence.question_id)
        .filter(QuestionOccurrence.difficulty_level == DifficultyLevelEnum(difficulty_level))
        .order_by(Question.created_at.desc())
        .distinct()
        .all()
    )

    return jsonify({
        "difficulty_level": difficulty_level,
        "questions": [serialize_question(q) for q in questions]
    }), 200


@questions_bp.route("/getQuestionsByCompany/<int:company_id>", methods=["GET"])
def getQuestionsByCompany(company_id):
    company = Company.query.filter_by(company_id=company_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    questions = (
        Question.query
        .join(QuestionOccurrence, Question.question_id == QuestionOccurrence.question_id)
        .filter(QuestionOccurrence.company_id == company_id)
        .order_by(Question.created_at.desc())
        .distinct()
        .all()
    )

    return jsonify({
        "company_id": company.company_id,
        "company_name": company.company_name,
        "questions": [serialize_question(q) for q in questions]
    }), 200


@questions_bp.route("/getQuestionsByCreator/<int:user_id>", methods=["GET"])
def getQuestionsByCreator(user_id):
    creator = User.query.filter_by(id=user_id).first()

    if not creator:
        return jsonify({"message": "Creator not found"}), 404

    questions = Question.query.filter_by(created_by=user_id).order_by(Question.created_at.desc()).all()

    return jsonify({
        "creator_id": creator.id,
        "creator_name": creator.name,
        "questions": [serialize_question(q) for q in questions]
    }), 200


@questions_bp.route("/filterQuestions", methods=["POST"])
def filterQuestions():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    topic_id = data.get("topic_id")
    type_id = data.get("type_id")
    difficulty_level = data.get("difficulty_level")

    if topic_id is None or type_id is None or difficulty_level is None:
        return jsonify({
            "message": "topic_id, type_id and difficulty_level are required"
        }), 400

    if difficulty_level not in [d.value for d in DifficultyLevelEnum]:
        return jsonify({"message": "Invalid difficulty_level"}), 400

    topic = Topic.query.filter_by(topic_id=topic_id).first()
    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    qtype = QuestionType.query.filter_by(type_id=type_id).first()
    if not qtype:
        return jsonify({"message": "Question type not found"}), 404

    questions = (
        Question.query
        .join(Topic_Questions, Question.question_id == Topic_Questions.question_id)
        .join(QuestionOccurrence, Question.question_id == QuestionOccurrence.question_id)
        .filter(
            Topic_Questions.topic_id == topic_id,
            Question.type_id == type_id,
            QuestionOccurrence.difficulty_level == DifficultyLevelEnum(difficulty_level)
        )
        .order_by(Question.created_at.desc())
        .distinct()
        .all()
    )

    return jsonify({
        "filters": {
            "topic_id": topic_id,
            "topic_name": topic.topic_name,
            "type_id": type_id,
            "type_name": qtype.type_name,
            "difficulty_level": difficulty_level
        },
        "questions": [serialize_question(q) for q in questions]
    }), 200


@questions_bp.route("/getQuestionsBySubject/<int:subject_id>", methods=["GET"])
def getQuestionsBySubject(subject_id):
    subject = Subject.query.filter_by(subject_id=subject_id).first()

    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    topic_id = request.args.get("topic_id", type=int)
    type_id = request.args.get("type_id", type=int)
    difficulty_level = request.args.get("difficulty_level", type=str)

    query = (
        Question.query
        .join(Topic_Questions, Question.question_id == Topic_Questions.question_id)
        .join(Topic, Topic.topic_id == Topic_Questions.topic_id)
        .filter(Topic.subject_id == subject_id)
    )

    if topic_id is not None:
        topic = Topic.query.filter_by(topic_id=topic_id, subject_id=subject_id).first()
        if not topic:
            return jsonify({"message": "Topic not found for this subject"}), 404
        query = query.filter(Topic.topic_id == topic_id)

    if type_id is not None:
        qtype = QuestionType.query.filter_by(type_id=type_id).first()
        if not qtype:
            return jsonify({"message": "Question type not found"}), 404
        query = query.filter(Question.type_id == type_id)

    if difficulty_level is not None:
        if difficulty_level not in [d.value for d in DifficultyLevelEnum]:
            return jsonify({"message": "Invalid difficulty_level"}), 400
        query = (
            query
            .join(QuestionOccurrence, Question.question_id == QuestionOccurrence.question_id)
            .filter(QuestionOccurrence.difficulty_level == DifficultyLevelEnum(difficulty_level))
        )

    questions = query.order_by(Question.created_at.desc()).distinct().all()

    return jsonify({
        "subject_id": subject.subject_id,
        "subject_name": subject.subject_name,
        "filters": {
            "topic_id": topic_id,
            "type_id": type_id,
            "difficulty_level": difficulty_level
        },
        "questions": [serialize_question(q) for q in questions]
    }), 200