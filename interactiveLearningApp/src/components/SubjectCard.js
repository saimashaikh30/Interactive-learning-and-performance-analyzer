function SubjectCard({ title, image }) {
  return (
    <div className="subject-card">
      <img src={image} alt={title} className="card-bg" />
      <div className="card-overlay">
        <h3>{title}</h3>
      </div>
    </div>
  );
}

export default SubjectCard;