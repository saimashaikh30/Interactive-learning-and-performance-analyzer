from flask import Blueprint, request, jsonify
from app import db
from app.models import Topic, Subject

topics_bp = Blueprint("topics_bp", __name__)


@topics_bp.route("/addTopic", methods=["POST"])
def addTopic():
    data = request.get_json()

    topic_name = data.get("topic_name")
    subject_id = data.get("subject_id")

    if not topic_name or not subject_id:
        return jsonify({"message": "topic_name and subject_id are required"}), 400

    subject = Subject.query.filter_by(subject_id=subject_id).first()
    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    existing_topic = Topic.query.filter_by(
        topic_name=topic_name,
        subject_id=subject_id
    ).first()

    if existing_topic:
        return jsonify({"message": "Topic already exists in this subject"}), 400

    topic = Topic(
        topic_name=topic_name,
        subject_id=subject_id
    )

    db.session.add(topic)
    db.session.commit()

    return jsonify({
        "message": "Topic successfully added",
        "topic": {
            "topic_id": topic.topic_id,
            "topic_name": topic.topic_name,
            "subject_id": topic.subject_id
        }
    }), 201


@topics_bp.route("/editTopic", methods=["PUT"])
def editTopic():
    data = request.get_json()

    topic_id = data.get("topic_id")
    topic_name = data.get("topic_name")
    subject_id = data.get("subject_id")

    if not topic_id or not topic_name or not subject_id:
        return jsonify({"message": "topic_id, topic_name and subject_id are required"}), 400

    topic = Topic.query.filter_by(topic_id=topic_id).first()
    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    subject = Subject.query.filter_by(subject_id=subject_id).first()
    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    existing_topic = Topic.query.filter(
        Topic.topic_name == topic_name,
        Topic.subject_id == subject_id,
        Topic.topic_id != topic_id
    ).first()

    if existing_topic:
        return jsonify({"message": "Topic already exists in this subject"}), 400

    topic.topic_name = topic_name
    topic.subject_id = subject_id

    db.session.commit()

    return jsonify({
        "message": "Topic successfully updated",
        "topic": {
            "topic_id": topic.topic_id,
            "topic_name": topic.topic_name,
            "subject_id": topic.subject_id
        }
    }), 200


@topics_bp.route("/deleteTopic/<int:topic_id>", methods=["DELETE"])
def deleteTopic(topic_id):
    topic = Topic.query.filter_by(topic_id=topic_id).first()

    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    db.session.delete(topic)
    db.session.commit()

    return jsonify({"message": "Topic deleted successfully"}), 200


@topics_bp.route("/getTopics", methods=["GET"])
def getTopics():
    topics = Topic.query.all()

    serialized_topics = [
        {
            "topic_id": t.topic_id,
            "topic_name": t.topic_name,
            "subject_id": t.subject_id,
            "subject_name": t.subject.subject_name if t.subject else None,
            "subject_code": t.subject.subject_code if t.subject else None,
            "domain_id": t.subject.domain_id if t.subject else None,
            "domain_name": t.subject.domain.domain_name if t.subject and t.subject.domain else None
        }
        for t in topics
    ]

    return jsonify({"topics": serialized_topics}), 200


@topics_bp.route("/getTopic/<int:topic_id>", methods=["GET"])
def getTopic(topic_id):
    topic = Topic.query.filter_by(topic_id=topic_id).first()

    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    return jsonify({
        "topic": {
            "topic_id": topic.topic_id,
            "topic_name": topic.topic_name,
            "subject_id": topic.subject_id,
            "subject_name": topic.subject.subject_name if topic.subject else None,
            "subject_code": topic.subject.subject_code if topic.subject else None,
            "domain_id": topic.subject.domain_id if topic.subject else None,
            "domain_name": topic.subject.domain.domain_name if topic.subject and topic.subject.domain else None
        }
    }), 200


@topics_bp.route("/getTopicsBySubject/<int:subject_id>", methods=["GET"])
def getTopicsBySubject(subject_id):
    subject = Subject.query.filter_by(subject_id=subject_id).first()

    if not subject:
        return jsonify({"message": "Subject not found"}), 404

    topics = Topic.query.filter_by(subject_id=subject_id).all()

    serialized_topics = [
        {
            "topic_id": t.topic_id,
            "topic_name": t.topic_name,
            "subject_id": t.subject_id
        }
        for t in topics
    ]

    return jsonify({
        "subject_id": subject.subject_id,
        "subject_name": subject.subject_name,
        "topics": serialized_topics
    }), 200