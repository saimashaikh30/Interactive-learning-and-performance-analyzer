import React, { useEffect, useMemo, useState } from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify, FiSearch } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdPersonOutline } from "react-icons/md";
import { BsArrowBarUp } from "react-icons/bs";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [darkmode, setDarkmode] = useState(
    document.body.classList.contains("dark")
  );

  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [latestQuestions, setLatestQuestions] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchNavbarData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchText(params.get("search") || "");
  }, [location.pathname, location.search]);

  const fetchNavbarData = async () => {
    try {
      setLoadingUser(true);

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const [profileRes, requestsRes, questionsRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/users/getProfile`, { headers }),
        axios.get(`${BASE_URL}/contributorRequests/getContributorRequests`),
        axios.get(`${BASE_URL}/questions/getQuestions`),
      ]);

      if (profileRes.status === "fulfilled") {
        const fetchedUser = profileRes.value.data?.user || null;
        setUser(fetchedUser);
        if (fetchedUser) {
          localStorage.setItem("user", JSON.stringify(fetchedUser));
        }
      } else {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) setUser(storedUser);
      }

      if (requestsRes.status === "fulfilled") {
        const allRequests = requestsRes.value.data?.requests || [];
        const onlyPending = allRequests.filter((req) => req.status === "pending");
        setPendingRequests(onlyPending);
      } else {
        setPendingRequests([]);
      }

      if (questionsRes.status === "fulfilled") {
        const allQuestions = questionsRes.value.data?.questions || [];
        setLatestQuestions(allQuestions.slice(0, 5));
      } else {
        setLatestQuestions([]);
      }
    } catch (error) {
      console.error("Failed to load navbar data:", error);

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) setUser(storedUser);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("role");
    navigate("/auth/sign-in");
  };

  const displayName = user?.name || "User";

  const notifications = useMemo(() => {
    const contributorNotifications = pendingRequests.map((item) => ({
      id: `request-${item.request_id}`,
      type: "request",
      title: "New Contributor Request",
      subtitle: `${item.user_name || "User"} requested contributor access`,
      time: item.requested_at,
      link: "/admin/contributor-requests",
    }));

    const questionNotifications = latestQuestions.map((item) => ({
      id: `question-${item.question_id}`,
      type: "question",
      title: "New Question Added",
      subtitle: item.question_string || "A new question was added",
      time: item.created_at,
      link: "/admin/questions",
    }));

    return [...contributorNotifications, ...questionNotifications]
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
      .slice(0, 6);
  }, [pendingRequests, latestQuestions]);

  const formatTime = (value) => {
    if (!value) return "";
    try {
      const date = new Date(value);
      return date.toLocaleString();
    } catch {
      return "";
    }
  };

  const getSearchRoute = () => {
    const path = location.pathname;

    if (path.includes("/admin/users")) return "/admin/users";
    if (path.includes("/admin/contributor-requests"))
      return "/admin/contributor-requests";
    if (path.includes("/admin/domains")) return "/admin/domains";
    if (path.includes("/admin/subjects")) return "/admin/subjects";
    if (path.includes("/admin/topics")) return "/admin/topics";
    if (path.includes("/admin/questions")) return "/admin/questions";
    if (path.includes("/admin/companies")) return "/admin/companies";
    if (path.includes("/admin/profile")) return "/admin/profile";

    return path || "/admin";
  };

  const updateSearch = (value) => {
    const targetRoute = getSearchRoute();
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      navigate(targetRoute, { replace: true });
      return;
    }

    navigate(`${targetRoute}?search=${encodeURIComponent(value)}`, {
      replace: true,
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    updateSearch(value);
  };

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            href=" "
          >
            Pages
            <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 dark:text-white">
              /
            </span>
          </a>
          <Link
            className="text-sm font-normal capitalize text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            to="#"
          >
            {brandText}
          </Link>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700 dark:text-white">
          <Link
            to="#"
            className="font-bold capitalize hover:text-navy-700 dark:hover:text-white"
          >
            {brandText}
          </Link>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[365px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2">
        <div className="flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
          <div className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
          </div>

          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
          />
        </div>

        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>

        <Dropdown
          button={
            <p className="relative cursor-pointer">
              <IoMdNotificationsOutline className="h-4 w-4 text-gray-600 dark:text-white" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                  {notifications.length}
                </span>
              )}
            </p>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:w-[460px]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  Notifications
                </p>
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  {notifications.length} New
                </p>
              </div>

              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="flex w-full items-center rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800"
                  >
                    <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-brand-500 py-4 text-2xl text-white">
                      <BsArrowBarUp />
                    </div>
                    <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 py-2 text-sm">
                      <p className="mb-1 text-left text-base font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="line-clamp-2 text-left text-xs text-gray-900 dark:text-white">
                        {item.subtitle}
                      </p>
                      <p className="mt-1 text-left text-[11px] text-gray-500 dark:text-gray-300">
                        {formatTime(item.time)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-navy-800 dark:text-gray-300">
                  No new notifications
                </div>
              )}
            </div>
          }
          classNames={"py-2 top-4 -left-[230px] md:-left-[440px] w-max"}
        />

        <div
          className="cursor-pointer text-gray-600"
          onClick={() => {
            if (darkmode) {
              document.body.classList.remove("dark");
              setDarkmode(false);
            } else {
              document.body.classList.add("dark");
              setDarkmode(true);
            }
          }}
        >
          {darkmode ? (
            <RiSunFill className="h-4 w-4 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="h-4 w-4 text-gray-600 dark:text-white" />
          )}
        </div>

        <Dropdown
          button={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
              <MdPersonOutline className="h-6 w-6" />
            </div>
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hey, {loadingUser ? "..." : displayName}
                  </p>
                </div>
                {user?.email && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                    {user.email}
                  </p>
                )}
              </div>

              <div className="h-px w-full bg-gray-200 dark:bg-white/20" />

              <div className="flex flex-col p-4">
                <Link
                  to="/admin/profile"
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="mt-3 text-left text-sm font-medium text-red-500 transition duration-150 ease-out hover:text-red-500 hover:ease-in"
                >
                  Log Out
                </button>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;