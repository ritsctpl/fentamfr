import { MdFactory } from "react-icons/md";
import React, { useState } from "react";
import styles from "./tileOee.module.css";

import { FaLongArrowAltDown, FaLongArrowAltUp, FaRegPauseCircle, FaRegPlayCircle, FaRegClock } from "react-icons/fa";
import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import { AiOutlineInfoCircle, AiOutlineSchedule } from 'react-icons/ai';
import { Card, Tooltip } from "antd";

interface OEEData {
  oee?: number;
  availability?: number;
  quality?: number;
  performance?: number;
  label?: string;
  label2?: string;
  actual?: number;
  plan?: number;
  downtime?: boolean;
  goodqualitycount?: number;
  badqualitycount?: number;
  plannedcycletime?: number;
  actualcycletime?: number;
  productiontime?: number;
  actualtime?: number;
  downtimeduration?: number;
  planneddowntime?: number;
  unplanneddowntime?: number;
  downtimereasons?: string | null;
}

interface TileOeeProps {
  data: OEEData;
}

const TileOee: React.FC<TileOeeProps> = ({ data }) => {
  const { oee } = data;
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const [activeTab, setActiveTab] = useState(activeTabIndex);

  const getColor = (value: number) => {
    if (value < 50) return "#dc3545";
    if (value < 84) return "#ffc107";
    return "#28a745";
  };

  // const handleTitle = () => {
  //   if (activeTab.includes("filter") || activeTab.includes("plant")) {
  //     console.log("oee");

  //     return item.site;
  //   } else if (activeTab.includes("batch")) {
  //     console.log("batch");
  //     return item.batchNo;
  //   } else if (activeTab.includes("resource")) {
  //     console.log("resource");
  //     return item.resource;
  //   }
  // };

  console.log(data, "item");

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(secs).padStart(2, "0")
    };
  };

  return (
    <>
      <Card
        size="small"
        title={
          <div className={styles.cardTitle}>
            <div className={styles.resourceName}>
              <MdFactory className={styles.resourceIcon} />
              <span className={styles.resourceText}>{data?.label}</span>
              {/* <span className={styles.resourceText}>{activeTab?.includes('plant') ? item.site :activeTab?.includes('batch')?item.batchNo:item.resource}</span> */}
            </div>
            <span className={styles.itemName}>{data?.label2}</span>



            <span>
              <Tooltip
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span><strong>Downtime:</strong> {data.downtime ? "Inactive" : "Active"}</span>
                    <span><strong>Reasons:</strong> {
                      data.downtime ?
                        (data?.downtimereasons && typeof data?.downtimereasons === 'object'
                          ? Object.entries(data?.downtimereasons).map(([key, value]) => `${key}: ${value}`).join(', ')
                          : data?.downtimereasons || 'No reasons provided')
                        : 'Unknown'
                    }</span>


                  </div>
                }
              >
                <AiOutlineInfoCircle style={{
                  color: '#fff!important', borderRadius: '50%', padding: '2px', fontSize: '20px'
                }} />
              </Tooltip>
            </span>
          </div>


        }
        className={`${styles.mainCard} ${data?.downtime ? styles.blink : ''}`}
        style={{
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className={styles.detailsDisplay}>
          <Card
            className={styles.productionCard}
            styles={{
              body: {
                padding: "8px 10px 5px 8px",
                fontFamily: "roboto",
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
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
                  <strong>Prod-Time</strong>
                </span>
                <span className={styles.productionItemvalue}>
                  :{" "}
                  <span
                    className={styles.timeValue}
                    style={{ color: "#3b82f6" }}
                  >
                    {formatTime(data?.productiontime || 0).hours}h{" "}
                    {formatTime(data?.productiontime || 0).minutes}m{" "}
                    {formatTime(data?.productiontime || 0).seconds}s
                  </span>
                </span>
              </p>
              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <AiOutlineSchedule
                    className={styles.productionIcon}
                    style={{ color: "#ef4444" }}
                  />
                  <strong>PD-Time</strong>
                </span>
                <span className={styles.productionItemvalue}>
                  :{" "}
                  <span
                    className={styles.timeValue}
                    style={{ color: "#ef4444" }}
                  >
                    {formatTime(data?.planneddowntime || 0).hours}h{" "}
                    {formatTime(data?.planneddowntime || 0).minutes}m{" "}
                    {formatTime(data?.planneddowntime || 0).seconds}s
                  </span>
                </span>
              </p>

              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <FaRegPauseCircle
                    className={styles.productionIcon}
                    style={{ color: "#ef4444" }}
                  />
                  <strong>D-Time</strong>
                </span>
                <span className={styles.productionItemvalue}>
                  :{" "}
                  <span
                    className={styles.timeValue}
                    style={{ color: "#ef4444" }}
                  >
                    {formatTime(data?.downtimeduration || 0).hours}h{" "}
                    {formatTime(data?.downtimeduration || 0).minutes}m{" "}
                    {formatTime(data?.downtimeduration || 0).seconds}s
                  </span>
                </span>
              </p>
              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <FaRegPlayCircle
                    className={styles.productionIcon}
                    style={{ color: "#22c55e" }}
                  />
                  <strong>Act-Time</strong>
                </span>
                <span className={styles.productionItemvalue}>
                  :{" "}
                  <span
                    className={styles.timeValue}
                    style={{ color: "#22c55e" }}
                  >
                    {formatTime(data?.actualtime || 0).hours}h{" "}
                    {formatTime(data?.actualtime || 0).minutes}m{" "}
                    {formatTime(data?.actualtime || 0).seconds}s
                  </span>
                </span>
              </p>

            </div>
          </Card>
          <Card
            className={styles.actualCard}
            style={{
              fontFamily: "roboto",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
            }}
          >
            <div className={styles.actualPlanContainer}>
              <span className={styles.actualLabel}>Actual</span>
              <span className={styles.actualPlanValue}>{data?.actual}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.actualPlanContainer}>
              <span className={styles.actualPlanValue}>{data?.plan}</span>
              <span className={styles.planLabel}>Plan</span>
            </div>
          </Card>
        </div>
        <div className={styles.boxFull}>

          <div className={styles.qualityItem}>
            <span className={styles.qualityLabel}>Planned Cycle Time</span>
            <div className={styles.qualityValue}>
              <span>
                {formatTime(data?.plannedcycletime || 0).hours}h{' '}
                {formatTime(data?.plannedcycletime || 0).minutes}m{' '}
                {formatTime(data?.plannedcycletime || 0).seconds}s
              </span>
            </div>
          </div>
          <div className={styles.qualityItem}>
            <span className={styles.qualityLabel}>Actual Cycle Time</span>
            <div className={styles.qualityValue}>
              <span>
                {formatTime(data?.actualcycletime || 0).hours}h{' '}
                {formatTime(data?.actualcycletime || 0).minutes}m{' '}
                {formatTime(data?.actualcycletime || 0).seconds}s
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
              <span style={{ color: "green" }}>{data?.goodqualitycount}</span>
            </div>
          </div>
          <div className={styles.qualityItem}>
            <span className={styles.qualityLabel}>
              Bad Quantity & Rejections
            </span>
            <div className={styles.qualityValue}>
              <FaLongArrowAltDown
                style={{ color: "red", marginRight: "4px", fontSize: "11px" }}
              />
              <span style={{ color: "red" }}>{data?.badqualitycount}</span>
            </div>
          </div>
          {/* </div> */}
        </div>
        <div className={styles.oeebox} >
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
                {oee?.toFixed(2).endsWith(".00")
                  ? Math.floor(oee)
                  : oee?.toFixed(2)}
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
                  stroke={getColor(data?.availability)}
                  strokeWidth="3"
                  strokeDasharray={`${data?.availability} 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: getColor(data?.availability),
                }}
              >
                {data?.availability?.toFixed(2).endsWith(".00")
                  ? Math.floor(data?.availability)
                  : data?.availability?.toFixed(2)}
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
                  stroke={getColor(data?.performance)}
                  strokeWidth="3"
                  strokeDasharray={`${data?.performance} 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: getColor(data?.performance),
                }}
              >
                {data?.performance?.toFixed(2).endsWith(".00")
                  ? Math.floor(data?.performance)
                  : data?.performance?.toFixed(2)}
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
                  stroke={getColor(data?.quality)}
                  strokeWidth="3"
                  strokeDasharray={`${data?.quality} 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: getColor(data?.quality),
                }}
              >
                {data?.quality?.toFixed(2).endsWith(".00")
                  ? Math.floor(data?.quality)
                  : data?.quality?.toFixed(2)}
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
