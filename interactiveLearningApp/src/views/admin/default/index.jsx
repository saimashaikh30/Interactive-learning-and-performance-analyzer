import MiniCalendar from "components/calendar/MiniCalendar";
import PieChartCard from "views/admin/default/components/PieChartCard";
import Widget from "components/widget/Widget";

import {
  MdPerson,
  MdMenuBook,
  MdHelpOutline,
  MdBarChart,
} from "react-icons/md";

const Dashboard = () => {
  return (
    <div className="mt-6 space-y-6">

      {/* ================= TOP STATS ================= */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Widget
          icon={<MdPerson className="h-6 w-6" />}
          title={"Total Users"}
          subtitle={"120"}
        />
        <Widget
          icon={<MdMenuBook className="h-6 w-6" />}
          title={"Total Subjects"}
          subtitle={"3"}
        />
        <Widget
          icon={<MdBarChart className="h-6 w-6" />}
          title={"Total Topics"}
          subtitle={"54"}
        />
        <Widget
          icon={<MdHelpOutline className="h-6 w-6" />}
          title={"Pending Requests"}
          subtitle={"6"}
        />
      </div>

      {/* ================= SLIM PENDING STRIP ================= */}

      <div className="rounded-xl bg-white dark:bg-navy-800 px-6 py-3 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Pending Question Requests
          </p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            6 awaiting approval
          </p>
        </div>

        <button className="text-sm font-medium text-brand-500 hover:underline">
          View All
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

        {/* Pie Chart */}
        <div className="xl:col-span-4 rounded-xl bg-white dark:bg-navy-800 p-4 shadow-sm">

          <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-white">
            Pie Chart
          </h3>

          <div className="flex justify-center">
            <div className="w-[350px]">
              <PieChartCard />
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="xl:col-span-4 rounded-xl bg-white dark:bg-navy-800 p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-white">
            Calendar
          </h3>

          <div className="text-gray-800 dark:text-white">
            <MiniCalendar />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
