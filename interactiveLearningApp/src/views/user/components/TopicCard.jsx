export default function TopicCard({ topic }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 p-6 cursor-pointer flex flex-col justify-between">
      
      {/* Topic title */}
      <h3 className="text-lg font-semibold text-blue-600">{topic.name}</h3>

      {/* Number of questions */}
      <p className="mt-2 text-sm text-gray-500">{topic.questions} Questions</p>
      
    </div>
  );
}