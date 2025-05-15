import React from "react";
import { Spin } from "antd";

const LoadingScreen: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.8)",
        zIndex: 1000,
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default LoadingScreen;
