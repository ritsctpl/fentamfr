import React, { useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "antd";
import { InboxOutlined } from '@ant-design/icons';

interface DataPoint {
  [key: string]: number | string;
}

interface PiChartProps {
  data: DataPoint[];
  per:any
}

const PieCharts: React.FC<PiChartProps> = ({ data ,per }) => {
  const echartsRef = useRef<ReactECharts>(null);

  useEffect(() => {
    if (echartsRef.current) {
      const chart = echartsRef.current.getEchartsInstance();
      chart.clear();
      chart.setOption(getChartOptions());
      chart.resize();
      const timer = setTimeout(() => {
        chart.resize();
    }, 100);
    
    return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data || data.length === 0 || !Array.isArray(data)) {
    return (
      <Card 
        bordered={false}
        style={{ 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <InboxOutlined style={{ 
            fontSize: '42px',
            color: '#bfbfbf'
          }} />
          <div style={{
            color: '#8c8c8c',
            fontSize: '16px',
            fontWeight: 500
          }}>
            No data available
          </div>
        </div>
      </Card>
    );
  }

  const numericKeys = Object.keys(data[0]).filter(
    key => typeof data[0][key] === "number"
  );

  if (numericKeys.length > 1) {
    return <div>Error: Pie chart can only display one numeric value per category. Current data contains multiple numeric columns: {numericKeys.join(", ")}</div>;
  }

  const getChartOptions = () => {
    const categoryKey = Object.keys(data[0]).find(
      (key) => typeof data[0][key] === "string"
    );
    const metricsKeys = Object.keys(data[0]).filter(
      (key) => key !== categoryKey && typeof data[0][key] === "number"
    );

    if (!categoryKey || metricsKeys.length === 0) {
      return null;
    }

    const series = metricsKeys.map((metricKey) => ({
      name: metricKey,
      type: "pie",
      radius: "50%",
      data: data.map((item) => ({
        value: typeof item[metricKey] === 'number' ? Number(item[metricKey].toFixed(2)) : Number(item[metricKey]),
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
      tooltip: {
        trigger: "item",
        formatter: (params) => `${params.name}: ${params.value}`,
      },
      label: {
        show: true,
        formatter: (params) => `${params.name}: ${params.value}${per}`
      },
      legend: {
        type: "scroll",
        orient: "horizontal",
        left: "center",
        data: data.map((item) => item[categoryKey]),
      },
      series: series,
    };
  };

  const options = getChartOptions();
  if (!options) {
    return <div>Error: No valid category or value key found.</div>;
  }

  return (
    <ReactECharts
      ref={echartsRef}
      style={{ height: '100%', width: '100%' }}
      option={options}
      notMerge={true}
    />
  );
};

export default PieCharts;