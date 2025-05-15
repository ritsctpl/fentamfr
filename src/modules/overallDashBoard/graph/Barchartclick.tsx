import React, { useEffect, useRef, useState, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Button } from "antd";
import {
  AiOutlineClose,
  AiOutlineFullscreen,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { BsBarChart } from "react-icons/bs";
// import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
// import NoDataFound from "@modules/pcoPlugin/components/NoDataFound";
import { letterSpacing } from "html2canvas/dist/types/css/property-descriptors/letter-spacing";
import NoDataScreen from "../components/NoData";
import { parseCookies } from "nookies";
import { getApiRegistry } from "@services/oeeServices";
import { useMyContext } from "../hooks/managementReport";
// import NoDataScreen from "../components/NoData";
// import NoDataFound from "./NoDataFound";
const { Title } = Typography;

interface DataPoint {
  [key: string]: number | string;
}

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  color?: any;
  theshold?: any;
  close?: boolean;
  unit?: string;
  description?: any;
  type?: any;
  onBarClick?: (xValue: string, yValue: number) => void;
  timebyperiod?: boolean;
  setShowDrillDown?: (value: any) => void;
  machineToggle?: any;
  enableDrillDown: boolean;
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
  return "#5cb9a0";
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
  isFlip
) => {
  if (!data || data.length === 0) return null;

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
    barGap: "10%",
    barWidth: "30%",
    barCategoryGap: "10%",
    data: data.map((item) => {
      const value = Number(item[metricKey]).toFixed(2);
      return {
        value: Math.min(Number(value), 100),
        actualValue: value,
      };
    }),
    colorBy: metricsKeys.length > 2 ? "series" : "data",
    label: {
      show: true,
      position: "top",
      formatter: (params: any) => {
        const value = params.data.actualValue;
        if (isDownTime) {
          return `${value} sec`;
        } else if (unit === "count") {
          return `${value}`;
        } else {
          return `${value}%`;
        }
      },
      fontSize: 11,
      padding: [4, 0, 0, 0],
      color: "#08181c",
      distance: 5,
    },
  }));

  return {
    color: getSeriesColor(tabkey, color, theshold),
    grid: {
      left: "40px",
      right: "40px",
      bottom: "40px",
      top: "40px",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        interval: 0,
        rotate: 0,
        hideOverlap: true,
        margin: 15,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      splitNumber: 5,
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          opacity: 0.3,
        },
      },
      axisLabel: {
        formatter: (value: number) => {
          return isDownTime
            ? `${value} sec`
            : unit === "count"
            ? `${value}`
            : `${value}%`;
        },
      },
    },
    series,
    dataZoom: [
      {
        show: timebyperiod ? true : isFlip,
        type: "slider",
        bottom: "bottom",
        height: "6%",
        start: 0,
        end: timebyperiod
          ? (isFlip ? 31 : 5 / data.length) * 100
          : (7 / data.length) * 100,
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const header = params[0].name;
        const body = params
          .map(({ marker, seriesName, data }) => {
            const value = data.actualValue;
            if (isDownTime) {
              return `${marker} ${seriesName}: ${value} sec`;
            } else if (unit === "count") {
              return `${marker} ${seriesName}: ${value}`;
            } else {
              return `${marker} ${seriesName}: ${value}%`;
            }
          })
          .join("<br />");
        return `${header}<br />${body}`;
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
    setShowDrillDown,
    machineToggle,
    enableDrillDown,
  }: BarChartProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem("activeTabIndex");
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [barName, setBarName] = useState(null);
    let leastValuedWc = null, leastValuedResource = null;

    const { setTopLossForWorkcenterData, setTopLossForResourceData, setSelectedTopLossDate,
      setSelectedTopLossPercentage, topLossForResourceData, reasonCodeForResourceData, selectedTopLossDate,
      topLossForWorkcenterData, selectedTopLossPercentage, selectedWorkCenter,
       setReasonCodeForResourceData, eventSource, selectedWC } = useMyContext();
    const activeTabIndex = sessionStorage.getItem("activeTabIndex");
    // const { setDowntimeOeeData } = useFilterContext();
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
        isFlip
      );
      if (optionRef.current) {
        optionRef.current.isFlip = isFlip; // Store current isFlip state
      }
    }

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

   

    const clickHandlerRef = useRef(async(params) => {
      // debugger
      if (onBarClick) {
        onBarClick(params.name, params.value);
      }
      setBarName(params.name);
      // Only set showDrillDown if enableDrillDown is true
      if (setShowDrillDown && enableDrillDown) {
        setShowDrillDown(true);
      setSelectedTopLossPercentage(params?.value);
      await getTopLossForWorkCenter(params);
      await getTopLossForResourceData(params);
      await getReasonCodeForResourceData(params);
      }
    });

    const getTopLossForWorkCenter = async (params) => {
      // debugger
      const cookies = parseCookies();
      const site = cookies?.site;
      const date = params?.name;
      setSelectedTopLossDate(date);
      // debugger
      const eventsource = machineToggle ? "machine" : "manual";
      try {
        const req = {
          site: site,
          date: date,
          eventsource: eventSource,
        };

        let response = await getApiRegistry(
          req,
          "getTopLossForWorkcenter"
        );
        
        if(response?.data && response?.data?.length > 0) {
          setTopLossForWorkcenterData(response?.data);
          const nonZeroItems = response?.data?.filter(item => item.bad_qty_percentage != 0);
          leastValuedWc = nonZeroItems && nonZeroItems.length > 0 
            ? nonZeroItems.reduce((prev, current) => {
                return prev.bad_qty_percentage < current.bad_qty_percentage ? prev : current;
              }, nonZeroItems[0])?.workcenter_id
            : response?.data?.[0]?.workcenter_id;
          selectedWC.current = leastValuedWc;
        } 
        else {
          setTopLossForWorkcenterData([]);
        }
      } catch (e) {
        console.error(`Error retrieving top loss for work center :`, e);
      }
    };

    const getTopLossForResourceData = async (params) => {
      // debugger
      const cookies = parseCookies();
      const site = cookies?.site;
      const date = params?.name;
      const eventsource = machineToggle ? "machine" : "manual";
      try {
        const req = {
          site: site,
          eventsource: eventSource,
          workcenter: leastValuedWc,
          date: date,
        };

        const topLossResourceResponse = await getApiRegistry(
          req,
          "getTopLossForResource"
        );
        // debugger
        if(topLossResourceResponse?.data && topLossResourceResponse?.data?.length > 0) {
          const nonZeroItems = topLossResourceResponse.data?.filter(item => item.bad_qty_percentage != 0);
          leastValuedResource = nonZeroItems && nonZeroItems.length > 0 
            ? nonZeroItems.reduce((prev, current) => {
                return prev.bad_qty_percentage < current.bad_qty_percentage ? prev : current;
              }, nonZeroItems[0])?.resource_id
            : topLossResourceResponse.data?.[0]?.resource_id;
          setTopLossForResourceData(topLossResourceResponse.data);
         
        } 
        else {
          setTopLossForResourceData([]);
        }
      } catch (e) {
        console.error(`Error retrieving machine details for resource :`, e);
      }
    };

    const getReasonCodeForResourceData = async (params) => {
      const cookies = parseCookies();
      const site = cookies?.site;
      const date = params?.name;
      const eventsource = machineToggle ? "machine" : "manual";
      
      try {
        const req = {
          site: site,
          eventsource: eventSource,
          workcenter: leastValuedWc,
          resource: leastValuedResource,
          date: date,
        };

        const response = await getApiRegistry(
          req,
          "getReasonCodeForResource"
        );
        // debugger
        if(response?.data && response?.data?.length > 0) {
          // const totalBadQty = response?.data?.reduce((sum, item) => sum + item.bad_qty, 0);
          // const totalQty = response?.data?.reduce((sum, item) => sum + item.total_qty, 0);
          // const totalGoodQty = totalQty - totalBadQty;

          // // Generate reject details for resources with bad quantities
          // const rejectDetails = {
          //   reject_details: response?.data
          //     .filter(item => item.bad_qty > 0)
          //     .map(item => `${item.resource_id} -- ${item.reason || 'Unknown reason'}`)
          // };


          // // Map to donut chart format
          // const chartData = [
          //   {
          //     name: "Good",
          //     value: totalGoodQty
          //   },
          //   {
          //     name: "Rejected",
          //     value: totalBadQty
          //   }
          // ];
          setReasonCodeForResourceData(response?.data);
         
        } 
        else {
          setReasonCodeForResourceData([]);
        }
      } catch (e) {
        console.error(`Error retrieving machine details for resource :`, e);
      }
    };

    // Update the click handler reference if onBarClick changes
    // useEffect(() => {
    //   clickHandlerRef.current = (params) => {
    //     if (onBarClick) {
    //       onBarClick(params.name, params.value);
    //     }
    //     setBarName(params.name);
    //     debugger
    //     setShowDrillDown(true);
    //   };
    // }, [onBarClick]);

    const showDetail = () => {
      setIsFlip(true);
    };

    const handleClose = () => {
      setIsFlip(false);
    };

    // If we don't have valid options or data, show no data found
    if (!optionRef.current || data.length === 0) {
      return (
        <Card ref={chartContainerRef} title={title}>
          <NoDataScreen />
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
        style={{
          background: "white",
          boxShadow:
            title === "Top Loss Trend"
              ? "none"
              : "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
          borderRadius: "8px",
        }}
        bodyStyle={{
          padding: "8px 8px 0 8px",
          height: "100%",
        }}
        bordered={false}
      >
        <span
          style={{
            margin: 0,
            fontSize: "14px",
            color: "#08181c",
            fontWeight: "bold",
            marginBottom: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BsBarChart style={{ fontSize: "16px" }} />
            {title}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <AiOutlineFullscreen onClick={showDetail} />
          </div>
        </span>
        <ReactECharts
          ref={echartsRef}
          option={optionRef.current}
          style={{
            height: "230px",
            width: "100%",
            marginBottom: "0",
          }}
          // onEvents={{
          //   click: (params: { name: any; value: any }) => {
          //     const xValue = params.name;
          //     const yValue = params.value;
          //     onBarClick && onBarClick(xValue, yValue);
          //   },
          // }}
          onEvents={events}
          notMerge={true}
          lazyUpdate={true}
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
                              backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
                                  backgroundColor: "#3aa080",
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
