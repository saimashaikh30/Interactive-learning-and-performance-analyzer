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
    DifficultyLevelEnum
)

questions_bp = Blueprint("questions_bp", __name__)

MAX_TECHNOLOGY_LENGTH = 50
MAX_LANGUAGE_LENGTH = 30
MAX_YEAR_LENGTH = 4
MAX_OPTION_TEXT_LENGTH = 500


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def serialize_question(q):
    company_name = q.company.company_name if hasattr(q, "company") and q.company else None
    type_name = q.question_type.type_name if hasattr(q, "question_type") and q.question_type else None

    if type_name is None and q.type_id:
        qtype = QuestionType.query.filter_by(type_id=q.type_id).first()
        type_name = qtype.type_name if qtype else None

    if company_name is None and q.company_id:
        company = Company.query.filter_by(company_id=q.company_id).first()
        company_name = company.company_name if company else None

    return {
        "question_id": q.question_id,
        "question_string": q.question_string,
        "difficulty_level": q.difficulty_level.value if q.difficulty_level else None,
        "year": q.year,
        "technology": q.technology,
        "language": q.language,
        "company_id": q.company_id,
        "company_name": company_name,
        "type_id": q.type_id,
        "type_name": type_name,
        "created_by": q.created_by,
        "creator_name": q.creator.name if q.creator else None,
        "created_at": q.created_at.isoformat() if q.created_at else None,
        "updated_at": q.updated_at.isoformat() if q.updated_at else None,
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
        ]
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


# ================= ADD QUESTION =================

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

    try:
        question = Question(
            question_string=question_string,
            difficulty_level=DifficultyLevelEnum(difficulty_level),
            year=year,
            technology=technology,
            language=language,
            company_id=company_id,
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

        db.session.commit()

        question = Question.query.filter_by(question_id=question.question_id).first()

        return jsonify({
            "message": "Question added successfully",
            "question": serialize_question(question)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to add question"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to add question"}), 500


# ================= EDIT QUESTION =================

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

    try:
        question.question_string = question_string
        question.difficulty_level = DifficultyLevelEnum(difficulty_level)
        question.year = year
        question.technology = technology
        question.language = language
        question.company_id = company_id
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

        db.session.commit()

        updated_question = Question.query.filter_by(question_id=question_id).first()

        return jsonify({
            "message": "Question updated successfully",
            "question": serialize_question(updated_question)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update question"}), 500


# ================= DELETE QUESTION =================

@questions_bp.route("/deleteQuestion/<int:question_id>", methods=["DELETE"])
def deleteQuestion(question_id):
    question = Question.query.filter_by(question_id=question_id).first()

    if not question:
        return jsonify({"message": "Question not found"}), 404

    try:
        db.session.delete(question)
        db.session.commit()

        return jsonify({"message": "Question deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete question"}), 500


# ================= GET ALL QUESTIONS =================

@questions_bp.route("/getQuestions", methods=["GET"])
def getQuestions():
    questions = Question.query.order_by(Question.created_at.desc()).all()

    return jsonify({
        "questions": [serialize_question(q) for q in questions]
    }), 200


# ================= GET SINGLE QUESTION =================

@questions_bp.route("/getQuestion/<int:question_id>", methods=["GET"])
def getQuestion(question_id):
    question = Question.query.filter_by(question_id=question_id).first()

    if not question:
        return jsonify({"message": "Question not found"}), 404

    return jsonify({
        "question": serialize_question(question)
    }), 200


# ================= FILTER BY TOPIC =================

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


# ================= FILTER BY QUESTION TYPE =================

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


# ================= FILTER BY DIFFICULTY =================

@questions_bp.route("/getQuestionsByDifficulty/<string:difficulty_level>", methods=["GET"])
def getQuestionsByDifficulty(difficulty_level):
    if difficulty_level not in [d.value for d in DifficultyLevelEnum]:
        return jsonify({"message": "Invalid difficulty_level"}), 400

    questions = Question.query.filter_by(
        difficulty_level=DifficultyLevelEnum(difficulty_level)
    ).order_by(Question.created_at.desc()).all()

    return jsonify({
        "difficulty_level": difficulty_level,
        "questions": [serialize_question(q) for q in questions]
    }), 200


# ================= FILTER BY COMPANY =================

@questions_bp.route("/getQuestionsByCompany/<int:company_id>", methods=["GET"])
def getQuestionsByCompany(company_id):
    company = Company.query.filter_by(company_id=company_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    questions = Question.query.filter_by(company_id=company_id).order_by(Question.created_at.desc()).all()

    return jsonify({
        "company_id": company.company_id,
        "company_name": company.company_name,
        "questions": [serialize_question(q) for q in questions]
    }), 200


# ================= FILTER BY CREATOR =================

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


# ================= MIXED FILTER =================

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
        .filter(
            Topic_Questions.topic_id == topic_id,
            Question.type_id == type_id,
            Question.difficulty_level == DifficultyLevelEnum(difficulty_level)
        )
        .order_by(Question.created_at.desc())
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