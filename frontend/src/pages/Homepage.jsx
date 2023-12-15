import Header from "../components/layout/Header";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import ActivityCard from "../components/ActivityCard";
import { toast } from "react-toastify";
import NotFound from "../components/layout/NotFound";
import Loader from "../components/layout/Loader";
import moment from "moment";
import { useLocation } from "react-router-dom";

const Homepage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD HH:mm:ss")
  );
  const [selectedDistance, setSelectedDistance] = useState("");
  const [selectPrice, setSelectPrice] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({
    lat: "",
    lng: "",
  });
  const location = useLocation();

  useEffect(() => {
    const searchInput = location.state?.searchInput;

    const fetchActivities = async () => {
      let queryParams = new URLSearchParams({
        typeId: selectedType,
        date: selectedDate,
        distance: selectedDistance,
        price: selectPrice,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      }).toString();

      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/activities?${queryParams}`,
          {
            credentials: "include",
          }
        )
          .then((response) => response.json())
          .then((data) => {
            setActivities(data);
          });
      } catch (error) {
        console.error("Fetching activities failed: ", error);
      }
    };

    const searchActivities = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/activities/search?query=${searchInput}`
        );

        if (response.ok) {
          const result = await response.json();
          setActivities(result);
        } else {
          console.error("Search request failed");
        }
      } catch (error) {
        console.error("Error while searching:", error);
      }
    };

    if (searchInput) {
      searchActivities();
      location.state.searchInput = null;
    } else {
      fetchActivities();
    }
  }, [
    selectedType,
    selectedDate,
    selectedDistance,
    selectPrice,
    currentLocation,
    location,
  ]);

  useEffect(() => {
    const getActivityTypes = async () => {
      fetch(`${import.meta.env.VITE_API_URL}/activity/types`)
        .then((response) => response.json())
        .then((data) => {
          setActivityTypes(data);
        });
    };
    getActivityTypes();
  }, []);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          maximumAge: 600000,
        });
      }
    });
  };

  const handleDistanceChange = async (value) => {
    setLoading(true);
    try {
      const position = await getUserLocation();
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setSelectedDistance(value);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("請允許瀏覽器存取您的當前位置.");
    }
  };

  const resetFilters = () => {
    setSelectedType("");
    setSelectedDate("");
    setSelectedDistance("");
    setSelectPrice("");
  };

  return (
    <div>
      <div>
        <Header setActivities={setActivities} />
      </div>
      <div className="px-5 py-6 w-full bg-white">
        <div className="w-max-width flex gap-10 mx-auto mt-10">
          <div>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateCalendar
                className="border border-gray-300 font-bold rounded-md"
                disablePast
                defaultValue={moment()}
                value={moment()}
                onChange={(newValue) => {
                  const formattedDate = newValue.format("YYYY-MM-DD HH:mm:ss");
                  setSelectedDate(formattedDate);
                }}
              />
            </LocalizationProvider>
          </div>

          <div className="w-[70%]">
            <div className="filter w-full h-min flex items-center justify-evenly mb-5">
              <div>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="type" className="!font-semibold">
                    類型
                  </InputLabel>
                  <Select
                    labelId="type"
                    id="type-select"
                    value={selectedType}
                    label="Type"
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                    }}
                    className="!rounded-full bg-gray-100 !font-semibold"
                  >
                    {activityTypes &&
                      activityTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>

              <div>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="distance" className="!font-semibold">
                    距離
                  </InputLabel>
                  <Select
                    labelId="distance"
                    id="distance-select"
                    value={selectedDistance}
                    label="Distance"
                    onChange={(e) => handleDistanceChange(e.target.value)}
                    className="!rounded-full bg-gray-100 !font-semibold"
                  >
                    <MenuItem value={2000}>2公里</MenuItem>
                    <MenuItem value={5000}>5公里</MenuItem>
                    <MenuItem value={10000}>10公里</MenuItem>
                    <MenuItem value={20000}>20公里</MenuItem>
                    <MenuItem value={50000}>50公里</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="price" className="!font-semibold">
                    費用
                  </InputLabel>
                  <Select
                    labelId="price"
                    id="price-select"
                    value={selectPrice}
                    label="Price"
                    onChange={(e) => {
                      setSelectPrice(e.target.value);
                    }}
                    className="!rounded-full bg-gray-100 !font-semibold"
                  >
                    <MenuItem value={0}>Free</MenuItem>
                    <MenuItem value={100}>100以下</MenuItem>
                    <MenuItem value={200}>200以下</MenuItem>
                    <MenuItem value={500}>500以下</MenuItem>
                    <MenuItem value={1000}>1000以下</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border bg-gray-200 text-gray-500 font-semibold rounded-full hover:bg-gray-300 "
                >
                  重設條件
                </button>
              </div>
            </div>

            <div>
              {loading ? (
                <Loader />
              ) : activities?.length > 0 ? (
                activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center">
                  <NotFound />
                  <p className="text-[26px] mt-2">沒有符合的活動</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
