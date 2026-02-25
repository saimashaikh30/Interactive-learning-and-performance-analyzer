from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
from app import db, mail
from app.models import User, AuthProviderEnum, UserRoleEnum
import requests
import re

user_bp = Blueprint("user_bp", __name__)


# =========================
# VALIDATION FUNCTIONS
# =========================

def is_valid_name(name):
    # Only letters and spaces allowed
    return bool(re.fullmatch(r"[A-Za-z ]+", name))


def is_valid_email(email):
    # Simple email regex validation
    return bool(re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email))


def is_strong_password(password):
    """
    Password rules:
    - Minimum 8 characters
    - At least 1 letter
    - At least 1 number
    - At least 1 special character
    """
    return bool(
        re.fullmatch(
            r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            password
        )
    )


# =========================
# REGISTER
# =========================

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    provider = data.get("authprovider")
    role_str = data.get("role")

    if not provider:
        return jsonify({"message": "Auth provider is required"}), 400

    # Validate role
    if not role_str or role_str not in [r.value for r in UserRoleEnum]:
        return jsonify({
            "message": f"Invalid role. Must be one of {[r.value for r in UserRoleEnum]}"
        }), 400

    role = UserRoleEnum(role_str)

    # -------------------------
    # LOCAL REGISTRATION
    # -------------------------
    if provider == "local":
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        # Required fields check
        if not name or not email or not password:
            return jsonify({"message": "Name, email and password are required"}), 400

        # Name validation
        if not is_valid_name(name):
            return jsonify({
                "message": "Name must contain only letters and spaces"
            }), 400

        # Email validation
        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        # Email uniqueness
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already registered"}), 400

        # Password strength validation
        if not is_strong_password(password):
            return jsonify({
                "message": "Password must be at least 8 characters long and include at least one letter, one number, and one special character"
            }), 400

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

        return jsonify({
            "message": "Registration successful",
            "access_token": access_token
        }), 201

    # -------------------------
    # GOOGLE REGISTRATION
    # -------------------------
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

        if not email:
            return jsonify({"message": "Google account email not found"}), 400

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

        return jsonify({
            "message": "Google registration successful",
            "access_token": access_token
        }), 201

    else:
        return jsonify({"message": "Invalid auth provider"}), 400


# =========================
# LOGIN
# =========================

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    provider = data.get("authprovider")

    if not provider:
        return jsonify({"message": "Auth provider required"}), 400

    # -------------------------
    # LOCAL LOGIN
    # -------------------------
    if provider == "local":
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        if user.authprovider != AuthProviderEnum.local:
            return jsonify({"message": "Use Google login"}), 400

        if not check_password_hash(user.password, password):
            return jsonify({"message": "Invalid credentials"}), 401

    # -------------------------
    # GOOGLE LOGIN
    # -------------------------
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

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "role": user.role.value
    }), 200


# =========================
# PROTECTED PROFILE
# =========================

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "provider": user.authprovider.value,
        "role": user.role.value
    }), 200