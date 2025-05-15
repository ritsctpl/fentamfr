import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
const { Title } = Typography;
import { getColor } from './LineChart';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';

interface AreaChartProps {
  data: Record<string, any>[];
  title: string;
}

const AreaChart: React.FC<AreaChartProps> = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // const { color } = useFilterContext();
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);

  const keys = Object.keys(data[0] || {});
  const xAxisKey = keys[0];
  const yAxisKey = keys[1];

  const categoriesArray = data.map(item => new Date(item[xAxisKey]).toLocaleDateString());
  const valueKeys = Object.keys(data[0] || {}).slice(1);

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

  const options = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item[xAxisKey]),
      axisLabel: {
        formatter: (value: string) => {
          return new Date(value).toLocaleDateString();
        }
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    visualMap: {
      show: false,
      pieces: [
        {
          gt: 0,
          lte: 10,
          color: '#2ECC71'
        },
        {
          gt: 10,
          lte: 30,
          color: '#F39C12'
        },
        {
          gt: 30,
          lte: 100,
          color: '#E74C3C'
        }
      ],
    },
    series: [{
      name: yAxisKey,
      type: 'line',
      smooth: true,
      colorBy: 'data',
      areaStyle: {
        opacity: 0.4,
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => params.value.toFixed(1) + '%'
      },
      itemStyle: {
        color: (params: any) => {
          const currentValue = params.data;
          return getColor(currentValue, tabkey,{
            itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
            threshold:[50,85,20],
            linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          });
        }
      },
      data: data.map(item => item[yAxisKey])
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${new Date(param.name).toLocaleDateString()}<br/>${param.seriesName}: ${param.value}`;
      }
    },
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: {
          show: true,
        }
      }
    }
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
            <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
                <FullscreenOutlined onClick={showDetail} />
                {/* {!isModalOpen && (
                    <Tooltip placement='topRight' title='FullScreen'>
                        <FullscreenOutlined onClick={showModal} />
                    </Tooltip>
                )} */}
            </div>
        </div>
    }
    >
      <ReactECharts ref={echartsRef} option={options} style={{ height: '300px' }} />
      <Modal
        title={title}
        open={isModalOpen}
        centered
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width='100%'
      >
        <ReactECharts
          option={options}
          style={{ height: 'calc(100vh - 100px)', width: '100%' }}
          ref={echartsRef}
        />
      </Modal>


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
          <ReactECharts option={options} ref={echartsRef} style={{
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
                <p><strong>Description:</strong></p>
                <p>This chart visualizes {title.toLowerCase()} metrics over time, helping track performance trends and identify patterns.</p>
                <p>Use this graph to monitor daily variations and spot areas requiring attention or improvement.</p>
                <p><strong>Date Range:</strong> {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: '20px' }}>
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#2ECC71', marginRight: '10px' }}></div>
                    <span>Good: 0-10%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#F39C12', marginRight: '10px' }}></div>
                    <span>Warning: 10-30%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#E74C3C', marginRight: '10px' }}></div>
                    <span>Critical: 30-100%</span>
                  </div>
                </>
              </div>

              <Title level={5}>Graph Analysis</Title>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Key Metrics:</strong></p>
                <ul>
                  <li>Measurement Type: {yAxisKey}</li>
                  <li>Data Points: {data.length}</li>
                  <li>Average Value: {
                    (data.reduce((acc, item) => acc + (Number(item[valueKeys[0]]) || 0), 0) / data.length).toFixed(2)
                  }</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default AreaChart;
