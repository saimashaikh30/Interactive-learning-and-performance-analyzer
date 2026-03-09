import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import routes from "routes.js";
import logo from "assets/img/landing/ilps3.png";
import { HiArrowLeft } from "react-icons/hi";
import {
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlineDeviceMobile,
} from "react-icons/hi";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Hide right card on forgot password
  const hideRightCard = location.pathname.includes("forgot-password");

  const getRoutes = (routes) =>
    routes.map((prop, key) =>
      prop.layout === "/auth" ? (
        <Route path={`/${prop.path}`} element={prop.component} key={key} />
      ) : null
    );

  return (
    <div
      className="
        relative h-screen w-full
        bg-gradient-to-br
        from-[#5f8cff]
        via-[#7b8cff]
        to-[#9ad7f5]
        overflow-y-auto
        px-4 py-8
      "
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/", { replace: true })}
        className="
          absolute top-6 left-6
          flex items-center gap-2
          text-white text-sm font-medium
          opacity-90 hover:opacity-100
        "
      >
        <HiArrowLeft className="text-lg" />
        Back
      </button>

      {/* Center wrapper */}
      <div className="min-h-full flex items-center justify-center">
        <div
          className={`w-full max-w-6xl flex items-stretch max-h-[90vh]
            ${hideRightCard ? "justify-center" : ""}
          `}
        >
          {/* ================= LEFT: AUTH CARD ================= */}
          <div
            className={`bg-white shadow-xl px-8 py-9 md:px-10 overflow-y-auto
              ${
                hideRightCard
                  ? "w-full max-w-md rounded-2xl"
                  : "w-full md:w-1/2 rounded-l-2xl"
              }
            `}
          >
            <div className="mb-6">
              <img src={logo} alt="Logo" className="h-20 object-contain" />
            </div>

            <Routes>
              {getRoutes(routes)}
              <Route
                path="/"
                element={<Navigate to="/auth/sign-up" replace />}
              />
            </Routes>
          </div>

          {/* ================= DIVIDER ================= */}
          {!hideRightCard && (
            <div className="hidden md:flex items-center">
              <div className="h-[85%] w-[1px] bg-gray-200" />
            </div>
          )}

          {/* ================= RIGHT: ABOUT CARD ================= */}
          {!hideRightCard && (
            <div className="hidden md:flex w-1/2 bg-gray-50 rounded-r-2xl shadow-xl px-10 py-12 flex-col justify-between overflow-y-auto">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 leading-snug">
                  <span className="text-blue-600">Interactive Learning </span>
                   & Performance System{" "}
                </h2>

                <p className="mt-4 text-gray-600 leading-relaxed">
                  A structured learning platform designed to help users prepare
                  for placements through organized content and guided practice.
                </p>

                <div className="mt-6 rounded-xl border bg-white px-5 py-4 shadow-sm">
                  <p className="font-medium text-gray-800">
                    Placement-focused learning across web and mobile platforms.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-10">
                <Feature
                  icon={<HiOutlineBookOpen />}
                  title="Structured Learning"
                  desc="Topics organized by difficulty level."
                />
                <Feature
                  icon={<HiOutlineClipboardList />}
                  title="Practice Questions"
                  desc="MCQs, blanks, and coding problems."
                />
                <Feature
                  icon={<HiOutlineOfficeBuilding />}
                  title="Company Questions"
                  desc="Interview questions by frequency."
                />
                <Feature
                  icon={<HiOutlineDeviceMobile />}
                  title="Any Device"
                  desc="Accessible on web & mobile."
                />
              </div>

              <p className="mt-10 text-sm text-gray-400">
                © {new Date().getFullYear()} Interactive Learning System
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= FEATURE CARD ================= */
function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-xl bg-white p-5 border shadow-sm">
      <div className="mb-3 h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
        {icon}
      </div>
      <p className="font-medium text-gray-800 text-sm">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{desc}</p>
    </div>
  );
}