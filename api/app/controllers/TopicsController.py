from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Topic, Subject, Topic_Questions

topics_bp = Blueprint("topics_bp", __name__)

MAX_TOPIC_NAME_LENGTH = 100


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def is_valid_topic_name(topic_name: str) -> bool:
    return not topic_name.isdigit()


def serialize_topic(topic):
    return {
        "topic_id": topic.topic_id,
        "topic_name": topic.topic_name,
        "subject_id": topic.subject_id,
        "subject_name": topic.subject.subject_name if topic.subject else None,
        "subject_code": topic.subject.subject_code if topic.subject else None,
        "domain_id": topic.subject.domain_id if topic.subject else None,
        "domain_name": topic.subject.domain.domain_name if topic.subject and topic.subject.domain else None
    }


@topics_bp.route("/addTopic", methods=["POST"])
def addTopic():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    topic_name = data.get("topic_name")
    subject_id = data.get("subject_id")

    if topic_name is None:
        return jsonify({"message": "topic_name is required"}), 400

    if subject_id is None:
        return jsonify({"message": "subject_id is required"}), 400

    if not isinstance(topic_name, str):
        return jsonify({"message": "topic_name must be a string"}), 400

    topic_name = normalize_text(topic_name)

    if not topic_name:
        return jsonify({"message": "topic_name cannot be empty"}), 400

    if not is_valid_topic_name(topic_name):
        return jsonify({"message": "topic_name cannot contain only digits"}), 400

    if len(topic_name) > MAX_TOPIC_NAME_LENGTH:
        return jsonify({
            "message": f"topic_name cannot exceed {MAX_TOPIC_NAME_LENGTH} characters"
        }), 400

    subject = Subject.query.filter_by(subject_id=subject_id).first()
    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    existing_topic = Topic.query.filter(
        func.lower(Topic.topic_name) == topic_name.lower(),
        Topic.subject_id == subject_id
    ).first()

    if existing_topic:
        return jsonify({"message": "Topic already exists in this subject"}), 409

    try:
        topic = Topic(
            topic_name=topic_name,
            subject_id=subject_id
        )

        db.session.add(topic)
        db.session.commit()

        return jsonify({
            "message": "Topic successfully added",
            "topic": serialize_topic(topic)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to add topic due to duplicate data"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to add topic"}), 500


@topics_bp.route("/editTopic", methods=["PUT"])
def editTopic():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    topic_id = data.get("topic_id")
    topic_name = data.get("topic_name")
    subject_id = data.get("subject_id")

    if topic_id is None:
        return jsonify({"message": "topic_id is required"}), 400

    if topic_name is None:
        return jsonify({"message": "topic_name is required"}), 400

    if subject_id is None:
        return jsonify({"message": "subject_id is required"}), 400

    if not isinstance(topic_name, str):
        return jsonify({"message": "topic_name must be a string"}), 400

    topic_name = normalize_text(topic_name)

    if not topic_name:
        return jsonify({"message": "topic_name cannot be empty"}), 400

    if not is_valid_topic_name(topic_name):
        return jsonify({"message": "topic_name cannot contain only digits"}), 400

    if len(topic_name) > MAX_TOPIC_NAME_LENGTH:
        return jsonify({
            "message": f"topic_name cannot exceed {MAX_TOPIC_NAME_LENGTH} characters"
        }), 400

    topic = Topic.query.filter_by(topic_id=topic_id).first()
    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    subject = Subject.query.filter_by(subject_id=subject_id).first()
    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    existing_topic = Topic.query.filter(
        func.lower(Topic.topic_name) == topic_name.lower(),
        Topic.subject_id == subject_id,
        Topic.topic_id != topic_id
    ).first()

    if existing_topic:
        return jsonify({"message": "Topic already exists in this subject"}), 409

    try:
        topic.topic_name = topic_name
        topic.subject_id = subject_id

        db.session.commit()

        return jsonify({
            "message": "Topic successfully updated",
            "topic": serialize_topic(topic)
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to update topic due to duplicate data"}), 409

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to update topic"}), 500


@topics_bp.route("/deleteTopic/<int:topic_id>", methods=["DELETE"])
def deleteTopic(topic_id):
    topic = Topic.query.filter_by(topic_id=topic_id).first()

    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    linked_questions = Topic_Questions.query.filter_by(topic_id=topic_id).count()
    if linked_questions > 0:
        return jsonify({
            "message": "Cannot delete topic. It is linked to existing questions."
        }), 409

    try:
        db.session.delete(topic)
        db.session.commit()

        return jsonify({"message": "Topic deleted successfully"}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Failed to delete topic"}), 500


@topics_bp.route("/getTopics", methods=["GET"])
def getTopics():
    topics = Topic.query.order_by(Topic.topic_name.asc()).all()

    return jsonify({
        "topics": [serialize_topic(t) for t in topics]
    }), 200


@topics_bp.route("/getTopic/<int:topic_id>", methods=["GET"])
def getTopic(topic_id):
    topic = Topic.query.filter_by(topic_id=topic_id).first()

    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    return jsonify({
        "topic": serialize_topic(topic)
    }), 200


@topics_bp.route("/getTopicsBySubject/<int:subject_id>", methods=["GET"])
def getTopicsBySubject(subject_id):
    subject = Subject.query.filter_by(subject_id=subject_id).first()

    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    topics = Topic.query.filter_by(subject_id=subject_id).order_by(Topic.topic_name.asc()).all()

    return jsonify({
        "subject_id": subject.subject_id,
        "subject_name": subject.subject_name,
        "subject_code": subject.subject_code,
        "topics": [
            {
                "topic_id": t.topic_id,
                "topic_name": t.topic_name,
                "subject_id": t.subject_id
            }
            for t in topics
        ]
    }), 200