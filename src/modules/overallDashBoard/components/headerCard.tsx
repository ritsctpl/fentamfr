import { Card, Progress } from "antd";
import React from "react";
import {
  // MdTarget,
  MdMyLocation,
  MdCheckCircle,
  MdAccessTime,
  MdStop,
  MdCheck,
  MdClose,
} from "react-icons/md";

interface HeaderCardProps {
  title: string;
  value: number;
  color: string;
  icon: any;
  rightValue: {
    targetQty?: number;
    actualQty?: number;
    availableTime?: number;
    downtime?: number;
    goodQty?: number;
    badQty?: number;
  };
}

const HeaderCard: React.FC<HeaderCardProps> = ({
  title,
  value,
  icon,
  rightValue,
}) => {
  const renderRightSection = () => {
    switch (title) {
      case "OEE":
        return (
          <div style={{ paddingLeft: "5px" }}>
            {/* OEE keeps the same design, no additional values to show */}
          </div>
        );
      case "Performance":
        return (
          <div style={{ paddingLeft: "5px", paddingTop: "3px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                fontWeight: "500",
                display: "flex",
                // alignItems: "center",
                // gap: "0px",
              }}
            >
              Target Qty
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: "bold", color: "#0e2328" }}
            >
              {rightValue.targetQty || "0"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                fontWeight: "500",
                // marginTop: "4px",
                display: "flex",
                // alignItems: "center",
                // gap: "4px",
              }}
            >
              Actual Qty
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: "bold", color: "#0e2328" }}
            >
              {rightValue.actualQty || "0"}
            </div>
          </div>
        );
      case "Availability":
        return (
          <div style={{ paddingLeft: "5px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                // gap: "4px",
              }}
            >
              Available Time
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: "bold", color: "#0e2328" }}
            >
              {(() => {
                const seconds = rightValue.availableTime || 0;
                const hrs = Math.floor(seconds / 3600) % 24; // wrap after 24
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                return `${hrs.toString().padStart(2, "0")}:${mins
                  .toString()
                  .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
              })() || "00:00:00"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                fontWeight: "500",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                // gap: "4px",
              }}
            >
              Downtime
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: "bold", color: "#0e2328" }}
            >
              {/* {rightValue.downtime || "0"} */}
              {(() => {
                const seconds = rightValue.downtime || 0;
                const hrs = Math.floor(seconds / 3600) % 24; // wrap after 24
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                return `${hrs.toString().padStart(2, "0")}:${mins
                  .toString()
                  .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
              })() || "00:00:00"}
            </div>
          </div>
        );
      case "Quality":
        return (
          <div style={{ paddingLeft: "5px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                // gap: "4px",
              }}
            >
              Good Qty
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: "bold", color: "#0e2328" }}
            >
              {rightValue.goodQty || "0"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                fontWeight: "500",
                // marginTop: "4px",
                display: "flex",
                alignItems: "center",
                // gap: "4px",
              }}
            >
              Bad Qty
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: "bold", color: "#0e2328" }}
            >
              {rightValue.badQty || "0"}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      size="small"
      style={{
        width: title === "OEE" ? "95px" : "240px",
        height: "80px",
        borderRadius: "4px",
        // margin: "0 8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        border: "1px solid #f0f0f0",
        padding: 0,
      }}
      bodyStyle={{
        padding: "5px",
        display: "flex",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      {/* Left Section - Current Design */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: title === "OEE" ? "100%" : "50%",
          borderRight: title === "OEE" ? "none" : "1px solid #f0f0f0",
          padding: "2px 5px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#666",
            fontWeight: "500",
            paddingLeft: "5px",
            alignItems: "center",
            display: "flex",
            gap: "1px",
          }}
        >
          {icon}
          {title}
        </div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "#0e2328",
            lineHeight: "1",
            paddingLeft: "5px",
          }}
        >
          {value === 0 ? '0' : value === 100 ? '100' : value.toFixed(2)}%
        </div>
        <Progress
          percent={value}
          strokeColor={"#3aa080"}
          size="small"
          style={{
            width: "90%",
            margin: "0",
            transform: "scale(0.9)",
          }}
          strokeWidth={3}
          showInfo={false}
        />
      </div>

      {/* Right Section - Additional Metrics */}
      {title !== "OEE" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            width: "50%",
            padding: "10px 5px",
          }}
        >
          {renderRightSection()}
        </div>
      )}
    </Card>
  );
};

export default HeaderCard;
