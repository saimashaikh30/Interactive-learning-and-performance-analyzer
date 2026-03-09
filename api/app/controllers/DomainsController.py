from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Domain, Subject

domains_bp = Blueprint("domains_bp", __name__)

MAX_DOMAIN_NAME_LENGTH = 50


def normalize_domain_name(name: str) -> str:
    return " ".join(name.strip().split())


def serialize_domain(domain):
    return {
        "domain_id": domain.domain_id,
        "domain_name": domain.domain_name
    }


@domains_bp.route("/addDomain", methods=["POST"])
def addDomain():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    domain_name = data.get("domain_name")

    if domain_name is None:
        return jsonify({"message": "domain_name is required"}), 400

    if not isinstance(domain_name, str):
        return jsonify({"message": "domain_name must be a string"}), 400

    domain_name = normalize_domain_name(domain_name)

    if not domain_name:
        return jsonify({"message": "domain_name cannot be empty"}), 400

    if len(domain_name) > MAX_DOMAIN_NAME_LENGTH:
        return jsonify({
            "message": f"domain_name cannot exceed {MAX_DOMAIN_NAME_LENGTH} characters"
        }), 400

    existing_domain = Domain.query.filter(
        func.lower(Domain.domain_name) == domain_name.lower()
    ).first()

    if existing_domain:
        return jsonify({"message": "Domain already exists"}), 409

    try:
        domain = Domain(domain_name=domain_name)
        db.session.add(domain)
        db.session.commit()

        return jsonify({
            "message": "Domain successfully added",
            "domain": serialize_domain(domain)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Domain already exists"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to add domain"}), 500


@domains_bp.route("/editDomain", methods=["PUT"])
def editDomain():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    domain_id = data.get("domain_id")
    domain_name = data.get("domain_name")

    if domain_id is None:
        return jsonify({"message": "domain_id is required"}), 400

    if domain_name is None:
        return jsonify({"message": "domain_name is required"}), 400

    if not isinstance(domain_name, str):
        return jsonify({"message": "domain_name must be a string"}), 400

    domain_name = normalize_domain_name(domain_name)

    if not domain_name:
        return jsonify({"message": "domain_name cannot be empty"}), 400

    if len(domain_name) > MAX_DOMAIN_NAME_LENGTH:
        return jsonify({
            "message": f"domain_name cannot exceed {MAX_DOMAIN_NAME_LENGTH} characters"
        }), 400

    domain = Domain.query.filter_by(domain_id=domain_id).first()

    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    existing_domain = Domain.query.filter(
        func.lower(Domain.domain_name) == domain_name.lower(),
        Domain.domain_id != domain_id
    ).first()

    if existing_domain:
        return jsonify({"message": "Domain already exists"}), 409

    try:
        domain.domain_name = domain_name
        db.session.commit()

        return jsonify({
            "message": "Domain successfully updated",
            "domain": serialize_domain(domain)
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Domain already exists"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update domain"}), 500


@domains_bp.route("/deleteDomain", methods=["DELETE"])
def deleteDomain():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    domain_id = data.get("domain_id")

    if domain_id is None:
        return jsonify({"message": "domain_id is required"}), 400

    domain = Domain.query.filter_by(domain_id=domain_id).first()

    if not domain:
        return jsonify({"message": "Domain not found"}), 404

    linked_subjects = Subject.query.filter_by(domain_id=domain_id).count()
    if linked_subjects > 0:
        return jsonify({
            "message": "Cannot delete domain. It is linked to existing subjects."
        }), 409

    try:
        db.session.delete(domain)
        db.session.commit()

        return jsonify({"message": "Domain deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete domain"}), 500


@domains_bp.route("/getDomain", methods=["GET"])
def getDomain():
    domains = Domain.query.order_by(Domain.domain_name.asc()).all()

    return jsonify({
        "domains": [serialize_domain(d) for d in domains]
    }), 200