import { Link, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { useState, useEffect, useRef } from "react";
import { LuMapPin } from "react-icons/lu";
import { SlCalender } from "react-icons/sl";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { BiMessage } from "react-icons/bi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ActivityDetailPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.user);
  const [detail, setDetail] = useState(null);
  const [content, setContent] = useState("");
  const [spots, setSpots] = useState(0);
  const [libraries] = useState(["places"]);
  const latestCommentRef = useRef(null);

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
    language: "zh-TW",
  });

  useEffect(() => {
    const getActivityDetail = async () => {
      fetch(`${import.meta.env.VITE_API_URL}/activity/detail/${id}`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setDetail(data);
          setSpots(data.attendees_limit - data.current_attendees_count);
        });
    };
    getActivityDetail();
  }, [id]);

  const handleSubmitComment = async (id) => {
    if (!content.trim()) return toast.error("Please enter a comment.");

    if (!user) return toast.error("Please login first.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/activity/${id}/comment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        setDetail((prevDetail) => ({
          ...prevDetail,
          comments: [
            ...prevDetail.comments,
            {
              content,
              name: user.name,
              user_id: user.id,
              avatar: user.avatar,
              comment_at: Date.now(),
            },
          ],
        }));

        setContent("");
      } else {
        throw new Error("Failed to submit comment");
      }
      if (latestCommentRef.current) {
        latestCommentRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      toast.error("Failed to submit comment.");
    }
  };

  const handleAttend = async (id) => {
    if (!user) return toast.error("Please login first.");

    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/activity/attend/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatroomId: detail.chatroom_id }),
      }
    );
    const { message, errors } = await result.json();
    if (result.ok) {
      setDetail((prevDetail) => ({
        ...prevDetail,
        attendees: [
          ...prevDetail.attendees,
          {
            user_id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
        ],
      }));
      toast.success(message);
    } else {
      toast.error(errors);
    }
  };

  return (
    <div>
      <Header />
      {detail && (
        <>
          <div className="px-5 py-6 w-full border-b-2 bg-white">
            <div className="max-w-[75vw] w-full mx-auto">
              <h1 className="overflow-hidden overflow-ellipsis text-3xl font-bold leading-snug">
                {detail.title}
              </h1>
              <Link to="/" className="block w-fit">
                <div className="flex mt-5">
                  <img
                    src={`${import.meta.env.VITE_UPLOAD_URL}/${
                      detail?.host_avatar
                    }`}
                    alt="host_avatar"
                    className="h-[48px] w-[48px] rounded-full object-cover"
                  />
                  <div className="ml-6">
                    <div>Hosted By:</div>
                    <div>
                      <span className="font-medium">{detail.host_name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-between border-bg-gray-100 bg-gray-100 pb-6 px-5">
            <div className="max-w-[75vw] w-full bg-gray-100">
              <div className="flex flex-row gap-20">
                <div className="flex flex-grow flex-col mt-5">
                  <div className="max-w-2xl">
                    <div>
                      <div>
                        <img
                          id="picture"
                          src={`${import.meta.env.VITE_UPLOAD_URL}/${
                            detail.picture
                          }`}
                          alt="Activity Picture"
                          className="mt-4 max-w-2xl rounded-sm"
                        />
                      </div>
                      <div className="px-6 sm:px-4 xl:px-0 md:max-w-screen mt-5 w-full">
                        <div className="mb-5 flex items-center justify-between">
                          <h2 className="text-xl font-semibold">Details</h2>
                        </div>
                        <div className="break-words">
                          <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Natus molestiae aspernatur similique eveniet,
                            ea repudiandae aut alias non consequatur voluptate
                            exercitationem dolorem architecto mollitia labore
                            obcaecati ipsam maiores, odio dolore? Lorem ipsum
                            dolor sit amet consectetur adipisicing elit. Natus
                            molestiae aspernatur similique eveniet, ea
                            repudiandae aut alias non consequatur voluptate
                            exercitationem dolorem architecto mollitia labore
                            obcaecati ipsam maiores, odio dolore?
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 w-full">
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Comments</h2>
                      </div>

                      <div id="comments-section" className="space-y-4 my-6">
                        {detail.comments.map((comment, index) => (
                          <div
                            key={index}
                            ref={
                              index === detail.comments.length - 1
                                ? latestCommentRef
                                : null
                            }
                            className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow"
                          >
                            <img
                              src={`${import.meta.env.VITE_UPLOAD_URL}/${
                                comment.avatar
                              }`}
                              alt={`${comment.name}'s avatar`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                              <h5 className="text-lg font-bold">
                                {comment.name}
                              </h5>
                              <p className="text-gray-700 whitespace-pre-line">
                                {comment.content}
                              </p>
                              <span className="text-xs text-gray-500 mt-2">
                                {new Date(comment.comment_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center space-x-3">
                        <textarea
                          id="content"
                          placeholder="Add a comment..."
                          className="flex-1 border border-gray-500 rounded-lg py-2 px-4"
                          rows="3"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment(id);
                            }
                          }}
                        ></textarea>
                        <button
                          type="button"
                          onClick={() => {
                            handleSubmitComment(id);
                          }}
                          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full"
                        >
                          <svg
                            className="w-6 h-6 transform rotate"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[500px] mt-10">
                  <div className="bg-white px-5 pb-3 pt-6 sm:pb-4.5 py-5 rounded-2xl">
                    <div className="flex items-center">
                      <div className="p-3 mr-3">
                        <SlCalender className="w-[28px] h-[28px] text-red-500" />
                      </div>
                      <div className="flex gap-5">
                        <div>
                          <div>Start:</div>
                          <div>End:</div>
                        </div>
                        <div>
                          <div>{formatDate(detail.start_from)}</div>
                          <div>{formatDate(detail.end_at)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mt-3">
                      <div className="p-3 mr-3">
                        <LuMapPin className="w-[28px] h-[28px] text-red-500" />
                      </div>
                      <a
                        href={`https://www.google.com/maps/?q=${detail.latitude},${detail.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-800"
                      >
                        {detail.location_name}
                      </a>
                    </div>

                    <div className="w-full h-[350px] p-3">
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={{
                            width: "400px",
                            height: "300px",
                          }}
                          center={{
                            lat: detail.latitude,
                            lng: detail.longitude,
                          }}
                          zoom={17}
                        >
                          <Marker
                            position={{
                              lat: detail.latitude,
                              lng: detail.longitude,
                            }}
                          />
                        </GoogleMap>
                      ) : (
                        <></>
                      )}
                    </div>

                    <div className="text-center text-[#008990] bg-white pb-4 pt-3 mt-4 rounded-2xl px-5 py-4 relative">
                      <Link to="/">
                        <button className="flex justify-center items-center rounded-lg border-2 border-[#008990] bg-white py-1 font-medium leading-8 w-full hover:bg-gray-100">
                          <div className="mr-3">
                            <BiMessage size={23} color="#008990" />
                          </div>
                          Group Chat
                        </button>
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="mt-5 w-full max-h-[600px] overflow-auto">
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Attendees</h2>
                      </div>
                      <ul className="space-y-4">
                        {detail.attendees.map((attendee, index) => (
                          <li
                            key={index}
                            className="flex items-center p-4 bg-white rounded-lg shadow"
                          >
                            <img
                              src={`${import.meta.env.VITE_UPLOAD_URL}/${
                                attendee.avatar
                              }`}
                              alt={`${attendee.name}'s avatar`}
                              className="w-10 h-10 rounded-full mr-4 object-cover"
                            />
                            <div className="flex flex-col">
                              <h5 className="font-bold">{attendee.name}</h5>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 z-10 w-full bg-white px-5 py-5 xl:px-0">
            <div className="max-w-[50vw] mx-auto">
              <div className="flex justify-between text-gray7">
                <div className="flex-col justify-center sm:flex">
                  <div className="flex flex-col uppercase leading-7 tracking-tight">
                    {formatDate(detail.start_from)}
                  </div>
                  <div>
                    <p className="font-semibold">{detail.title}</p>
                  </div>
                </div>

                <div className="w-auto">
                  <div className="flex items-center justify-around gap-5">
                    <div className="flex items-center md:block">
                      <div className="flex flex-col">
                        <div
                          className={`text-lg font-semibold ${
                            detail.price === 0 ? "text-red-500" : "font-bold"
                          }`}
                        >
                          {detail.price === 0 ? "Free" : detail.price + "$"}
                        </div>
                        <div>{spots} spots left</div>
                      </div>
                    </div>

                    <button
                      className={`rounded-lg border px-8 py-2.5 w-[120px] font-semibold leading-8 text-white ${
                        spots > 0
                          ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                          : "bg-gray-500 hover:bg-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => handleAttend(id)}
                      disabled={spots < 0}
                    >
                      {spots > 0 ? "Attend" : "Full"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityDetailPage;
