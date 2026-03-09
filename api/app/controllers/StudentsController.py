from flask import Blueprint, request, jsonify
from app import db
from app.models import Subject, Domain

subjects_bp = Blueprint("subjects_bp", __name__)


@subjects_bp.route("/addSubject", methods=["POST"])
def addSubject():
    data = request.get_json()

    subject_code = data.get("subject_code")
    subject_name = data.get("subject_name")
    domain_id = data.get("domain_id")

    if not subject_code or not subject_name or not domain_id:
        return jsonify({
            "message": "subject_code, subject_name and domain_id are required"
        }), 400

    # Check if domain exists
    domain = Domain.query.filter_by(domain_id=domain_id).first()
    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    # Check duplicate subject code
    existing_code = Subject.query.filter_by(subject_code=subject_code).first()
    if existing_code:
        return jsonify({"message": "Subject code already exists"}), 400

    # Optional: prevent same subject name in same domain
    existing_subject = Subject.query.filter_by(
        subject_name=subject_name,
        domain_id=domain_id
    ).first()
    if existing_subject:
        return jsonify({"message": "Subject already exists in this domain"}), 400

    subject = Subject(
        subject_code=subject_code,
        subject_name=subject_name,
        domain_id=domain_id
    )

    db.session.add(subject)
    db.session.commit()

    return jsonify({
        "message": "Subject successfully added",
        "subject": {
            "subject_id": subject.subject_id,
            "subject_code": subject.subject_code,
            "subject_name": subject.subject_name,
            "domain_id": subject.domain_id
        }
    }), 201


@subjects_bp.route("/editSubject", methods=["PUT"])
def editSubject():
    data = request.get_json()

    subject_id = data.get("subject_id")
    subject_code = data.get("subject_code")
    subject_name = data.get("subject_name")
    domain_id = data.get("domain_id")

    if not subject_id or not subject_code or not subject_name or not domain_id:
        return jsonify({
            "message": "subject_id, subject_code, subject_name and domain_id are required"
        }), 400

    subject = Subject.query.filter_by(subject_id=subject_id).first()
    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    domain = Domain.query.filter_by(domain_id=domain_id).first()
    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    # Check if subject_code already belongs to another subject
    existing_code = Subject.query.filter(
        Subject.subject_code == subject_code,
        Subject.subject_id != subject_id
    ).first()

    if existing_code:
        return jsonify({"message": "Subject code already exists"}), 400

    # Optional: prevent same name in same domain for another subject
    existing_subject = Subject.query.filter(
        Subject.subject_name == subject_name,
        Subject.domain_id == domain_id,
        Subject.subject_id != subject_id
    ).first()

    if existing_subject:
        return jsonify({"message": "Subject already exists in this domain"}), 400

    subject.subject_code = subject_code
    subject.subject_name = subject_name
    subject.domain_id = domain_id

    db.session.commit()

    return jsonify({
        "message": "Subject successfully updated",
        "subject": {
            "subject_id": subject.subject_id,
            "subject_code": subject.subject_code,
            "subject_name": subject.subject_name,
            "domain_id": subject.domain_id
        }
    }), 200


@subjects_bp.route("/deleteSubject/<int:subject_id>", methods=["DELETE"])
def deleteSubject(subject_id):
    subject = Subject.query.filter_by(subject_id=subject_id).first()

    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    db.session.delete(subject)
    db.session.commit()

    return jsonify({"message": "Subject deleted successfully"}), 200


@subjects_bp.route("/getSubjects", methods=["GET"])
def getSubjects():
    subjects = Subject.query.all()

    serialized_subjects = [
        {
            "subject_id": s.subject_id,
            "subject_code": s.subject_code,
            "subject_name": s.subject_name,
            "domain_id": s.domain_id,
            "domain_name": s.domain.domain_name if s.domain else None
        }
        for s in subjects
    ]

    return jsonify({"subjects": serialized_subjects}), 200


@subjects_bp.route("/getSubject/<int:subject_id>", methods=["GET"])
def getSubject(subject_id):
    subject = Subject.query.filter_by(subject_id=subject_id).first()

    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    return jsonify({
        "subject": {
            "subject_id": subject.subject_id,
            "subject_code": subject.subject_code,
            "subject_name": subject.subject_name,
            "domain_id": subject.domain_id,
            "domain_name": subject.domain.domain_name if subject.domain else None
        }
    }), 200


@subjects_bp.route("/getSubjectsByDomain/<int:domain_id>", methods=["GET"])
def getSubjectsByDomain(domain_id):

    domain = Domain.query.filter_by(domain_id=domain_id).first()

    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    subjects = Subject.query.filter_by(domain_id=domain_id).all()

    serialized_subjects = [
        {
            "subject_id": s.subject_id,
            "subject_code": s.subject_code,
            "subject_name": s.subject_name,
            "domain_id": s.domain_id,
            "domain_name": domain.domain_name
        }
        for s in subjects
    ]

    return jsonify({
        "domain_id": domain.domain_id,
        "domain_name": domain.domain_name,
        "subjects": serialized_subjects
    }), 200