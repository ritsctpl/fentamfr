import React, { useEffect, useRef, useState, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFullscreen,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { BsBarChart } from "react-icons/bs";
import NoDataScreen from "../components/NoData";
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

const getColor = (value) => {
  if (value >= 80) return "#28a745"; // green
  if (value >= 60) return "#ffc107"; // orange
  return "#dc3545"; // red
};

// Create a stable chart options generator outside component
const createChartOptions = (
  data,
  unit,
  isDownTime,
  timebyperiod,
  isFlip,
  showXAxisLabel
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
    barWidth: "45%",
    animation: false, // Disable animation to prevent blinking
    data: data.map((item) => {
      const value = Number(item[metricKey]);
      return {
        value,
        itemStyle: {
          color: getColor(value),
        },
        label: {
          show: true,
          position: showXAxisLabel ? "top" : "insideBottom",
          distance: showXAxisLabel ? 10 : 15,
          formatter: function (params) {
            if (showXAxisLabel) {
              return `${params.value}${
               "%"
              }`;
            } else {
              return [
                `{name|${params.name}}`,
                `{value|${params.value}${
                  "%"
                }}`,
              ].join("\n");
            }
          },
          rich: !showXAxisLabel
            ? {
                name: {
                  color: "#000",
                  fontSize: 12,
                  padding: [0, 0, 4, 0],
                  align: "left",
                },
                value: {
                  color: "#000",
                  fontSize: 12,
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
    }),
  }));

  return {
    animation: false, // Disable animation for the entire chart
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: {
          show: true,
        },
      },
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        show: showXAxisLabel,
        interval: 0,
        rotate: 0,
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
        bottom: "5%",
        height: "3%",
        start: 0,
        end: (function () {
          const itemCount = data.length;
          if (itemCount <= 10) return 100;
          return isFlip ? (80 / itemCount) * 100 : (30 / itemCount) * 100;
        })(),
      },
    ],
    grid: {
      bottom: "10%",
      containLabel: true,
      left: "2%",
      right: "2%",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: function (params) {
        const param = params[0];
        return `<strong>${param.name}</strong><br/>${param.seriesName}: ${
          param.value
        }${"%"}`;
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
        unit,
        isDownTime,
        timebyperiod,
        isFlip,
        showXAxisLabel
      );
      if (optionRef.current) {
        optionRef.current.isFlip = isFlip;
      }
    }

    // Handle modal/flip resize
    useEffect(() => {
      if ((isModalOpen || isFlip) && echartsRef.current) {
        echartsRef.current.getEchartsInstance().resize();
      }
    }, [isModalOpen, isFlip]);

    // Handle container resize
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
    };

    // If we don't have valid options or data, show no data found
    if (!optionRef.current || data.length === 0) {
      return (
        <Card
          ref={chartContainerRef}
          className="chart-card"
          bodyStyle={{
            padding: "16px",
            height: "370px",
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BsBarChart style={{ fontSize: "16px", color: "#666" }} />
              <span
                style={{ fontSize: "15px", fontWeight: "500", color: "#333" }}
              >
                {title}
              </span>
            </div>
            <button
              onClick={showDetail}
              style={{
                border: "none",
                background: "none",
                padding: "4px",
                cursor: "pointer",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <AiOutlineFullscreen
                style={{ fontSize: "16px", color: "#666" }}
              />
            </button>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#fafafa",
              borderRadius: "6px",
            }}
          >
            <NoDataScreen
              message="No Chart Data"
              subMessage="There is no data available to display in the chart"
            />
          </div>
        </Card>
      );
    }

    // Use stable events object to prevent re-renders
    const events = {
      click: clickHandlerRef.current,
    };

    return (
      <Card ref={chartContainerRef} bodyStyle={{ padding: "10px" }}>
        <span
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            // padding: "8px 16px",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BsBarChart style={{ fontSize: "14px" }} />
            {title}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <AiOutlineFullscreen onClick={showDetail} />
          </div>
        </span>
        <ReactECharts
          ref={echartsRef}
          option={optionRef.current}
          style={{ height: "330px" }}
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
                justifyContent: "center",
              }}
            >
              <span style={{ flex: 1, textAlign: "center" }}>{title}</span>
              <Button
                type="text"
                icon={<AiOutlineClose style={{ fontSize: "20px" }} />}
                onClick={() => setIsFlip(false)}
                style={{ position: "absolute", right: 24 }}
              />
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
