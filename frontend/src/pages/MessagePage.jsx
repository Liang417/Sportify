import { useState, useEffect, useRef } from "react";
import Header from "../components/layout/Header";
import socketIO from "socket.io-client";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
const socket = socketIO(`${import.meta.env.VITE_SOCKET}`, {
  transports: ["websocket"],
});

const MessagePage = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const [privateChatrooms, setPrivateChatrooms] = useState([]);
  const [groupChatrooms, setGroupChatrooms] = useState([]);
  const [activeChatroom, setActiveChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");
  const chatroomId = queryParams.get("chatroomId");

  useEffect(() => {
    const test = async () => {
      if (type === "group") {
        await fetchGroupChatrooms();
      } else {
        await fetchPrivateChatrooms();
      }
    };
    test();
  }, [location, type]);

  useEffect(() => {
    if (chatroomId) {
      setActiveChatroom(
        privateChatrooms.find(
          (chatroom) => String(chatroom.id) === chatroomId
        ) ||
          groupChatrooms.find((chatroom) => String(chatroom.id) === chatroomId)
      );
      fetchMessages(chatroomId);
    }
  }, [privateChatrooms, groupChatrooms, location, chatroomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChatroom) {
      socket.emit("joinRoom", activeChatroom.id);
      socket.on("getMessage", (newMessage) => {
        setMessages((messages) => [...messages, newMessage]);
      });

      return () => socket.off("getMessage");
    }
  }, [activeChatroom]);

  const fetchPrivateChatrooms = async () => {
    setPrivateChatrooms([]);
    setGroupChatrooms([]);
    setActiveChatroom(null);
    fetch(`${import.meta.env.VITE_API_URL}/chatrooms/private`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setPrivateChatrooms(data.privateChatrooms));
  };

  const fetchGroupChatrooms = async () => {
    setPrivateChatrooms([]);
    setGroupChatrooms([]);
    setActiveChatroom(null);
    fetch(`${import.meta.env.VITE_API_URL}/chatrooms/group`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setGroupChatrooms(data.groupChatrooms));
  };

  const fetchMessages = async (chatroomId) => {
    fetch(`${import.meta.env.VITE_API_URL}/messages/${chatroomId}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setMessages(data.messages));
  };

  const handleRoomClick = (chatroom) => {
    navigate(`/message?type=${type}&chatroomId=${chatroom.id}`);
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    socket.emit("sendMessage", {
      content: currentMessage,
      chatroom_id: activeChatroom.id,
      sender_id: user.id,
      sender_name: user.name,
      sender_avatar: user.avatar,
    });

    fetch(`${import.meta.env.VITE_API_URL}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        chatroomId: activeChatroom.id,
        content: currentMessage,
      }),
    });

    setCurrentMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <Header />
      <div className="w-3/4 mx-auto flex flex-col mt-6">
        {/* Chat room list section */}
        <div className="w-full p-4">
          <div className="flex items-center justify-evenly">
            <button
              onClick={() => navigate("/message?type=private")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 w-1/3 rounded-full"
            >
              私人訊息
            </button>

            <button
              onClick={() => navigate("/message?type=group")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 w-1/3 rounded-full"
            >
              群組訊息
            </button>
          </div>
        </div>

        {/* Chat display section */}
        <div className="w-full h-[70vh] p-4 flex rounded-lg">
          <div className="w-1/3 border-2">
            <ul className="overflow-auto">
              {privateChatrooms &&
                privateChatrooms.map((chatroom) => (
                  <li
                    key={chatroom.id}
                    onClick={() => handleRoomClick(chatroom)}
                    className={`p-4 ${
                      activeChatroom?.id === chatroom.id
                        ? "bg-gray-400"
                        : "hover:bg-gray-200"
                    } rounded cursor-pointer border-b`}
                  >
                    {chatroom.name}
                  </li>
                ))}

              {groupChatrooms &&
                groupChatrooms.map((chatroom) => (
                  <li
                    key={chatroom.id}
                    onClick={() => handleRoomClick(chatroom)}
                    className={`p-4 ${
                      activeChatroom?.id === chatroom.id
                        ? "bg-gray-400"
                        : "hover:bg-gray-200"
                    } rounded cursor-pointer border-b`}
                  >
                    {chatroom.name}
                  </li>
                ))}
            </ul>
          </div>

          {activeChatroom ? (
            <div className="w-full flex flex-col flex-1 border-y-2 border-r-2">
              <div className="bg-green-200 p-4 mb-4 rounded text-lg text-center">
                {activeChatroom.name}
              </div>
              <div className="overflow-auto h-[70%]">
                {messages &&
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender_id === user.id
                          ? "justify-end pr-4"
                          : "justify-start pl-4"
                      } my-2`}
                    >
                      {message.sender_id !== user.id && (
                        <img
                          src={`${import.meta.env.VITE_UPLOAD_URL}/${
                            message.sender_avatar
                          }`}
                          alt={message.sender_name}
                          className="h-10 w-10 rounded-full mt-3 mr-2 object-cover"
                        />
                      )}
                      <div
                        className={`p-2 max-w-xs rounded break-words ${
                          message.sender_id === user.id
                            ? "bg-blue-300"
                            : "bg-gray-300"
                        }`}
                      >
                        {message.sender_id !== user.id && (
                          <div className="text-sm text-gray-600">
                            {message.sender_name}
                          </div>
                        )}
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <input
                  type="text"
                  placeholder="Message input"
                  className="border-2 p-2 rounded flex-grow mr-2"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center text-gray-500 text-lg border-y-2 border-r-2">
              <p>Select a chat room</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
