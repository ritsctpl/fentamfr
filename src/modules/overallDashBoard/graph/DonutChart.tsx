import React, { useEffect, useRef, useState } from "react";
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Button } from "antd";
import { AiOutlineClose, AiOutlineFullscreen, AiOutlineInfoCircle } from "react-icons/ai";
import { FaArrowTrendDown } from "react-icons/fa6";
import NoDataScreen from "../components/NoData";
const { Title } = Typography;

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    itemStyle?: {
      color: string;
    };
  }[];
  title?: string;
  description?: string;
  rejectedData?: any;
}

const DonutChart: React.FC<DonutChartProps> = ({ data =[], title, description, rejectedData }) => {
  console.log("data", rejectedData);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rejectColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];
  // const totalRejects = data?.reduce((sum, item) => sum + item.value, 0);
  const totalRejects = Array.isArray(data)
    ? data.reduce((sum, item) => sum + item.value, 0)
    : 0;


  // Process data to include colors based on reject details
  const processedData = Array.isArray(data) ? data.map((item, index) => {
    const reasonCode = rejectedData?.reject_details?.[index]?.split('--')?.[1]?.trim() || 'unknown';
    return {
      ...item,
      itemStyle: {
        color: rejectColors[index % rejectColors.length]
      },
      reasonCode: reasonCode
    };
  }) : [];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const reasonCode = params.data.reasonCode;
        return `${params.name}: ${params.value}<br/>Reason: ${reasonCode}`;
      }
    },
    legend: {
      show: true,
      top: '0%',
      left: 'center',
      type: "scroll",
      orient: "horizontal",
      textStyle: {
        fontSize: 14
      }
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        center: ['50%', '60%'],
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 0
        },
        labelLine: {
          show: false
        },
        data: processedData,
        label: {
          show: true,
          position: 'center',
          formatter: () => `${totalRejects}`,
          fontSize: 26,
          fontWeight: 600,
          color: '#002c2d'
        }
      }
    ]
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

    if (isFlip) {
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
  }, [isFlip]);

  const showDetail = () => {
    setIsFlip(true);
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
      bodyStyle={{
        padding: "10px",
        boxSizing: 'border-box',
        height: '100%',
        width: '100%',
      }}
      headStyle={{
        minHeight: '10px',
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.25rem'
          }}>
            <FaArrowTrendDown />
            <span>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <AiOutlineFullscreen onClick={showDetail} />
          </div>
        </div>
      }
    >
      {data?.length > 0 ?
        <div style={{ width: '100%', height: '90%', display: 'flex', gap: 10 }}>
          <ReactECharts
            ref={echartsRef}
            option={option}
            style={{ height: '100%', width: '50%' }}
          />
          <div
            style={{
              display: "flex",
              height: '100%',
              width: '50%',
              overflow: 'auto',
              flexDirection: "column",
              justifyContent: "start",
              gap: "15px",
              fontSize: "14px",
              // marginTop: "20px",
            }}
          >
            {rejectedData?.reject_details
              ?.slice(0, 5)
              .map((reject, index) => (
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                  key={index}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: rejectColors[index],
                      display: "inline-block",
                    }}
                  ></span>
                  <span
                    style={{
                      color: "#333",
                      fontSize: "16px",
                      fontWeight: index === 0 ? "600" : "400",
                    }}
                  >
                    {reject}
                  </span>
                </div>
              ))}
          </div>
        </div> :
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <NoDataScreen subMessage="Currently no rejects data" />
        </div>
      }

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
              {/* <Button
                type="text"
                icon={<AiOutlineInfoCircle style={{ fontSize: "20px" }} />}
                onClick={() => setOpen((prev) => !prev)}
              /> */}
              <Button
                type="text"
                icon={<AiOutlineClose style={{ fontSize: "20px" }} />}
                onClick={() => setIsFlip(false)}
              />
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", justifyContent: "space-between", overflow: "hidden" }}>
          <div style={{ width: '100%', height: '90%', display: 'flex', gap: 10 }}>
            <ReactECharts
              ref={echartsRef}
              option={option}
              style={{
                height: "calc(100vh - 100px)",
                width: open ? "70%" : "100%",
                transition: "width 0.3s ease-in-out",
              }}
            />
            <div
              style={{
                display: "flex",
                height: '100%',
                width: '50%',
                overflow: 'auto',
                flexDirection: "column",
                justifyContent: "start",
                gap: "15px",
                fontSize: "14px",
                // marginTop: "20px",
              }}
            >
              {rejectedData?.reject_details
                ?.slice(0, 5)
                .map((reject, index) => (
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                    key={index}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: rejectColors[index],
                        display: "inline-block",
                      }}
                    ></span>
                    <span
                      style={{
                        color: "#333",
                        fontSize: "16px",
                        fontWeight: index === 0 ? "600" : "400",
                      }}
                    >
                      {reject}
                    </span>
                  </div>
                ))}
            </div>
          </div>

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
              <Title level={5}>Chart Details</Title>
              <div style={{ marginBottom: "20px" }}>
                <p><strong>Description:</strong></p>
                <p>{description}</p>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p><strong>Total:</strong> {data.reduce((acc, item) => acc + item.value, 0)}</p>
                <p><strong>Categories:</strong> {data.length}</p>
                {data.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: item.name === 'Rejected' ? '#002c2d' : '#7b9c9d',
                      borderRadius: '4px'
                    }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default DonutChart;