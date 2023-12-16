import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TiMessages } from "react-icons/ti";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdEventNote } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { CiSearch } from "react-icons/ci";
import { BiMessageRoundedCheck } from "react-icons/bi";
import socketIO from "socket.io-client";
import { useRef } from "react";

const Header = ({ setActivities, setPage, setSearchInput, searchInput }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [openNotification, setOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const notificationIconRef = useRef(null);
  const notificationPopupRef = useRef(null);
  const navigate = useNavigate();

  const toggleNotification = (e) => {
    e.stopPropagation();
    setOpenNotification(!openNotification);
    setHasNewNotification(false);
  };

  const handleSearch = async () => {
    if (searchInput.trim() === "") return;
    if (!setActivities) {
      return navigate("/", { state: { searchInput: searchInput } });
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/activities/search?query=${searchInput}&page=1`
      );

      if (response.ok) {
        const { activities, next_page } = await response.json();
        setActivities(activities);
        setPage(next_page);
      } else {
        console.error("Search request failed");
      }
    } catch (error) {
      console.error("Error while searching:", error);
    }
  };

  useEffect(() => {
    if (user) {
      const socket = socketIO(`${import.meta.env.VITE_SOCKET}`, {
        transports: ["websocket"],
      });

      socket.emit("joinRoom", `user-${user.id}`);

      socket.on("getNotification", (newNotification) => {
        setNotifications((prevNotifications) => [
          newNotification,
          ...prevNotifications,
        ]);
        setHasNewNotification(true);
      });

      return () => {
        socket.off("getNotification");
        socket.disconnect();
      };
    }
  }, [user]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationPopupRef.current &&
        !notificationPopupRef.current.contains(event.target) &&
        !notificationIconRef.current.contains(event.target)
      ) {
        setOpenNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="bg-[#FFFFFF] flex justify-between items-center w-full h-[70px] relative">
        <div className="">
          <div className="flex justify-center items-center ml-4">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Logo"
                className="object-cover w-[200px] h-[70px]"
              />
            </Link>
          </div>
        </div>
        <div className="relative mx-2">
          <input
            id="searchInput"
            type="text"
            className="w-[600px] py-2 px-10 border-2 border-[##979797] rounded-full focus:outline-none"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="輸入關鍵字、地點查詢活動"
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <label
            htmlFor="searchInput"
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
          >
            <CiSearch size={30} onClick={handleSearch} />
          </label>
        </div>

        <div className="h-full flex justify-between items-center mr-10">
          <div className="flex gap-10 justify-center items-center text-[#313538] text-[17px] font-semibold">
            <Link to="/activity">
              <MdEventNote size={30} />
            </Link>

            <Link to="/message">
              <TiMessages size={30} />
            </Link>

            <div className="relative" ref={notificationIconRef}>
              <IoMdNotificationsOutline
                size={30}
                onClick={toggleNotification}
                className="cursor-pointer"
              />
              {hasNewNotification && (
                <div className="absolute bg-red-500 rounded-full w-2.5 h-2.5 top-2 right-2 transform translate-x-1/2 -translate-y-1/2"></div>
              )}
            </div>

            {openNotification && (
              <div
                className="max-w-[35vw] min-w-[30vw] absolute right-[20px] top-[60px] mt-2 bg-white border-2 border-blue-300 shadow-2xl rounded-md w-120 z-10 max-h-[600px] overflow-y-scroll"
                ref={notificationPopupRef}
              >
                <ul className="list-none m-0 p-0">
                  {notifications?.length > 0 ? (
                    notifications?.map((notification) => (
                      <div key={notification.id}>
                        <Link
                          to={`/activity/detail/${notification.activity_id}`}
                        >
                          <li className="border-b last:border-b-0 hover:bg-gray-100 cursor-pointer">
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
                        </Link>
                      </div>
                    ))
                  ) : (
                    <li className="text-center px-4 py-3">沒有通知</li>
                  )}
                </ul>
              </div>
            )}

            <Link to="/user/profile">
              {isAuthenticated ? (
                <img
                  src={`${import.meta.env.VITE_UPLOAD_URL}/${user?.avatar}`}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <CgProfile size={30} />
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="h-6 w-full bg-[#313538]"></div>
    </div>
  );
};

export default Header;
