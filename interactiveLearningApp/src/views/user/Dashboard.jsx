const courses = [
  { name: "Data Structures & Algorithms", progress: 65, hours: 40 },
  { name: "Operating Systems", progress: 50, hours: 28 },
  { name: "Computer Networks", progress: 35, hours: 18 },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="card-container">
        {courses.map((course, i) => (
          <div key={i} className="card">
            <h3>{course.name}</h3>
            <p>Progress: {course.progress}%</p>
            <p>Study Hours: {course.hours}</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: course.progress + "%" }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="activity">
        <h2>Recent Study Activity</h2>
        <ul>
          <li>Completed Arrays topic</li>
          <li>Learned Process Scheduling</li>
          <li>Studied OSI Model</li>
        </ul>
      </div>
    </div>
  );
}
