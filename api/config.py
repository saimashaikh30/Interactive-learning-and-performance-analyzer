import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS=False

    JWT_SECRET_KEY = "super-secret-key"  # ✅ this is required
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    SECRET_KEY = "another-secret-key" 
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")  # your email
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")  # App password
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_USERNAME")