export default function ProfilePanel() {

  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">

      <img
        src="https://i.pravatar.cc/100"
        className="rounded-full mx-auto mb-4"
      />

      <h3 className="text-lg font-semibold">
        User Name
      </h3>

      <p className="text-gray-500 text-sm">
        Student
      </p>

      <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">
        Profile
      </button>

    </div>
  );
}