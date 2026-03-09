import React, { useEffect, useState } from "react";
import axios from "axios";
import PieChart from "components/charts/PieChart";
import Card from "components/card";

const PieChartCard = () => {
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const pieChartOptions = {
    labels,
    chart: {
      type: "pie",
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: true,
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return `${value} topics`;
        },
      },
    },
    stroke: {
      colors: ["#fff"],
    },
  };

  useEffect(() => {
    fetchSubjectTopicDistribution();
  }, []);

  const fetchSubjectTopicDistribution = async () => {
    try {
      setLoading(true);

      const [subjectsRes, topicsRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/subjects/getSubjects"),
        axios.get("http://127.0.0.1:5000/topics/getTopics"),
      ]);

      const subjects = subjectsRes.data?.subjects || [];
      const topics = topicsRes.data?.topics || [];

      const distribution = subjects
        .map((subject) => {
          const count = topics.filter(
            (topic) => Number(topic.subject_id) === Number(subject.subject_id)
          ).length;

          return {
            label: subject.subject_name,
            count,
          };
        })
        .filter((item) => item.count > 0);

      const total = distribution.reduce((sum, item) => sum + item.count, 0);

      const sortedSummary = distribution
        .map((item) => ({
          ...item,
          percentage: total ? Math.round((item.count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setLabels(sortedSummary.map((item) => item.label));
      setSeries(sortedSummary.map((item) => item.count));
      setSummary(sortedSummary);
    } catch (error) {
      console.error("Failed to load subject-topic distribution:", error);
      setLabels([]);
      setSeries([]);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const dotColors = [
    "bg-brand-500",
    "bg-[#6AD2FF]",
    "bg-[#4318FF]",
    "bg-[#A3AED0]",
    "bg-[#39B8FF]",
    "bg-[#FFB547]",
  ];

  return (
    <Card extra="rounded-[20px] p-3">
      <div className="flex flex-row justify-center px-3 pt-2">
        <div>
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">
            Topics by Subject
          </h4>
        </div>
      </div>

      <div className="mb-auto flex h-[220px] w-full items-center justify-center">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Loading chart...
          </p>
        ) : series.length > 0 ? (
          <PieChart options={pieChartOptions} series={series} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-300">
            No topic data available
          </p>
        )}
      </div>

      <div className="flex flex-row flex-wrap justify-between gap-4 rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        {summary.length > 0 ? (
          summary.slice(0, 3).map((item, index) => (
            <React.Fragment key={item.label}>
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      dotColors[index % dotColors.length]
                    }`}
                  />
                  <p className="ml-1 text-sm font-normal text-gray-600 dark:text-gray-300">
                    {item.label}
                  </p>
                </div>
                <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
                  {item.count} ({item.percentage}%)
                </p>
              </div>

              {index !== Math.min(summary.slice(0, 3).length - 1, 2) && (
                <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="w-full text-center text-sm text-gray-500 dark:text-gray-300">
            No summary available
          </div>
        )}
      </div>
    </Card>
  );
};

export default PieChartCard;