from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import Config
import redis

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Add this line:
    app.config["JWT_SECRET_KEY"] = "super-secret-key"  # replace with a strong random key
    app.config["SECRET_KEY"] = "another-secret-key"   # optional, good practice

    # Enable CORS
    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)

    app.redis_client=redis.Redis(
        host='localhost',
        port=6379,
        db=0,
        decode_responses=True
    )

    from app import models
    from app.controllers.UserController import user_bp

    app.register_blueprint(user_bp, url_prefix="/users")

    return app
