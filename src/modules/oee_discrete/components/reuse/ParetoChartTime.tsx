import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography, Tooltip, Modal, Button } from "antd";

import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { getColor } from "./LineChart";
import {
  AiOutlineInfoCircle,
  AiOutlineFullscreen,
  AiOutlineClose,
} from "react-icons/ai";
import NoDataFound from "./NoDataFound";

const { Title } = Typography;

interface DataPoint {
  [key: string]: any;
}

interface ParetoChartProps {
  data: DataPoint[];
  title: string;
  color: {
    itemcolor?: string[];
    threshold?: number[];
    linecolor?: string[];
  };
  description?: any;
  threshold?: any;
  keyMappings?: {
    xAxis?: string;
    leftYaxis?: string;
    rightYaxis?: string;
  };
}

const ParetoChartTime: React.FC<ParetoChartProps> = ({
  data,
  title,
  color,
  description,
  threshold,
  keyMappings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem("activeTabIndex");
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const isDownTime = activeTabIndex?.includes("downtime") ? true : false;

  // Get key mappings with defaults
  const xAxisKey = keyMappings?.xAxis || "resourceId";
  const leftYaxisKey = keyMappings?.leftYaxis || "downtimeDuration";
  const rightYaxisKey = keyMappings?.rightYaxis || "occurredAt";

  // Early data validation
  const isDataValid = data && data.length > 0 && data[0];

  // Get color based on value and thresholds
  const getColorByValue = (value: number) => {
    return color?.itemcolor?.[0] || "#4F95FF"; // Default blue color for bars
  };

  // Format display name from key
  const formatKeyName = (key: string) => {
    if (!key) return "";

    // Special case handling for common keys
    if (key === "downtimeDuration") return "Downtime (min)";
    if (key === "resourceId") return "Resource";
    if (key === "occurredAt") return "Time";

    // Generic formatting: capitalize and add spaces
    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  // Prepare data for chart
  const prepareChartData = (data: DataPoint[]) => {
    // Sort data by left y-axis value in descending order
    const sortedData = [...data].sort(
      (a, b) => (b[leftYaxisKey] || 0) - (a[leftYaxisKey] || 0)
    );

    // Calculate cumulative value
    let cumulativeValue = 0;
    const cumulativeData = sortedData.map((item) => {
      cumulativeValue += item[leftYaxisKey] || 0;
      return {
        ...item,
        cumulativeValue,
      };
    });

    return cumulativeData;
  };

  const preparedData = isDataValid ? prepareChartData(data) : [];

  const maxValue = Math.max(
    ...preparedData.map((item) => item[leftYaxisKey] || 0)
  );
  const yAxisMax = Math.ceil(maxValue / 10) * 10;

  // Convert time strings (HH:MM) to total minutes for proper line display
  const convertTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num, 10));
    return hours * 60 + minutes;
  };

  // Extract actual time values from the data
  const extractTimeValues = () => {
    if (!preparedData || preparedData.length === 0)
      return ["10:00", "10:30", "11:00", "11:45"];

    // Get all unique time values from the data
    const times = preparedData
      .map((item) => {
        const timeValue = item[rightYaxisKey] || "";
        // Check if the value is in ISO date format
        if (
          timeValue &&
          typeof timeValue === "string" &&
          timeValue.includes("T")
        ) {
          try {
            const date = new Date(timeValue);
            // Extract only the time part (HH:MM)
            return `${date.getHours().toString().padStart(2, "0")}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
          } catch (e) {
            return timeValue;
          }
        }
        return timeValue;
      })
      .filter(Boolean);

    if (times.length === 0) return ["10:00", "10:30", "11:00", "11:45"];

    // Create a Set of times and convert back to array to get unique values
    const uniqueTimes = Array.from(new Set(times));

    // Sort times chronologically
    return uniqueTimes.sort((a, b) => {
      return convertTimeToMinutes(a) - convertTimeToMinutes(b);
    });
  };

  // Use actual times from data
  const timeValues = extractTimeValues();

  // Create a mapping between time values and their position on the axis
  const timeToAxisPosition = {};
  timeValues.forEach((time, index) => {
    timeToAxisPosition[time] = index;
  });

  // Calculate time positions for line chart
  const timeMapping = preparedData.map((item) => {
    const time = item[rightYaxisKey] || "";
    // Return the position on the axis for this time
    return time ? timeToAxisPosition[time] : null;
  });

  // Format left y-axis values
  const formatLeftYValue = (value: number) => {
    // If dealing with minutes or duration, add "min" suffix
    if (
      leftYaxisKey.toLowerCase().includes("duration") ||
      leftYaxisKey.toLowerCase().includes("minute")
    ) {
      return `${value} min`;
    }
    return value.toString();
  };

  const formatTimeForTooltip = (timeStr: string) => {
    if (!timeStr) return "";

    // Check if the value is in ISO date format
    if (timeStr.includes("T")) {
      try {
        const date = new Date(timeStr);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${hours}:${minutes} ${day}-${month}-${year}`;
      } catch (e) {
        return timeStr;
      }
    }
    return timeStr;
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: function (params) {
        const barData = params.find((p) => p.seriesType === "bar");

        if (barData) {
          const itemIndex = barData.dataIndex;
          const xValue = preparedData[itemIndex]?.[xAxisKey] || "";
          const leftYValue = preparedData[itemIndex]?.[leftYaxisKey] || 0;
          const rightYValue = preparedData[itemIndex]?.[rightYaxisKey] || "";

          // Format date-time for tooltip display
          const formattedTime = formatTimeForTooltip(rightYValue);

          return `${xValue}<br/>
                  ${formatKeyName(leftYaxisKey)}: ${formatLeftYValue(
            leftYValue
          )}<br/>
                  ${formatKeyName(rightYaxisKey)}: ${formattedTime}`;
        }
        return "";
      },
    },
    legend: {
      data: [
        {
          name: formatKeyName(leftYaxisKey),
          itemStyle: {
            color: "#4F95FF",
          },
        },
        {
          name: formatKeyName(rightYaxisKey),
          itemStyle: {
            color: "#e74c3c",
          },
        },
      ],
      bottom: "bottom",
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    dataZoom: [
      {
        show: true,
        type: "slider",
        bottom: "2%",
        height: "6%",
        start: 0,
        end: (function () {
          // Calculate percentage to show
          const itemCount = data?.length;
          if (itemCount <= 10) {
            return 100; // Show all if 10 or fewer items
          } else {
            // Show first 10 items in normal view, 5 items in flipped view
            return isFlip ? (9 / itemCount) * 100 : (4 / itemCount) * 100;
          }
        })(),
      },
    ],
    xAxis: [
      {
        type: "category",
        data: preparedData.map((item) => item[xAxisKey] || ""),
        axisLabel: {
          rotate: preparedData.length > 5 ? 25 : 0,
          interval: 0,
          textStyle: {
            fontSize: 11,
          },
        },
        axisLine: {
          lineStyle: {
            color: "grey",
          },
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: formatKeyName(leftYaxisKey),
        min: 0,
        max: threshold?.max || undefined,
        interval: yAxisMax / 6,
        axisLabel: {
          formatter: "{value}",
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#ddd",
          },
        },
        axisPointer: {
          label: {
            show: false,
          },
        },
      },
      {
        type: "value",
        name: formatKeyName(rightYaxisKey),
        axisLabel: {
          formatter: function (value) {
            const index = Math.round(value);
            return index >= 0 && index < timeValues.length
              ? timeValues[index]
              : "";
          },
          show: true,
          fontSize: 11,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e74c3c",
          },
        },
        splitLine: {
          show: false,
        },
        position: "right",
        offset: 0,
        nameTextStyle: {
          color: "#e74c3c",
          align: "right",
          verticalAlign: "top",
        },
        min: 0,
        max: timeValues.length - 1,
        interval: 1,
        axisPointer: {
          label: {
            show: false,
          },
        },
      },
    ],
    series: [
      {
        name: formatKeyName(leftYaxisKey),
        type: "bar",
        data: preparedData.map((item) => item[leftYaxisKey] || 0),
        barWidth: "40%",
        itemStyle: {
          color: "#4F95FF",
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          fontSize: 12,
        },
        emphasis: {
          itemStyle: {
            color: "#5DA0FF",
          },
        },
      },
      {
        name: formatKeyName(rightYaxisKey),
        type: "line",
        yAxisIndex: 1,
        data: preparedData.map((item, index) => {
          // Extract and format time from ISO date string if needed
          const rawTime = item[rightYaxisKey] || "";
          let time = rawTime;

          if (typeof rawTime === "string" && rawTime.includes("T")) {
            try {
              const date = new Date(rawTime);
              time = `${date.getHours().toString().padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;
            } catch (e) {
              time = rawTime;
            }
          }

          if (time && timeToAxisPosition[time] !== undefined) {
            return timeToAxisPosition[time];
          }

          // Fallback to proportional positioning
          return (index / (preparedData.length - 1)) * (timeValues.length - 1);
        }),
        itemStyle: {
          color: "#e74c3c",
        },
        lineStyle: {
          color: "#e74c3c",
          width: 2,
          cap: "round",
          join: "round",
          shadowColor: "rgba(231, 76, 60, 0.3)",
          shadowBlur: 3,
        },
        label: {
          show: false,
        },
        symbol: "circle",
        symbolSize: 8,
        smooth: true,
        connectNulls: true,
        tooltip: {
          show: false,
        },
        emphasis: {
          label: {
            show: false,
          },
          itemStyle: {
            color: "#e74c3c",
            borderColor: "#fff",
            borderWidth: 2,
            shadowColor: "rgba(231, 76, 60, 0.5)",
            shadowBlur: 5,
          },
        },
        axisPointer: {
          label: {
            show: false,
            formatter: " ",
          },
        },
      },
    ],
    axisPointer: {
      link: {
        xAxisIndex: "all",
      },
      label: {
        show: false,
      },
    },
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  // Fix for first-time fullscreen display issue
  useEffect(() => {
    if (isFlip && echartsRef.current) {
      setTimeout(() => {
        echartsRef.current?.getEchartsInstance().resize();
      }, 300);
    }
  }, [isFlip]);

  // Resize chart when window size changes
  useEffect(() => {
    const handleResize = () => {
      if (echartsRef.current) {
        echartsRef.current.getEchartsInstance().resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    >
      {data?.length === 0 ? (
        <NoDataFound />
      ) : (
        <ReactECharts
          ref={echartsRef}
          option={option}
          style={{ height: "calc(100vh - 305px)" }}
          notMerge={true}
          lazyUpdate={false}
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
          notMerge={true}
          lazyUpdate={false}
        />
      </Modal>

      <Modal
        closable={false}
        open={isFlip}
        centered
        onCancel={() => setIsFlip(false)}
        footer={null}
        width="100%"
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{title}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button
                type="text"
                icon={<AiOutlineInfoCircle style={{ fontSize: "20px" }} />}
                onClick={() => setOpen((prev) => !prev)}
              />
              <Button
                type="text"
                icon={
                  <AiOutlineClose
                    style={{ fontSize: "20px" }}
                    onClick={() => setIsFlip(false)}
                  />
                }
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
              width: open ? "70%" : "100%",
              transition: "width 0.3s ease-in-out",
            }}
            notMerge={true}
            lazyUpdate={false}
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
                <p>{description}</p>
              </div>

              <Title level={5}>Chart Information</Title>
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Total Resources:</strong> {preparedData.length}
                </p>
                <p>
                  <strong>Highest Value:</strong>{" "}
                  {Math.max(
                    ...data.map((item) => item[leftYaxisKey] || 0)
                  ).toFixed(2)}
                  {leftYaxisKey.toLowerCase().includes("duration")
                    ? " min"
                    : ""}
                </p>
                <p>
                  <strong>Lowest Value:</strong>{" "}
                  {Math.min(
                    ...data.map((item) => item[leftYaxisKey] || 0)
                  ).toFixed(2)}
                  {leftYaxisKey.toLowerCase().includes("duration")
                    ? " min"
                    : ""}
                </p>
              </div>

              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Graph Usage:</strong>
                </p>
                <ul style={{ paddingLeft: "20px" }}>
                  <li>
                    Use the slider at the bottom to zoom in on specific sections
                  </li>
                  <li>Click on legend items to show/hide specific metrics</li>
                  <li>Hover over bars to see detailed values</li>
                  <li>
                    The line shows the{" "}
                    {formatKeyName(rightYaxisKey).toLowerCase()} progression
                  </li>
                  <li>
                    Blue bars represent{" "}
                    {formatKeyName(leftYaxisKey).toLowerCase()}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default ParetoChartTime;
