import enum
from datetime import datetime
from app import db


class AuthProviderEnum(enum.Enum):
    local = "local"
    google = "google"


class UserRoleEnum(enum.Enum):
    admin = "admin"
    superadmin = "superadmin"
    user = "user"
    contributor = "contributor"


class DifficultyLevelEnum(enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class RequestStatusEnum(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    revoked = "revoked"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=True)

    role = db.Column(
        db.Enum(UserRoleEnum, name="user_role_enum"),
        nullable=False
    )

    authprovider = db.Column(
        db.Enum(AuthProviderEnum, name="auth_provider_enum"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

class Domain(db.Model):
    __tablename__="domains"

    domain_id=db.Column(db.Integer,primary_key=True)
    domain_name=db.Column(db.String(20),nullable=False)

    subjects=db.relationship(
        "Subject",
        backref="domain",
        cascade="all,delete-orphan",
        lazy=True
    )

class Subject(db.Model):
    __tablename__ = "subjects"

    subject_id = db.Column(db.Integer, primary_key=True)
    subject_code=db.Column(db.String(6),nullable=False,unique=True)
    subject_name = db.Column(db.String(20), nullable=False)
    domain_id=db.Column(
        db.Integer,
        db.ForeignKey("domains.domain_id"),
        nullable=False
    )

    topics = db.relationship(
        "Topic",
        backref="subject",
        cascade="all, delete-orphan",
        lazy=True
    )


class Topic(db.Model):
    __tablename__ = "topics"

    topic_id = db.Column(db.Integer, primary_key=True)
    topic_name = db.Column(db.String(20), nullable=False)

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.subject_id"),
        nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint("topic_name", "subject_id"),
    )


class Company(db.Model):
    __tablename__ = "companies"

    company_id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(30), unique=True, nullable=False)


class QuestionType(db.Model):
    __tablename__ = "question_types"

    type_id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String(20), unique=True, nullable=False)


class Topic_Questions(db.Model):
    __tablename__ = "topic_questions"

    topic_id = db.Column(
        db.Integer,
        db.ForeignKey("topics.topic_id"),
        primary_key=True
    )

    question_id = db.Column(
        db.Integer,
        db.ForeignKey("questions.question_id"),
        primary_key=True
    )


class Question(db.Model):
    __tablename__ = "questions"

    question_id = db.Column(db.Integer, primary_key=True)
    question_string = db.Column(db.Text, nullable=False)

    difficulty_level = db.Column(
        db.Enum(DifficultyLevelEnum, name="difficulty_level_enum"),
        nullable=False
    )

    year = db.Column(db.String(4), nullable=True)
    technology = db.Column(db.String(20), nullable=True)
    language = db.Column(db.String(10), nullable=True)

    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.company_id"),
        nullable=True
    )

    type_id = db.Column(
        db.Integer,
        db.ForeignKey("question_types.type_id"),
        nullable=False
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    creator = db.relationship(
        "User",
        backref="created_questions",
        foreign_keys=[created_by]
    )

    topics = db.relationship(
        "Topic",
        secondary="topic_questions",
        backref=db.backref("questions", lazy="dynamic")
    )

    options = db.relationship(
        "Option",
        backref="question",
        cascade="all, delete-orphan",
        lazy=True
    )


class Option(db.Model):
    __tablename__ = "options"

    option_id = db.Column(db.Integer, primary_key=True)

    question_id = db.Column(
        db.Integer,
        db.ForeignKey("questions.question_id"),
        nullable=False
    )

    option_text = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)


class Contributor_Request(db.Model):
    __tablename__ = "contributor_request"

    request_id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    status = db.Column(
        db.Enum(RequestStatusEnum, name="request_status_enum"),
        nullable=False
    )

    requested_at = db.Column(db.DateTime, default=datetime.utcnow)

    reviewed_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    reviewed_at = db.Column(db.DateTime, nullable=True)
    remarks = db.Column(db.String(200), nullable=True)

    user = db.relationship(
        "User",
        foreign_keys=[user_id]
    )

    reviewer = db.relationship(
        "User",
        foreign_keys=[reviewed_by]
    )