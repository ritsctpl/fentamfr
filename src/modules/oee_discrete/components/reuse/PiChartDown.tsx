import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Button } from "antd";
import {
  AiOutlineInfoCircle,
  AiOutlineFullscreen,
  AiOutlineClose,
} from "react-icons/ai";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import NoDataFound from "./NoDataFound";

const { Title } = Typography;

interface DataPoint {
  [key: string]: number | string;
}

interface PiChartProps {
  data: DataPoint[];
  title: string;
  color: string[];
  description?: string;
  theshold?: number;
  type?: string;
  onBarClick?: (xValue: string, yValue: number) => void;
}

const getColor = (tabkey: string, color: string[]): string[] => {
  switch (tabkey) {
    case "availability":
      return ["#28a745", "#ffc107", "#dc3545"];
    case "quality":
      return color;
    case "downtime":
      return color;
    case "performance":
      return color;
    case "oee":
      return ["#8B0000", "#FFD700", "#008000"];
    default:
      return ["#dc3545", "#ffc107", "#28a745"];
  }
};

// Create a stable chart options generator outside component to prevent recreation
const createChartOptions = (
  data: DataPoint[],
  tabkey: string,
  color: string[],
  isDownTime: boolean
) => {
  if (!data || data.length === 0) return null;

  const categoryKey = Object.keys(data[0]).find(
    (key) => typeof data[0][key] === "string"
  );

  const metricsKeys = Object.keys(data[0]).filter(
    (key) => key !== categoryKey && typeof data[0][key] === "number"
  );

  if (!categoryKey || metricsKeys.length === 0) return null;

  const categoriesArray = data.map((item) => item[categoryKey]);
  const valueKeys = metricsKeys;

  const series = metricsKeys.map((metricKey) => ({
    name: metricKey,
    type: "pie",
    radius: "50%",
    data: data.map((item) => ({
      value: item[metricKey],
      name: item[categoryKey],
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: "rgba(0, 0, 0, 0.5)",
      },
    },
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
    color: getColor(tabkey, color),
    tooltip: {
      trigger: "item",
      formatter: (params) => `${params.name}: ${params.value}`,
    },
    label: {
      show: true,
      formatter: (params) =>
        `${params.name}: ${params.value}${isDownTime ? " min" : " %"}`,
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      left: "center",
      bottom: "bottom",
      data: categoriesArray,
    },
    series: series,
    categoriesArray,
    valueKeys,
  };
};

const PiChart = memo(
  ({
    data,
    title,
    color,
    description,
    theshold,
    type,
    onBarClick,
  }: PiChartProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem("activeTabIndex");
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const activeTabIndex = sessionStorage.getItem("activeTabIndex");
    const isDownTime = activeTabIndex?.includes("downtime") ? true : false;
    const [open, setOpen] = useState(false);
    const [isFlip, setIsFlip] = useState(false);

    // Store data reference for comparison
    const dataRef = useRef(data);
    // Store option in ref to prevent recomputation
    const optionRef = useRef(null);

    // Only recalculate options if data actually changes
    if (
      !optionRef.current ||
      JSON.stringify(dataRef.current) !== JSON.stringify(data)
    ) {
      dataRef.current = data;
      optionRef.current = createChartOptions(data, tabkey, color, isDownTime);
    }

    // Handle resize events only
    useEffect(() => {
      const handleResize = () => {
        if (echartsRef.current) {
          const chart = echartsRef.current.getEchartsInstance();
          if (chart) {
            setTimeout(() => chart.resize(), 0);
          }
        }
      };
      
      handleResize();
  
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
    }, [isFlip, data]);

    // Create a stable click handler using ref instead of useCallback
    const clickHandlerRef = useRef((params) => {
      if (onBarClick) {
        onBarClick(params.name, params.value);
      }
    });

    // Update the click handler reference if onBarClick changes
    useEffect(() => {
      clickHandlerRef.current = (params) => {
        if (onBarClick) {
          onBarClick(params.name, params.value);
        }
      };
    }, [onBarClick]);

    const showDetail = () => {
      setIsFlip(!isFlip);
    };

    // If we don't have valid options or data, show no data found
    if (!optionRef.current || data.length === 0) {
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
              <span
                style={{ margin: 0, fontFamily: "roboto", fontSize: "16px" }}
              >
                {title}
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <AiOutlineFullscreen onClick={showDetail} />
              </div>
            </div>
          }
        >
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
            <div style={{ display: "flex", gap: "10px" }}>
              <AiOutlineFullscreen onClick={showDetail} />
            </div>
          </div>
        }
      >
        <ReactECharts
          ref={echartsRef}
          option={optionRef.current}
          style={{ height: "calc(100vh - 305px)", fontFamily: "roboto" }}
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
              ref={echartsRef}
              option={optionRef.current}
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
                    <strong>Date Range:</strong>{" "}
                    {optionRef.current.categoriesArray[0]} to{" "}
                    {
                      optionRef.current.categoriesArray[
                        optionRef.current.categoriesArray.length - 1
                      ]
                    }
                  </p>
                </div>

                <Title level={5}>Performance Thresholds</Title>
                <div style={{ marginBottom: "20px" }}>
                  {optionRef.current.series[0]?.data.map((item, index) => (
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
                          backgroundColor: getColor(tabkey, color)?.[index],
                          marginRight: "10px",
                        }}
                      ></div>
                      <span>
                        {item.name}
                        {tabkey === "oee" && ` (${item.value}%)`}
                      </span>
                    </div>
                  ))}
                  {tabkey === "oee" && (
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
                            backgroundColor: "#dcd9d9",
                            marginRight: "10px",
                          }}
                        ></div>
                        <span>Remaining</span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginLeft: "30px",
                          marginBottom: "12px",
                        }}
                      >
                        Note: The "Remaining" portion represents the gap between
                        the current OEE value and 100%. For example, if OEE is
                        65%, the remaining portion is 35%.
                      </div>
                    </>
                  )}
                </div>

                <Title level={5}>Graph Details</Title>
                <div style={{ marginBottom: "20px" }}>
                  <p>
                    <strong>Total Categories:</strong>{" "}
                    {optionRef.current.categoriesArray.length}
                  </p>
                  <p>
                    <strong>Metrics Shown:</strong>{" "}
                    {optionRef.current.valueKeys.join(", ")}
                  </p>
                  <p>
                    <strong>Average:</strong>{" "}
                    {(
                      data.reduce(
                        (acc, item) =>
                          acc +
                          (Number(item[optionRef.current.valueKeys[0]]) || 0),
                        0
                      ) / data.length
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </Card>
    );
  }
);

PiChart.displayName = "PiChart";

export default PiChart;
