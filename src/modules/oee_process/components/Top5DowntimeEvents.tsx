// components/Top5DowntimeEvents.tsx
import React, { useRef, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Tooltip, Typography } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';


interface Top5DowntimeEventsProps{
  data:any[]
  color:any
}

const Top5DowntimeEvents: React.FC<Top5DowntimeEventsProps> = ({data,color}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const getRedColorForDuration = (duration: number, maxDuration: number) => {
    const ratio = duration / maxDuration;
    const redIntensity = Math.floor(255 * ratio); 
    return `rgb(${redIntensity}, 0, 0)`; 
  };
  
  // Find the maximum duration to normalize the color
  const maxDuration = Math.max(...data.map(d => d.duration));
  
  // Transform data for ECharts
  const option = {
    title: {
      text: 'Top 5 Downtime Events',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: params => `${params.name}: ${params.value} minutes`,
    },
    xAxis: {
      type: 'value',
      name: 'Duration (minutes)',
      position: 'top',
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.event),
      name: 'Event',
    },
    series: [
      {
        name: 'Duration',
        type: 'bar',
        data: data.map(d => ({
          value: d.duration,
          itemStyle: {
            color: getRedColorForDuration(d.duration, maxDuration),
          },
        })),
        label: {
          show: true,
          position: 'right',
        },
      },
    ],
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const echartsRef = useRef<ReactECharts>(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
  }, [data]);

  return (
    <Card ref={chartContainerRef}
    style={{background:color.lightcolor}}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Top 5 Downtime Events</Typography.Title>
          <Tooltip title='Full Screen'>
            <FullscreenOutlined onClick={showModal} style={{ cursor: 'pointer' }} />
          </Tooltip>
        </div>
      }
    >
      <ReactECharts option={option} style={{ height: '300px', width: '100%' }} ref={echartsRef} />
      <Modal
        title="Top 5 Downtime Events"
        width={800}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <ReactECharts option={option} style={{ height: '400px', width: '100%' }} ref={echartsRef} />
      </Modal>
    </Card>
  );
};

export default Top5DowntimeEvents;
