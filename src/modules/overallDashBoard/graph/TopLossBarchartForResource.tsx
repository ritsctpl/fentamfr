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
  topLossForResourceData?: any;
  setTopLossForResourceData?: (value: any) => void;
  selectedTopLossDate?: any;
  setSelectedTopLossDate?: (value: any) => void;
  machineToggle?: any;
  
 
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
  // if (!data || data.length === 0) return null;

  // const xAxisData = data.map(item => item.resource_id);
  
  // const series = [{
  //   name: 'Bad Quantity',
  //   type: 'bar',
  //   barGap: '10%',
  //   barWidth: '30%',
  //   barCategoryGap: '10%',
  //   data: data.map(item => ({
  //     value: item.bad_qty_percentage,
  //     actualValue: item.bad_qty_percentage,
  //     badQty: item.bad_qty
  //   })),
  //   label: {
  //     show: true,
  //     position: 'top',
  //     formatter: (params) => {
  //       return `${params.data.actualValue}% (${params.data.badQty})`;
  //     },
  //     fontSize: 11,
  //     padding: [4, 0, 0, 0],
  //     color: '#08181c',
  //     distance: 5,
  //   }
  // }];

  // return {
  //   color: ['#5cb9a0'], // Using a single color since we only have one series
  //   grid: {
  //     left: '40px',
  //     right: '40px',
  //     bottom: '40px',
  //     top: '40px',
  //     containLabel: true,
  //   },
  //   xAxis: {
  //     type: 'category',
  //     data: xAxisData,
  //     axisLabel: {
  //       show: true,
  //       interval: 0,
  //       rotate: 90,
  //       margin: 5,
  //       align: 'left',
  //       verticalAlign: 'middle',
  //       fontSize: 10
  //     },
  //     axisTick: {
  //       alignWithLabel: true
  //     }
  //   },
  //   yAxis: {
  //     type: 'value',
  //     min: 0,
  //     max: 100,
  //     interval: 20,
  //     splitNumber: 5,
  //     splitLine: {
  //       show: true,
  //       lineStyle: {
  //         type: 'dashed',
  //         opacity: 0.3,
  //       }
  //     },
  //     axisLabel: {
  //       formatter: (value) => `${value}%`
  //     }
  //   },
  //   series,
  //   tooltip: {
  //     trigger: 'axis',
  //     axisPointer: { type: 'shadow' },
  //     formatter: (params) => {
  //       const param = params[0];
  //       return `${param.name}<br/>${param.seriesName}: ${param.data.actualValue}%<br/>Bad Quantity: ${param.data.badQty}`;
  //     }
  //   }
  // };
  // debugger
  if (!data || data.length === 0) return null;

  if (!data[0] || typeof data[0] !== "object") return null;

  const categoryKey = "resource_id";
  const metricsKeys = ["bad_qty_percentage"];

  if (!data[0][categoryKey]) return null;

  const xAxisData = data.map(item => item[categoryKey]);

  const series = [{
    name: 'Bad Quantity',
    type: 'bar',
    barGap: '10%',
    barWidth: '30%',
    barCategoryGap: '10%',
    data: data.map(item => ({
      value: item.bad_qty_percentage,
      actualValue: item.bad_qty_percentage,
      badQty: item.bad_qty,
      resource_id: item.resource_id
    })),
    label: {
      show: true,
      position: 'insideBottom',
      formatter: (params) => {
        return `${params.data.resource_id}   ${Number(params.data.actualValue).toFixed(2)}% (${params.data.badQty})`;
      },
      fontSize: 11,
      padding: [4, 0, 0, 0],
      color: '#08181c',
      distance: 5,
      rotate: 90,
          align: "left",
          verticalAlign: "middle",
    },
    itemStyle: {
      color: '#5cb9a0'
    }
  }];

  return {
    toolbox: {
      show: true,
      right: "10%",
      feature: {
        saveAsImage: {
          show: false,
        },
      },
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLabel: {
        show: false,
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
          // Calculate percentage to show
          const itemCount = data.length;
          if (itemCount <= 10) {
            return 100; // Show all if 10 or fewer items
          } else {
            // Show first 10 items in normal view, 5 items in flipped view
            return isFlip ? (80 / itemCount) * 100 : (30 / itemCount) * 100;
          }
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
        // Show full resource ID in tooltip
        return `<strong>${param.name}</strong><br/> Rejection : ${
          Number(param.value).toFixed(2)
        }${"%"}  (${param.data.badQty})`;
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

const TopLossBarchartForResource = memo(
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
    
  }: BarChartProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem("activeTabIndex");
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [barName, setBarName] = useState(null);
    const activeTabIndex = sessionStorage.getItem("activeTabIndex");
    const { setTopLossForWorkcenterData, setTopLossForResourceData, setSelectedTopLossDate,
      setSelectedTopLossPercentage, topLossForResourceData, reasonCodeForResourceData, selectedTopLossDate,
      topLossForWorkcenterData, selectedTopLossPercentage, selectedWorkCenter,
      setReasonCodeForResourceData, eventSource } = useMyContext();
    // const { setDowntimeOeeData } = useFilterContext();
    const isDownTime = activeTabIndex?.includes("downtime") ? true : false;
    const { selectedWC } = useMyContext();

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

    // Create a stable click handler using ref
    const clickHandlerRef1 = useRef((params) => {
      if (onBarClick) {
        onBarClick(params.name, params.value);
      }
      setBarName(params?.name);
      // debugger
    });

    const clickHandlerRef = useRef(async(params) => {
      // debugger
      if (onBarClick) {
        onBarClick(params.name, params.value);
      }
      setBarName(params.name);
      await getReasonCodeForResourceData(params);
    });

    const getReasonCodeForResourceData = async (params) => {
      const cookies = parseCookies();
      const site = cookies?.site;
      const date = params?.name;
      const eventsource = machineToggle ? "machine" : "manual";
      
      try {
        const req = {
          site: site,
          eventsource: eventSource,
          workcenter: selectedWC?.current,
          resource: params?.name,
          date: selectedTopLossDate,
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
    
          // // Group reject reasons and count totals
          // const reasonTotals = {};
          // response.data
          //   .filter(item => item.bad_qty > 0)
          //   .forEach(item => {
          //     const reason = item.reason || 'unknown';
          //     if (!reasonTotals[reason]) {
          //       reasonTotals[reason] = 0;
          //     }
          //     reasonTotals[reason] += item.bad_qty;
          //   });
    
          // // Format the data according to the required structure
          // const rejectDetails = {
          //   total_rejects: Object.entries(reasonTotals).map(([name, value]) => ({ 
          //     name, 
          //     value 
          //   })),
          //   reject_details: response.data
          //     .filter(item => item.bad_qty > 0)
          //     .map(item => `${item.bad_qty} rejections from ${item.resource_id} -- ${item.reason || 'unknown'}`)
          // };
    
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
    //   };
    // }, [onBarClick]);

    const showDetail = () => {
      setIsFlip(true);
    };

    const handleClose = () => {
      setIsFlip(false);
    };

    // If we don't have valid options or data, show no data found
    if ( data.length == 0) {
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
            title === "Top Loss Trend For Resource"
              ? "none"
              : "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
          borderRadius: "8px",
        }}
        bodyStyle={{
          padding: "8px 8px 0 8px",
          height: "99%",
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
            height: "300px", // Use fixed height instead of percentage
            minHeight: "300px",
            width: "100%",
          }}
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
TopLossBarchartForResource.displayName = "TopLossBarchartForResource";

export default TopLossBarchartForResource;
