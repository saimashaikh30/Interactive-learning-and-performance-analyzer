import { FaBell } from "react-icons/fa";
import { MdPersonOutline } from "react-icons/md";
import Dropdown from "components/dropdown";

export default function UserNavbar() {

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-sm">

      
      <input
        type="text"
        placeholder="Search questions..."
        className="border rounded-lg px-4 py-2 w-96"
      />

      <div className="flex items-center gap-6">

        <FaBell className="text-gray-500 cursor-pointer" />
        <Dropdown
          button={
            <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
                    <MdPersonOutline className="h-6 w-6" />
                </div>
                <span className="font-medium">User</span>
            </div>
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hey
                  </p>{" "}
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="flex flex-col p-4">
                <a
                  href=" "
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </a>
                
                <a
                  href="/auth/sign-in"
                  className="mt-3 text-sm font-medium text-red-500 hover:text-red-500 transition duration-150 ease-out hover:ease-in"
                >
                  Log Out
                </a>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
      </div>

    </div>
  );
}