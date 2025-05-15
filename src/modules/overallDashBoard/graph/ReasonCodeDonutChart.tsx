import React, { useState } from "react";
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Typography, Button } from "antd";
import { AiOutlineClose, AiOutlineFullscreen, AiOutlineInfoCircle } from "react-icons/ai";
import NoDataScreen from "../components/NoData";
const { Title } = Typography;

interface ReasonCodeData {
  resource_id: string;
  reason: string | null;
  bad_qty: number;
  total_qty: number;
  bad_qty_percentage: number;
}

interface DonutChartProps {
  title?: string;
  rejectedData?: ReasonCodeData[] | ReasonCodeData;
}

const ReasonCodeDonutChart: React.FC<DonutChartProps> = ({ title, rejectedData }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rejectedData1 = [
    {
        "resource_id": "MULTI_CHANNEL_COUNTING_L1_PRET_0035",
        "reason": "reason 1 MULTI_CHANNEL_COUNTING_L1_PRET_0035",
        "bad_qty": 1000.0,
        "total_qty": 2000.0,
        "bad_qty_percentage": 20.0
    }, {
        "resource_id": "MULTI_CHANNEL_COUNTING_L1_PRET_0036",
        "reason": null,
        "bad_qty": 4000.0,
        "total_qty": 4000.0,
        "bad_qty_percentage": 40.0
    }, {
        "resource_id": "MULTI_CHANNEL_COUNTING_L1_PRET_0037",
        "reason": "reason 3 MULTI_CHANNEL_COUNTING_L1_PRET_0035 MULTI_CHANNEL_COUNTING_L1_PRET_0035",
        "bad_qty": 3000.0,
        "total_qty": 3000.0,
        "bad_qty_percentage": 30.0
    },
]
  // Handle both array and single object formats
  const dataArray = Array.isArray(rejectedData) ? rejectedData : rejectedData ? [rejectedData] : [];

  if (!dataArray.length || !dataArray[0]?.total_qty) {
    return <NoDataScreen />;
  }

  // Calculate quantities
  const totalBadQty = dataArray.reduce((sum, item) => sum + item.bad_qty, 0);
  const totalQty = dataArray[0].total_qty;
  const goodQty = totalQty - totalBadQty;
  
  // Prepare chart data with only reasons
  const chartData = dataArray.map(item => ({ 
    value: item.bad_qty, 
    name: item.reason ? item.reason : 'Unknown' 
  }));
  
  // If no bad qty exists, show only "Good"
  // if (chartData.length === 0 || totalBadQty === 0) {
  //   chartData.push({ value: goodQty, name: 'Good' });
  // }

  // Prepare legend data
  const legendData = chartData.map(item => item.name);

  // Generate dynamic colors for each reason code
  const colorPalette = [
    '#f5222d', // Red
    '#fa8c16', // Orange
    '#52c41a', // Green
    '#13c2c2', // Cyan
    '#1677ff', // Blue
    '#722ed1', // Purple
    '#eb2f96', // Magenta
    '#fa541c', // Volcano
    '#a0d911', // Lime
    '#2f54eb', // Geekblue
    '#eb1d4d'  // Rose
  ];

  // Assign a unique color to each reason from the palette
  const colors = chartData.map((_, index) => colorPalette[index % colorPalette.length]);

  const getChartOptions = () => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} '
    },
    legend: {
      orient: 'horizontal',
      right: 10,
      bottom: 10,
      width: '80%',  // Control legend width
      type: 'scroll', // Enable scrolling for many items
      formatter: function(name) {
        // Truncate long reason names to 30 characters
        return name.length > 30 ? name.substring(0, 27) + '...' : name;
      },
      textStyle: {
        overflow: 'truncate',
        width: 120  // Limit text width
      }
    },
    color: colors,
    series: [
      {
        name: 'Quantity',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0,  // Remove border radius
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center',
          formatter: '{b}: {c} '
        },
        emphasis: {
          label: {
            show: false,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  });

  // Calculate percentages
  const goodPercentage = ((goodQty / totalQty) * 100) || 0;

  return (
    <Card
      className="chart-card"
      
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title level={5} style={{ margin: 0 }}>{title || 'Reason Code Analysis'}</Title>
            {/* <AiOutlineInfoCircle /> */}
          </div>
          <Button 
            type="text" 
            icon={<AiOutlineFullscreen />} 
            onClick={() => setIsFullscreen(true)}
          />
        </div>
        // ref={chartContainerRef}
       
      }
      style={{marginTop: '10px',  marginRight: '10px'}}
    >
      <div style={{ height: 255 }}>
        <ReactECharts 
          option={getChartOptions()} 
          style={{ height: '100%', width: '100%' }}
        />
      </div>
      {/* <div style={{ textAlign: 'center', marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Good: {goodQty.toFixed(1)}</p>
            <p style={{ margin: 0, color: '#52c41a' }}>{goodPercentage.toFixed(1)}%</p>
          </div>
          {totalBadQty > 0 && (
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Bad: {totalBadQty.toFixed(1)}</p>
              <p style={{ margin: 0, color: '#f5222d' }}>{(100 - goodPercentage).toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div> */}

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>{title || 'Reason Code Analysis'}</Title>
            <Button 
              type="text" 
              // icon={<AiOutlineClose />} 
              onClick={() => setIsFullscreen(false)}
            />
          </div>
        }
        open={isFullscreen}
        footer={null}
        onCancel={() => setIsFullscreen(false)}
        width="80%"
        bodyStyle={{ height: '70vh' }}
      >
        <ReactECharts 
          option={getChartOptions()} 
          style={{ height: '100%', width: '100%' }}
        />
      </Modal>
    </Card>
  );
};

export default ReasonCodeDonutChart;