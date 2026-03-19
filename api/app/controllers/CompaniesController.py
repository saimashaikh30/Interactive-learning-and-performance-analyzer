from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Company, Question

companies_bp = Blueprint("companies_bp", __name__)

MAX_COMPANY_NAME_LENGTH = 100


def normalize_name(name: str) -> str:
    return " ".join(name.strip().split())


def serialize_company(company):
    return {
        "company_id": company.company_id,
        "company_name": company.company_name
    }




@companies_bp.route("/addCompany", methods=["POST"])
def addCompany():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    company_name = data.get("company_name")

    if company_name is None:
        return jsonify({"message": "company_name is required"}), 400

    if not isinstance(company_name, str):
        return jsonify({"message": "company_name must be a string"}), 400

    company_name = normalize_name(company_name)

    if not company_name:
        return jsonify({"message": "company_name cannot be empty"}), 400

    if len(company_name) > MAX_COMPANY_NAME_LENGTH:
        return jsonify({
            "message": f"company_name cannot exceed {MAX_COMPANY_NAME_LENGTH} characters"
        }), 400

    existing = Company.query.filter(
        func.lower(Company.company_name) == company_name.lower()
    ).first()

    if existing:
        return jsonify({"message": "Company already exists"}), 409

    try:
        company = Company(company_name=company_name)
        db.session.add(company)
        db.session.commit()

        return jsonify({
            "message": "Company successfully added",
            "company": serialize_company(company)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Company already exists"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to add company"}), 500




@companies_bp.route("/editCompany", methods=["PUT"])
def editCompany():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    company_id = data.get("company_id")
    company_name = data.get("company_name")

    if company_id is None:
        return jsonify({"message": "company_id is required"}), 400

    if company_name is None:
        return jsonify({"message": "company_name is required"}), 400

    if not isinstance(company_name, str):
        return jsonify({"message": "company_name must be a string"}), 400

    company_name = normalize_name(company_name)

    if not company_name:
        return jsonify({"message": "company_name cannot be empty"}), 400

    if len(company_name) > MAX_COMPANY_NAME_LENGTH:
        return jsonify({
            "message": f"company_name cannot exceed {MAX_COMPANY_NAME_LENGTH} characters"
        }), 400

    company = Company.query.filter_by(company_id=company_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    existing = Company.query.filter(
        func.lower(Company.company_name) == company_name.lower(),
        Company.company_id != company_id
    ).first()

    if existing:
        return jsonify({"message": "Company already exists"}), 409

    try:
        company.company_name = company_name
        db.session.commit()

        return jsonify({
            "message": "Company successfully updated",
            "company": serialize_company(company)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update company"}), 500




@companies_bp.route("/deleteCompany/<int:company_id>", methods=["DELETE"])
def deleteCompany(company_id):

    company = Company.query.filter_by(company_id=company_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    linked_questions = Question.query.filter_by(company_id=company_id).count()

    if linked_questions > 0:
        return jsonify({
            "message": "Cannot delete company. It is linked to existing questions."
        }), 409

    try:
        db.session.delete(company)
        db.session.commit()

        return jsonify({"message": "Company deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete company"}), 500




@companies_bp.route("/getCompanies", methods=["GET"])
def getCompanies():

    companies = Company.query.order_by(Company.company_name).all()

    return jsonify({
        "companies": [serialize_company(c) for c in companies]
    }), 200



@companies_bp.route("/getCompany/<int:company_id>", methods=["GET"])
def getCompany(company_id):

    company = Company.query.filter_by(company_id=company_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    return jsonify({
        "company": serialize_company(company)
    }), 200