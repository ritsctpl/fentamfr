import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Tooltip, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFileSearch,
  AiOutlineFullscreen,
} from "react-icons/ai";
import { FileSearchOutlined, FullscreenOutlined } from "@ant-design/icons";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { CloseOutlined } from "@mui/icons-material";
import NoDataFound from "./NoDataFound";

const { Title } = Typography;

const getColor = (tabkey: string) => {
  const defaultColors = ["#E74C3C", "#F39C12", "#2ECC71"];
  switch (tabkey) {
    case "availability":
      return defaultColors;
    case "quality":
      return defaultColors;
    case "downtime":
      return defaultColors;
    case "performance":
      return defaultColors;
    case "oee":
      return defaultColors;
    default:
      return defaultColors;
  }
};

const HeatmapDownTime = ({
  data,
  xKey,
  yKey,
  valueKey,
  title,
  description,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem("activeTabIndex");
  const echartsRef = useRef(null);
  const chartContainerRef = useRef(null);
  const { color } = useFilterContext();
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [resources, setResources] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const isDownTime = activeTabIndex?.includes("downtime") ? true : false;

  useEffect(() => {
    if (isModalOpen && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
    if (isFlip && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
  }, [isModalOpen, isFlip]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (echartsRef.current) {
        echartsRef.current.getEchartsInstance().resize();
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      if (chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
    };
  }, [data]);

  // Process time-based data format
  useEffect(() => {
    if (data && data.length > 0) {
      // Extract all resources (using resourceId instead of resource)
      const resourcesList = data.map((item) => item.resourceId);
      setResources(resourcesList);

      // Create a set of all time slots across all resources
      const allTimeSlots = new Set();
      data.forEach((item) => {
        if (item.downtime) {
          Object.keys(item.downtime).forEach((time) => {
            allTimeSlots.add(time);
          });
        }
      });

      // Convert set to array and sort by time
      const sortedTimeSlots = Array.from(allTimeSlots).sort();
      setTimeSlots(sortedTimeSlots);

      // Process data for heatmap with zeros for missing values
      const processedData = [];

      // Create a map for quick lookup of values
      const dataMap = {};

      // First, build a lookup map
      data.forEach((item) => {
        if (!dataMap[item.resourceId]) {
          dataMap[item.resourceId] = {};
        }

        if (item.downtime) {
          Object.entries(item.downtime).forEach(([time, value]) => {
            // Round the value to 2 decimal places
            dataMap[item.resourceId][time] = Number(value).toFixed(2);
          });
        }
      });

      // Then, generate data points for all resource/time combinations
      resourcesList.forEach((resource) => {
        sortedTimeSlots.forEach((time) => {
          const value =
            dataMap[resource] && dataMap[resource][time] !== undefined
              ? dataMap[resource][time]
              : 0;

          processedData.push({
            value: [time, resource, Number(value)],
            originalX: time,
            originalY: resource,
            originalValue: Number(value),
          });
        });
      });

      setHeatmapData(processedData);
    }
  }, [data]);

  const option = {
    grid: {
      top: 30,
      right: 80, // Increased right margin for visualMap
      bottom: 60,
      left: 180, // Increased left margin for wrapped resource labels
      containLabel: false,
    },
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: {
          show: true,
        },
      },
    },
    tooltip: {
      position: "top",
      formatter: (params) => {
        const { data } = params;
        return (
          `Time: ${data.originalX}<br/>` +
          `Resource: ${data.originalY}<br/>` +
          `Downtime: ${Number(data.originalValue).toFixed(2)} min`
        );
      },
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#ccc",
      borderWidth: 1,
      textStyle: {
        color: "#333",
      },
    },
    xAxis: {
      type: "category",
      data: timeSlots,
      name: "Hour of Day",
      nameLocation: "middle",
      nameGap: 40,
      axisLabel: {
        fontSize: 12,
        interval: 0,
        rotate: 45,
        formatter: function (value) {
          // Format ISO time string to more readable format
          if (value && value.includes("T")) {
            try {
              const parts = value.split("T");
              return parts[1]; // Just display the time part
            } catch (e) {
              return value;
            }
          }
          return value;
        },
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
      splitArea: {
        show: true,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#ddd",
          type: "dashed",
        },
      },
    },
    yAxis: {
      type: "category",
      data: resources,
      name: "Resource",
      nameLocation: "middle",
      nameGap: 160,
      axisLabel: {
        fontSize: 9,
        formatter: function (value) {
          // If the text is longer than 22 characters, add a newline
          if (value.length > 22) {
            // Find a good spot to break the text (near the middle)
            const breakPoint = Math.floor(value.length / 2);
            const searchStart = Math.max(0, breakPoint - 5);
            const searchEnd = Math.min(value.length, breakPoint + 5);

            // Look for underscore, space or dash near the middle to break text
            for (let i = searchStart; i < searchEnd; i++) {
              if (value[i] === "_" || value[i] === " " || value[i] === "-") {
                return (
                  value.substring(0, i + 1) + "\n" + value.substring(i + 1)
                );
              }
            }

            // If no good breaking point found, just break at the mid point
            return (
              value.substring(0, breakPoint) +
              "\n" +
              value.substring(breakPoint)
            );
          }
          return value;
        },
        margin: 16,
        align: "right",
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 30,
      calculable: true,
      orient: "vertical",
      right: 0,
      top: "center",
      color: getColor(tabkey),
      textStyle: {
        color: "#333",
      },
      formatter: function (value) {
        return Number(value).toFixed(2) + " min";
      },
    },
    series: [
      {
        name: "Downtime",
        type: "heatmap",
        data: heatmapData,
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          show: true,
          color: "#fcfcfc",
          fontSize: 12,
          fontWeight: "bold",
          formatter: function (params) {
            const value = params.data.originalValue;
            return Number(value).toFixed(2); // Round to 2 decimal places
          },
        },
      },
    ],
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  const calculateAverage = () => {
    if (!heatmapData || heatmapData.length === 0) return 0;
    const validValues = heatmapData
      .map((item) => Number(item.originalValue))
      .filter((val) => !isNaN(val));
    if (validValues.length === 0) return 0;
    return (
      validValues.reduce((acc, val) => acc + val, 0) / validValues.length
    ).toFixed(2);
  };

  const getThresholdDescriptions = () => {
    switch (tabkey) {
      case "availability":
        return "Shows machine availability patterns across different time periods and shifts. Higher values (green) indicate better equipment availability.";
      case "quality":
        return "Displays product quality metrics over time and shifts. Green areas represent high quality production, while red indicates quality issues.";
      case "downtime":
        return "Visualizes equipment downtime patterns. Green indicates minimal downtime, while red shows significant operational interruptions.";
      case "performance":
        return "Maps machine performance efficiency. Dark green represents optimal performance, while red indicates below-target performance levels.";
      case "oee":
        return "Overall Equipment Effectiveness combining availability, performance, and quality. Green shows high efficiency, red indicates improvement areas.";
      default:
        return "Displays operational metrics across time periods and shifts. Green indicates optimal conditions, while red shows areas needing attention.";
    }
  };

  return (
    <Card
      ref={chartContainerRef}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ margin: 0, fontFamily: "roboto", fontSize: "16px" }}>
            {title}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <AiOutlineFullscreen onClick={showDetail} />
            {/* {!isModalOpen && (
                            <Tooltip placement='topRight' title='FullScreen'>
                                <FullscreenOutlined onClick={showModal} />
                            </Tooltip>
                        )} */}
          </div>
        </div>
      }
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
      }}
    >
      {!data || data.length === 0 ? (
        <NoDataFound />
      ) : (
        <ReactECharts
          ref={echartsRef}
          option={option}
          style={{ height: "calc(100vh - 305px)" }}
        />
      )}

      <Modal
        title={title}
        open={isModalOpen}
        centered
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="100%"
      >
        <ReactECharts
          option={option}
          style={{ height: "calc(100vh - 100px)", width: "100%" }}
          ref={echartsRef}
        />
      </Modal>

      <Modal
        closable={false}
        open={isFlip}
        centered
        onCancel={() => setIsFlip(false)}
        footer={null}
        width="95%"
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: "500" }}>
              {title || "Hourly Downtime Heatmap for Top Resources"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button
                type="text"
                icon={<AiOutlineInfoCircle style={{ fontSize: "20px" }} />}
                onClick={() => setOpen((prev) => !prev)}
              />
              <Button
                type="text"
                icon={<CloseOutlined onClick={() => setIsFlip(false)} />}
              />
            </div>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <ReactECharts
            option={option}
            ref={echartsRef}
            style={{
              height: "calc(100vh - 100px)",
              width: open ? "70%" : "98%",
              transition: "width 0.3s ease-in-out",
            }}
          />
          {open && (
            <div
              style={{
                width: "30%",
                padding: "20px",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "all 0.3s ease-in-out",
                overflow: "hidden",
              }}
            >
              <Title level={5}>Graph Details</Title>
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Description:</strong>
                </p>
                <p>{description || getThresholdDescriptions()}</p>
                <p>
                  <strong>Graph Details:</strong> Analysis covers downtime
                  metrics from {timeSlots[0] || "N/A"} to{" "}
                  {timeSlots[timeSlots.length - 1] || "N/A"}
                </p>
              </div>

              <Title level={5}>Downtime Thresholds</Title>
              <div style={{ marginBottom: "20px" }}>
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#2ECC71",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span>Low Downtime: ≤ 5 min</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#F39C12",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span>Medium Downtime: 5-15 min</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#E74C3C",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span>Medium-High Downtime: 15-25 min</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#E74C3C",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span>High Downtime: ≥ 25 min</span>
                  </div>
                </>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p>
                  <strong>Average:</strong> {calculateAverage()} min
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default HeatmapDownTime;
