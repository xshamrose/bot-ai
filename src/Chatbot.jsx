import React, { useState, useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";

const TypewriterText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 30);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayedText}</span>;
};

const Message = ({ message, isTyping, isLastMessage }) => {
  const [showTypingAnimation, setShowTypingAnimation] = useState(false);

  useEffect(() => {
    if (
      message.sender === "bot" &&
      message.message !== "AI is thinking..." &&
      isLastMessage
    ) {
      setShowTypingAnimation(true);
    }
  }, [message, isLastMessage]);

  return (
    <div
      style={{
        textAlign: message.sender === "user" ? "right" : "left",
        margin: "10px 0",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
        gap: "8px",
      }}
    >
      {message.sender === "bot" && (
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#e3f2fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bot size={16} color="#1976d2" />
        </div>
      )}
      <div
        style={{
          display: "inline-block",
          maxWidth: "80%",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: "15px",
            backgroundColor: message.sender === "user" ? "#007bff" : "#f1f1f1",
            color: message.sender === "user" ? "#fff" : "#333",
          }}
        >
          {showTypingAnimation ? (
            <TypewriterText
              text={message.message}
              onComplete={() => setShowTypingAnimation(false)}
            />
          ) : (
            message.message
          )}
        </span>
        <div
          style={{
            fontSize: "10px",
            color: "#666",
            marginTop: "5px",
            textAlign: message.sender === "user" ? "right" : "left",
          }}
        >
          {message.timestamp}
        </div>
      </div>
      {message.sender === "user" && (
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#e8eaf6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={16} color="#3f51b5" />
        </div>
      )}
    </div>
  );
};

const Chatbot = ({ apiEndpoint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatbotData, setChatbotData] = useState({
    topBorderColor: "#007bff",
    chatBotColor: "#fff",
    chatBotLogo: "",
    backgroundLogo: "",
    initialMsg: "Hi! How can I help you today?",
    topBorderTitle: "Chatbot",
    loginUser: "",
    notificationCount: 0,
  });

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchChatbotConfig = async () => {
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setChatbotData({
          topBorderColor: data.topBorderColor || "#007bff",
          chatBotColor: data.chatBotColor || "#fff",
          chatBotLogo: data.chatBotLogo || "",
          backgroundLogo: data.backgroundLogo || "",
          initialMsg: data.initialMsg || "Hi! How can I help you today?",
          topBorderTitle: data.topBorderTitle || "Chatbot",
          loginUser: data.loginUser || "",
          notificationCount: data.notificationCount || 0,
        });

        setChatHistory([
          {
            sender: "bot",
            message: data.initialMsg || "Hi! How can I help you today?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch chatbot configuration:", error);
      }
    };

    fetchChatbotConfig();
  }, [apiEndpoint]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    const newUserMessage = {
      sender: "user",
      message: userInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const thinkingMessage = {
      sender: "bot",
      message: "AI is thinking...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatHistory((prevHistory) => [
      ...prevHistory,
      newUserMessage,
      thinkingMessage,
    ]);
    setUserInput("");

    try {
      const response = await fetch("http://192.168.1.9:5001/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const botResponseMessage = {
        sender: "bot",
        message: data.answer || "I'm sorry, I couldn't process your request.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        botResponseMessage,
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        sender: "bot",
        message: "I'm sorry, I couldn't process your request.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        errorMessage,
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
      }}
    >
      {isOpen && (
        <div
          style={{
            position: "relative",
            borderRadius: "10px",
            width: "320px",
            height: "400px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.3s ease-in-out",
            marginBottom: "10px",
            overflow: "hidden",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${chatbotData.backgroundLogo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.1,
            }}
          />
          <div
            style={{
              backgroundColor: chatbotData.topBorderColor,
              color: "#fff",
              padding: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>{chatbotData.topBorderTitle}</div>
            <button
              onClick={toggleChatbot}
              style={{
                backgroundColor: "transparent",
                color: "#fff",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              X
            </button>
          </div>

          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              padding: "15px",
              fontSize: "14px",
              color: "#333",
              overflowY: "auto",
            }}
          >
            {chatHistory.map((chat, index) => (
              <Message
                key={index}
                message={chat}
                isLastMessage={index === chatHistory.length - 1}
                isTyping={chat.message === "AI is thinking..."}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "5px",
              padding: "10px",
              borderTop: "1px solid #ddd",
              backgroundColor: "#fff",
            }}
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                backgroundColor: chatbotData.topBorderColor,
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {!isOpen ? (
        <div
          onClick={toggleChatbot}
          style={{
            backgroundColor: chatbotData.chatBotColor,
            color: "#fff",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
          }}
        >
          {chatbotData.chatBotLogo ? (
            <img
              src={chatbotData.chatBotLogo}
              alt=""
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
          ) : (
            "💬"
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: chatbotData.topBorderColor,
            borderRadius: "10px",
            padding: "10px",
            gap: "10px",
            color: "#fff",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              👤
              {chatbotData.notificationCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: "15px",
                    height: "15px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {chatbotData.notificationCount}
                </div>
              )}
            </div>
            <div style={{ fontSize: "14px" }}>
              {chatbotData.loginUser || "Guest"}
            </div>
          </div>
          <div
            onClick={toggleChatbot}
            style={{
              backgroundColor: chatbotData.chatBotColor,
              color: "#fff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
            }}
          >
            {chatbotData.chatBotLogo ? (
              <img
                src={chatbotData.chatBotLogo}
                alt=""
                style={{ width: "30px", height: "30px", objectFit: "cover" }}
              />
            ) : (
              "💬"
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
