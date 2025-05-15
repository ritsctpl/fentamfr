/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import * as echarts from 'echarts';

const AnalyticsDashboard = () => {
  const leaveData = [
    { value: 20, name: 'Reported', itemStyle: { color: '#4287f5' }},
    { value: 18, name: 'On Leave', itemStyle: { color: '#8a4af3' }},
    { value: 2, name: 'Not Reported', itemStyle: { color: '#42ba96' }},
    { value: 5, name: 'Cancelled', itemStyle: { color: '#ffc107' }}
  ];

  const ServiceData = [
    { value: 40, name: 'Service Opened', itemStyle: { color: '#4287f5' }},
    { value: 20, name: 'Service Closed', itemStyle: { color: '#8a4af3' }},
    { value: 15, name: 'Service On Hold', itemStyle: { color: '#42ba96' }},
    { value: 5, name: 'Service Cancelled', itemStyle: { color: '#ffc107' }}
  ];

  const performanceData = {
    Design: [75, 62, 88, 70],
    Dev: [80, 95, 65, 78],
    Marketing: [85, 55, 72, 68]
  };

  React.useEffect(() => {
    // Leave Analytics Chart
    const leaveChart = echarts.init(document.getElementById('employee-chart'));
    leaveChart.setOption({
      tooltip: { 
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
    //   legend: {
    //     orient: 'vertical',
    //     right: '5%',
    //     top: 'center',
    //     itemWidth: 16,
    //     itemHeight: 16,
    //     textStyle: { 
    //       color: '#666', 
    //       fontSize: 16 
    //     },
    //     formatter: (name) => {
    //       const item = leaveData.find(d => d.name === name);
    //       return `${name}: ${item ? item.value : 0}`; // Add value to legend
    //     }
    //   },
      graphic: {
        elements: [{
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: '45', // This is a placeholder, adjust dynamically
            fontSize: 36, // Increased font size
            fontWeight: 'bold',
            textAlign: 'center',
            fill: '#333'
          }
        }]
      },
      series: [{
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'], // Ensure the center is aligned
        avoidLabelOverlap: false,
        label: { show: false },
        data: leaveData
      }]
    });

    // Service Analytics Chart
    const serviceChart = echarts.init(document.getElementById('job-chart'));
    serviceChart.setOption({
      tooltip: { 
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
    //   legend: {
    //     orient: 'vertical',
    //     right: '5%',
    //     top: 'center',
    //     itemWidth: 16,
    //     itemHeight: 16,
    //     textStyle: { 
    //       color: '#666', 
    //       fontSize: 16 
    //     },
    //     formatter: (name) => {
    //       const item = ServiceData.find(d => d.name === name);
    //       return `${name}: ${item ? item.value : 0}`; // Add value to legend
    //     }
    //   },
      graphic: {
        elements: [{
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: '80', // This is a placeholder, adjust dynamically
            fontSize: 36, // Increased font size
            fontWeight: 'bold',
            textAlign: 'center',
            fill: '#333'
          }
        }]
      },
      series: [{
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'], // Ensure the center is aligned
        avoidLabelOverlap: false,
        label: { show: false },
        data: ServiceData
      }]
    });

    // Team Performance Chart
    const performanceChart = echarts.init(document.getElementById('performance-chart'));
    performanceChart.setOption({
      tooltip: { 
        trigger: 'axis',
        formatter: '{b}<br/>{a}: {c}%'
      },
    //   legend: {
    //     orient: 'vertical',
    //     right: '5%',
    //     top: 'center',
    //     itemWidth: 16,
    //     itemHeight: 16,
    //     textStyle: { 
    //       color: '#666', 
    //       fontSize: 16 
    //     }
    //   },
      grid: {
        left: '5%',
        right: '0%',
        top: '5%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Q1', 'Q2', 'Q3', 'Q4'],
        axisLine: { lineStyle: { color: '#ddd' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: '#666'
        },
        splitLine: { lineStyle: { color: '#eee' } }
      },
      series: [
        {
          name: 'Design Team',
          type: 'bar',
          data: performanceData.Design,
          itemStyle: { color: '#4287f5' }
        },
        {
          name: 'Dev Team',
          type: 'bar',
          data: performanceData.Dev,
          itemStyle: { color: '#42ba96' }
        },
        {
          name: 'Marketing Team',
          type: 'bar',
          data: performanceData.Marketing,
          itemStyle: { color: '#ffc107' }
        }
      ]
    });

    const handleResize = () => {
      leaveChart.resize();
      serviceChart.resize();
      performanceChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      leaveChart.dispose();
      serviceChart.dispose();
      performanceChart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="card">
        <div className="card-header">
          <h2>Leave Analytics</h2>
          <select className="header-select">
            <option>All Time</option>
          </select>
        </div>
        <div className="card-content">
          <div className="chart-container">
            <div className="chart" id="employee-chart"></div>
          </div>
          <div className="legend">
            {leaveData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-icon" style={{ backgroundColor: item.itemStyle.color }}></div>
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Service Analytics</h2>
          <select className="header-select">
            <option>All Time</option>
          </select>
        </div>
        <div className="card-content">
          <div className="chart-container">
            <div className="chart" id="job-chart"></div>
          </div>
          <div className="legend">
            {ServiceData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-icon" style={{ backgroundColor: item.itemStyle.color }}></div>
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Team Performance</h2>
          <select className="header-select">
            <option>2023</option>
          </select>
        </div>
        <div className="card-content">
          <div className="chart-container">
            <div className="chart" id="performance-chart"></div>
          </div>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-icon" style={{ backgroundColor: '#4287f5' }}></div>
              <span className="legend-label">Design Team</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon" style={{ backgroundColor: '#42ba96' }}></div>
              <span className="legend-label">Dev Team</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon" style={{ backgroundColor: '#ffc107' }}></div>
              <span className="legend-label">Marketing Team</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          gap: 15px;
          padding: 15px;
          width: 100%;
          box-sizing: border-box;
          background: #f5f7fb;
          margin-top: 20px;
        }

        .card {
          flex: 1;
          background: white;
          border-radius: 8px;
          box-shadow: 0 3px 4px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: #ffffff;
          border-bottom: 1px solid #eef2f8;
        }

        .card-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        .header-select {
          padding: 4px 8px;
          border: 1px solid #e1e8ef;
          border-radius: 4px;
          font-size: 13px;
          color: #5c6c7c;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-select:hover {
          border-color: #4287f5;
        }

        .card-content {
          display: flex;
          padding: 12px;
        }

        .chart-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .chart {
          height: 200px;
          width: 100%;
        }

        .legend {
          width: 30%;
          height: 200px;
          gap: 6px;
          padding: 0 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #666;
          width: 100%;
          padding: 2px 0;
        }

        .legend-icon {
          min-width: 8px;
          height: 8px;
          margin-right: 6px;
        }

        .legend-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 8px;
        }

        .legend-value {
          margin-left: auto;
          font-weight: 600;
        }

        @media (max-width: 1200px) {
          .legend {
            width: 100%;
            height: auto;
            flex-direction: row;
            flex-wrap: wrap;
            padding: 8px 0;
          }

          .legend-item {
            width: auto;
            margin-right: 16px;
            flex-direction: row;
            align-items: center;
          }

          .legend-value {
            margin-left: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;