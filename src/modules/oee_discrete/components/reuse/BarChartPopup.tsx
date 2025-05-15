import React, { useEffect, useRef, useState, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFullscreen,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import NoDataFound from "./NoDataFound";
const { Title } = Typography;

interface DataPoint {
  [key: string]: number | string;
}

interface BarChartProps {
  data: DataPoint[];
  title: string;
  color: any;
  theshold: any;
  close?: boolean;
  unit?: string;
  description?: any;
  type?: any;
  onBarClick?: (xValue: string, yValue: number) => void;
  timebyperiod?: boolean;
  showXAxisLabel?: boolean;
}

// Move these helper functions outside component to prevent recreation
const getSeriesColor = (tabkey: any, color: any, theshold: any) => {
  switch (tabkey) {
    case "availability":
      return color;
    case "quality":
      return color;
    case "downtime":
      return color;
    case "performance":
      return color;
    case "oee":
      return color;
    default:
      return color;
  }
};

const getColor = (value, type, key, color, theshold) => {
  switch (type) {
    case "availability":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    case "quality":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    case "downtime":
      if (value > theshold?.[0]) return color?.[2];
      if (value > theshold?.[1]) return color?.[1];
      return color?.[0];
    case "performance":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    case "oee":
      if (value < theshold?.[0]) return color?.[2];
      if (value < theshold?.[1]) return color?.[1];
      return color?.[0];
    default:
      if (value < 50) return "#dc3545";
      if (value < 84) return "#ffc107";
      return "#28a745";
  }
};

// Create a stable chart options generator outside component
const createChartOptions = (
  data,
  tabkey,
  color,
  theshold,
  unit,
  isDownTime,
  timebyperiod,
  isFlip,
  showXAxisLabel = false
) => {
  if (!data || data.length === 0) return null;

  // Add null check for data[0]
  if (!data[0] || typeof data[0] !== "object") return null;

  const categoryKey = Object.keys(data[0]).find(
    (key) => typeof data[0][key] === "string"
  );
  const metricsKeys = Object.keys(data[0]).filter(
    (key) => key !== categoryKey && typeof data[0][key] === "number"
  );

  if (!categoryKey || metricsKeys.length === 0) return null;

  const xAxisData = data.map((item) => item[categoryKey]);

  const series = metricsKeys.map((metricKey) => ({
    name: metricKey,
    type: "bar",
    data: data.map((item) => {
      const value = Number(item[metricKey]);
      let itemColor;
      itemColor = getColor(value, tabkey, metricsKeys.length, color, theshold);
      if (metricsKeys.length === 1) {
        return {
          value,
          itemStyle: {
            color: itemColor,
          },
          label: {
            show: true,
            position: showXAxisLabel ? "top" : "insideBottom",
            distance: showXAxisLabel ? 10 : 15,
            formatter: function (params) {
              if (showXAxisLabel) {
                return `${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              } else {
                return `{name|${params.name}}  ${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              }
            },
            rich: !showXAxisLabel
              ? {
                  name: {
                    color: "#000",
                    fontSize: 10,
                    padding: [0, 0, 4, 0],
                    align: "left",
                  },
                  value: {
                    color: "#000",
                    fontSize: 10,
                    padding: [4, 0, 0, 0],
                    align: "left",
                  },
                }
              : undefined,
            fontSize: 12,
            color: "#000",
            rotate: showXAxisLabel ? 0 : 90,
            align: "left",
            verticalAlign: "middle",
          },
        };
      } else {
        return {
          value,
          label: {
            show: true,
            position: showXAxisLabel ? "top" : "insideBottom",
            distance: showXAxisLabel ? 10 : 15,
            formatter: function (params) {
              if (showXAxisLabel) {
                return `${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              } else {
                return `{name|${params.name}}  ${params.value}${
                  isDownTime ? " min" : unit === "count" ? "" : "%"
                }`;
              }
            },
            rich: !showXAxisLabel
              ? {
                  name: {
                    color: "#000",
                    fontSize: 10,
                    padding: [0, 0, 4, 0],
                    align: "left",
                  },
                  value: {
                    color: "#000",
                    fontSize: 10,
                    padding: [4, 0, 0, 0],
                    align: "left",
                  },
                }
              : undefined,
            fontSize: 12,
            color: "#000",
            rotate: showXAxisLabel ? 0 : 90,
            align: "left",
            verticalAlign: "middle",
          },
        };
      }
    }),
    colorBy: metricsKeys.length > 2 ? "series" : "data",
  }));

  return {
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: {
          show: true,
        },
      },
    },
    color: getSeriesColor(tabkey, color, theshold),
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        show: showXAxisLabel,
        interval: 0,
        rotate: 0,
        formatter: function (value) {
          if (value.length > 10) {
            return (
              value.substring(0, 6) + "..." + value.substring(value.length - 6)
            );
          }
          return value;
        },
        margin: 15,
        align: "center",
        verticalAlign: "middle",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          width: 1,
        },
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series,
    dataZoom: [
      {
        show: true,
        type: "slider",
        bottom: "bottom",
        height: "6%",
        start: 0,
        end: (25 / data.length) * 100,
      },
    ],
    // grid: {
    //   bottom: "20%",
    //   containLabel: true,
    //   left: "5%",
    //   right: "5%",
    // },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: function (params) {
        const param = params[0];
        // Show full resource ID in tooltip
        return `<strong>${param.name}</strong><br/>${param.seriesName}: ${
          param.value
        }${isDownTime ? " min" : unit === "count" ? "" : "%"}`;
      },
      textStyle: {
        fontSize: 12,
      },
    },
    legend:
      metricsKeys.length > 2
        ? {
            data: metricsKeys,
            bottom: "bottom",
          }
        : undefined,
    xAxisData,
    metricsKeys,
  };
};

const BarChartPopup = memo(
  ({
    data,
    title,
    color,
    close,
    theshold,
    unit,
    description,
    type,
    onBarClick,
    timebyperiod,
    showXAxisLabel = false,
  }: BarChartProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem("activeTabIndex");
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [barName, setBarName] = useState(null);
    const activeTabIndex = sessionStorage.getItem("activeTabIndex");
    const { setDowntimeOeeData } = useFilterContext();
    const isDownTime = activeTabIndex?.includes("downtime") ? true : false;

    // Store data reference for comparison
    const dataRef = useRef(data);
    // Store option in ref to prevent recomputation
    const optionRef = useRef(null);

    // Only recalculate options if data actually changes or if isFlip state changes
    if (
      !optionRef.current ||
      JSON.stringify(dataRef.current) !== JSON.stringify(data) ||
      optionRef.current.isFlip !== isFlip
    ) {
      dataRef.current = data;
      optionRef.current = createChartOptions(
        data,
        tabkey,
        color,
        theshold,
        unit,
        isDownTime,
        timebyperiod,
        isFlip,
        showXAxisLabel
      );
      if (optionRef.current) {
        optionRef.current.isFlip = isFlip; // Store current isFlip state
      }
    }

    useEffect(() => {
      if (type === "workcenter" && barName !== null) {
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeByMachinee: [],
        }));
      }
    }, [barName, type, setDowntimeOeeData]);

    // Handle resize events efficiently
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
    }, [isModalOpen, isFlip]);

    // Create a stable click handler using ref
    const clickHandlerRef = useRef((params) => {
      if (onBarClick) {
        onBarClick(params.name, params.value);
      }
      setBarName(params.name);
    });

    // Update the click handler reference if onBarClick changes
    useEffect(() => {
      clickHandlerRef.current = (params) => {
        if (onBarClick) {
          onBarClick(params.name, params.value);
        }
        setBarName(params.name);
      };
    }, [onBarClick]);

    const showDetail = () => {
      setIsFlip(true);
    };

    const handleClose = () => {
      setIsFlip(false);
      setDowntimeOeeData((prevData) => ({
        ...prevData,
        downtimeByMachinee: null,
      }));
    };

    // If we don't have valid options or data, show no data found
    if (!optionRef.current || data.length === 0) {
      return (
        <Card ref={chartContainerRef} title={title}>
          <NoDataFound />
        </Card>
      );
    }

    // Use stable events object to prevent re-renders
    const events = {
      click: clickHandlerRef.current,
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
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <AiOutlineFullscreen
                onClick={showDetail}
                style={{ fontSize: "20px" }}
              />
              {close && (
                <Button
                  type="text"
                  style={{ padding: 0, display: "flex", alignItems: "center" }}
                  icon={<AiOutlineClose style={{ fontSize: "20px" }} />}
                  onClick={handleClose}
                />
              )}
            </div>
          </div>
        }
      >
        <ReactECharts
          ref={echartsRef}
          option={optionRef.current}
          style={{ height: "calc(100vh - 305px)" }}
          onEvents={events}
          notMerge={true}
          lazyUpdate={true}
          shouldSetOption={(prevProps, currentProps) => {
            return (
              JSON.stringify(prevProps.option) !==
              JSON.stringify(currentProps.option)
            );
          }}
        />

        <Modal
          title={title}
          open={isModalOpen}
          centered
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width="100%"
        >
          <ReactECharts
            option={optionRef.current}
            style={{ height: "calc(100vh - 100px)", width: "100%" }}
            ref={echartsRef}
            notMerge={true}
            lazyUpdate={true}
            onEvents={events}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Button
                  type="text"
                  icon={<AiOutlineInfoCircle style={{ fontSize: "20px" }} />}
                  onClick={() => setOpen((prev) => !prev)}
                />
                <Button
                  type="text"
                  icon={<AiOutlineClose style={{ fontSize: "20px" }} />}
                  onClick={() => setIsFlip(false)}
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
              option={optionRef.current}
              ref={echartsRef}
              style={{
                height: "calc(100vh - 100px)",
                width: open ? "70%" : "100%",
                transition: "width 0.3s ease-in-out",
              }}
              notMerge={true}
              lazyUpdate={true}
              onEvents={events}
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
                  <p>
                    <strong>Range:</strong> {optionRef.current.xAxisData[0]} to{" "}
                    {
                      optionRef.current.xAxisData[
                        optionRef.current.xAxisData.length - 1
                      ]
                    }
                  </p>
                </div>

                <Title level={5}>Performance Thresholds</Title>
                <div style={{ marginBottom: "20px" }}>
                  {optionRef.current.metricsKeys.length > 1 ? (
                    <>
                      {optionRef.current.metricsKeys.map((metricKey, index) => (
                        <div
                          key={index}
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
                              backgroundColor: color?.[index],
                              marginRight: "10px",
                            }}
                          ></div>
                          <span>{metricKey}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {tabkey === "availability" && (
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
                                  backgroundColor: color?.[0],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Good: ≥ {theshold?.[1]}%</span>
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
                                  backgroundColor: color?.[1],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>
                                Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                  backgroundColor: color?.[2],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                            </div>
                          </>
                        </div>
                      )}
                      {tabkey === "quality" && (
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
                                  backgroundColor: color?.[0],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Good: ≥ {theshold?.[1]}%</span>
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
                                  backgroundColor: color?.[1],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>
                                Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                  backgroundColor: color?.[2],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                            </div>
                          </>
                        </div>
                      )}
                      {tabkey === "downtime" && (
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
                                  backgroundColor: color?.[0],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Good: ≤ {theshold?.[1]}%</span>
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
                                  backgroundColor: color?.[1],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>
                                Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                  backgroundColor: color?.[2],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Critical: &gt; {theshold?.[0]}%</span>
                            </div>
                          </>
                        </div>
                      )}
                      {tabkey === "performance" && (
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
                                  backgroundColor: color?.[0],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Good: ≥ {theshold?.[1]}%</span>
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
                                  backgroundColor: color?.[1],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>
                                Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                  backgroundColor: color?.[2],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Critical: &gt; {theshold?.[0]}%</span>
                            </div>
                          </>
                        </div>
                      )}
                      {tabkey === "oee" && (
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
                                  backgroundColor: color?.[0],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Good: ≥ {theshold?.[1]}%</span>
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
                                  backgroundColor: color?.[1],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>
                                Warning: {theshold?.[0]}-{theshold?.[1] - 1}%
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
                                  backgroundColor: color?.[2],
                                  marginRight: "10px",
                                }}
                              ></div>
                              <span>Critical: ≤ {theshold?.[0] - 1}%</span>
                            </div>
                          </>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Title level={5}>Statistics</Title>
                <div>
                  <p>
                    <strong>Average:</strong>{" "}
                    {(
                      data.reduce(
                        (acc, item) =>
                          acc +
                          (Number(item[optionRef.current.metricsKeys[0]]) || 0),
                        0
                      ) / data.length
                    ).toFixed(2)}
                    %
                  </p>
                  <p>
                    <strong>Highest Value:</strong>{" "}
                    {Math.max(
                      ...data.map(
                        (item) =>
                          Number(item[optionRef.current.metricsKeys[0]]) || 0
                      )
                    ).toFixed(2)}
                    %
                  </p>
                  <p>
                    <strong>Lowest Value:</strong>{" "}
                    {Math.min(
                      ...data.map(
                        (item) =>
                          Number(item[optionRef.current.metricsKeys[0]]) || 0
                      )
                    ).toFixed(2)}
                    %
                  </p>
                  <div style={{ marginTop: "15px" }}>
                    <p>
                      <strong>Graph Usage:</strong>
                    </p>
                    <ul style={{ paddingLeft: "20px" }}>
                      <li>
                        Click on legend items to show/hide specific metrics
                      </li>
                      <li>Hover over bars to see detailed values</li>
                      <li>Use the save icon to download the chart</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </Card>
    );
  }
);

// Add display name
BarChartPopup.displayName = "BarChartPopup";

export default BarChartPopup;
