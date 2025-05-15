import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'antd/dist/reset.css';
import ReactECharts from 'echarts-for-react';

interface GaugeDataItem {
    totaldurationinseconds?: number;
    totaldowntime?: number;
    [key: string]: any;
}

interface MyGaugeChartProps {
    data?: GaugeDataItem[];
    unit?: string;
}

const GaugeChart: React.FC<MyGaugeChartProps> = ({
    data = [],
    unit = ''
}) => {
    const echartsRef = useRef<ReactECharts>(null);

    const formatNumber = (value: number) => {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        const seconds = Math.floor(value % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const processGaugeData = (inputData: GaugeDataItem[]) => {
        if (!Array.isArray(inputData) || inputData.length === 0) {
            return [{
                value: 0,
                name: 'No Data',
                title: {
                    offsetCenter: ['0%', '0%']
                },
                detail: {
                    valueAnimation: true,
                    offsetCenter: ['0%', '15%']
                }
            }];
        }

        const firstItem = inputData[0];
        
        // Handle the specific format for duration and downtime
        const metrics = [
            { 
                key: 'totalduration',
                name: 'Total Duration'
            },
            { 
                key: 'totaldowntime',
                name: 'Total Downtime'
            }
        ];

        // Find max value for scaling
        const maxValue = Math.max(
            firstItem.totaldurationinseconds || 0,
            firstItem.totaldowntime || 0
        );

        return metrics.map((metric, index) => {
            const totalItems = metrics.length;
            const spacing = totalItems === 1 ? 0 : 50 / (totalItems - 1);
            const startOffset = -25;
            const rawValue = firstItem[metric.key] || 0;
            // Scale the value to percentage (0-100) for the gauge
            const scaledValue = (rawValue / maxValue) * 100;
            
            const formattedValue = formatNumber(rawValue);
            
            return {
                value: scaledValue,
                name: metric.name,
                title: {
                    offsetCenter: ['0%', `${startOffset + (index * spacing)}%`],
                    color: '#999',
                    fontSize: 14,
                    fontWeight: 500
                },
                detail: {
                    valueAnimation: true,
                    offsetCenter: ['0%', `${startOffset + (index * spacing) + 15}%`],
                    formatter: `${formattedValue}`,
                    color: '#5470c6',
                    fontSize: 16,
                    fontWeight: 500
                }
            };
        });
    };

    useEffect(() => {
        if (echartsRef.current) {
            const chart = echartsRef.current.getEchartsInstance();
            chart.clear();
            chart.setOption(getOption());
            chart.resize();
            const timer = setTimeout(() => {
                chart.resize();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [data]);

    const getOption = () => ({
        series: [
            {
                type: 'gauge',
                min: 0,
                max: 100,
                startAngle: 90,
                endAngle: -270,
                pointer: {
                    show: false
                },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff'
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 30
                    }
                },
                splitLine: {
                    show: false,
                    distance: 0,
                    length: 10
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    distance: 50
                },
                data: processGaugeData(data),
                title: {
                    fontSize: 14,
                    color: '#999'
                },
                detail: {
                    width: 80,
                    height: 20,
                    fontSize: 16,
                    color: '#5470c6',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    borderRadius: 20,
                    borderWidth: 0
                }
            }
        ]
    });

    return (
        <ReactECharts 
            ref={echartsRef} 
            style={{height:'100%',width:'100%'}} 
            option={getOption()} 
            notMerge={true} 
        />
    );
};

export default GaugeChart;
