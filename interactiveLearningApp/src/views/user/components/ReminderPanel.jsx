export default function ReminderPanel() {

  const reminders = [
    { title: "DSA Practice", date: "Today" },
    { title: "OS Revision", date: "Tomorrow" },
    { title: "DBMS Questions", date: "Friday" }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h3 className="font-semibold mb-4">
        Reminders
      </h3>

      <div className="space-y-3">

        {reminders.map((r, index) => (
          <div key={index} className="flex justify-between text-sm">

            <span>{r.title}</span>
            <span className="text-gray-400">{r.date}</span>

          </div>
        ))}

      </div>

    </div>
  );
}