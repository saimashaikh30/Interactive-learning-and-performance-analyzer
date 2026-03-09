from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
from app import db, mail
from app.models import User,Domain,Subject,Topic ,AuthProviderEnum, UserRoleEnum,Contributor_Request,RequestStatusEnum
import requests
import re
import secrets
import threading

user_bp = Blueprint("user_bp", __name__)

# ================= HELPERS =================
def generate_otp():
    return secrets.randbelow(900000) + 100000

def is_valid_name(name):
    return bool(re.fullmatch(r"[A-Za-z ]+", name))

def is_valid_email(email):
    return bool(re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email))

def is_strong_password(password):
    return bool(re.fullmatch(
        r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        password
    ))

# ================= ASYNC EMAIL =================
def sendEmail(subject, to, body):
    """Send email in a background thread."""
    app = current_app._get_current_object()  # get actual Flask app instance

    def send():
        with app.app_context():
            try:
                recipients = [to] if isinstance(to, str) else to
                msg = Message(subject=subject, recipients=recipients, body=body)
                mail.send(msg)
                print(f"Email sent successfully to {recipients}")
            except Exception as e:
                print(f"Failed to send email: {e}")

    threading.Thread(target=send).start()

# ================= REGISTER =================
@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    provider = data.get("authprovider")
    role_str = data.get("role")

    if not provider:
        return jsonify({"message": "Auth provider is required"}), 400

    if not role_str or role_str not in [r.value for r in UserRoleEnum]:
        return jsonify({"message": f"Invalid role. Must be one of {[r.value for r in UserRoleEnum]}"}), 400

    role = UserRoleEnum(role_str)

    if provider == "local":
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({"message": "Name, email and password are required"}), 400

        if not is_valid_name(name):
            return jsonify({"message": "Name must contain only letters and spaces"}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already registered"}), 400

        if not is_strong_password(password):
            return jsonify({"message": "Password must be at least 8 characters long and include at least one letter, one number, and one special character"}), 400

        hashed_pw = generate_password_hash(password)

        user = User(name=name, email=email, password=hashed_pw, authprovider=AuthProviderEnum.local, role=role)
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))

        # Send welcome email asynchronously
        subject = "Welcome to ILPS!"
        body = f"Hello {user.name},\n\nWelcome! Your account has been created successfully."
        sendEmail(subject, user.email, body)

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

        if not email:
            return jsonify({"message": "Google account email not found"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(name=name, email=email, password=None, authprovider=AuthProviderEnum.google, role=UserRoleEnum.user)
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=user.id)
        return jsonify({"message": "Google registration successful", "access_token": access_token}), 201

    else:
        return jsonify({"message": "Invalid auth provider"}), 400

# ================= SEND OTP =================
@user_bp.route("/sendOtp", methods=["POST"])
def sendOtp():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    email = data.get("email")
    if not email:
        return jsonify({"message": "Email required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "No account found registered with this email"}), 404

    otp = generate_otp()
    current_app.redis_client.setex(f"otp:{email}", 300, otp)

    subject = "Forgot Password OTP"
    body = f"This is your One Time Password (OTP): {otp}"
    sendEmail(subject, user.email, body)

    return jsonify({"message": "OTP sent successfully"}), 200

@user_bp.route("/verifyOtp", methods=["POST"])
def verifyOtp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"message": "Email and OTP required"}), 400

    stored_otp = current_app.redis_client.get(f"otp:{email}")
    if not stored_otp:
        return jsonify({"message": "OTP expired or not found"}), 400

    if str(stored_otp) != str(otp):
        return jsonify({"message": "Invalid OTP"}), 400

    current_app.redis_client.delete(f"otp:{email}")
    return jsonify({"message": "OTP verified"}), 200

# ================= CHANGE PASSWORD =================
@user_bp.route("/changePassword", methods=["PUT"])
def changePassword():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    password = data.get("password")
    email = data.get("email")

    if not password:
        return jsonify({"message": "Password required"}), 400
    if not is_strong_password(password):
        return jsonify({"message": "Password must be at least 8 characters long and include at least one letter, one number, and one special character"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.password = generate_password_hash(password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200

# ================= LOGIN =================
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    provider = data.get("authprovider")
    if not provider:
        return jsonify({"message": "Auth provider required"}), 400

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

    access_token = create_access_token(identity=str(user.id))

    # Send login email asynchronously
    subject = "Login Notification"
    body = f"Hello {user.name},\n\nYou just logged into ILPS successfully!"
    sendEmail(subject, user.email, body)

    return jsonify({"message": "Login successful", "access_token": access_token, "role": user.role.value}), 200

# ================= PROFILE =================
@user_bp.route("/getProfile", methods=["GET"])
@jwt_required()
def getProfile():
    identity = get_jwt_identity()

    user = None

    try:
        user = User.query.filter_by(id=int(identity)).first()
    except (ValueError, TypeError):
        user = User.query.filter_by(email=identity).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "authprovider": user.authprovider.value
        }
    }), 200

@user_bp.route("/dashboardStats", methods=["GET"])
def dashboardStats():
    return jsonify({
        "domains": Domain.query.count(),
        "subjects": Subject.query.count(),
        "topics": Topic.query.count(),
        "users": User.query.count(),
        "pending_requests": Contributor_Request.query.filter_by(
            status=RequestStatusEnum.pending
        ).count()
    }), 200