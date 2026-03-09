from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Option, Question

options_bp = Blueprint("options_bp", __name__)

MAX_OPTION_TEXT_LENGTH = 500


def normalize_option_text(text: str) -> str:
    return " ".join(text.strip().split())


def serialize_option(option):
    return {
        "option_id": option.option_id,
        "question_id": option.question_id,
        "option_text": option.option_text,
        "is_correct": option.is_correct
    }


@options_bp.route("/addOption", methods=["POST"])
def addOption():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    question_id = data.get("question_id")
    option_text = data.get("option_text")
    is_correct = data.get("is_correct", False)

    if question_id is None:
        return jsonify({"message": "question_id is required"}), 400

    if option_text is None:
        return jsonify({"message": "option_text is required"}), 400

    if not isinstance(option_text, str):
        return jsonify({"message": "option_text must be a string"}), 400

    option_text = normalize_option_text(option_text)

    if not option_text:
        return jsonify({"message": "option_text cannot be empty"}), 400

    if len(option_text) > MAX_OPTION_TEXT_LENGTH:
        return jsonify({
            "message": f"option_text cannot exceed {MAX_OPTION_TEXT_LENGTH} characters"
        }), 400

    if not isinstance(is_correct, bool):
        return jsonify({"message": "is_correct must be true or false"}), 400

    question = Question.query.filter_by(question_id=question_id).first()
    if not question:
        return jsonify({"message": "Question not found"}), 404

    try:
        option = Option(
            question_id=question_id,
            option_text=option_text,
            is_correct=is_correct
        )

        db.session.add(option)
        db.session.commit()

        return jsonify({
            "message": "Option added successfully",
            "option": serialize_option(option)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to add option"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to add option"}), 500


@options_bp.route("/editOption", methods=["PUT"])
def editOption():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    option_id = data.get("option_id")
    option_text = data.get("option_text")
    is_correct = data.get("is_correct")

    if option_id is None:
        return jsonify({"message": "option_id is required"}), 400

    if option_text is None:
        return jsonify({"message": "option_text is required"}), 400

    if not isinstance(option_text, str):
        return jsonify({"message": "option_text must be a string"}), 400

    option_text = normalize_option_text(option_text)

    if not option_text:
        return jsonify({"message": "option_text cannot be empty"}), 400

    if len(option_text) > MAX_OPTION_TEXT_LENGTH:
        return jsonify({
            "message": f"option_text cannot exceed {MAX_OPTION_TEXT_LENGTH} characters"
        }), 400

    if is_correct is not None and not isinstance(is_correct, bool):
        return jsonify({"message": "is_correct must be true or false"}), 400

    option = Option.query.filter_by(option_id=option_id).first()
    if not option:
        return jsonify({"message": "Option not found"}), 404

    try:
        option.option_text = option_text

        if is_correct is not None:
            option.is_correct = is_correct

        db.session.commit()

        return jsonify({
            "message": "Option updated successfully",
            "option": serialize_option(option)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update option"}), 500


@options_bp.route("/deleteOption/<int:option_id>", methods=["DELETE"])
def deleteOption(option_id):
    option = Option.query.filter_by(option_id=option_id).first()

    if not option:
        return jsonify({"message": "Option not found"}), 404

    try:
        db.session.delete(option)
        db.session.commit()

        return jsonify({"message": "Option deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete option"}), 500


@options_bp.route("/getOptions", methods=["GET"])
def getOptions():
    options = Option.query.order_by(Option.option_id.asc()).all()

    return jsonify({
        "options": [serialize_option(option) for option in options]
    }), 200


@options_bp.route("/getOption/<int:option_id>", methods=["GET"])
def getOption(option_id):
    option = Option.query.filter_by(option_id=option_id).first()

    if not option:
        return jsonify({"message": "Option not found"}), 404

    return jsonify({
        "option": serialize_option(option)
    }), 200


@options_bp.route("/getOptionsByQuestion/<int:question_id>", methods=["GET"])
def getOptionsByQuestion(question_id):
    question = Question.query.filter_by(question_id=question_id).first()

    if not question:
        return jsonify({"message": "Question not found"}), 404

    options = Option.query.filter_by(question_id=question_id).order_by(Option.option_id.asc()).all()

    return jsonify({
        "question_id": question.question_id,
        "question_string": question.question_string,
        "options": [serialize_option(option) for option in options]
    }), 200