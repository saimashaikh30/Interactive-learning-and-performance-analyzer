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


class DifficultyLevelEnum(enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"



topic_questions = db.Table(
    "topic_questions",
    db.Column(
        "topic_id",
        db.Integer,
        db.ForeignKey("topics.topic_id"),
        primary_key=True
    ),
    db.Column(
        "question_id",
        db.Integer,
        db.ForeignKey("questions.question_id"),
        primary_key=True
    )
)



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


class Subject(db.Model):
    __tablename__ = "subjects"

    subject_id = db.Column(db.Integer, primary_key=True)
    subject_name = db.Column(db.String(100), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
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
    topic_name = db.Column(db.String(100), nullable=False)

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.subject_id"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class Company(db.Model):
    __tablename__ = "companies"

    company_id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), unique=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship("Question", backref="company", lazy=True)



class QuestionType(db.Model):
    __tablename__ = "question_types"

    type_id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String(50), unique=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship("Question", backref="question_type", lazy=True)



class Question(db.Model):
    __tablename__ = "questions"

    question_id = db.Column(db.Integer, primary_key=True)
    question_string = db.Column(db.Text, nullable=False)

    difficulty_level = db.Column(
        db.Enum(DifficultyLevelEnum, name="difficulty_level_enum"),
        nullable=False
    )

    year = db.Column(db.String(4), nullable=False)
    technology = db.Column(db.String(50), nullable=False)
    language = db.Column(db.String(50), nullable=False)

    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.company_id"),
        nullable=False
    )

    type_id = db.Column(
        db.Integer,
        db.ForeignKey("question_types.type_id"),
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Many-to-Many with Topic
    topics = db.relationship(
        "Topic",
        secondary=topic_questions,
        backref=db.backref("questions", lazy="dynamic")
    )

    # One-to-Many with Option
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
        primary_key=True
    )

    option_text = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)