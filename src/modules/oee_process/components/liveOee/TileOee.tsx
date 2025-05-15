import { MdFactory } from "react-icons/md";
import React, { useState } from "react";
import styles from "./tileOee.module.css";
import { TbClockCheck } from "react-icons/tb";
import { LuCalendarCheck } from "react-icons/lu";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaRegPauseCircle,
  FaRegPlayCircle,
  FaRegClock,
} from "react-icons/fa";
import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import { AiOutlineInfoCircle, AiOutlineSchedule } from "react-icons/ai";
import { Card, Tooltip } from "antd";

interface TileOeeProps {
  item: {
    resource: string;
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    downtime: boolean;
    site: string;
    batchNo: string | null;
    workcenter: string | null;
    item: string | null;
    actual: number;
    plan: number;
    shift: string | null;
    plannedCycletime: number;
    actualCycleTime: number;
    rejection: number;
    productionTime: number;
    actualTime: number;
    downtimeDuration: number;
    plannedDowntime: number;
    unplannedDowntime: number;
    downtimeReasons: string | null;
    goodQualityCount: number;
    badQualityCount: number;
    energyUsage: number;
    operation: number;
  };
  currentItem?: any;
}

const TileOee: React.FC<TileOeeProps> = ({ item, currentItem }) => {
  const { color } = useFilterContext();
  const { oee } = item;
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const [activeTab, setActiveTab] = useState(activeTabIndex);

  const getColor = (value: number) => {
    if (value < 50) return "#dc3545";
    if (value < 84) return "#ffc107";
    return "#28a745";
  };

  const handleTitle = () => {
    if (activeTab.includes("filter") || activeTab.includes("plant")) {
      // console.log("oee");

      return item.site;
    } else if (activeTab.includes("batch")) {
      // console.log("batch");
      return item.batchNo;
    } else if (activeTab.includes("resource")) {
      // console.log("resource");
      return item.resource;
    } else if (activeTab.includes("operation")) {
      // console.log("operation");
      return item.operation;
    }
    else if (activeTab.includes("machine")) {
      // console.log("resource");
      return item.resource;
    }
  };

  // console.log(item?.plannedCycletime, "item");

  return (
    <>
      <Card
        size="small"
        headStyle={{
          background: "var(--background-color)",
          color: "var(--text-color)",
          borderBottom: "1px solid var(--line-color)",
        }}
        title={
          <div className={styles.cardTitle}>
            <div className={styles.resourceName}>
              <MdFactory className={styles.resourceIcon} />
              <span className={styles.resourceText}>{handleTitle()}</span>
              {/* <span className={styles.resourceText}>{activeTab?.includes('plant') ? item.site :activeTab?.includes('batch')?item.batchNo:item.resource}</span> */}
            </div>
            <span className={styles.itemName}>
              {activeTab?.includes("workcenter")
                ? item.workcenter
                : activeTab?.includes("shift")
                ? item.shift
                : item.item?.replace(/^0+/, "")}
            </span>

            <span>
              <Tooltip
                title={
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>
                      <strong>Downtime:</strong>{" "}
                      {item.downtime ? "Inactive" : "Active"}
                    </span>
                    <span>
                      <strong>Reasons:</strong>{" "}
                      {item.downtime
                        ? item.downtimeReasons &&
                          typeof item.downtimeReasons === "object"
                          ? Object.entries(item.downtimeReasons)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")
                          : item.downtimeReasons || "No reasons provided"
                        : "Unknown"}
                    </span>
                  </div>
                }
              >
                <AiOutlineInfoCircle
                  style={{
                    color: "#fff!important",
                    borderRadius: "50%",
                    padding: "2px",
                    fontSize: "20px",
                  }}
                />
              </Tooltip>
            </span>
          </div>
        }
        className={`${styles.mainCard} ${item.downtime ? styles.blink : ""}`}
        style={{
          background: color.lightcolor,
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div className={styles.detailsDisplay}>
          <Card
            className={styles.actplancontainer}
            bodyStyle={{
              padding: "10px",
              height: "50%",
            }}
            style={{
              background: color.lightcolor,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <TbClockCheck style={{ fontSize: "16px", color: "#3b82f6" }} />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "roboto",
                  }}
                >
                  Actual
                </span>
              </div>
              <div
                style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}
              >
                {Number.isInteger(item?.actual)
                  ? item?.actual
                  : item?.actual % 1 === 0
                  ? Math.floor(item?.actual)
                  : item?.actual.toFixed(2)}
              </div>
            </div>

            <div
              style={{
                height: "1px",
                backgroundColor: "rgba(0, 0, 0, 0.06)",
                margin: "8px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <LuCalendarCheck style={{ fontSize: "16px", color: "green" }} />
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    fontFamily: "roboto",
                  }}
                >
                  Plan
                </span>
              </div>
              <div
                style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}
              >
                {Number.isInteger(item?.plan)
                  ? item?.plan
                  : item?.plan % 1 === 0
                  ? Math.floor(item?.plan)
                  : item?.plan.toFixed(2)}
              </div>
            </div>
          </Card>
          <Card
            className={styles.productionCard}
            styles={{
              body: {
                padding: "8px 10px 5px 8px",
                fontFamily: "roboto",
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                background: "#fff",
              },
            }}
          >
            <div className={styles.productionDetails}>
              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <FaRegClock
                    className={styles.productionIcon}
                    style={{ color: "#3b82f6" }}
                  />
                  <strong>Production Time</strong>
                </span>
                <span className={styles.productionItemvalue}>
                  :{" "}
                  <span
                    className={styles.timeValue}
                    style={{ color: "#3b82f6" }}
                  >
                    {String(Math.floor(item.productionTime / 3600)).padStart(
                      2,
                      "0"
                    )}
                    h{" "}
                    {String(
                      Math.floor((item.productionTime % 3600) / 60)
                    ).padStart(2, "0")}
                    m{" "}
                    {String(Math.floor(item.productionTime % 60)).padStart(
                      2,
                      "0"
                    )}
                    s
                  </span>
                </span>
              </p>
              {!activeTab.includes("operation") ? (
                <p className={styles.productionItem}>
                  <span className={`${styles.productionLabel}`}>
                    <AiOutlineSchedule
                      className={styles.productionIcon}
                      style={{ color: "#ef4444" }}
                    />
                    <strong>Planned Downtime</strong>
                  </span>
                  <span className={styles.productionItemvalue}>
                    <>
                      :{" "}
                      <span
                        className={styles.timeValue}
                        style={{ color: "#ef4444" }}
                      >
                        {String(
                          Math.floor(item.plannedDowntime / 3600)
                        ).padStart(2, "0")}
                        h{" "}
                        {String(
                          Math.floor((item.plannedDowntime % 3600) / 60)
                        ).padStart(2, "0")}
                        m{" "}
                        {String(Math.floor(item.plannedDowntime % 60)).padStart(
                          2,
                          "0"
                        )}
                        s
                      </span>
                    </>
                  </span>
                </p>
              ) : (
                <></>
              )}

              {!activeTab.includes("operation") ? (
                <p className={styles.productionItem}>
                  <span className={`${styles.productionLabel}`}>
                    <FaRegPauseCircle
                      className={styles.productionIcon}
                      style={{ color: "#ef4444" }}
                    />
                    <strong>Downtime</strong>
                  </span>
                  <span className={styles.productionItemvalue}>
                    :{" "}
                    <span
                      className={styles.timeValue}
                      style={{ color: "#ef4444" }}
                    >
                      {String(
                        Math.floor(item.downtimeDuration / 3600)
                      ).padStart(2, "0")}
                      h{" "}
                      {String(
                        Math.floor((item.downtimeDuration % 3600) / 60)
                      ).padStart(2, "0")}
                      m{" "}
                      {String(Math.floor(item.downtimeDuration % 60)).padStart(
                        2,
                        "0"
                      )}
                      s
                    </span>
                  </span>
                </p>
              ) : (
                <></>
              )}
              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <FaRegPlayCircle
                    className={styles.productionIcon}
                    style={{ color: "#22c55e" }}
                  />
                  <strong>Actual Time</strong>
                </span>
                <span className={styles.productionItemvalue}>
                  :{" "}
                  <span
                    className={styles.timeValue}
                    style={{ color: "#22c55e" }}
                  >
                    {String(Math.floor(item.actualTime / 3600)).padStart(
                      2,
                      "0"
                    )}
                    h{" "}
                    {String(Math.floor((item.actualTime % 3600) / 60)).padStart(
                      2,
                      "0"
                    )}
                    m{" "}
                    {String(Math.floor(item.actualTime % 60)).padStart(2, "0")}s
                  </span>
                </span>
              </p>
            </div>
          </Card>
        </div>
        <div className={styles.boxFull}>
          <div className={styles.qualityItem}>
            <span className={styles.qualityLabel}>Planned Cycle Time</span>
            <div className={styles.qualityValue}>
              <span>
                {String(
                  Math.floor((item?.plannedCycletime || 0) / 3600)
                ).padStart(2, "0")}
                h{" "}
                {String(
                  Math.floor(((item?.plannedCycletime || 0) % 3600) / 60)
                ).padStart(2, "0")}
                m{" "}
                {String(
                  Math.floor((item?.plannedCycletime || 0) % 60)
                ).padStart(2, "0")}
                s
              </span>
            </div>
          </div>
          <div className={styles.qualityItem}>
            <span className={styles.qualityLabel}>Actual Cycle Time</span>
            <div className={styles.qualityValue}>
              <span>
                {String(
                  Math.floor((item?.actualCycleTime || 0) / 3600)
                ).padStart(2, "0")}
                h{" "}
                {String(
                  Math.floor(((item?.actualCycleTime || 0) % 3600) / 60)
                ).padStart(2, "0")}
                m{" "}
                {String(Math.floor((item?.actualCycleTime || 0) % 60)).padStart(
                  2,
                  "0"
                )}
                s
              </span>
            </div>
          </div>
        </div>
        <div className={styles.boxFull}>
          {/* Removed the Rejection display */}
          {/* <div className={styles.cardLength}> */}
          <div className={styles.qualityItem}>
            <span className={styles.qualityLabel}>Good Quantity</span>
            <div className={styles.qualityValue}>
              <FaLongArrowAltUp
                style={{
                  color: "green",
                  marginRight: "4px",
                  fontSize: "11px",
                }}
              />
              <span style={{ color: "green" }}>{item.goodQualityCount}</span>
            </div>
          </div>
          <div className={styles.qualityItem}>
            <span className={styles.qualityLabel}>Rejections</span>
            <div className={styles.qualityValue}>
              <FaLongArrowAltDown
                style={{ color: "red", marginRight: "4px", fontSize: "11px" }}
              />
              <span style={{ color: "red" }}>{item.badQualityCount}</span>
            </div>
          </div>
          {/* </div> */}
        </div>
        <div className={styles.oeebox}>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>OEE</span>
            <div
              style={{ position: "relative", width: "60px", height: "60px" }}
            >
              <svg
                viewBox="0 0 36 36"
                style={{
                  transform: "rotate(-90deg)",
                  width: "100%",
                  height: "100%",
                }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={getColor(oee)}
                  strokeWidth="3"
                  strokeDasharray={`${oee} 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: getColor(oee),
                }}
              >
                {oee.toFixed(2).endsWith(".00")
                  ? Math.floor(oee)
                  : oee.toFixed(2)}
                %
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>Availability</span>
            <div
              style={{ position: "relative", width: "60px", height: "60px" }}
            >
              <svg
                viewBox="0 0 36 36"
                style={{
                  transform: "rotate(-90deg)",
                  width: "100%",
                  height: "100%",
                }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={getColor(item.availability)}
                  strokeWidth="3"
                  strokeDasharray={`${item.availability} 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: getColor(item.availability),
                }}
              >
                {item.availability.toFixed(2).endsWith(".00")
                  ? Math.floor(item.availability)
                  : item.availability.toFixed(2)}
                %
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>Performance</span>
            <div
              style={{ position: "relative", width: "60px", height: "60px" }}
            >
              <svg
                viewBox="0 0 36 36"
                style={{
                  transform: "rotate(-90deg)",
                  width: "100%",
                  height: "100%",
                }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={getColor(item.performance)}
                  strokeWidth="3"
                  strokeDasharray={`${item.performance} 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: getColor(item.performance),
                }}
              >
                {item.performance.toFixed(2).endsWith(".00")
                  ? Math.floor(item.performance)
                  : item.performance.toFixed(2)}
                %
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>Quality</span>
            <div
              style={{ position: "relative", width: "60px", height: "60px" }}
            >
              <svg
                viewBox="0 0 36 36"
                style={{
                  transform: "rotate(-90deg)",
                  width: "100%",
                  height: "100%",
                }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={getColor(item.quality)}
                  strokeWidth="3"
                  strokeDasharray={`${item.quality} 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: getColor(item.quality),
                }}
              >
                {item.quality.toFixed(2).endsWith(".00")
                  ? Math.floor(item.quality)
                  : item.quality.toFixed(2)}
                %
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default TileOee;
