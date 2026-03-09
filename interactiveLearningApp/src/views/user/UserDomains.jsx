import { MdArrowForward } from "react-icons/md";

export default function UserDomains() {

  const domains = [
    { id: 1, name: "Programming", subjects: 12 },
    { id: 2, name: "Core CS", subjects: 8 },
    { id: 3, name: "Aptitude", subjects: 10 },
    { id: 4, name: "Interview Preparation", subjects: 6 }
  ];

  return (
    <div className="bg-gray-100 p-6 rounded-xl min-h-[80vh]">

      <div className="space-y-8">

        {/* PAGE TITLE */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Choose a Domain
          </h1>
          <p className="text-gray-500 text-sm">
            Select a domain to start practicing questions.
          </p>
        </div>

        {/* DOMAIN CARDS */}
        <div className="grid grid-cols-3 gap-6">

          {domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex justify-between items-center cursor-pointer"
            >

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {domain.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {domain.subjects} Subjects
                </p>
              </div>

              <MdArrowForward className="text-gray-400" size={22} />

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}