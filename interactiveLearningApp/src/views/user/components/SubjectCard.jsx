export default function SubjectCard({ subject }) {

  return (
    <div className="p-6 rounded-xl text-white shadow hover:scale-105 transition bg-gradient-to-r from-indigo-500 to-purple-500">

      <h3 className="text-lg font-semibold">
        {subject.name}
      </h3>

      <p className="mt-2 text-sm opacity-80">
        {subject.questions} Topics
      </p>

    </div>
  );
}