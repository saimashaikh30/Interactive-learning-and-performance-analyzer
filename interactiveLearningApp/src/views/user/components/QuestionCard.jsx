import { MdArrowForward } from "react-icons/md";

export default function QuestionCard({ question }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg flex justify-between items-center transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">

      <div>
        <p className="text-xs text-blue-400 uppercase">{question.subject}</p>
        <h3 className="text-lg font-semibold text-gray-800 mt-1">{question.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{question.questions} Questions</p>
      </div>

      <MdArrowForward className="text-blue-400" size={22} />

    </div>
  );
}