import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'antd/dist/reset.css';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import { AiOutlineFullscreen } from 'react-icons/ai';


interface GaugeDataItem {
    [key: string]: any;
}

interface MyGaugeChartProps {
    data?: GaugeDataItem[];
    unit?: string;
}

const GaugeChart: React.FC<MyGaugeChartProps> = ({
    data ,
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
        const keys = Object.keys(firstItem);
        const numericField = keys.find(key => typeof firstItem[key] === 'number' || !isNaN(Number(firstItem[key])));
        const stringField = keys.find(key => key !== numericField && (typeof firstItem[key] === 'string' || typeof firstItem[key] === 'undefined'));

        if (!numericField || !stringField) {
            console.warn('Could not detect appropriate fields for gauge chart data');
            return [{
                value: 0,
                name: 'Invalid Data Format',
                title: {
                    offsetCenter: ['0%', '0%']
                },
                detail: {
                    valueAnimation: true,
                    offsetCenter: ['0%', '15%']
                }
            }];
        }

        // Find max value for scaling
        const maxValue = Math.max(...inputData.map(item => Number(item[numericField]) || 0));

        return inputData.map((item, index) => {
            const totalItems = inputData.length;
            const spacing = totalItems === 1 ? 0 : 50 / (totalItems - 1);
            const startOffset = -25;
            const rawValue = Number(item[numericField]) || 0;
            // Scale the value to percentage (0-100) for the gauge
            const scaledValue = (rawValue / maxValue) * 100;

            const formattedValue = formatNumber(rawValue);

            return {
                value: scaledValue,
                name: String(item[stringField] || `Item ${index + 1}`),
                title: {
                    offsetCenter: ['0%', `${startOffset + (index * spacing)}%`],
                    color: '#999',
                    fontSize: 14,
                    fontWeight: 500
                },
                detail: {
                    valueAnimation: true,
                    offsetCenter: ['0%', `${startOffset + (index * spacing) + 15}%`],
                    formatter: `${formattedValue} ${unit}`,
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
        // <div style={{ background: '#fff', borderRadius: '8px', height:'380px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        //     <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 500, color: '#333' ,padding: '3px 24px' }}>Overall Downtime</h3>
        //     <div style={{ height: '1px', background: '#ff0000', margin: '0 0 16px 0' }} />
        //     <ReactECharts 
        //         ref={echartsRef} 
        //         style={{height:'calc(100% - 42px)',width:'100%'}} 
        //         option={getOption()} 
        //         notMerge={true} 
        //     />
        // </div>
        <Card
            style={{  height: '380px' }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>Overall Downtime</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* <FullscreenOutlined onClick={showDetail} /> */}
                    </div>
                </div>
            }
        >
            <ReactECharts
                ref={echartsRef}
                style={{ height: '300px', width: '100%' }}
                option={getOption()}
                notMerge={true}
            />
        </Card>
    );
};



export default GaugeChart;
