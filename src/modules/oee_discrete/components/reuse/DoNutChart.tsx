import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { AiOutlineClose, AiOutlineFileSearch, AiOutlineFullscreen } from 'react-icons/ai';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import NoDataFound from './NoDataFound';

const { Title } = Typography;

interface DataPoint {
  [key: string]: number | string;
}

interface ParetoChartProps {
  data: DataPoint[];
  title: string;
  color: any;
  threshold: any;
  unit?: string;
  description?: any;
}

const DoNutChart: React.FC<ParetoChartProps> = ({ data, title, color, threshold, unit, description }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
    if (isFlip && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
  }, [isModalOpen, isFlip]);

  const categoryKey = data && data[0] ? Object.keys(data[0]).find(key => typeof data[0][key] === 'string') : undefined;
  const metricsKeys = data && data[0] ? Object.keys(data[0]).filter(key => key !== categoryKey && typeof data[0][key] === 'number') : [];
  const xAxisData = Array.isArray(data) ? data.map(item => item[categoryKey]) : [];

  if (!data.length) {
    return (
      <Card ref={chartContainerRef} title={title}>
        <NoDataFound />
      </Card>
    );
  }

  // Sort the data by the metric value for Pareto logic
  const sortedData = [...data].sort((a, b) => {
    const valueA = Number(a[metricsKeys[0]]);
    const valueB = Number(b[metricsKeys[0]]);
    return valueB - valueA; // Sort descending
  });

  // Calculate cumulative sum and percentage
  let cumulative = 0;
  const totalSum = sortedData.reduce((acc, item) => acc + Number(item[metricsKeys[0]]), 0);
  const cumulativeData = sortedData.map((item, index) => {
    cumulative += Number(item[metricsKeys[0]]);
    return {
      name: item[categoryKey],
      value: Number(item[metricsKeys[0]]),
      cumulativePercentage: (cumulative / totalSum) * 100,
    };
  });

  // Creating series for the Pareto chart (bars and line)
  const barSeries = {
    name: 'Metric Values',
    type: 'bar',
    data: cumulativeData.map(item => item.value),
    itemStyle: {
      color: color?.[0] || '#0f4b5f',
    },
    label: {
      show: true,
      position: 'top',
      formatter: `{c}${unit ? ' ' + unit : ''}`,
    },
  };

  const lineSeries = {
    name: 'Cumulative Percentage',
    type: 'line',
    yAxisIndex: 1,
    data: cumulativeData.map(item => item.cumulativePercentage.toFixed(2)),
    itemStyle: {
      color: '#ff9900',
    },
    label: {
      show: true,
      position: 'top',
      formatter: `{c}%`,
    },
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const barData = params[0].data;
        const lineData = params[1].data;
        const formattedLineData = typeof lineData === 'number' ? lineData.toFixed(2) : 'N/A';
        return `${params[0].name}: ${barData} (${formattedLineData}%)`;
      },
    },
    legend: {
      data: ['Metric Values', 'Cumulative Percentage'],
      orient: 'horizontal',
      top: 'top',
    },
    xAxis: {
      type: 'category',
      data: cumulativeData.map(item => item.name),
    },
    yAxis: [
      {
        type: 'value',
        name: 'Metric Values',
        axisLabel: {
            formatter: (value: number) => value.toFixed(2),
        },
      },
      {
        type: 'value',
        name: 'Cumulative Percentage',
        axisLabel: {
          formatter: (value: number) => value % 1 === 0 ? `${value}%` : `${value.toFixed(2)}%`,

        },
        max: 100,
      },
    ],
    series: [barSeries, lineSeries],
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(true);
  };

  return (
    <Card
      ref={chartContainerRef}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <AiOutlineFullscreen onClick={showDetail} />
          </div>
        </div>
      }
    >
      <ReactECharts ref={echartsRef} option={option} style={{ height: 'calc(100vh - 305px)', width: '95%' }} />
      <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width="100%">
        <ReactECharts option={option} style={{ height: 'calc(100vh - 100px)', width: '100%' }} ref={echartsRef} />
      </Modal>

      <Modal closable={false} open={isFlip} centered onCancel={() => setIsFlip(false)} footer={null} width="100%" title={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span>{title}</span><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Button type="text" icon={<AiOutlineInfoCircle style={{ fontSize: '20px' }} />} onClick={() => setOpen((prev) => !prev)} /><Button type="text" icon={<AiOutlineClose style={{ fontSize: '20px' }} onClick={() => setIsFlip(false)} />} /></div></div>}>
        <div style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
          <ReactECharts option={option} ref={echartsRef} style={{ height: 'calc(100vh - 100px)', width: open ? '70%' : '100%', transition: 'width 0.3s ease-in-out' }} />
          {open && (
            <div
              style={{
                width: '30%',
                padding: '20px',
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(100%)',
                transition: 'all 0.3s ease-in-out',
                overflow: 'hidden',
              }}
            >
              <Title level={5}>Graph Details</Title>
              <div style={{ marginBottom: '20px' }}>
                <p>
                  <strong>Description:</strong>
                </p>
                <p>{description}</p>
                <p>
                  <strong>Range:</strong> {xAxisData[0]} to {xAxisData[xAxisData.length - 1]}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default DoNutChart;
