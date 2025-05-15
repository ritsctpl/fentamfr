import React, { useEffect, useRef } from 'react';
import { Card,  Typography,  } from 'antd';
import ReactECharts from 'echarts-for-react';
const { Text } = Typography;


interface MyGaugeChartProps {
  value: number;
  type: string
}

const GaugeChart: React.FC<MyGaugeChartProps> = ({ value, type }) => {
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const option = {
    series: [
      {
        type: 'gauge',
        radius: '100%',
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.7, '#dc3545'],
              [0.9, '#ffc107'],
              [1, '#28a745']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -20,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -40,
          length: 25,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: 'inherit',
          distance: 40,
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          formatter: `{value}%`,
          color: 'inherit',
          fontSize: 16,
          fontWeight: 'bold',
          offsetCenter: [0, '40%']
        },
        data: [
          {
            value: value
          }
        ]
      }
    ]
  };
  
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


  return (
    <Card
      title={type}
      ref={chartContainerRef}
      style={{
        maxWidth: '100%',
        minHeight: '100%',
        border: 'none',
        textAlign: 'center',
        background: 'none',
        fontFamily: 'roboto',
      }}
    >
      <ReactECharts ref={echartsRef} option={option} style={{ height: '200px', width: '100%' }} />
    </Card>
  );
};
export default GaugeChart;