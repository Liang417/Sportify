import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { toast } from "react-toastify";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const CreateActivityPage = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [libraries] = useState(["places"]);
  const [center, setCenter] = useState({ lat: 25.03746, lng: 121.564558 });
  const autocompleteInputRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
    language: "zh-TW",
  });

  useEffect(() => {
    getActivityTypes().then(setActivityTypes);
    getTags().then(setTagOptions);
  }, []);

  useEffect(() => {
    if (isLoaded && autocompleteInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        { componentRestrictions: { country: "TW" } }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = place.geometry.location;
          setCenter({
            lat: location.lat(),
            lng: location.lng(),
          });
        }
      });
    }
  }, [isLoaded]);

  const getActivityTypes = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/activity/types`
    );
    const data = await response.json();
    return data;
  };

  const getTags = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/tags`);
    const { tags } = await response.json();
    return tags;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !document.getElementById("latitude").value ||
      !document.getElementById("longitude").value
    )
      return toast.error("Please choice location on the map.");

    const formData = new FormData(event.target);
    formData.append("tags", JSON.stringify(tags));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/activity`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Activity created successfully");
      } else {
        toast.error("Error creating activity");
      }
    } catch (error) {
      toast.error("Error submitting form", error);
    }
  };

  return (
    <div className="bg-gray-100 p-8">
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md flex flex-col item-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">建立活動</h2>

        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-600"
          >
            標題:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-600"
          >
            類型:
          </label>
          <select
            id="type"
            name="typeId"
            className="mt-1 p-2 w-full border rounded-md"
            required
          >
            <option value="" className="bg-gray-100">
              選擇活動種類
            </option>
            {activityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="search_location"
            className="block text-sm font-medium text-gray-600"
          >
            地點:
          </label>
          <input
            id="search_location"
            ref={autocompleteInputRef}
            type="text"
            name="locationName"
            placeholder="Enter a location"
            className="mt-1 p-2 w-full border rounded-md mb-4"
            autoComplete="off"
            required
          />
          {isLoaded ? (
            <GoogleMap
              key={center}
              mapContainerStyle={{
                width: "100%",
                height: "350px",
              }}
              center={center}
              zoom={17}
            >
              <Marker position={center} />
            </GoogleMap>
          ) : (
            <></>
          )}

          <input
            type="hidden"
            id="latitude"
            name="latitude"
            value={center.lat}
          />
          <input
            type="hidden"
            id="longitude"
            name="longitude"
            value={center.lng}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-600"
          >
            費用:
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="attendeesLimit"
            className="block text-sm font-medium text-gray-600"
          >
            參加人數限制:
          </label>
          <input
            type="number"
            id="attendeesLimit"
            name="attendeesLimit"
            required
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="startFrom"
            className="block text-sm font-medium text-gray-600"
          >
            活動開始時間:
          </label>
          <input
            type="datetime-local"
            id="startFrom"
            name="startFrom"
            required
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="endAt"
            className="block text-sm font-medium text-gray-600"
          >
            活動結束時間:
          </label>
          <input
            type="datetime-local"
            id="endAt"
            name="endAt"
            required
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="dateline"
            className="block text-sm font-medium text-gray-600"
          >
            報名截止日:
          </label>
          <input
            type="datetime-local"
            id="dateline"
            name="dateline"
            required
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-600"
          >
            活動說明:
          </label>
          <textarea
            id="description"
            name="description"
            cols="50"
            rows="10"
            required
            className="mt-1 p-2 w-full border rounded-md"
          ></textarea>
        </div>

        <div className="mb-4">
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-600"
          >
            標籤 (最多 5 個):
          </label>
          <Autocomplete
            multiple
            id="tags"
            options={tagOptions.map((option) => option.name)}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} variant="outlined" placeholder="Tags" />
            )}
            value={tags}
            onChange={(event, newValue) => {
              setTags(newValue);
            }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            上傳圖片:
          </label>
          <input
            type="file"
            id="picture"
            name="picture"
            accept="image/*"
            className="mt-1 p-2 w-full border rounded-md"
            required
          />
        </div>

        <input
          type="submit"
          value="Create Activity"
          className="mt-4 bg-blue-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-500"
        />
      </form>
    </div>
  );
};

export default CreateActivityPage;
