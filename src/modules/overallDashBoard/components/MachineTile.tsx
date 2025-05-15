import React, { useState } from "react";
import { PiWashingMachineFill } from "react-icons/pi";
interface MachineTileProps {
  data: {
    resource_id: string;
    oee: number;
    actual: number;
    plan: number;
    actual_time: number;
    reject_percentage: number;
    downtime_seconds: number;
  };
}

const MachineTile: React.FC<MachineTileProps> = ({ data }) => {
  return (
    <div
      style={{
        background: "#3aa080",
        width: "100%",
        minWidth: "250px",
        maxWidth: "350px",
        minHeight: "10px",
        height: "100%",
        borderRadius: "8px",
        padding: "10px",
        boxSizing: "border-box",
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: "500",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <PiWashingMachineFill /> {data.resource_id}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "#000", fontWeight: "bold" }}>
            OEE
          </span>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            {data.oee === 0
              ? "0"
              : data.oee === 100
              ? "100"
              : data.oee?.toFixed(2) || "0"}
            %
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "#000", fontWeight: "bold" }}>
            Actual
          </span>
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>
            {data.actual === 0
              ? "0"
              : data.actual === 100
              ? "100"
              : data.actual % 1 === 0
              ? data.actual
              : data.actual?.toFixed(2) || "0"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "#000", fontWeight: "bold" }}>
            Plan
          </span>
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>
            {data.plan === 0
              ? "0"
              : data.plan === 100
              ? "100"
              : data.plan % 1 === 0
              ? data.plan
              : data.plan?.toFixed(2) || "0"}
          </span>
        </div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            // marginBottom: "8px",
          }}
        >
          <span>Actual Time</span>
          <span>
            {Math.floor(data.actual_time / 3600)}h{" "}
            {String(Math.floor((data.actual_time % 3600) / 60)).padStart(
              2,
              "0"
            )}
            m {String(data.actual_time % 60).padStart(2, "0")}s
          </span>
        </div>
        <div
          style={{
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Unscheduled DT</span>
          <span>
            {data.downtime_seconds
              ? `${Math.floor(data.downtime_seconds / 3600)}h ${Math.floor(
                  (data.downtime_seconds % 3600) / 60
                )}m ${data.downtime_seconds % 60}s`
              : "00h 00m 00s"}
          </span>
        </div>
        <div
          style={{
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Rejections</span>
          <span>{data.reject_percentage}</span>
        </div>
        {/* <div style={{
          fontSize: "13px",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>Unscheduled DT</span>
          <span>{data.downtime_seconds ? `${Math.floor(data.downtime_seconds / 3600)}h ${Math.floor((data.downtime_seconds % 3600) / 60)}m ${data.downtime_seconds % 60}s` : '00h 00m 00s'}</span>
        </div> */}
      </div>
    </div>
  );
};

export default MachineTile;
