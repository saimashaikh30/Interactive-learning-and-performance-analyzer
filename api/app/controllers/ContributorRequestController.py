from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Contributor_Request, User, RequestStatusEnum, UserRoleEnum

contributor_request_bp = Blueprint("contributor_request_bp", __name__)

MAX_REMARKS_LENGTH = 200




def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def validate_remarks(remarks):
    if remarks is None:
        return None, None

    if not isinstance(remarks, str):
        return None, "remarks must be a string"

    remarks = normalize_text(remarks)

    if len(remarks) > MAX_REMARKS_LENGTH:
        return None, f"remarks cannot exceed {MAX_REMARKS_LENGTH} characters"

    return remarks, None


def serialize_contributor_request(req):
    return {
        "request_id": req.request_id,
        "user_id": req.user_id,
        "user_name": req.user.name if req.user else None,
        "user_email": req.user.email if req.user else None,
        "status": req.status.value if req.status else None,
        "requested_at": req.requested_at.isoformat() if req.requested_at else None,
        "reviewed_by": req.reviewed_by,
        "reviewer_name": req.reviewer.name if req.reviewer else None,
        "reviewed_at": req.reviewed_at.isoformat() if req.reviewed_at else None,
        "remarks": req.remarks
    }



@contributor_request_bp.route("/addContributorRequest", methods=["POST"])
def addContributorRequest():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    user_id = data.get("user_id")
    remarks = data.get("remarks")

    if user_id is None:
        return jsonify({"message": "user_id is required"}), 400

    remarks, remarks_error = validate_remarks(remarks)
    if remarks_error:
        return jsonify({"message": remarks_error}), 400

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    existing_pending = Contributor_Request.query.filter_by(
        user_id=user_id,
        status=RequestStatusEnum.pending
    ).first()

    if existing_pending:
        return jsonify({"message": "Pending contributor request already exists"}), 409

    try:
        contributor_request = Contributor_Request(
            user_id=user_id,
            status=RequestStatusEnum.pending,
            remarks=remarks
        )

        db.session.add(contributor_request)
        db.session.commit()

        return jsonify({
            "message": "Contributor request created successfully",
            "request": serialize_contributor_request(contributor_request)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to create contributor request"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to create contributor request"}), 500




@contributor_request_bp.route("/getContributorRequests", methods=["GET"])
def getContributorRequests():
    requests_list = Contributor_Request.query.order_by(
        Contributor_Request.requested_at.desc()
    ).all()

    return jsonify({
        "requests": [serialize_contributor_request(req) for req in requests_list]
    }), 200




@contributor_request_bp.route("/getContributorRequest/<int:request_id>", methods=["GET"])
def getContributorRequest(request_id):
    contributor_request = Contributor_Request.query.filter_by(request_id=request_id).first()

    if not contributor_request:
        return jsonify({"message": "Contributor request not found"}), 404

    return jsonify({
        "request": serialize_contributor_request(contributor_request)
    }), 200




