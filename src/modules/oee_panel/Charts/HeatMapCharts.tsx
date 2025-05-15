import React, { useRef, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
interface HeatMapProps {
    data: any[];
}

const HeatMapCharts: React.FC<HeatMapProps> = ({ data }) => {
    const echartsRef = useRef<ReactEcharts>(null);

    useEffect(() => {
        if (echartsRef.current) {
            const chart = echartsRef.current.getEchartsInstance();
            chart.clear();
            chart.setOption(getChartOptions());
            chart.resize();
            const timer = setTimeout(() => {
                chart.resize();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [data]);

    if (!data || data.length === 0 || !Array.isArray(data)) {
        return (
          <Card 
            bordered={false}
            style={{ 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fafafa'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <InboxOutlined style={{ 
                fontSize: '42px',
                color: '#bfbfbf'
              }} />
              <div style={{
                color: '#8c8c8c',
                fontSize: '16px',
                fontWeight: 500
              }}>
                No data available
              </div>
            </div>
          </Card>
        );
      }


    const getChartOptions = () => {
        const allKeys = Object.keys(data[0] || {});

        const yAxisKey = allKeys[0];
        const xAxisKey = allKeys[1];
        const valueKey = allKeys[2];

        // Return null if required keys are not present
        if (!yAxisKey || !xAxisKey || !valueKey) {
            return null;
        }

        const xCategories = Array.from(new Set(data.map(item => item[xAxisKey])));
        const yCategories = Array.from(new Set(data.map(item => item[yAxisKey])));

        const heatmapData = data.map(item => {
            const xIndex = xCategories.indexOf(item[xAxisKey]);
            const yIndex = yCategories.indexOf(item[yAxisKey]);
            return [xIndex, yIndex, item[valueKey]];
        });

        const values = data.map(item => Number(item[valueKey]));
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        return {
            tooltip: {
                position: 'top',
                formatter: (params: any) => {
                    const xCategory = xCategories[params.data[0]];
                    const yCategory = yCategories[params.data[1]];
                    const value = params.data[2];
                    return `${yCategory} - ${xCategory}<br/>Value: ${value}`;
                }
            },
            xAxis: {
                type: 'category',
                data: xCategories,
                splitArea: {
                    show: true
                },
            },
            yAxis: {
                type: 'category',
                data: yCategories,
                splitArea: {
                    show: true
                }
            },
            visualMap: {
                min: minValue,
                max: maxValue,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '0%',
                inRange: {
                    color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8',
                        '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                }
            },
            series: [{
                name: 'Heatmap',
                type: 'heatmap',
                data: heatmapData,
                label: {
                    show: true
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
    };

    const options = getChartOptions();
    if (!options) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Invalid data format</div>;
    }

    return <ReactEcharts
        ref={echartsRef}
        style={{ height: '100%', width: '100%' }}
        option={options}
        notMerge={true}
    />;
};

export default HeatMapCharts;