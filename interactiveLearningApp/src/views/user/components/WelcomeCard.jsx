export default function WelcomeCard() {

  return (
    <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome Back!
        </h2>

        <p className="text-gray-500 mt-2">
          Continue learning and prepare for placements.
        </p>

        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">
          Explore Subjects
        </button>
      </div>

      {/* <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
        className="w-32"
      /> */}

    </div>
  );
}