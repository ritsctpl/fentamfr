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
  convertmin?: boolean;
}

const ParetoChart: React.FC<ParetoChartProps> = ({
  data,
  title,
  color,
  description,
  threshold,
  convertmin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem("activeTabIndex");
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // const { color, colors } = useFilterContext()
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const activeTabIndex = sessionStorage.getItem("activeTabIndex");
  const isDownTime = activeTabIndex?.includes("downtime") ? true : false;
  // Early data validation
  const isDataValid = data && data.length > 0 && data[0];

  // Get color based on value and thresholds
  const getColorByValue = (value: number) => {
    // if (!color?.itemcolor || !color?.threshold) return "#F03652"; // default color

    // if (value >= color.threshold[1]) return color.itemcolor[2]; // Good
    // if (value >= color.threshold[0]) return color.itemcolor[1]; // Warning
    // return color.itemcolor[0]; // Critical
    return color.itemcolor[2];
  };

  // Dynamically find the keys for category, occurrence, and percentage
  const getDataKeys = (dataItem: DataPoint) => {
    const keys = Object.keys(dataItem);
    const categoryKey =
      keys.find((key) => typeof dataItem[key] === "string") || "";
    const numberKeys = keys.filter((key) => typeof dataItem[key] === "number");
    const occurrenceKey =
      numberKeys.find((key) => !key.toLowerCase().includes("percentage")) ||
      numberKeys[0] ||
      "";
    const percentageKey =
      numberKeys.find((key) => key.toLowerCase().includes("percentage")) ||
      numberKeys[1] ||
      "";

    return { categoryKey, occurrenceKey, percentageKey };
  };

  const { categoryKey, occurrenceKey, percentageKey } = isDataValid
    ? getDataKeys(data[0])
    : { categoryKey: "", occurrenceKey: "", percentageKey: "" };

  // Sort data by occurrence value
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => b[occurrenceKey] - a[occurrenceKey])
    : [];

  const maxOccurrence = Math.max(
    ...sortedData.map((item) => item[occurrenceKey])
  );
  const yAxisMax = Math.ceil(maxOccurrence / 10) * 10;
  const totalOccurrence = sortedData.reduce(
    (acc, item) => acc + item[occurrenceKey],
    0
  );

  const sortedDataWithCumulativePercentage = sortedData.map((item, index) => {
    const cumulativeOccurrence = sortedData
      .slice(0, index + 1)
      .reduce((acc, curr) => acc + curr[occurrenceKey], 0);
    return {
      ...item,
      cumulativePercentage: (cumulativeOccurrence / totalOccurrence) * 100,
    };
  });
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params) => {
        if (!convertmin) return;
        return params
          .map((param) => {
            const value = param.value;
            const convertedValue =
              param.seriesType === "bar" ? (value / 60).toFixed(2) : value;
            return `${param.seriesName}: ${convertedValue}${
              param.seriesType === "bar" ? " min" : "%"
            }`;
          })
          .join("<br/>");
      },
    },
    legend: {
      data: [
        {
          name: occurrenceKey,
          itemStyle: {
            color: getColorByValue(maxOccurrence),
          },
        },
        {
          name: percentageKey,
          itemStyle: {
            color: color?.linecolor?.[0] || "#ff0000",
          },
        },
      ],
      bottom: "bottom",
    },
    dataZoom: [
      {
        type: "slider",
        show: true,
        start: 0,
        end: sortedData.length > 5 ? (5 / sortedData.length) * 100 : 100,
        bottom: 50,
        height: 20,
      },
      {
        type: "inside",
        start: 0,
        end: sortedData.length > 5 ? (5 / sortedData.length) * 100 : 100,
      },
    ],
    grid: {
      left: "10%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: sortedData.map((item) => item[categoryKey]),
        axisLabel: {
          rotate: sortedData.length > 5 ? 25 : 0,
          interval: 0,
          textStyle: {
            fontSize: 9,
          },
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: occurrenceKey,
        min: 0,
        max: threshold?.max || undefined,
        interval: yAxisMax / 5,
        axisLabel: {
          formatter: convertmin
            ? (value: any) => (value / 60)?.toFixed(2)
            : "{value}",
        },
      },
      {
        type: "value",
        name: percentageKey,
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: "{value}%",
        },
      },
    ],
    series: [
      {
        name: occurrenceKey,
        type: "bar",
        data: sortedData.map((item) => item[occurrenceKey]),
        itemStyle: {
          color: (params) => {
            const currentValue = sortedData[params.dataIndex][occurrenceKey];
            return getColorByValue(currentValue);
          },
        },
        colorBy: "data",
        label: {
          show: true,
          position: "top",
          formatter: convertmin
            ? (params) => (params?.value / 60).toFixed(2)
            : "{c}",
          fontSize: 12,
        },
      },
      {
        name: percentageKey,
        type: "line",
        yAxisIndex: 1,
        data: sortedData.map((item) => item[percentageKey]),
        itemStyle: {
          color: color?.linecolor?.[0] || "#ff0000",
        },
        lineStyle: {
          color: color?.linecolor?.[0] || "#ff0000",
          width: 2,
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c}%",
          fontSize: 12,
        },
      },
    ],
  };

  // Create modal option with more dataZoom range
  const modalOption = {
    ...option,
    dataZoom: [
      {
        type: "slider",
        show: true,
        start: 0,
        end: sortedData.length > 10 ? (10 / sortedData.length) * 100 : 100,
        bottom: 50,
        height: 20,
      },
      {
        type: "inside",
        start: 0,
        end: sortedData.length > 10 ? (10 / sortedData.length) * 100 : 100,
      },
    ],
  };

  // Create fullscreen option with full range
  const fullOption = {
    ...option,
    dataZoom: [
      {
        type: "slider",
        show: true,
        start: 0,
        end: 100,
        bottom: 50,
        height: 20,
      },
      {
        type: "inside",
        start: 0,
        end: 100,
      },
    ],
  };

  useEffect(() => {
    const handleResize = () => {
      if (echartsRef.current) {
        const chart = echartsRef.current.getEchartsInstance();
        if (chart) {
          setTimeout(() => chart.resize(), 0);
        }
      }
    };

    if (isModalOpen || isFlip) {
      handleResize();
    }

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(handleResize);
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
    };
  }, [isModalOpen, isFlip, data]);

  useEffect(() => {
    if (isModalOpen && echartsRef.current) {
      const chart = echartsRef.current.getEchartsInstance();
      setTimeout(() => {
        chart.setOption(option);
        chart.resize();
      }, 100);
    }
  }, [isModalOpen]);

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  return (
    <Card
      ref={chartContainerRef}
      // style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
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
      {data.length === 0 ? (
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
          option={modalOption}
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
            option={fullOption}
            ref={echartsRef}
            style={{
              height: "calc(100vh - 100px)",
              width: open ? "70%" : "100%",
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
                <p>{description}</p>
              </div>

              <Title level={5}>Chart Information</Title>
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Total Categories:</strong> {sortedData.length}
                </p>
                <p>
                  <strong>Highest Value:</strong>{" "}
                  {Math.max(...data.map((item) => item[occurrenceKey])).toFixed(
                    2
                  )}
                </p>
                <p>
                  <strong>Lowest Value:</strong>{" "}
                  {Math.min(...data.map((item) => item[occurrenceKey])).toFixed(
                    2
                  )}
                </p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
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
                        backgroundColor:
                          color?.itemcolor?.[2] || getColor(85, tabkey, color),
                        marginRight: "10px",
                      }}
                    ></div>
                    <span>Good: ≥ {color?.threshold?.[1] || 85}%</span>
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
                        backgroundColor:
                          color?.itemcolor?.[1] || getColor(60, tabkey, color),
                        marginRight: "10px",
                      }}
                    ></div>
                    <span>
                      Warning: {color?.threshold?.[0] || 50}-
                      {color?.threshold?.[1] - 1 || 84}%
                    </span>
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
                        backgroundColor:
                          color?.itemcolor?.[0] || getColor(40, tabkey, color),
                        marginRight: "10px",
                      }}
                    ></div>
                    <span>Critical: ≤ {color?.threshold?.[0] - 1 || 50}%</span>
                  </div>
                </>
              </div>
              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Graph Usage:</strong>
                </p>
                <ul style={{ paddingLeft: "20px" }}>
                  <li>Click on legend items to show/hide specific metrics</li>
                  <li>Hover over bars to see detailed values</li>
                  <li>Use the zoom slider to focus on specific data points</li>
                  <li>Use the save icon to download the chart</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default ParetoChart;
