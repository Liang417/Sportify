import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { toast } from "react-toastify";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import moment from "moment";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";

const CreateActivityPage = () => {
  const [typeOptions, setTypeOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [libraries] = useState(["places"]);
  const [center, setCenter] = useState({ lat: 25.03746, lng: 121.564558 });
  const autocompleteInputRef = useRef(null);
  const [startFrom, setStartFrom] = useState(null);
  const [endAt, setEndAt] = useState(null);
  const [dateline, setDeadline] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
    language: "zh-TW",
  });

  useEffect(() => {
    getTypesOptions().then(setTypeOptions);
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
          setLatitude(location.lat());
          setLongitude(location.lng());
        }
      });
    }
  }, [isLoaded]);

  const getTypesOptions = async () => {
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

    if (!longitude || !latitude)
      return toast.error("請從GoogleMap下拉式選單中選取地圖位置");

    const formData = new FormData(event.target);

    formData.append("tags", JSON.stringify(selectedTags));
    formData.append(
      "startFrom",
      moment(startFrom).format("YYYY-MM-DD HH:mm:ss")
    );
    formData.append("endAt", moment(endAt).format("YYYY-MM-DD HH:mm:ss"));
    formData.append("dateline", moment(dateline).format("YYYY-MM-DD HH:mm:ss"));
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/activity`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (response.ok) {
        toast.success("Activity created successfully");
        setTimeout(async () => {
          const { id } = await response.json();
          navigate(`/activity/detail/${id}`);
        }, 1000);
      } else {
        toast.error("Error creating activity");
      }
    } catch (error) {
      toast.error("Error submitting form", error);
    }
  };

  return (
    <div>
      <div>
        <Header />
      </div>
      <Box
        className="bg-gray-100 p-8"
        sx={{ "& .MuiTextField-root": { mb: 2, width: "100%" } }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md flex flex-col item-center justify-center"
          autoComplete="off"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">建立活動</h2>
          <TextField
            label="標題"
            type="text"
            id="title"
            name="title"
            required
          />

          <FormControl>
            <Select
              id="type"
              name="typeId"
              required
              value={selectedType}
              displayEmpty
              onChange={(e) => setSelectedType(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                選擇活動種類
              </MenuItem>
              {typeOptions?.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="地點"
            id="search_location"
            name="locationName"
            placeholder="Enter a location"
            required
            inputRef={autocompleteInputRef}
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

          <TextField
            label="費用"
            type="number"
            id="price"
            name="price"
            required
            InputProps={{ inputProps: { min: 0, max: 10000, step: 1 } }}
            sx={{ mt: 2 }}
          />

          <TextField
            label="參加人數限制"
            type="number"
            id="attendeesLimit"
            name="attendeesLimit"
            required
            InputProps={{ inputProps: { min: 1, max: 500 } }}
          />

          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DemoContainer components={["DateTimePicker"]}>
              <FormControl>
                <InputLabel htmlFor="startFrom"></InputLabel>
                <DateTimePicker
                  id="startFrom"
                  value={startFrom}
                  label="選擇活動開始日期"
                  onChange={(newValue) => {
                    setStartFrom(newValue);
                  }}
                  views={["year", "day", "hours", "minutes"]}
                  disablePast
                  required
                />
              </FormControl>

              <FormControl>
                <DateTimePicker
                  id="endAt"
                  label="選擇活動結束日期"
                  value={endAt}
                  onChange={(newValue) => setEndAt(newValue)}
                  views={["year", "day", "hours", "minutes"]}
                  minDateTime={
                    startFrom ? moment(startFrom).add(30, "minutes") : startFrom
                  }
                  required
                  disabled={!startFrom}
                />
              </FormControl>

              <FormControl>
                <DateTimePicker
                  id="dateline"
                  value={dateline}
                  label="選擇報名截止日期"
                  onChange={(newValue) => setDeadline(newValue)}
                  views={["year", "day", "hours", "minutes"]}
                  required
                  minDateTime={moment()}
                  maxDateTime={
                    startFrom
                      ? moment(startFrom).subtract(15, "minutes")
                      : startFrom
                  }
                  disabled={!startFrom}
                />
              </FormControl>
            </DemoContainer>
          </LocalizationProvider>

          <TextField
            label="活動說明"
            id="description"
            name="description"
            required
            multiline
            minRows={10}
            InputProps={{
              style: { whiteSpace: "pre-line" },
            }}
          />

          <Autocomplete
            multiple
            id="tags"
            options={tagOptions.map((option) => option.name)}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} variant="outlined" placeholder="Tags" />
            )}
            value={selectedTags}
            onChange={(event, newValue) => {
              setSelectedTags(newValue);
            }}
          />

          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2, fontSize: "20px" }}
          >
            上傳圖片
            <input
              type="file"
              id="picture"
              name="picture"
              accept="image/*"
              required
            />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, fontSize: "20px" }}
          >
            發佈活動
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default CreateActivityPage;
