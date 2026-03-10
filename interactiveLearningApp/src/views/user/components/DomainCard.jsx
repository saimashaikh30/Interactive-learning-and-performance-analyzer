export default function DomainCard({ domain }) {
  return (
    <div className="min-w-[220px] bg-blue-500 p-6 rounded-xl shadow hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer">
      <h3 className="text-lg font-semibold text-white">{domain.name}</h3>
      <p className="mt-2 text-sm text-white/80">{domain.subjects} Subjects</p>
    </div>
  );
}