import React from "react";
import { Progress } from "antd";
import styles from "../styles/MachineDowntime.module.css";
import { Card } from "antd";
import { BsExclamationTriangle } from "react-icons/bs";

interface DowntimeData {
  machine: string;
  downtime_seconds: number;
}

interface MachineDowntimeProps {
  data: DowntimeData[];
  title?: string;
}

const MachineDowntime: React.FC<MachineDowntimeProps> = ({
  data,
  title = "Machine Downtime",
}) => {
  const totalDowntime = data.reduce(
    (total, item) => total + item.downtime_seconds,
    0
  );

  console.log(data, "datassssssss");
  

  return (
    <Card
      style={{
        height: "180px",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        borderRadius: "8px",
      }}
      bodyStyle={{ padding: "5px" }}
    >
      <h3
        style={{
          fontSize: "16px",
          fontWeight: "600",
          margin: "0px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <BsExclamationTriangle style={{ fontSize: "12px" }} />
        {title}
      </h3>
      <div
        style={{
          display: "grid",
          gap: "6px",
        }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                minWidth: "70px",
                fontSize: "13px",
                color: "#666",
              }}
            >
              {item.machine} :
            </span>
            {/* <div style={{ flex: 1 }}>
              <Progress
                percent={(item.downtime_minutes / totalDowntime) * 100}
                status={item.downtime_minutes >= 80 ? "exception" : "active"}
                strokeWidth={6}
                showInfo={false}
                strokeColor={{
                  "0%": "#3aa080",
                  "50%": "#2d8064",
                  "100%": item.downtime_minutes >= 80 ? "#1f604c" : "#2d8064",
                }}
              />
            </div> */}
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                minWidth: "30px",
              }}
            >
              {`${Math.floor(item.downtime_seconds / 3600)}h ${Math.floor((item.downtime_seconds % 3600) / 60)}m ${item.downtime_seconds % 60}s`}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MachineDowntime;
