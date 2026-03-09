from flask import Blueprint, request, jsonify
from app import db
from app.models import Company

companies_bp = Blueprint("companies_bp", __name__)


@companies_bp.route("/addCompany", methods=["POST"])
def addCompany():
    data = request.get_json()

    company_name = data.get("company_name")

    if not company_name:
        return jsonify({"message": "company_name is required"}), 400

    existing_company = Company.query.filter_by(company_name=company_name).first()
    if existing_company:
        return jsonify({"message": "Company already exists"}), 400

    company = Company(company_name=company_name)

    db.session.add(company)
    db.session.commit()

    return jsonify({
        "message": "Company successfully added",
        "company": {
            "company_id": company.company_id,
            "company_name": company.company_name
        }
    }), 201


@companies_bp.route("/editCompany", methods=["PUT"])
def editCompany():
    data = request.get_json()

    company_id = data.get("company_id")
    company_name = data.get("company_name")

    if not company_id or not company_name:
        return jsonify({"message": "company_id and company_name are required"}), 400

    company = Company.query.filter_by(company_id=company_id).first()
    if not company:
        return jsonify({"message": "Company not found"}), 404

    existing_company = Company.query.filter(
        Company.company_name == company_name,
        Company.company_id != company_id
    ).first()

    if existing_company:
        return jsonify({"message": "Company already exists"}), 400

    company.company_name = company_name
    db.session.commit()

    return jsonify({
        "message": "Company successfully updated",
        "company": {
            "company_id": company.company_id,
            "company_name": company.company_name
        }
    }), 200


@companies_bp.route("/deleteCompany/<int:company_id>", methods=["DELETE"])
def deleteCompany(company_id):
    company = Company.query.filter_by(company_id=company_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    db.session.delete(company)
    db.session.commit()

    return jsonify({"message": "Company deleted successfully"}), 200


@companies_bp.route("/getCompanies", methods=["GET"])
def getCompanies():
    companies = Company.query.all()

    serialized_companies = [
        {
            "company_id": c.company_id,
            "company_name": c.company_name
        }
        for c in companies
    ]

    return jsonify({"companies": serialized_companies}), 200


@companies_bp.route("/getCompany/<int:company_id>", methods=["GET"])
def getCompany(company_id):
    company = Company.query.filter_by(company_id=company_id).first()

    if not company:
        return jsonify({"message": "Company not found"}), 404

    return jsonify({
        "company": {
            "company_id": company.company_id,
            "company_name": company.company_name
        }
    }), 200