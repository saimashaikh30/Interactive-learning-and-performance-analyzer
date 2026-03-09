from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Subject, Domain, Topic
import re

subjects_bp = Blueprint("subjects_bp", __name__)

MAX_SUBJECT_CODE_LENGTH = 10
MAX_SUBJECT_NAME_LENGTH = 100


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def normalize_subject_code(value: str) -> str:
    return value.strip().upper()


def is_valid_subject_name(subject_name: str) -> bool:
    # reject names made of digits only
    return not subject_name.isdigit()


def is_valid_subject_code(subject_code: str) -> bool:
    # must contain at least one letter and at least one digit
    return bool(re.fullmatch(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$", subject_code))


def serialize_subject(subject, topics_count=0):
    return {
        "subject_id": subject.subject_id,
        "subject_code": subject.subject_code,
        "subject_name": subject.subject_name,
        "domain_id": subject.domain_id,
        "domain_name": subject.domain.domain_name if subject.domain else None,
        "topics_count": topics_count
    }


@subjects_bp.route("/addSubject", methods=["POST"])
def addSubject():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    subject_code = data.get("subject_code")
    subject_name = data.get("subject_name")
    domain_id = data.get("domain_id")

    if subject_code is None:
        return jsonify({"message": "subject_code is required"}), 400

    if subject_name is None:
        return jsonify({"message": "subject_name is required"}), 400

    if domain_id is None:
        return jsonify({"message": "domain_id is required"}), 400

    if not isinstance(subject_code, str):
        return jsonify({"message": "subject_code must be a string"}), 400

    if not isinstance(subject_name, str):
        return jsonify({"message": "subject_name must be a string"}), 400

    subject_code = normalize_subject_code(subject_code)
    subject_name = normalize_text(subject_name)

    if not subject_code:
        return jsonify({"message": "subject_code cannot be empty"}), 400

    if not subject_name:
        return jsonify({"message": "subject_name cannot be empty"}), 400

    if not is_valid_subject_name(subject_name):
        return jsonify({"message": "subject_name cannot contain only digits"}), 400

    if not is_valid_subject_code(subject_code):
        return jsonify({
            "message": "subject_code must contain both letters and digits only"
        }), 400

    if len(subject_code) > MAX_SUBJECT_CODE_LENGTH:
        return jsonify({
            "message": f"subject_code cannot exceed {MAX_SUBJECT_CODE_LENGTH} characters"
        }), 400

    if len(subject_name) > MAX_SUBJECT_NAME_LENGTH:
        return jsonify({
            "message": f"subject_name cannot exceed {MAX_SUBJECT_NAME_LENGTH} characters"
        }), 400

    domain = Domain.query.filter_by(domain_id=domain_id).first()
    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    existing_code = Subject.query.filter(
        func.lower(Subject.subject_code) == subject_code.lower()
    ).first()

    if existing_code:
        return jsonify({"message": "Subject code already exists"}), 409

    existing_subject = Subject.query.filter(
        func.lower(Subject.subject_name) == subject_name.lower(),
        Subject.domain_id == domain_id
    ).first()

    if existing_subject:
        return jsonify({"message": "Subject already exists in this domain"}), 409

    try:
        subject = Subject(
            subject_code=subject_code,
            subject_name=subject_name,
            domain_id=domain_id
        )

        db.session.add(subject)
        db.session.commit()

        return jsonify({
            "message": "Subject successfully added",
            "subject": serialize_subject(subject)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to add subject due to duplicate data"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to add subject"}), 500


@subjects_bp.route("/editSubject", methods=["PUT"])
def editSubject():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    subject_id = data.get("subject_id")
    subject_code = data.get("subject_code")
    subject_name = data.get("subject_name")
    domain_id = data.get("domain_id")

    if subject_id is None:
        return jsonify({"message": "subject_id is required"}), 400

    if subject_code is None:
        return jsonify({"message": "subject_code is required"}), 400

    if subject_name is None:
        return jsonify({"message": "subject_name is required"}), 400

    if domain_id is None:
        return jsonify({"message": "domain_id is required"}), 400

    if not isinstance(subject_code, str):
        return jsonify({"message": "subject_code must be a string"}), 400

    if not isinstance(subject_name, str):
        return jsonify({"message": "subject_name must be a string"}), 400

    subject_code = normalize_subject_code(subject_code)
    subject_name = normalize_text(subject_name)

    if not subject_code:
        return jsonify({"message": "subject_code cannot be empty"}), 400

    if not subject_name:
        return jsonify({"message": "subject_name cannot be empty"}), 400

    if not is_valid_subject_name(subject_name):
        return jsonify({"message": "subject_name cannot contain only digits"}), 400

    if not is_valid_subject_code(subject_code):
        return jsonify({
            "message": "subject_code must contain both letters and digits only"
        }), 400

    if len(subject_code) > MAX_SUBJECT_CODE_LENGTH:
        return jsonify({
            "message": f"subject_code cannot exceed {MAX_SUBJECT_CODE_LENGTH} characters"
        }), 400

    if len(subject_name) > MAX_SUBJECT_NAME_LENGTH:
        return jsonify({
            "message": f"subject_name cannot exceed {MAX_SUBJECT_NAME_LENGTH} characters"
        }), 400

    subject = Subject.query.filter_by(subject_id=subject_id).first()
    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    domain = Domain.query.filter_by(domain_id=domain_id).first()
    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    existing_code = Subject.query.filter(
        func.lower(Subject.subject_code) == subject_code.lower(),
        Subject.subject_id != subject_id
    ).first()

    if existing_code:
        return jsonify({"message": "Subject code already exists"}), 409

    existing_subject = Subject.query.filter(
        func.lower(Subject.subject_name) == subject_name.lower(),
        Subject.domain_id == domain_id,
        Subject.subject_id != subject_id
    ).first()

    if existing_subject:
        return jsonify({"message": "Subject already exists in this domain"}), 409

    try:
        subject.subject_code = subject_code
        subject.subject_name = subject_name
        subject.domain_id = domain_id

        db.session.commit()

        return jsonify({
            "message": "Subject successfully updated",
            "subject": serialize_subject(subject)
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to update subject due to duplicate data"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update subject"}), 500


@subjects_bp.route("/deleteSubject/<int:subject_id>", methods=["DELETE"])
def deleteSubject(subject_id):
    subject = Subject.query.filter_by(subject_id=subject_id).first()

    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    linked_topics = Topic.query.filter_by(subject_id=subject_id).count()
    if linked_topics > 0:
        return jsonify({
            "message": "Cannot delete subject. It is linked to existing topics."
        }), 409

    try:
        db.session.delete(subject)
        db.session.commit()

        return jsonify({"message": "Subject deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete subject"}), 500


@subjects_bp.route("/getSubjects", methods=["GET"])
def getSubjects():
    results = (
        db.session.query(
            Subject,
            func.count(Topic.topic_id).label("topics_count")
        )
        .outerjoin(Topic, Subject.subject_id == Topic.subject_id)
        .group_by(Subject.subject_id)
        .order_by(Subject.subject_name.asc())
        .all()
    )

    return jsonify({
        "subjects": [
            serialize_subject(subject, topics_count)
            for subject, topics_count in results
        ]
    }), 200

@subjects_bp.route("/getSubject/<int:subject_id>", methods=["GET"])
def getSubject(subject_id):
    result = (
        db.session.query(
            Subject,
            func.count(Topic.topic_id).label("topics_count")
        )
        .outerjoin(Topic, Subject.subject_id == Topic.subject_id)
        .filter(Subject.subject_id == subject_id)
        .group_by(Subject.subject_id)
        .first()
    )

    if not result:
        return jsonify({"message": "Subject not found"}), 404

    subject, topics_count = result

    return jsonify({
        "subject": serialize_subject(subject, topics_count)
    }), 200

@subjects_bp.route("/getSubjectsByDomain/<int:domain_id>", methods=["GET"])
def getSubjectsByDomain(domain_id):
    domain = Domain.query.filter_by(domain_id=domain_id).first()

    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    results = (
        db.session.query(
            Subject,
            func.count(Topic.topic_id).label("topics_count")
        )
        .outerjoin(Topic, Subject.subject_id == Topic.subject_id)
        .filter(Subject.domain_id == domain_id)
        .group_by(Subject.subject_id)
        .order_by(Subject.subject_name.asc())
        .all()
    )

    return jsonify({
        "domain_id": domain.domain_id,
        "domain_name": domain.domain_name,
        "subjects": [
            serialize_subject(subject, topics_count)
            for subject, topics_count in results
        ]
    }), 200