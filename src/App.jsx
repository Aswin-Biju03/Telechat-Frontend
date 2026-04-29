import React, { useState, useRef, useEffect } from "react";
import { BiPaperPlane } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";

// 🔌 CONNECT TO BACKEND
const socket = io("http://localhost:5000");

function App() {
  const [showName, setShowName] = useState(true);
  const [inputName, setInputName] = useState("");
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef();

  // ✅ JOIN
  const handleName = () => {
    if (inputName.trim()) {
      setShowName(false);
      socket.emit("join", inputName);
    }
  };

  // ✅ SEND MESSAGE
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", {
        name: inputName,
        text: message,
      });

      setMessage("");
      setTypingUser("");
      setShowEmoji(false);
    }
  };

  // ✅ TYPING
  const handleTyping = () => {
    socket.emit("typing", inputName);
  };

  // ✅ EMOJI
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  // ✅ SOCKET LISTENERS
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing", (name) => {
      setTypingUser(name);
      setTimeout(() => setTypingUser(""), 1500);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
      socket.off("typing");
    };
  }, []);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex items-center justify-center bg-gray-900 text-white h-screen">
      <div
        style={{ backgroundColor: "#1B202D", width: "350px", height: "650px" }}
        className="rounded-2xl flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        {!showName && (
          <div className="bg-[#1B202D] py-3 px-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-500 rounded-full flex justify-center items-center text-xl">
                {inputName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-sm font-medium">Realtime Group Chat</h1>
                <p className="text-xs text-gray-400">
                  {typingUser ? `${typingUser} typing...` : "Online"}
                </p>
              </div>
            </div>

            <h1 className="text-xs">
              <span className="text-gray-400">You:</span>{" "}
              <span className="font-bold">{inputName}</span>
            </h1>
          </div>
        )}

        {/* NAME SCREEN */}
        {showName && (
          <div className="flex-1 flex justify-center items-center bg-[#292F3F]">
            <div className="flex flex-col gap-3 bg-[#1B202D] p-5 rounded-xl shadow-lg w-[300px]">
              <h1 className="text-2xl font-semibold text-center">
                Enter your Name
              </h1>

              <p className="text-xs text-gray-400 text-center">
                This name will be visible to others in the chat
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Eg: Max Miller"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded bg-gray-800 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleName();
                  }}
                />
                <button
                  onClick={handleName}
                  className="px-4 py-2 rounded bg-green-700 hover:bg-green-600"
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHAT AREA */}
        {!showName && (
          <>
            {/* ONLINE USERS */}
            <div className="bg-[#1B202D] px-3 py-2 border-b border-gray-700">
              <div className="flex gap-3 overflow-x-auto">
                {onlineUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center min-w-[50px]"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        user === inputName ? "bg-green-600" : "bg-gray-600"
                      }`}
                    >
                      {user.slice(0, 1).toUpperCase()}
                    </div>

                    <p className="text-[10px] text-gray-300 mt-1 text-center">
                      {user === inputName ? "You" : user}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-[#292F3F]">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 text-sm mt-10">
                  Start the conversation 👋
                </p>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.name === inputName
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
                      msg.name === inputName
                        ? "bg-green-600"
                        : "bg-[#373E4E]"
                    }`}
                  >
                    {msg.name !== inputName && (
                      <p className="text-xs text-gray-300 mb-1">
                        {msg.name}
                      </p>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}

              <div ref={bottomRef}></div>
            </div>

            {/* INPUT */}
            <div className="relative p-3 bg-[#1B202D] border-t border-gray-700 flex items-center gap-2">
              {showEmoji && (
                <div className="absolute bottom-16 left-3 z-10">
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
              )}

              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 text-xl text-gray-400 hover:text-white"
              >
                <BsEmojiSmile />
              </button>

              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-full bg-gray-800 outline-none text-sm"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button
                onClick={sendMessage}
                className="p-3 bg-green-600 rounded-full hover:bg-green-500"
              >
                <BiPaperPlane />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;