/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { toast } from "react-toastify";

const CreateActivityPage = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    window.initMap = initMap;

    if (!window.google) {
      loadGoogleMaps();
    }

    getActivityTypes().then(setActivityTypes);
    getTags().then(setTagOptions);
    return () => {
      window.initMap = undefined;
    };
  }, []);

  const loadGoogleMaps = () => {
    const existingScript = document.querySelector('script[src*="googleapis"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCtl2-WkzFdv8HKXFChDCJDspBqLDxgKcc&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  };

  const initMap = () => {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 25.030724, lng: 121.520076 },
      zoom: 12,
    });
    const input = document.getElementById("search_location");
    const autocomplete = new google.maps.places.Autocomplete(input);
    const marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29),
    });

    autocomplete.bindTo("bounds", map);

    autocomplete.addListener("place_changed", function () {
      marker.setVisible(false);
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15);
      }

      // Set the marker position and make it visible
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      // Set the latitude and longitude in the form
      document.getElementById("latitude").value = place.geometry.location.lat();
      document.getElementById("longitude").value =
        place.geometry.location.lng();
    });

    // Geolocation to set current position
    navigator.geolocation.getCurrentPosition((position) => {
      const currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      map.setCenter(currentPosition);
      marker.setPosition(currentPosition);
      marker.setVisible(true);
      map.setZoom(15);
    });
  };

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
            className="mt-1 p-2 w-full border rounded-md mb-4"
            type="text"
            placeholder="Enter a location"
            name="locationName"
            required
          />
          <div
            id="map"
            ref={mapRef}
            style={{ height: "400px", width: "100%" }}
          ></div>

          <input type="hidden" id="latitude" name="latitude" />
          <input type="hidden" id="longitude" name="longitude" />
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
