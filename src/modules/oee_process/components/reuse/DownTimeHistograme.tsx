import React, { useRef, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';
const { Title } = Typography;

const DowntimeHistogram = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);

  const title = "Downtime Duration Distribution";
  const categoriesArray = ['0-25', '25-50', '50-75', '75-100', '100-125', '125-150', '150-175', '175-200'];

  const getMachineData = (machineName: string) => {
    return option.series.find(s => s.name === machineName)?.data || [];
  };

  const calculateAverage = (data: number[]) => {
    return (data.reduce((acc, val) => acc + val, 0) / data.length).toFixed(2);
  };

  const renderInfoPanel = () => (
    <div style={{
      width: '30%',
      padding: '20px',
      opacity: open ? 1 : 0,
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'all 0.3s ease-in-out',
      overflow: 'hidden'
    }}>
      <Title level={5}>Graph Details</Title>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Description:</strong></p>
        <p>This histogram shows the frequency of downtime events across different time intervals for each machine.</p>
        <p>The x-axis represents time ranges in minutes, while the y-axis shows how often downtimes occurred in each range.</p>
        
        <p><strong>Graph Information:</strong></p>
        <ul>
          <li>Time Range: {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]} minutes</li>
          <li>Interval Size: 25 minutes</li>
          <li>Data Type: Frequency count of downtime events</li>
        </ul>
      </div>

      <Title level={5}>Performance Thresholds</Title>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#2ECC71', marginRight: '10px' }}></div>
          <span>Machine A - Optimal Performance</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#F39C12', marginRight: '10px' }}></div>
          <span>Machine B - Warning Level</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#E74C3C', marginRight: '10px' }}></div>
          <span>Machine C - Critical Level</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#BA68C8', marginRight: '10px' }}></div>
          <span>Machine D - Monitoring Level</span>
        </div>
      </div>

      <Title level={5}>Machine Statistics</Title>
      <div>
        {option.series.map(series => (
          <p key={series.name}>
            <strong>{series.name} Average:</strong> {calculateAverage(series.data)}
          </p>
        ))}
      </div>
    </div>
  );

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
  }, []);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      type: 'scroll',  // Enable scroll for the legend
      data: ['Machine A', 'Machine B', 'Machine C', 'Machine D'],
      right: 'center',
      top: 'bottom',       // Adjust the position if necessary
      orient: 'horizontal', // Set to 'vertical' if you want a vertical scrollable legend
    },
    xAxis: {
      type: 'category',
      name: 'Downtime Duration (Minutes)',
      nameLocation: 'center',
      nameGap: 25,
      data: ['0-25', '25-50', '50-75', '75-100', '100-125', '125-150', '150-175', '175-200'],
    },
    yAxis: {
      type: 'value',
      name: 'Frequency',
    },
    dataZoom: [
      {
        show: isFlip,
        type: 'slider',
        bottom: 'bottom',
        height: '6%',
        start: 0,
        end: (5 / categoriesArray.length) * 100
      },
    ],
    series: [
      {
        name: 'Machine A',
        type: 'bar',
        barGap: '0%',  // ensures bars for different machines can overlap
        barWidth: 30, // Adjust the bar width as needed
        data: [2, 1, 0, 1, 0, 0, 0, 0],
        itemStyle: { color: '#2ECC71' },
        label: {
          show: true,
          position: 'top'
        }
      },
      {
        name: 'Machine B',
        type: 'bar',
        barGap: '0%',
        barWidth: 30,
        data: [2, 0, 1, 1, 0, 0, 0, 0],
        itemStyle: { color: '#F39C12' },
        label: {
          show: true,
          position: 'top'
        }
      },
      {
        name: 'Machine C',
        type: 'bar',
        barGap: '0%',
        barWidth: 30,
        data: [2, 1, 0, 0, 1, 0, 0, 0],
        itemStyle: { color: '#E74C3C' },
        label: {
          show: true,
          position: 'top'
        }
      },
      {
        name: 'Machine D',
        type: 'bar',
        barGap: '0%',
        barWidth: 30,
        data: [2, 1, 1, 0, 0, 1, 1, 1],
        itemStyle: { color: '#BA68C8' },
        label: {
          show: true,
          position: 'top'
        }
      },
    ],
  };

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>Downtime Duration Distribution</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <FullscreenOutlined onClick={showDetail} />
          </div>
        </div>
      }
    >
      <ReactECharts ref={echartsRef} option={option} style={{ height: '300px', width: '100%' }} />
      <Modal
        title="Downtime Duration Distribution"
        open={isModalOpen}
        centered
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width='100%'
      >
        <ReactECharts
          ref={echartsRef}
          option={option}
          style={{ height: 'calc(100vh - 100px)', width: '100%' }}
        />
      </Modal>

      <Modal closable={false} open={isFlip} centered onCancel={() => setIsFlip(false)} footer={null} width='100%'
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Downtime Duration Distribution</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                type="text"
                icon={
                  <AiOutlineInfoCircle
                    style={{ fontSize: '20px' }}
                  />
                }
                onClick={() => setOpen(prev => !prev)}
              />
              <Button type="text" icon={<CloseOutlined onClick={() => setIsFlip(false)} />} />
            </div>
          </div>
        }>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}>
          <ReactECharts option={option} ref={echartsRef} style={{
            height: 'calc(100vh - 100px)',
            width: open ? '70%' : '100%',
            transition: 'width 0.3s ease-in-out'
          }} />
          {open && renderInfoPanel()}
        </div>
      </Modal>
    </Card>
  );
};

export default DowntimeHistogram;