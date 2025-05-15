import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons'
import { useFilterContext } from '@modules/oee_process/hooks/filterData';
import { setDefaultHighWaterMark } from 'stream';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CloseOutlined } from '@mui/icons-material';
const { Title } = Typography;

interface DataPoint {
  date: string;
  [key: string]: number | string;
}

interface LineChartProps {
  data: DataPoint[];
  title: String
}
export const getColor = (value: number, type: string) => {
  switch (type) {
      case 'availability':
          if (value < 50) return "#dc3545";
          if (value < 85) return "#ffc107";
          return "#28a745";
      case 'quality':
          if (value < 80) return "#F44336";
          if (value < 95) return "#FFEB3B";
          return "#4CAF50";
      case 'downtime':
          if (value > 30) return "#E74C3C";
          if (value > 10) return "#F39C12";
          return "#2ECC71";
      case 'performance':
          if (value < 70) return "#B22222";
          if (value < 90) return "#FFAE42";
          return "#2E8B57";
      case 'oee':
          if (value < 60) return "#8B0000";
          if (value < 85) return "#FFD700";
          return "#008000";
      default:
          if (value < 50) return "#dc3545";
          if (value < 84) return "#ffc107";
          return "#28a745";
  }
};

const NewLineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey=sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { color,threshold } = useFilterContext()
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);

  const categoriesArray = data.map(item => item.date);
  const valueKeys = Object.keys(data[0]).filter(key => key !== 'date');

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

  const xAxisData = data.map(item => item.date);

  const options = {
    xAxis: {
      type: 'category',
      data: xAxisData,
    },
    yAxis: [
      {
        type: 'value',
        name: 'Downtime',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: 'Output',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    dataZoom: [
      {
        show: isFlip,
        type: 'slider',
        bottom: 'bottom',
        height: '6%',
        start: 0,
        end: (5 / data.length) * 100
      },
    ],
    series: [
      {
        name: 'downtime',
        type: 'line',
        smooth: true,
        data: data.map(item => item.downtime),
        yAxisIndex: 0,
        itemStyle: {
          color: (params) => getColor(params.value, 'downtime')
        },
        lineStyle: {
          color: color.maincolor
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      },
      {
        name: 'output',
        type: 'line',
        smooth: true,
        data: data.map(item => item.output),
        yAxisIndex: 1,
        itemStyle: {
          color: (params) => getColor(params.value, 'output')
        },
        lineStyle: {
          color: color.maincolor
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ],
    toolbox:{
      show:true,
      right:'10%',
      feature:{
        saveAsImage:{
          show:true,
        },
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{
        marker: string;
        name: string;
        value: number;
        seriesName: string;
      }>) => {
        return params
          .map(({ marker, name, value, seriesName }) => `${marker} [${seriesName}]: ${value}`)
          .join('<br />');
      },
    },
    legend: {
      data: ['downtime', 'output'],
      top: 'bottom',
      left: 'center',
    },

  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showDetail = () => {
    setIsFlip(!isFlip);
  };

  return (
    <Card
      ref={chartContainerRef}
      style={{ background: color.lightcolor, boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
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
          {/* <span style={{ margin: 0, fontFamily:'roboto',fontSize:'16px' }}>{title}</span>
          {!isModalOpen && (
            <Tooltip placement='topRight' title='FullScreen'>
              <FullscreenOutlined onClick={showModal} />
            </Tooltip>
          )} */}
        </div>
      }
    >
      <ReactECharts ref={echartsRef} option={options} style={{ height: '300px' }} />
      {/* <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='80%'>
        <ReactECharts opts={{ locale: 'FR' }} option={options} style={{ height: '600px', width: '100%' }} ref={echartsRef} />
        </Modal> */}
      <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='100%'>
        <ReactECharts opts={{ locale: 'FR' }} option={options} style={{ height: 'calc(100vh - 100px)', width: '100%' }} ref={echartsRef} />
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
                <p><strong>Description:</strong> This chart shows the relationship between downtime and output metrics over time.</p>
                <p>Higher output with lower downtime indicates optimal production efficiency.</p>
                <p><strong>Date Range:</strong> {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: '20px' }}>
                <div>
                  <h4>Downtime:</h4>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#2ECC71', marginRight: '10px' }}></div>
                    <span>Good: ≤ 10%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#F39C12', marginRight: '10px' }}></div>
                    <span>Warning: 10-30%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#E74C3C', marginRight: '10px' }}></div>
                    <span>Critical: &gt; 30%</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '15px' }}>
                  <h4>Output:</h4>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#28a745', marginRight: '10px' }}></div>
                    <span>Good: ≥ 85%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#ffc107', marginRight: '10px' }}></div>
                    <span>Warning: 50-84%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', marginRight: '10px' }}></div>
                    <span>Critical: &lt; 50%</span>
                  </div>
                </div>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p><strong>Average:</strong> {
                  (data.reduce((acc, item) => acc + (Number(item[valueKeys[0]]) || 0), 0) / data.length).toFixed(2)
                }</p>
                {/* <div style={{ width: '50%' }}>
                  Graph Details
                </div> */}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default NewLineChart;
