import React, { useEffect, useState } from "react";
import MiniCalendar from "components/calendar/MiniCalendar";
import PieChartCard from "views/admin/default/components/PieChartCard";
import Widget from "components/widget/Widget";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  MdPerson,
  MdLayers,
  MdMenuBook,
  MdBarChart,
} from "react-icons/md";

const Dashboard = () => {
  const [stats, setStats] = useState({
    domains: 0,
    subjects: 0,
    topics: 0,
    users: 0,
    pendingRequests: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://127.0.0.1:5000/users/dashboardStats");

      setStats({
        domains: res.data.domains || 0,
        subjects: res.data.subjects || 0,
        topics: res.data.topics || 0,
        users: res.data.users || 0,
        pendingRequests: res.data.pending_requests || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/domains">
          <Widget
            icon={<MdLayers className="h-6 w-6" />}
            title={"Total Domains"}
            subtitle={loading ? "..." : String(stats.domains)}
          />
        </Link>

        <Link to="/admin/subjects">
          <Widget
            icon={<MdMenuBook className="h-6 w-6" />}
            title={"Total Subjects"}
            subtitle={loading ? "..." : String(stats.subjects)}
          />
        </Link>

        <Link to="/admin/topics">
          <Widget
            icon={<MdBarChart className="h-6 w-6" />}
            title={"Total Topics"}
            subtitle={loading ? "..." : String(stats.topics)}
          />
        </Link>

        <Link to="/admin/users">
          <Widget
            icon={<MdPerson className="h-6 w-6" />}
            title={"Total Users"}
            subtitle={loading ? "..." : String(stats.users)}
          />
        </Link>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white px-6 py-3 shadow-sm dark:bg-navy-800">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Pending Contributor Requests
          </p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            {loading ? "Loading..." : `${stats.pendingRequests} awaiting approval`}
          </p>
        </div>

        <Link
          to="/admin/contributor-requests"
          className="text-sm font-medium text-brand-500 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-navy-800 xl:col-span-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-white">
            Pie Chart
          </h3>

          <div className="flex justify-center">
            <div className="w-[350px]">
              <PieChartCard />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-navy-800 xl:col-span-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-white">
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