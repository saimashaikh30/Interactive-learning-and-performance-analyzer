import SubjectCard from "./components/SubjectCard";

export default function UserSubjects() {

  const subjects = [
    { id: 1, name: "Data Structures", questions: 120 },
    { id: 2, name: "Algorithms", questions: 90 },
    { id: 3, name: "Operating Systems", questions: 80 },
    { id: 4, name: "DBMS", questions: 95 },
    { id: 5, name: "Computer Networks", questions: 70 },
    { id: 6, name: "OOP", questions: 65 }
  ];

  return (
    <div className="bg-gray-100 p-6 rounded-xl min-h-[80vh]">

      <div className="space-y-8">

        {/* PAGE TITLE */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Subjects
          </h1>
          <p className="text-gray-500 text-sm">
            Choose a subject to start practicing questions.
          </p>
        </div>

        {/* SUBJECT CARDS */}
        <div className="grid grid-cols-3 gap-6">

          {subjects.map((sub) => (
            <SubjectCard key={sub.id} subject={sub} />
          ))}

        </div>

      </div>

    </div>
  );
}