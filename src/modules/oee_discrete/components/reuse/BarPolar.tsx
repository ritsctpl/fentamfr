import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Modal, Button } from 'antd';
import { AiOutlineClose, AiOutlineFullscreen } from 'react-icons/ai';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';
import NoDataFound from './NoDataFound';


interface DataPoint {
    [key: string]: number | string;
}

interface BarChartProps {
    data: DataPoint[];
    title: string;
    color: string[];
    threshold: [number, number];
    close?: boolean;
    unit?: string;
    description?: string;
    type?: string;
    onBarClick?: (xValue: string, yValue: number) => void;
}
const BarChartPolar: React.FC<BarChartProps> = ({ 
    data, 
    title, 
    color, 
    close, 
    threshold, 
    unit, 
    description,
    type, 
    onBarClick 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const [barName, setBarName] = useState<string | null>(null);
    
    const tabkey = sessionStorage.getItem('activeTabIndex');
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const { setDowntimeOeeData } = useFilterContext();
    const activeTabIndex = sessionStorage.getItem('activeTabIndex');
    const isDownTime = activeTabIndex?.includes('downtime') ?? false;

    useEffect(() => {
        if (type === 'workcenter' && barName !== null) {
            setDowntimeOeeData(prev => ({
                ...prev,
                downtimeByMachinee: [
                    { machine: 'Machine A', percentage: 25 },
                    { machine: 'Machine B', percentage: 40 },
                    { machine: 'Machine C', percentage: 35 }
                ]
            }));
        }
    }, [barName, type, setDowntimeOeeData]);

    useEffect(() => {
        if (echartsRef.current) {
            if (isModalOpen || isFlip) {
                echartsRef.current.getEchartsInstance().resize();
            }
        }
    }, [isModalOpen, isFlip]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            echartsRef.current?.getEchartsInstance().resize();
        });

        chartContainerRef.current && resizeObserver.observe(chartContainerRef.current);
        return () => resizeObserver.disconnect();
    }, [data]);

    const categoryKey = data[0] ? Object.keys(data[0]).find(key => typeof data[0][key] === 'string') : undefined;
    const metricsKeys = data[0] ? Object.keys(data[0]).filter(key => key !== categoryKey && typeof data[0][key] === 'number') : [];
    const xAxisData = data.map(item => item[categoryKey]);

    if (!data.length) {
        return (
            <Card ref={chartContainerRef} title={title}>
                <NoDataFound />
            </Card>
        );
    }
    
    const getColor = (value: number, type: string, color: string[], threshold: [number, number] = [0, 0]) => {
        if (value < threshold[0]) return 'red';
        if (value < threshold[1]) return 'yellow';
        return color[0];
    };

    const chartOption = {
        toolbox: {
            show: true,
            right: '10%',
            feature: { saveAsImage: { show: true } }
        },
        color: color,
        polar: {
            radius: [30, '80%'],  // Adjust the inner and outer radius
        },
        angleAxis: {
            type: 'category',
            data: xAxisData,  // Set this to your categories
            startAngle: 75,  // Customize the start angle
        },
        radiusAxis: {
            type: 'value',
        },
        series: metricsKeys.map((metricKey) => ({
            name: metricKey,
            type: 'bar',
            data: data.map((item) => {
                const value = Number(item[metricKey]);
                const itemColor = getColor(value, tabkey, color, threshold);
                const labelConfig = {
                    show: true,
                    position: 'middle',  // Tangential position in the middle
                    formatter: isDownTime
                        ? '{c} Sec'
                        : unit === 'count'
                        ? '{c}'
                        : '{c}',  // Label formatting
                };

                return metricsKeys.length === 1
                    ? { value, itemStyle: { color: itemColor }, label: labelConfig }
                    : { value, label: labelConfig };
            }),
            coordinateSystem: 'polar',
            colorBy: metricsKeys.length > 2 ? 'series' : 'data'
        })),
        dataZoom: [
            {
                show: isFlip,
                type: 'slider',
                bottom: 'bottom',
                height: '6%',
                start: 0,
                end: (5 / data.length) * 100,
            },
        ],
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
        },
        legend: metricsKeys.length > 2 ? { data: metricsKeys, bottom: 'bottom' } : undefined
    };

    return (
        <Card
            ref={chartContainerRef}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <AiOutlineFullscreen onClick={() => setIsFlip(true)} style={{ fontSize: '20px' }} />
                        {close && (
                            <Button
                                type="text"
                                style={{ padding: 0 }}
                                icon={<AiOutlineClose style={{ fontSize: '20px' }} />}
                                onClick={() => {
                                    setIsFlip(false);
                                    setDowntimeOeeData(prev => ({ ...prev, downtimeByMachinee: null }));
                                }}
                            />
                        )}
                    </div>
                </div>
            }
        >
            <ReactECharts
                ref={echartsRef}
                option={chartOption}
                style={{ height: 'calc(100vh - 305px)' }}
                onEvents={{
                    click: ({ name, value }) => onBarClick?.(name, value)
                }}
            />

            <Modal
                title={title}
                open={isFlip}
                centered
                onCancel={() => setIsFlip(false)}
                footer={null}
                width="100%"
                closable={false}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
                    <ReactECharts
                        ref={echartsRef}
                        option={chartOption}
                        style={{
                            height: 'calc(100vh - 100px)',
                            width: open ? '70%' : '100%',
                            transition: 'width 0.3s ease-in-out'
                        }}
                    />
                </div>
            </Modal>
        </Card>
    );
};

export default BarChartPolar;
