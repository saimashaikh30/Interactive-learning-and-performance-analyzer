import DomainCard from "./components/DomainCard";
import SubjectCard from "./components/SubjectCard";
import QuestionCard from "./components/QuestionCard";

export default function UserDashboard() {

  const domains = [
    { id: 1, name: "Programming", subjects: 6 },
    { id: 2, name: "Computer Science", subjects: 5 },
    { id: 3, name: "Aptitude", subjects: 4 },
    { id: 4, name: "AI/ML", subjects: 3 },
  ];

  const subjects = [
    { id: 1, name: "Data Structures", questions: 120 },
    { id: 2, name: "Operating Systems", questions: 80 },
    { id: 3, name: "DBMS", questions: 95 },
  ];

  const newQuestions = [
    { id: 1, title: "Arrays Practice", subject: "Data Structures", questions: 25 },
    { id: 2, title: "Process Scheduling", subject: "Operating Systems", questions: 18 },
    { id: 3, title: "SQL Queries", subject: "DBMS", questions: 20 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-12">

        {/* DOMAINS */}
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Domains</h2>
          <div className="flex gap-6 overflow-x-auto py-2">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        </div>

        {/* SUBJECTS */}
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <SubjectCard key={sub.id} subject={sub} />
            ))}
          </div>
        </div>

        {/* NEW QUESTIONS */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-600">New Questions</h2>
            <span className="text-sm text-blue-500 cursor-pointer hover:underline">See All</span>
          </div>

          <div className="flex flex-col gap-4">
            {newQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}