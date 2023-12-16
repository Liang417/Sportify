import { Link } from "react-router-dom";

const ActivityCard = ({ activity }) => {
  const formatDate = (dateString) => {
    const options = {
      timeZone: "UTC",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white border-gray-300 border p-6 my-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link to={`/activity/detail/${activity.id}`} className="block">
        <div className="flex items-center relative">
          <div className="flex-shrink-0 mr-4">
            <img
              src={`${import.meta.env.VITE_UPLOAD_URL}/${activity.picture}`}
              alt={activity.title}
              className="w-[200px] h-[150px] object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 pl-4">
            <div className="font-semibold text-[#715025] uppercase tracking-wide">
              {formatDate(activity.start_from)}
            </div>
            <div className="text-xl font-bold text-gray-900 mt-2">
              {activity.title}
            </div>
            <div className="text-gray-500 mt-3 font-semibold">
              {activity.location_name}
            </div>
            <div className="text-sm text-gray-500 my-2 font-medium">
              {activity.current_attendees_count} 位參加者
            </div>
            <div className="mt-2">
              {activity.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 mr-2 bg-green-700 rounded-full text-white text-sm font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ActivityCard;
