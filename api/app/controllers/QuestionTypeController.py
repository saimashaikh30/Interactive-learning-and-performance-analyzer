from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import QuestionType, Question

question_type_bp = Blueprint("question_type_bp", __name__)

MAX_TYPE_NAME_LENGTH = 50


def normalize_type_name(value: str) -> str:
    return " ".join(value.strip().split())


def serialize_question_type(qt):
    return {
        "type_id": qt.type_id,
        "type_name": qt.type_name
    }


# ================= CREATE =================

@question_type_bp.route("/addQuestionType", methods=["POST"])
def addQuestionType():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    type_name = data.get("type_name")

    if type_name is None:
        return jsonify({"message": "type_name is required"}), 400

    if not isinstance(type_name, str):
        return jsonify({"message": "type_name must be a string"}), 400

    type_name = normalize_type_name(type_name)

    if not type_name:
        return jsonify({"message": "type_name cannot be empty"}), 400

    if len(type_name) > MAX_TYPE_NAME_LENGTH:
        return jsonify({
            "message": f"type_name cannot exceed {MAX_TYPE_NAME_LENGTH} characters"
        }), 400

    existing_type = QuestionType.query.filter(
        func.lower(QuestionType.type_name) == type_name.lower()
    ).first()

    if existing_type:
        return jsonify({"message": "Question type already exists"}), 409

    try:
        question_type = QuestionType(type_name=type_name)
        db.session.add(question_type)
        db.session.commit()

        return jsonify({
            "message": "Question type added successfully",
            "question_type": serialize_question_type(question_type)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Question type already exists"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to add question type"}), 500


# ================= READ ALL =================

@question_type_bp.route("/getQuestionTypes", methods=["GET"])
def getQuestionTypes():
    question_types = QuestionType.query.order_by(QuestionType.type_name.asc()).all()

    return jsonify({
        "question_types": [serialize_question_type(qt) for qt in question_types]
    }), 200


# ================= READ SINGLE =================

@question_type_bp.route("/getQuestionType/<int:type_id>", methods=["GET"])
def getQuestionType(type_id):
    question_type = QuestionType.query.filter_by(type_id=type_id).first()

    if not question_type:
        return jsonify({"message": "Question type not found"}), 404

    return jsonify({
        "question_type": serialize_question_type(question_type)
    }), 200


# ================= UPDATE =================

@question_type_bp.route("/editQuestionType", methods=["PUT"])
def editQuestionType():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    type_id = data.get("type_id")
    type_name = data.get("type_name")

    if type_id is None:
        return jsonify({"message": "type_id is required"}), 400

    if type_name is None:
        return jsonify({"message": "type_name is required"}), 400

    if not isinstance(type_name, str):
        return jsonify({"message": "type_name must be a string"}), 400

    type_name = normalize_type_name(type_name)

    if not type_name:
        return jsonify({"message": "type_name cannot be empty"}), 400

    if len(type_name) > MAX_TYPE_NAME_LENGTH:
        return jsonify({
            "message": f"type_name cannot exceed {MAX_TYPE_NAME_LENGTH} characters"
        }), 400

    question_type = QuestionType.query.filter_by(type_id=type_id).first()

    if not question_type:
        return jsonify({"message": "Question type not found"}), 404

    existing_type = QuestionType.query.filter(
        func.lower(QuestionType.type_name) == type_name.lower(),
        QuestionType.type_id != type_id
    ).first()

    if existing_type:
        return jsonify({"message": "Question type already exists"}), 409

    try:
        question_type.type_name = type_name
        db.session.commit()

        return jsonify({
            "message": "Question type updated successfully",
            "question_type": serialize_question_type(question_type)
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Question type already exists"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update question type"}), 500


# ================= DELETE =================

@question_type_bp.route("/deleteQuestionType/<int:type_id>", methods=["DELETE"])
def deleteQuestionType(type_id):
    question_type = QuestionType.query.filter_by(type_id=type_id).first()

    if not question_type:
        return jsonify({"message": "Question type not found"}), 404

    linked_questions = Question.query.filter_by(type_id=type_id).count()
    if linked_questions > 0:
        return jsonify({
            "message": "Cannot delete question type. It is linked to existing questions."
        }), 409

    try:
        db.session.delete(question_type)
        db.session.commit()

        return jsonify({"message": "Question type deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete question type"}), 500