@contributor_request_bp.route("/editContributorRequest", methods=["PUT"])
def editContributorRequest():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    request_id = data.get("request_id")
    remarks = data.get("remarks")

    if request_id is None:
        return jsonify({"message": "request_id is required"}), 400

    remarks, remarks_error = validate_remarks(remarks)
    if remarks_error:
        return jsonify({"message": remarks_error}), 400

    contributor_request = Contributor_Request.query.filter_by(request_id=request_id).first()

    if not contributor_request:
        return jsonify({"message": "Contributor request not found"}), 404

    try:
        contributor_request.remarks = remarks
        db.session.commit()

        return jsonify({
            "message": "Contributor request updated successfully",
            "request": serialize_contributor_request(contributor_request)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update contributor request"}), 500




@contributor_request_bp.route("/deleteContributorRequest/<int:request_id>", methods=["DELETE"])
def deleteContributorRequest(request_id):
    contributor_request = Contributor_Request.query.filter_by(request_id=request_id).first()

    if not contributor_request:
        return jsonify({"message": "Contributor request not found"}), 404

    try:
        db.session.delete(contributor_request)
        db.session.commit()

        return jsonify({"message": "Contributor request deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete contributor request"}), 500




@contributor_request_bp.route("/getContributorRequestsByStatus/<string:status>", methods=["GET"])
def getContributorRequestsByStatus(status):
    if status not in [s.value for s in RequestStatusEnum]:
        return jsonify({"message": "Invalid status"}), 400

    requests_list = Contributor_Request.query.filter_by(
        status=RequestStatusEnum(status)
    ).order_by(Contributor_Request.requested_at.desc()).all()

    return jsonify({
        "status": status,
        "requests": [serialize_contributor_request(req) for req in requests_list]
    }), 200




@contributor_request_bp.route("/approveContributorRequest", methods=["PUT"])
def approveContributorRequest():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    request_id = data.get("request_id")
    reviewed_by = data.get("reviewed_by")
    remarks = data.get("remarks")

    if request_id is None or reviewed_by is None:
        return jsonify({"message": "request_id and reviewed_by are required"}), 400

    remarks, remarks_error = validate_remarks(remarks)
    if remarks_error:
        return jsonify({"message": remarks_error}), 400

    contributor_request = Contributor_Request.query.filter_by(request_id=request_id).first()
    if not contributor_request:
        return jsonify({"message": "Contributor request not found"}), 404

    reviewer = User.query.filter_by(id=reviewed_by).first()
    if not reviewer:
        return jsonify({"message": "Reviewer not found"}), 404

    if reviewer.role not in [UserRoleEnum.admin, UserRoleEnum.superadmin]:
        return jsonify({"message": "Only admin or superadmin can approve requests"}), 403

    user = User.query.filter_by(id=contributor_request.user_id).first()
    if not user:
        return jsonify({"message": "Requested user not found"}), 404

    if contributor_request.status == RequestStatusEnum.approved:
        return jsonify({"message": "Contributor request is already approved"}), 409

    try:
        contributor_request.status = RequestStatusEnum.approved
        contributor_request.reviewed_by = reviewed_by
        contributor_request.reviewed_at = datetime.utcnow()
        contributor_request.remarks = remarks

        user.role = UserRoleEnum.contributor

        db.session.commit()

        return jsonify({
            "message": "Contributor request approved successfully",
            "request": serialize_contributor_request(contributor_request)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to approve contributor request"}), 500
    



@contributor_request_bp.route("/rejectContributorRequest", methods=["PUT"])
def rejectContributorRequest():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    request_id = data.get("request_id")
    reviewed_by = data.get("reviewed_by")
    remarks = data.get("remarks")

    if request_id is None or reviewed_by is None:
        return jsonify({"message": "request_id and reviewed_by are required"}), 400

    remarks, remarks_error = validate_remarks(remarks)
    if remarks_error:
        return jsonify({"message": remarks_error}), 400

    contributor_request = Contributor_Request.query.filter_by(request_id=request_id).first()
    if not contributor_request:
        return jsonify({"message": "Contributor request not found"}), 404

    reviewer = User.query.filter_by(id=reviewed_by).first()
    if not reviewer:
        return jsonify({"message": "Reviewer not found"}), 404

    if reviewer.role not in [UserRoleEnum.admin, UserRoleEnum.superadmin]:
        return jsonify({"message": "Only admin or superadmin can reject requests"}), 403

    if contributor_request.status == RequestStatusEnum.rejected:
        return jsonify({"message": "Contributor request is already rejected"}), 409

    try:
        contributor_request.status = RequestStatusEnum.rejected
        contributor_request.reviewed_by = reviewed_by
        contributor_request.reviewed_at = datetime.utcnow()
        contributor_request.remarks = remarks

        db.session.commit()

        return jsonify({
            "message": "Contributor request rejected successfully",
            "request": serialize_contributor_request(contributor_request)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to reject contributor request"}), 500
    
    


@contributor_request_bp.route("/revokeContributorRequest", methods=["PUT"])
def revokeContributorRequest():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    request_id = data.get("request_id")
    reviewed_by = data.get("reviewed_by")
    remarks = data.get("remarks")

    if request_id is None or reviewed_by is None:
        return jsonify({"message": "request_id and reviewed_by are required"}), 400

    remarks, remarks_error = validate_remarks(remarks)
    if remarks_error:
        return jsonify({"message": remarks_error}), 400

    contributor_request = Contributor_Request.query.filter_by(request_id=request_id).first()
    if not contributor_request:
        return jsonify({"message": "Contributor request not found"}), 404

    reviewer = User.query.filter_by(id=reviewed_by).first()
    if not reviewer:
        return jsonify({"message": "Reviewer not found"}), 404

    user = User.query.filter_by(id=contributor_request.user_id).first()
    if not user:
        return jsonify({"message": "Requested user not found"}), 404

    if contributor_request.status == RequestStatusEnum.revoked:
        return jsonify({"message": "Contributor request is already revoked"}), 409

    try:
        contributor_request.status = RequestStatusEnum.revoked
        contributor_request.reviewed_by = reviewed_by
        contributor_request.reviewed_at = datetime.utcnow()
        contributor_request.remarks = remarks

        user.role = UserRoleEnum.user

        db.session.commit()

        return jsonify({
            "message": "Contributor request revoked successfully",
            "request": serialize_contributor_request(contributor_request)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to revoke contributor request"}), 500