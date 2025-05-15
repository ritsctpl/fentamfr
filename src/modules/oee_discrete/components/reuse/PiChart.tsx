/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Modal, Typography, Tooltip, Button } from "antd";
import { AiOutlineInfoCircle, AiOutlineFullscreen, AiOutlineClose } from "react-icons/ai";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import NoDataFound from "./NoDataFound";
 
const { Title } = Typography;
 
interface DataPoint {
  [key: string]: number | string;
}
 
interface PiChartProps {
  data: DataPoint[];
  title: string;
  color:any;
  description?:any
}
 
const getColor = (tabkey: string,color) => {
  switch (tabkey) {
    case 'availability':
      return ["#28a745", "#ffc107", "#dc3545"]
    case 'quality':
      return color
    case 'downtime':
      return color
    case 'performance':
      return color;
    case 'oee':
      return ["#8B0000", "#FFD700", "#008000"]
    default:
      return ["#dc3545", "#ffc107", "#28a745"]
  }
}
 
const PiChart: React.FC<PiChartProps> = ({ data, title,color,description }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const { color, colors } = useFilterContext();
  const tabkey = sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const activeTabIndex = sessionStorage.getItem('activeTabIndex');
  const isDownTime = activeTabIndex?.includes('downtime') ? true : false;
  const [open, setOpen] = useState(false);
  const [isFlip, setIsFlip] = useState(false);
 
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
 


 
  const categoryKey = data && data[0] ? Object.keys(data[0]).find(
    (key) => typeof data[0][key] === "string"
  ) : undefined;
  const metricsKeys = data && data[0] ? Object.keys(data[0]).filter(
    (key) => key !== categoryKey && typeof data[0][key] === "number"
  ) : [];
 
  // if (!categoryKey || metricsKeys.length === 0) {
  //   return <div>Error: No valid category or value key found.</div>;
  // }
 
  const categoriesArray = data.map(item => item[categoryKey]);
  const valueKeys = metricsKeys;
 
  const series = metricsKeys.map((metricKey) => ({
    name: metricKey,
    type: "pie",
    radius: "50%",
    data: data.map((item) => ({
      value: item[metricKey],
      name: item[categoryKey],
      // itemStyle: {
      //   color: getColor(Number(item[metricKey]), tabkey)
      // }
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: "rgba(0, 0, 0, 0.5)",
      },
    },
  }));
 
  const option = {
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
      formatter: (params) => `${params.name}: ${params.value}${isDownTime ? ' sec' : ' %'}`
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      left: "center",
      bottom: "bottom",
      data: data.map((item) => item[categoryKey]),
    },
    series: series,
  };
 
  const showModal = () => {
    setIsModalOpen(true);
  };
 
  const showDetail = () => {
    setIsFlip(!isFlip);
  };
 
  return (
    <Card
      ref={chartContainerRef}
      style={{
        // boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
      }}

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
        <>
          <ReactECharts
            ref={echartsRef}
            option={option}
            style={{ height: "calc(100vh - 305px)", fontFamily: "roboto" }}
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
                    icon={<AiOutlineClose style={{fontSize:'20px'}} onClick={() => setIsFlip(false)} />}
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
                    <p>
                      {description}
                    </p>
                    <p>
                      <strong>Date Range:</strong> {categoriesArray[0]} to{" "}
                      {categoriesArray[categoriesArray.length - 1]}
                    </p>
                  </div>

                  <Title level={5}>Performance Thresholds</Title>
                  <div style={{ marginBottom: '20px' }}>
                    {series[0]?.data.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ 
                                width: '20px', 
                                height: '20px', 
                                backgroundColor: getColor(tabkey, color)?.[index], 
                                marginRight: '10px' 
                            }}></div>
                            <span>
                                {item.name}
                                {tabkey === 'oee' && ` (${item.value}%)`}
                            </span>
                        </div>
                    ))}
                    {/* Show remaining for OEE */}
                    {tabkey === 'oee' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    backgroundColor: '#dcd9d9', 
                                    marginRight: '10px' 
                                }}></div>
                                <span>Remaining</span>
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#666', 
                                marginLeft: '30px', 
                                marginBottom: '12px' 
                            }}>
                                Note: The "Remaining" portion represents the gap between the current OEE value and 100%. 
                                For example, if OEE is 65%, the remaining portion is 35%.
                            </div>
                        </>
                    )}
                  </div>

                  <Title level={5}>Graph Details</Title>
                  <div style={{ marginBottom: "20px" }}>
                    <p>
                      <strong>Total Categories:</strong> {categoriesArray.length}
                    </p>
                    <p>
                      <strong>Metrics Shown:</strong> {valueKeys.join(", ")}
                    </p>
                    <p>
                      <strong>Average:</strong>{" "}
                      {(
                        data.reduce(
                          (acc, item) => acc + (Number(item[valueKeys[0]]) || 0),
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
        </>
      )}
    </Card>
  );
};
 
export default PiChart;