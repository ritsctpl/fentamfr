import * as echarts from "echarts/core";
import { GaugeChart, GaugeSeriesOption } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { Modal, Button, Card } from "antd";
import { useEffect, useRef, useState } from "react";
import NoDataFound from "./NoDataFound";
import ReactECharts from "echarts-for-react";

echarts.use([GaugeChart, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<GaugeSeriesOption>;

// Define props interface
interface SpeedLossProps {
  data: { value: number }[];
  title: string;
  color: string;
  description?: string;
  type?: string;
}

const SpeedLoss: React.FC<SpeedLossProps> = ({
  data,
  title,
  color,
  description,
  type,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const value = data.length > 0 ? data[0].value : 0;
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

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
  }, [value]);

  // Improved chart options
  const option: EChartsOption = {
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        radius: "100%",
        center: ["50%", "55%"],
        progress: {
          show: true,
          width: 12,
          itemStyle: {
            color: color,
          },
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [
              [value / 100, color],
              [1, "#E0E0E0"],
            ],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: 8,
          lineStyle: {
            color: "#888",
          },
        },
        axisLabel: {
          distance: 15,
          color: "#666",
          fontSize: 12,
        },
        pointer: {
          length: "60%",
          width: 6,
        },
        anchor: {
          show: true,
          size: 10,
          itemStyle: {
            color: "#333",
          },
        },
        detail: {
          valueAnimation: true,
          fontSize: 14,
          offsetCenter: [0, "70%"],
          color: "#333",
          formatter: "{value}%",
        },
        data: [{ value }],
      },
    ],
  };

  return (
    <Card
      ref={chartContainerRef}
      title={
        <span style={{ margin: 0, fontFamily: "roboto", fontSize: "16px" }}>
          {title}
        </span>
      }
      style={{ height: "100%", width: "100%" }}
      bodyStyle={{
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ReactECharts
        ref={echartsRef}
        option={option}
        style={{
          height: "230px",
          width: "100%",
        }}
      />
    </Card>
  );
};

export default SpeedLoss;
