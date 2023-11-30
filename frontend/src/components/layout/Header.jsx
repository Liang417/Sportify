import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { TiMessages } from "react-icons/ti";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdEventNote } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { CiSearch } from "react-icons/ci";
import { BiMessageRoundedCheck } from "react-icons/bi";

const Header = () => {
  const [openNotification, setOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/notification`,
          {
            credentials: "include",
          }
        );
        const { notifications } = await response.json();
        setNotifications(notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);
  return (
    <div>
      <div className="bg-[#FFFFFF] flex justify-between items-center w-full h-[70px] relative">
        <div className="flex justify-center items-center">
          <div className="w-[430px] ml-6">
            <Link to="/">
              <img src="../images/logo.png" alt="Logo" className="h-[40px]" />
            </Link>
          </div>
          <div className="relative mx-2">
            <input
              id="searchInput"
              type="text"
              className="w-[600px] py-2 px-10 border-2 border-[##979797] rounded-full focus:outline-none text-[#8B572A]"
            />
            <label
              htmlFor="searchInput"
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            >
              <CiSearch size={30} />
            </label>
          </div>
        </div>

        <div className="h-full flex justify-between items-center mr-10">
          <div className="flex gap-10 justify-center items-end text-[#313538] text-[17px] font-semibold">
            <Link to="/activity">
              <MdEventNote size={30} />
            </Link>

            <Link to="/message">
              <TiMessages size={30} />
            </Link>

            <IoMdNotificationsOutline
              size={30}
              onClick={() => setOpenNotification(!openNotification)}
              className="cursor-pointer"
            />

            {openNotification && (
              <div className="absolute right-[20px] top-[60px] mt-2 bg-white border-2 border-blue-300 shadow-2xl rounded-md w-120 z-10 max-h-[600px] overflow-y-scroll">
                <ul className="list-none m-0 p-0">
                  {notifications?.length > 0 ? (
                    notifications?.map((notification) => (
                      <li
                        key={notification.id}
                        className="border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center px-6 py-4">
                          <div className="mr-3">
                            <BiMessageRoundedCheck
                              className="text-green-500"
                              size={24}
                            />
                          </div>
                          <div className="leading-8">
                            <p className="font-medium text-gray-900">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center px-4 py-3">No notifications</li>
                  )}
                </ul>
              </div>
            )}

            <Link to="/user/profile">
              <CgProfile size={30} />
            </Link>
          </div>
        </div>
      </div>

      <div className="h-6 w-full bg-[#313538]"></div>
    </div>
  );
};

export default Header;
