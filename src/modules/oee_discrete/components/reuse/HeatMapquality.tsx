import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Tooltip, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFileSearch,
  AiOutlineFullscreen,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { FileSearchOutlined, FullscreenOutlined } from "@ant-design/icons";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { CloseOutlined } from "@mui/icons-material";
import NoDataFound from "./NoDataFound";

const { Title } = Typography;

const getColor = (tabkey: string) => {
  switch (tabkey) {
    case "availability":
      return ["#28a745", "#ffc107", "#dc3545"];
    case "quality":
      return ["#F44336", "#FFEB3B", "#4CAF50"];
    case "downtime":
      return ["#081d58", "#24409a", "#41b6c4", "#abdeb7"];
    case "performance":
      return ["#2E8B57", "#FFAE42", "#B22222"];
    case "oee":
      return ["#8B0000", "#FFD700", "#008000"];
    default:
      return ["#081d58", "#24409a", "#41b6c4", "#abdeb7"];
  }
};

const HeatmapQuality = ({
  data,
  xKey = "date",
  yKey = "resourceId",
  valueKey = "defects",
  title = "Quality Defects Heatmap",
  description = "Visualizes defect patterns across different resources and time periods",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem("activeTabIndex") || "quality";
  const echartsRef = useRef(null);
  const chartContainerRef = useRef(null);
  const { color } = useFilterContext();
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [resources, setResources] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");

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

  // Process data for the heatmap
  useEffect(() => {
    if (data && data.length > 0) {
      console.log("Processing data for heatmap:", data);

      // Extract unique resources using object keys to avoid Set
      const resourcesMap: Record<string, boolean> = {};
      data.forEach((item) => {
        const resource = item.resourceId;
        resourcesMap[resource] = true;
      });
      const uniqueResources = Object.keys(resourcesMap);
      setResources(uniqueResources);
      console.log("Unique resources:", uniqueResources);

      // Extract unique time slots using object keys
      const timeSlotsMap: Record<string, boolean> = {};
      data.forEach((item) => {
        const time = item.date;
        timeSlotsMap[time] = true;
      });
      const uniqueTimeSlots = Object.keys(timeSlotsMap).sort();
      setTimeSlots(uniqueTimeSlots);
      console.log("Unique time slots:", uniqueTimeSlots);

      // Create a map for quick lookup of values
      const dataMap = {};
      data.forEach((item) => {
        const resource = item.resourceId;
        const time = item.date;
        const value = parseFloat(item.defects);

        if (!dataMap[resource]) {
          dataMap[resource] = {};
        }

        dataMap[resource][time] = value;
      });

      // Generate data points for all resource/time combinations
      const processedData = [];
      uniqueResources.forEach((resource) => {
        uniqueTimeSlots.forEach((time) => {
          const value =
            dataMap[resource] && dataMap[resource][time] !== undefined
              ? dataMap[resource][time]
              : 0;

          processedData.push({
            value: [time, resource, value],
            originalX: time,
            originalY: resource,
            originalValue: value,
          });
        });
      });

      console.log("Processed heatmap data:", processedData);
      setHeatmapData(processedData);
    }
  }, [data]);

  // Find max value for visualMap configuration
  const maxDefectValue = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return 30;
    const max = Math.max(
      ...heatmapData.map((item) => parseFloat(item.originalValue) || 0)
    );
    console.log("Max defect value:", max);
    return max > 0 ? max : 30;
  }, [heatmapData]);

  const option = {
    grid: {
      top: 30,
      right: 80,
      bottom: 60,
      left: 180,
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
        const date = data.originalX;
        const resource = data.originalY;
        const defects = data.originalValue;

        // Format the date to be more readable
        let formattedDate = date;
        if (date && date.includes(" ")) {
          try {
            const [datePart, timePart] = date.split(" ");
            formattedDate = `${datePart} ${timePart}`;
          } catch (e) {
            formattedDate = date;
          }
        }

        return (
          `Time: ${formattedDate}<br/>` +
          `Resource: ${resource}<br/>` +
          `Defects: ${defects}`
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
      name: "Time",
      nameLocation: "middle",
      nameGap: 40,
      axisLabel: {
        fontSize: 12,
        interval: 0,
        rotate: 45,
        formatter: function (value) {
          if (value && value.includes(" ")) {
            // Format datetime string to more readable format
            try {
              const [datePart, timePart] = value.split(" ");
              return timePart; // Just display the time part
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
      max: maxDefectValue,
      calculable: true,
      orient: "vertical",
      right: 0,
      top: "center",
      color: getColor(tabkey),
      textStyle: {
        color: "#333",
      },
      formatter: function (value) {
        return value + " defects";
      },
    },
    series: [
      {
        name: "Defects",
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
            return value; // Show all values, including zeros
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
      .map((item) => parseFloat(item.originalValue))
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
        return "Displays quality defect metrics across time periods and resources. Red indicates high defect rates, while green shows areas with fewer quality issues.";
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
              {title || "Resource Quality Defects Heatmap"}
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
                  <strong>Graph Details:</strong> Analysis covers quality defect
                  metrics from {timeSlots[0] || "N/A"} to{" "}
                  {timeSlots[timeSlots.length - 1] || "N/A"}
                </p>
              </div>

              <Title level={5}>Quality Defect Thresholds</Title>
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
                        backgroundColor: "#4CAF50",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span>Low Defects: ≤ 10</span>
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
                        backgroundColor: "#FFEB3B",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span>Medium Defects: 10-30</span>
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
                        backgroundColor: "#F44336",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span>High Defects: {">"}30</span>
                  </div>
                </>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p>
                  <strong>Average Defects:</strong> {calculateAverage()}
                </p>
                <p>
                  <strong>Max Defects:</strong>{" "}
                  {Math.max(
                    ...heatmapData.map(
                      (item) => parseFloat(item.originalValue) || 0
                    )
                  )}
                </p>
                <p>
                  <strong>Total Resources:</strong> {resources.length}
                </p>
                <p>
                  <strong>Time Range:</strong>{" "}
                  {timeSlots.length > 0
                    ? `${timeSlots[0]} to ${timeSlots[timeSlots.length - 1]}`
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default HeatmapQuality;
