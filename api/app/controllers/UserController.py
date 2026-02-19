from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, mail
from app.models import User, AuthProviderEnum, UserRoleEnum
import requests
from flask_mail import Message

user_bp = Blueprint("user_bp", __name__)

# =========================
# REGISTER
# =========================
@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    provider = data.get("authprovider")
    role_str = data.get("role")

    # Validate role
    if role_str not in [r.value for r in UserRoleEnum]:
        return jsonify({"message": f"Invalid role. Must be one of {[r.value for r in UserRoleEnum]}"}), 400
    role = UserRoleEnum(role_str)

    if provider == "local":
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"message": "Missing fields"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"message": "User already exists"}), 400

        hashed_pw = generate_password_hash(password)
        user = User(
            name=name,
            email=email,
            password=hashed_pw,
            authprovider=AuthProviderEnum.local,
            role=role
        )
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        return jsonify({"message": "Registration successful", "access_token": access_token}), 201

    elif provider == "google":
        token = data.get("access_token")
        if not token:
            return jsonify({"message": "Missing Google token"}), 400

        resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )

        if resp.status_code != 200:
            return jsonify({"message": "Invalid Google token"}), 401

        idinfo = resp.json()
        email = idinfo.get("email")
        name = idinfo.get("name", "")

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                name=name,
                email=email,
                password=None,
                authprovider=AuthProviderEnum.google,
                role=UserRoleEnum.user
            )
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=user.id)
        return jsonify({"message": "Google registration successful", "access_token": access_token}), 201

    else:
        return jsonify({"message": "Invalid auth provider"}), 400


# =========================
# LOGIN
# =========================
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    provider = data.get("authprovider")

    if not provider:
        return jsonify({"message": "Auth provider required"}), 400

    if provider == "local":
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Missing credentials"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        if user.authprovider != AuthProviderEnum.local:
            return jsonify({"message": "Use Google login"}), 400
        if not check_password_hash(user.password, password):
            return jsonify({"message": "Invalid credentials"}), 401

    elif provider == "google":
        token = data.get("access_token")
        if not token:
            return jsonify({"message": "Missing Google token"}), 400

        resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )

        if resp.status_code != 200:
            return jsonify({"message": "Invalid Google token"}), 401

        idinfo = resp.json()
        email = idinfo.get("email")
        name = idinfo.get("name", "")

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(name=name, email=email, password=None, authprovider=AuthProviderEnum.google, role=UserRoleEnum.user)
            db.session.add(user)
            db.session.commit()

    else:
        return jsonify({"message": "Invalid auth provider"}), 400

    access_token = create_access_token(identity=user.id)

    # ================= SEND EMAIL =================
    try:
        msg = Message(
            subject="Login Notification",
            recipients=[user.email],
            body=f"Hello {user.name},\n\nYou just logged into ILPS successfully!"
        )
        mail.send(msg)
    except Exception as e:
        print("Failed to send email:", e)

    return jsonify({"message": "Login successful", "access_token": access_token, "role": user.role.value }), 200


# =========================
# PROTECTED PROFILE
# =========================
@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "provider": user.authprovider.value
    }), 200
