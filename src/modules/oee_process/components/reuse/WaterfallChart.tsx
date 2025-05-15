import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
const { Title } = Typography;
import { getColor } from './LineChart';

interface WaterfallChartProps {
  data: Array<{ category: string; hours: number }>;
  title: string;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey=sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { color } = useFilterContext();

  useEffect(() => {
    if (isModalOpen && echartsRef.current) {
      echartsRef.current.getEchartsInstance().resize();
    }
  }, [isModalOpen]);

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

  // Calculate the placeholder data and actual data
  const total = data.reduce((sum, item) => sum + item.hours, 0);
  const categories = ['Total', ...data.map(item => item.category)];
  
  let cumulative = total;
  const placeholderData = [0];
  const actualData = [total];
  
  data.forEach(item => {
    placeholderData.push(cumulative - item.hours);
    actualData.push(item.hours);
    cumulative -= item.hours;
  });

  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        const tar = params[1];
        return `${tar.name}<br/>Hours: ${tar.value}`;
      }
    },
    xAxis: {
      type: 'category',
      splitLine: { show: false },
      data: categories,
      axisLabel: {
        interval: 0,
        width: 50,
        overflow: 'truncate'
      }
    },
    yAxis: {
      type: 'value',
      name: 'Hours'
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        },
        data: placeholderData
      },
      {
        name: 'Downtime Hours',
        type: 'bar',
        stack: 'Total',
        data: actualData,
        itemStyle: {
          color: (params: any) => {
            const currentValue = params.data;
            return getColor(currentValue, tabkey,{
              itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
              threshold:[50,85,20],
              linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
            });
          }
        }
      }
    ],
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: { show: true },
      }
    },
    animation: true,
    animationDuration: 1000,
    animationEasing: 'elasticOut'
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{ background: color?.lightcolor || '#fafafa',boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, fontFamily:'roboto' ,fontSize:'16px'}}>{title}</Title>
          {!isModalOpen && (
            <Tooltip placement='topRight' title='FullScreen'>
              <FullscreenOutlined onClick={() => setIsModalOpen(true)} />
            </Tooltip>
          )}
        </div>
      }
    >
      <ReactECharts ref={echartsRef} option={options} style={{ height: '300px' }} />
      <Modal 
        title={title} 
        visible={isModalOpen} 
        centered 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        width='80%'
      >
        <ReactECharts 
          option={options} 
          style={{ height: '600px', width: '100%' }} 
          ref={echartsRef} 
        />
      </Modal>
    </Card>
  );
};

export default WaterfallChart;

