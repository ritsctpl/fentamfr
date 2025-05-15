import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import { CommentOutlined, CloseOutlined } from "@ant-design/icons";

const ChatbotButton: React.FC = () => {
  const [isButtonAnimated, setIsButtonAnimated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChatbotClick = () => {
    setIsButtonAnimated(true);
    setShowTooltip(true);
    setTimeout(() => {
      setIsButtonAnimated(false);
      setShowTooltip(false);
    }, 3000);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "50px",
        right: "10px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {showTooltip && (
        <div
          style={{
            background: "linear-gradient(135deg, #2193b0, #6dd5ed)",
            color: "white",
            padding: "15px 25px",
            borderRadius: "20px",
            boxShadow: "0 8px 25px rgba(33, 147, 176, 0.3)",
            marginRight: "15px",
            position: "relative",
            animation: "floatIn 0.5s ease-out",
            maxWidth: "280px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "0",
              height: "0",
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderLeft: "10px solid #2193b0",
            }}
          />
          <div
            style={{
              fontWeight: 600,
              fontSize: "16px",
              marginBottom: "5px",
            }}
          >
            AI Assistant Coming Soon! ✨
          </div>
          <div
            style={{
              fontSize: "14px",
              opacity: 0.9,
              lineHeight: "1.4",
            }}
          >
            We're crafting an intelligent assistant just for you!
          </div>
        </div>
      )}
      {/* <Tooltip title="Chat with AI Assistant" placement="left"> */}
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={handleChatbotClick}
          className={isButtonAnimated ? "pulse-animation" : ""}
          style={{
            width: "50px",
            height: "50px",
            background: "linear-gradient(135deg, #2193b0, #6dd5ed)",
            border: "none",
            boxShadow: "0 4px 15px rgba(33, 147, 176, 0.2)",
            transform: isButtonAnimated ? "scale(1.1)" : "scale(1)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <CommentOutlined
              style={{
                fontSize: "28px",
                animation: isButtonAnimated
                  ? "bounce 0.5s ease infinite"
                  : "none",
              }}
            />
            <div
              className="pulse-ring"
              style={{
                position: "absolute",
                top: "-15px",
                right: "-18px",
                width: "12px",
                height: "12px",
                background: "#4CAF50",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            />
          </div>
        </Button>
      {/* </Tooltip> */}
      <style jsx global>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .pulse-animation {
          animation: pulse 2s infinite;
        }

        .pulse-ring {
          animation: pulseRing 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(33, 147, 176, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(33, 147, 176, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(33, 147, 176, 0);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatbotButton;
