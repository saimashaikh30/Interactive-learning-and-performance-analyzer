import Widget from "../../components/widget/Widget";
import MiniCalendar from "../../components/calendar/MiniCalendar";

import {
  MdMenuBook,
  MdFavorite,
  MdHelpOutline,
  MdTrendingUp,
} from "react-icons/md";

const Dashboard = () => {
  return (
    <div className="mt-6 space-y-6">

      {/* ================= USER STATS ================= */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Widget
          icon={<MdMenuBook className="h-6 w-6" />}
          title={"Subjects Available"}
          subtitle={"3"}
        />

        <Widget
          icon={<MdHelpOutline className="h-6 w-6" />}
          title={"Questions Practiced"}
          subtitle={"24"}
        />

        <Widget
          icon={<MdFavorite className="h-6 w-6" />}
          title={"Favorite Questions"}
          subtitle={"8"}
        />

        <Widget
          icon={<MdTrendingUp className="h-6 w-6" />}
          title={"Progress"}
          subtitle={"65%"}
        />
      </div>

      {/* ================= SUBJECT SECTION ================= */}
      <div className="rounded-xl bg-white dark:bg-navy-800 px-6 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Quick Access Subjects
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["DSA", "CN", "OS"].map((subject, index) => (
            <div
              key={index}
              className="rounded-lg bg-lightPrimary dark:bg-navy-700 p-4 cursor-pointer hover:shadow-md transition"
            >
              <h4 className="font-medium text-navy-700 dark:text-white">
                {subject}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Click to explore questions
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="rounded-xl bg-white dark:bg-navy-800 p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-white">
          Study Calendar
        </h3>
        <MiniCalendar />
      </div>

    </div>
  );
};

export default Dashboard;
