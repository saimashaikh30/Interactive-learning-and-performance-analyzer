from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import User, UserRoleEnum
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin  # <-- added

admin_bp = Blueprint("admin_management", __name__, url_prefix="/admin")

def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value
    }


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@cross_origin() 
def get_users():
    current_user_id = get_jwt_identity()
    users = User.query.filter(User.role != UserRoleEnum.superadmin).all()
    users = [u for u in users if u.id != current_user_id]
    return jsonify({"users": [serialize_user(u) for u in users]}), 200


@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@jwt_required()
@cross_origin()  
def change_role(user_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    new_role = data.get("role")

   
    if not new_role or new_role not in [r.value for r in UserRoleEnum if r != UserRoleEnum.superadmin]:
        return jsonify({"message": "Invalid role"}), 400

    if user_id == current_user_id:
        return jsonify({"message": "Cannot change your own role"}), 403

    user = User.query.filter_by(id=user_id).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role == UserRoleEnum.superadmin:
        return jsonify({"message": "Cannot change superadmin role"}), 403

    try:
        user.role = UserRoleEnum(new_role)
        db.session.commit()
        return jsonify({
            "message": f"{user.name}'s role updated to {new_role}",
            "user": serialize_user(user)
        }), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to update role due to database error"}), 500
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update role"}), 500