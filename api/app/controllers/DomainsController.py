from flask import Blueprint, request, jsonify, current_app
# from werkzeug.security import generate_password_hash, check_password_hash
# from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
# from flask_mail import Message
from app import db
import requests
import re
from app.models import Domain
domains_bp=Blueprint("domains_bp",__name__)


@domains_bp.route("/addDomain",methods=["POST"])
def addDomain():
    data=request.get_json()
    domain_name=data.get("domain_name")

    if not domain_name:
        return jsonify({"message":"Domain Required"}),400
    
    domain=Domain.query.filter_by(domain_name=domain_name).first()

    if not domain:
        domain=Domain(domain_name=domain_name)
        db.session.add(domain)
        db.session.commit()
        return jsonify({"message":"Domain Successfully Added"}),201
    else:
        return jsonify({"message":"Failed to save domain"}),400
    
@domains_bp.route("/editDomain",methods=["PUT"])
def editDomain():
    data=request.get_json()
    domain_id=data.get("domain_id")
    domain_name=data.get("domain_name")

    if not domain_name or not domain_id :
        return jsonify({"message":"Domain Details Required"}),400
    
    domain=Domain.query.filter_by(domain_id=domain_id).first()

    if not domain:
        return jsonify({"message":"No Domain Found"}),400
    else:
        domain.domain_name=domain_name
        db.session.commit()
        return jsonify({"message":"Successfully edited domain"}),201
    

@domains_bp.route("/deleteDomain",methods=["DELETE"])
def deleteDomain():
    data=request.get_json()
    domain_id=data.get("domain_id")

    if not domain_id:
        return jsonify({"message":"Pass domain id"}),400
    
    domain=Domain.query.filter_by(domain_id=domain_id).first()

    if not domain:
        return jsonify({"message":"Domain Not found"}),404
    else:
        db.session.delete(domain)
        db.session.commit()
        return jsonify({"message":"Deleted successfully"}),200


@domains_bp.route("/getDomain", methods=["GET"])
def getDomain():
    domains = Domain.query.all()
    serialized_domains = [
        {"domain_id": d.domain_id, "domain_name": d.domain_name} 
        for d in domains
    ]
    
    return jsonify({
        "domains": serialized_domains
    }), 200 