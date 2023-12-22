import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { useState, useEffect, useRef } from "react";
import { LuMapPin } from "react-icons/lu";
import { SlCalender } from "react-icons/sl";
import { AiOutlineMessage } from "react-icons/ai";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { BiMessage } from "react-icons/bi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Loader from "../components/layout/Loader";

const ActivityDetailPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.user);
  const [detail, setDetail] = useState(null);
  const [content, setContent] = useState("");
  const [spots, setSpots] = useState(0);
  const [libraries] = useState(["places"]);
  const latestCommentRef = useRef(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
    language: "zh-TW",
  });

  useEffect(() => {
    const getActivityDetail = async () => {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/activity/detail/${id}`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.errors) {
            return setDetail(null);
          }
          setDetail(data);
          setSpots(data.attendees_limit - data.current_attendees_count);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getActivityDetail();
  }, [id]);

  const handleSubmitComment = async (id) => {
    if (!content.trim()) return;

    if (!user) return toast.error("請先登入");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/activity/${id}/comment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, title: detail.title }),
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
        throw new Error("提交留言失敗");
      }
      if (latestCommentRef.current) {
        latestCommentRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      toast.error("提交留言失敗");
    }
  };

  const handleAttend = async (id) => {
    if (!user) return toast.error("請先登入");

    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/activity/${id}/attend/`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatroomId: detail.chatroom_id,
          title: detail.title,
        }),
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
      setSpots((prevSpots) => prevSpots - 1);
      toast.success(message);
    } else {
      toast.error(errors);
    }
  };

  const handleCancelAttend = async (id) => {
    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/activity/${id}/cancel`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatroomId: detail.chatroom_id,
          title: detail.title,
        }),
      }
    );
    const { message, errors } = await result.json();
    if (result.ok) {
      setDetail((prevDetail) => ({
        ...prevDetail,
        attendees: prevDetail.attendees.filter(
          (attendee) => attendee.user_id !== user.id
        ),
      }));
      setSpots((prevSpots) => prevSpots + 1);
      toast.success(message);
    } else {
      toast.error(errors);
    }
  };

  const handleDeleteActivity = async (id) => {
    setOpen(false);
    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/activity/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const { message, errors } = await result.json();
    if (result.ok) {
      toast.success(message);
      navigate("/");
    } else {
      toast.error(errors);
    }
  };

  const privateMessage = async (userId) => {
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/chatroom`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const chatroomId = await result.json();
      navigate(`/message?type=private&chatroomId=${chatroomId}`);
    } catch (err) {
      toast.error("建立私人聊天室錯誤");
    }
  };

  return (
    <div>
      <Header searchInput={searchInput} setSearchInput={setSearchInput} />
      {loading ? (
        <div className="w-full h-[100vh] flex justify-center items-center bg-white">
          <Loader />
        </div>
      ) : detail ? (
        <>
          <div className="px-5 py-4 w-full border-b-2 bg-white">
            <div className="max-w-[75vw] w-full mx-auto">
              <h1 className="overflow-hidden overflow-ellipsis text-3xl font-bold leading-snug">
                {detail.title}
              </h1>

              <div className="flex w-full mt-3 items-center">
                <img
                  src={`${import.meta.env.VITE_UPLOAD_URL}/${
                    detail?.host_avatar
                  }`}
                  alt="host_avatar"
                  className="h-[48px] w-[48px] rounded-full object-cover"
                />
                <div className="flex w-full items-center justify-between ml-6">
                  <div className="w-[180px]">
                    <div>活動主辦人：</div>
                    <div>
                      <span className="font-medium">{detail.host_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-between border-bg-gray-100 bg-gray-100 pb-6 px-5">
            <div className="max-w-[75vw] w-full bg-gray-100">
              <div className="flex flex-row gap-[3rem]">
                <div className="flex flex-grow flex-col mt-5">
                  <div className="max-w-2xl">
                    <div>
                      <div>
                        <div className="flex items-center justify-center">
                          <img
                            id="picture"
                            src={`${import.meta.env.VITE_UPLOAD_URL}/${
                              detail.picture
                            }`}
                            alt="Activity Picture"
                            className="mt-4 w-[600px] rounded-md object-cover"
                          />
                        </div>
                      </div>
                      <div className="mt-5 w-full">
                        <div className="mb-5 flex items-center justify-between">
                          <h2 className="text-xl font-semibold">活動詳情</h2>
                        </div>
                        <div className="break-words whitespace-pre-line overflow-ellipsis">
                          <p>{detail.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="my-7">
                      {detail?.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block py-1 px-3 mr-3  bg-green-700 rounded-full text-white font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 w-full">
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">留言</h2>
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
                            <div className="flex flex-col max-w-[90%]">
                              <h5 className="text-lg font-bold">
                                {comment.name}
                              </h5>
                              <p className="text-gray-700 whitespace-pre-line break-words">
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

                <div className="w-[400px] mt-10">
                  <div className="bg-white px-5 pb-3 pt-6 sm:pb-4.5 py-5 rounded-2xl">
                    <div className="flex items-center">
                      <div className="p-3 mr-1">
                        <SlCalender className="w-[28px] h-[28px] text-red-500" />
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <div className="mb-1">開始:</div>
                          <div>結束:</div>
                        </div>
                        <div>
                          <div className="mb-1">
                            {formatDate(detail.start_from)}
                          </div>
                          <div>{formatDate(detail.end_at)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mt-3">
                      <div className="p-3 mr-1">
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

                    <div className="w-full h-[350px] flex justify-center items-center p-3">
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

                    <div className="text-center font-bold bg-white pb-4 pt-3 mt-4 rounded-2xl px-5 py-4 relative">
                      {detail?.attendees.some(
                        (attendee) => attendee.user_id === user?.id
                      ) ? (
                        <Link
                          to={`/message?type=group&chatroomId=${detail.chatroom_id}`}
                        >
                          <button className="flex justify-center items-center rounded-lg text-[#008990] border-2 border-[#008990] bg-white py-2 leading-8 w-full hover:bg-gray-100">
                            <div className="mr-3">
                              <BiMessage size={23} color="#008990" />
                            </div>
                            進入群組聊天
                          </button>
                        </Link>
                      ) : (
                        <button className="flex justify-center items-center rounded-lg text-white bg-gray-600 py-2 leading-8 w-full cursor-not-allowed opacity-50">
                          <div className="mr-3">
                            <BiMessage size={23} color="white" />
                          </div>
                          進入群組聊天(需成為活動參與者)
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mt-5 w-full max-h-[600px] overflow-auto">
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">參加者</h2>
                      </div>
                      <div className="overflow-y-auto max-h-[500px]">
                        <ul className="grid grid-cols-3 gap-4">
                          {detail.attendees.map((attendee, index) => (
                            <li
                              key={index}
                              className="relative flex flex-col items-center w-full p-4 bg-white rounded-lg shadow"
                            >
                              {attendee.user_id !== user?.id && (
                                <div
                                  className="absolute top-0 right-0 mt-2 mr-2 text-blue-500 cursor-pointer"
                                  onClick={() =>
                                    privateMessage(attendee.user_id)
                                  }
                                >
                                  <AiOutlineMessage size={25} />
                                </div>
                              )}
                              <img
                                src={`${import.meta.env.VITE_UPLOAD_URL}/${
                                  attendee.avatar
                                }`}
                                alt={`${attendee.name}'s avatar`}
                                className="w-[4.5rem] h-[4.5rem] rounded-full mb-2 object-cover"
                              />
                              <div className="flex flex-col w-full text-center">
                                <h5 className="font-bold break-words">
                                  {attendee.name}
                                </h5>
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
          </div>
          <div className="sticky bottom-0 z-10 w-full bg-white px-5 py-5 xl:px-0">
            <div className="max-w-[50vw] mx-auto">
              <div className="flex justify-between text-gray7">
                <div className="flex-col justify-center sm:flex">
                  <div className="flex flex-col uppercase leading-7 tracking-tight font-semibold text-[#715025] text-lg">
                    {formatDate(detail.start_from)}
                  </div>
                  <div>
                    <p className="font-semibold text-xl">{detail.title}</p>
                  </div>
                </div>

                <div className="w-auto">
                  <div className="flex items-center justify-around gap-5">
                    <div className="flex items-center md:block">
                      <div className="flex flex-col">
                        <div
                          className={`text-lg text-center font-semibold ${
                            detail.price === 0 ? "text-red-500" : "font-bold"
                          }`}
                        >
                          {detail.price === 0 ? "Free" : detail.price + "$"}
                        </div>
                        <div>剩下{spots}位名額</div>
                      </div>
                    </div>

                    {new Date(detail.dateline) < new Date() ? (
                      <button
                        className="rounded-lg border px-8 py-2.5 w-[120px] font-semibold leading-8 text-white bg-gray-500 hover:bg-gray-500 cursor-not-allowed"
                        aria-disabled
                      >
                        已結束
                      </button>
                    ) : user?.id === detail.host_id ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => setOpen(true)}
                        >
                          取消發佈
                        </Button>
                        <Dialog
                          open={open}
                          onClose={() => setOpen(false)}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle id="alert-dialog-title">
                            {"確認刪除"}
                          </DialogTitle>
                          <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                              確定要刪除已發佈的活動嗎?
                              <br />
                              這將會移除所有參加者，並且刪除群組聊天室。
                            </DialogContentText>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setOpen(false)}>取消</Button>
                            <Button
                              onClick={() => handleDeleteActivity(id)}
                              autoFocus
                            >
                              確定
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </>
                    ) : detail?.attendees.some(
                        (attendee) => attendee.user_id === user?.id
                      ) ? (
                      <button
                        className="rounded-lg border px-8 py-2.5 font-semibold leading-8 text-white bg-red-500 hover:bg-red-600 cursor-pointer"
                        onClick={() => handleCancelAttend(id)}
                      >
                        取消參加
                      </button>
                    ) : (
                      <button
                        className={`rounded-lg border px-8 py-2.5 font-semibold leading-8 text-white ${
                          spots > 0
                            ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                            : "bg-gray-500 hover:bg-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleAttend(id)}
                        disabled={spots <= 0}
                      >
                        {spots > 0 ? "參加" : "已額滿"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[85vh]">
          <div className="text-4xl font-bold text-red-500 mb-4">
            活動不存在或已被刪除
          </div>
          <p className="text-gray-500 text-lg mb-4">
            很抱歉，您查詢的活動不存在或已被刪除
          </p>
          <Link to="/" className="text-blue-500 hover:underline text-lg">
            返回首頁
          </Link>
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
