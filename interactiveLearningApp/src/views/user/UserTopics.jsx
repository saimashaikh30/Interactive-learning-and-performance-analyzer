import TopicCard from "./components/TopicCard";

export default function TopicsPage() {

  const topics = [
    { id: 1, name: "Arrays", questions: 25, completed: 10 },
    { id: 2, name: "Linked Lists", questions: 20, completed: 5 },
    { id: 3, name: "Stacks & Queues", questions: 15, completed: 0 },
    { id: 4, name: "Trees", questions: 18, completed: 8 },
    { id: 5, name: "Graphs", questions: 22, completed: 12 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Page title */}
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Topics</h1>

      {/* Topics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
      
    </div>
  );
}