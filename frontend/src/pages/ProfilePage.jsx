import Header from "../components/layout/Header";
import { useEffect, useState } from "react";
import ActivityCard from "../components/ActivityCard";
import EmptyResult from "../components/layout/EmptyResult";

const ProfilePage = () => {
  const [option, setOption] = useState("attending");
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/activities?option=${option}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setActivities(data.activities);
      });
  }, [option]);

  return (
    <>
      <Header />
      <div className="px-5 py-6 w-full min-h-screen bg-white">
        <div className="w-max-width mx-auto flex gap-10">
          <div>
            <div className="mx-3 space-y-4 rounded-lg bg-gray-100 p-[60px] mt-20 mb-10 text-gray-500">
              <div
                className={`cursor-pointer font-bold ${
                  option === "attending" ? "text-blue-500" : ""
                }`}
                onClick={() => setOption("attending")}
              >
                參加中的活動
              </div>
              <div
                className={`cursor-pointer font-bold ${
                  option === "hosting" ? "text-blue-500" : ""
                }`}
                onClick={() => setOption("hosting")}
              >
                我發佈的活動
              </div>
              <div
                className={`cursor-pointer font-bold ${
                  option === "past" ? "text-blue-500" : ""
                }`}
                onClick={() => setOption("past")}
              >
                過去的活動
              </div>
            </div>
          </div>

          <div className="min-w-[60%]">
            <h2 className="font-bold text-[40px]">我的活動</h2>
            <div>
              {activities?.length > 0 ? (
                activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="mt-[-50px] text-center">
                  <EmptyResult />
                  <p className="text-[20px]">沒有符合的活動</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
