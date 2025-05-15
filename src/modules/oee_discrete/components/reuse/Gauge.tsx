import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Modal, Typography, Button, Tooltip } from 'antd';
import 'antd/dist/reset.css';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Import styles for ResizableBox
import { CloseOutlined, FullscreenOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react';
import { AiOutlineInfoCircle, AiOutlineFullscreen } from 'react-icons/ai';
import { AiOutlineClose } from 'react-icons/ai';

const { Title } = Typography;
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

interface MyGaugeChartProps {
  value: number;
  title: string;
  color: any;
  categoriesArray?: string[];
  data?: any[];
  valueKeys?: string[];
}

const MyGaugeChart: React.FC<MyGaugeChartProps> = ({
  value,
  title,
  color,
  categoriesArray = [],
  data = [],
  valueKeys = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);
  const activeTabIndex = sessionStorage.getItem('activeTabIndex');
  const isDownTime = activeTabIndex?.includes('downtime') ? true : false;

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
  }, [value]);

  const option = {
    series: [
      {
        type: 'gauge',
        radius: '80%',
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
          formatter: isDownTime ? `{value} Sec` : `{value}%`,
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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{ background: color.lightcolor}}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <AiOutlineFullscreen onClick={showDetail} />
            {/* {!isModalOpen && (
              <Tooltip placement='topRight' title='FullScreen'>
                <FullscreenOutlined onClick={showModal} />
              </Tooltip>
            )} */}
          </div>
          {/* <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>

          {!isModalOpen && (
            <Tooltip placement='topRight' title='FullScreen'>
              <FullscreenOutlined onClick={showModal} />
            </Tooltip>
          )} */}
        </div>
      }
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        overflow: 'hidden'
      }}>
        <ReactECharts ref={echartsRef} option={option} style={{ height: '300px', width: '100%' }} />
      </div>

      <Modal
        title={title}
        centered
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}

        width='100%'
        // height='1000'
        footer={null}
      >

        <ReactECharts ref={echartsRef} option={option} style={{ height: 'calc(100vh - 100px)', width: '100%' }} />
      </Modal>

      {/* <Modal closable={false} open={isFlip} centered onCancel={() => setIsFlip(false)} footer={null} width='100%'
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{title}</span>
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
              <Button type="text" icon={<AiOutlineClose style={{fontSize:'20px'}} onClick={() => setIsFlip(false)} />} />
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
          {open && (
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
                <p><strong>Description:</strong> This gauge chart visualizes {title.toLowerCase()} performance metrics in real-time.</p>
                <p>The gauge indicates current performance levels with color-coded thresholds for quick status assessment.</p>
                <p><strong>Date Range:</strong> {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: '20px' }}>
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color.greencolor || '#28a745', marginRight: '10px' }}></div>
                    <span>Good: ≥ 85%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color.yellowcolor || '#ffc107', marginRight: '10px' }}></div>
                    <span>Warning: 50-84%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color.redcolor || '#dc3545', marginRight: '10px' }}></div>
                    <span>Critical: ≤ 50%</span>
                  </div>
                </>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p><strong>Current Value:</strong> {value}%</p>
                <p><strong>Average:</strong> {
                  (data.reduce((acc, item) => acc + (Number(item[valueKeys[0]]) || 0), 0) / data.length).toFixed(2)
                }%</p>
                <p><strong>Status:</strong> {
                  value >= 85 ? 'Good Performance' :
                  value >= 50 ? 'Needs Improvement' :
                  'Critical Attention Required'
                }</p>
              </div>
            </div>
          )}
        </div>
      </Modal> */}

      <Modal closable={false} open={isFlip} centered onCancel={() => setIsFlip(false)} footer={null} width='100%'
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{title}</span>
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
          {open && (
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
                <p><strong>Description:</strong> This gauge chart visualizes {title.toLowerCase()} performance metrics in real-time.</p>
                <p>The gauge indicates current performance levels with color-coded thresholds for quick status assessment.</p>
                {/* <p><strong>Date Range:</strong> {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p> */}
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: '20px' }}>
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color.greencolor || '#28a745', marginRight: '10px' }}></div>
                    <span>Good: ≥ 91%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color.yellowcolor || '#ffc107', marginRight: '10px' }}></div>
                    <span>Warning: 70-90%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color.redcolor || '#dc3545', marginRight: '10px' }}></div>
                    <span>Critical: &lt; 70%</span>
                  </div>
                </>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p><strong>Current Value:</strong> {value}%</p>
                <p><strong>Average:</strong> {
                  (data.reduce((acc, item) => acc + (Number(item[valueKeys[0]]) || 0), 0) / data.length).toFixed(2)
                }%</p>
                <p><strong>Status:</strong> {
                  value >= 91 ? 'Good Performance' :
                    value >= 70 ? 'Needs Improvement' :
                      'Critical Attention Required'
                }</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default MyGaugeChart;
