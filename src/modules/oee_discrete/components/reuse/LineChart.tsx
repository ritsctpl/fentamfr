import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Tooltip, Button } from 'antd';
import { AiOutlineClose, AiOutlineFileSearch, AiOutlineFullscreen } from 'react-icons/ai'
import { AiOutlineInfoCircle } from "react-icons/ai";
import { CloseOutlined } from '@mui/icons-material';
import NoDataFound from './NoDataFound';
const { Title } = Typography;

interface DataPoint {
  date: string;
  [key: string]: number | string;
}

interface LineChartProps {
  data: DataPoint[];
  title: String
  color: any
  description?:any
  type?:string
}
export const getColor = (value: number, type: string,color) => {
  switch (type) {
    case 'availability':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'quality':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'downtime':
      if (value > color?.threshold[0]) return color?.itemcolor[0];
      if (value > color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'performance':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    case 'oee':
      if (value < color?.threshold[0]) return color?.itemcolor[0];
      if (value < color?.threshold[1]) return color?.itemcolor[1];
      return color?.itemcolor[2];
    default:
      if (value < 50) return color?.itemcolor[0];
      if (value < 84) return color?.itemcolor[1];
      return color?.itemcolor[2];
  }
};

const LineChart: React.FC<LineChartProps> = ({ data, title, color, description, type }) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabkey = sessionStorage.getItem('activeTabIndex')
  const echartsRef = useRef<ReactECharts>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isFlip, setIsFlip] = useState(false);
  const [open, setOpen] = useState(false);

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
  useEffect(() => {
    if (data && data.length > 0) {
      // Extract the xAxisData
      const newXAxisData = data.map(item => item.date);


      // Extract the series keys (all keys except 'date')
      const newSeriesKeys = Object.keys(data[0]).filter(key => key !== 'date');



 
    }
  }, [data, tabkey, color]); 
  const getColor = (value: number, type: string) => {
    switch (type) {
      case 'availability':
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      case 'quality':
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      case 'downtime':
        if (value > color?.threshold[1]) return color?.itemcolor[2]; // Red for high downtime
        if (value > color?.threshold[0]) return color?.itemcolor[1]; // Yellow for medium downtime
        return color?.itemcolor[0]; // Green for low downtime
      case 'performance':
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      case 'oee':
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
      default:
        if (value < color?.threshold[0]) return color?.itemcolor[2]; // Red for critical
        if (value < color?.threshold[1]) return color?.itemcolor[1]; // Yellow for warning
        return color?.itemcolor[0]; // Green for good
    }
  };

  const xAxisData = data?.length ? data.map(item => item.date) : [];
  const seriesKeys = Object.keys(data[0] || {}).filter(key => key !== 'date');
  const activeTabIndex = sessionStorage.getItem('activeTabIndex');
  const isDownTime = activeTabIndex?.includes('downtime') ? true : false;
 const series = seriesKeys.map((key,index) => {
    const dataPoints = data.map(item => item[key] as number);
    return {
      name: key,
      type: 'line',
      smooth: true,
      data: dataPoints,
      Stack: 'value',
      clip: true,
      itemStyle: {
        color: (params) => getColor(dataPoints[params.dataIndex], tabkey)
      },
      label: {
        show: true,
        position: 'top',
        formatter: isDownTime ? '{c} sec' : title.toLowerCase() === 'scrap and rework trend' ? '{c}' : type ==='count' ? '{c}' : '{c} %',
        fontSize: 12
      },
      lineStyle: {
        color: color?.linecolor[index]
      }
    };
  });

  const options = {

    // color:colors,
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        interval: 0,
        formatter: (value: string, index: number) => {
          const dateSeparator = value.includes('T') ? 'T' : ' ';
          const [datePart, timePart] = value.split(dateSeparator);
          // For first entry always show date
          if (index === 0) return datePart;
          
          // Get previous date part
          const prevDate = (index > 0 && xAxisData[index - 1]) ? xAxisData[index - 1].split(dateSeparator)[0] : '';
          
          // Show date only if different from previous
          return datePart === prevDate ? timePart : datePart;
        },
        rotate: 45,
      },
      splitNumber: data?.length || 0,
    },
    yAxis: {
      type: 'value',
    },
    series,
    dataZoom: [
      {
        show: true,
        type: 'slider',
        bottom: 50,  // Add space from bottom
        height: '20px',  // Increase height
        start: 0,
        end: (isFlip ? 30 : 20) / data.length * 100,  // Show full range
        showDetail: true,
        showDataShadow: true,
        zoomLock: false,
        brushSelect: true
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',  // Add more space at bottom for dataZoom
      top: '3%',
      containLabel: true
    },
 
    toolbox: {
      show: true,
      right: '10%',
      feature: {
        saveAsImage: {
          show: true,
        }
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const header = params[0].name; 
        const body = params
          .map(({ marker, seriesName, value }) => `${marker} ${seriesName}: ${value}`)
          .join('<br />');
        return `${header}<br />${body}`;
      },
    },
    legend: {
      data: seriesKeys,
      top: 'bottom',
      left: 'center',
    },
  };

  const showDetail = () => {
    setIsFlip(true);
  }

  return (
    <Card
      ref={chartContainerRef}
      // style={{  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
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
        </div>
      }
    >
      {data.length === 0 ? (
       <NoDataFound/>
      ) : (
        <ReactECharts ref={echartsRef} option={options} style={{ height: 'calc(100vh - 305px)' }} />
      )}
      <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='100%'>
        <ReactECharts opts={{ locale: 'FR' }} option={options} style={{ height: 'calc(100vh - 100px)', width: '100%' }} ref={echartsRef} />
      </Modal>

      <Modal closable={false} open={isFlip} centered onCancel={() => setIsFlip(false)} footer={null} width='100%'
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button type="text" icon={<AiOutlineInfoCircle style={{fontSize:'20px'}} onClick={() => setOpen(prev => !prev)} />} />
              <Button type="text" icon={<AiOutlineClose style={{fontSize:'20px'}} onClick={() => setIsFlip(false)} />} />
            </div>
          </div>
        }>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}>
          <ReactECharts 
            opts={{ locale: 'FR' }} 
            option={options} 
            style={{ 
              height: 'calc(100vh - 100px)', 
              width: open ? '70%' : '100%',
              transition: 'width 0.3s ease-in-out'
            }} 
            ref={echartsRef} 
          />
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
                <p>{description}</p>
                <p><strong>Date Range:</strong> {xAxisData[0]} to {xAxisData[xAxisData.length - 1]}</p>
              </div>

              <Title level={5}>Performance Thresholds</Title>
              <div style={{ marginBottom: '20px' }}>
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color?.itemcolor[0], marginRight: '10px' }}></div>
                    <span>Good: ≥ {color?.threshold[1]}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color?.itemcolor[1], marginRight: '10px' }}></div>
                    <span>Warning: {color?.threshold[0]}-{color?.threshold[1]-1}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: color?.itemcolor[2], marginRight: '10px' }}></div>
                    <span>Critical: ≤ {color?.threshold[0]-1}%</span>
                  </div>
                </>
              </div>

              <Title level={5}>Statistics</Title>
              <div>
                <p><strong>Average:</strong> {
                  (data.reduce((acc, item) => acc + (Number(item[seriesKeys[0]]) || 0), 0) / data.length).toFixed(2)
                }%</p>
                <p><strong>Highest Value:</strong> {
                  Math.max(...data.map(item => Number(item[seriesKeys[0]]) || 0)).toFixed(2)
                }%</p>
                <p><strong>Lowest Value:</strong> {
                  Math.min(...data.map(item => Number(item[seriesKeys[0]]) || 0)).toFixed(2)
                }%</p>
                <p><strong>Data Points:</strong> {data.length}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default LineChart;
