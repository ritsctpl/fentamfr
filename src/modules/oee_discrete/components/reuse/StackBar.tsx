import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Typography, Tooltip, Modal, Button } from 'antd';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';
import { AiOutlineInfoCircle, AiOutlineFullscreen } from 'react-icons/ai';

import { AiOutlineClose } from 'react-icons/ai';
import NoDataFound from './NoDataFound';
const { Title } = Typography;

interface DataPoint {
    [key: string]: any;
}

interface StackedBarChartProps {
  data: DataPoint[];
  title: string;
  color: any;
  description?:any
  theshold?:any
  type?:any
  onBarClick?: (xValue: string, yValue: number) => void; // Passing both x and y values
}
const getSeriesColor = (tabkey: string, color) => {
  const colorMeanings = {
    availability: {
      colors: color,
      meanings: ["Running Time", "Idle Time", "Down Time"],
    },
    quality: {
      colors: color,
      meanings: ["Good Quality", "Marginal Quality", "Poor Quality"],
    },
    downtime: {
      colors: color,
      meanings: ["Planned", "Unplanned", "Breakdown"],
    },
    performance: {
      colors: color,
      meanings: ["High Performance", "Medium Performance", "Low Performance"],
    },
    oee: {
      colors: color,
      meanings: ["Optimal OEE", "Average OEE", "Low OEE"],
    },
  };
  return colorMeanings[tabkey]?.colors || [];
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, title, color,description,theshold,type,onBarClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabkey = sessionStorage.getItem('activeTabIndex')
    const echartsRef = useRef<ReactECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    // const { color, colors } = useFilterContext()
    const [isFlip, setIsFlip] = useState(false);
    const [open, setOpen] = useState(false);
    const[barName,setBarName] = useState(null)
    const activeTabIndex = sessionStorage.getItem('activeTabIndex');
    const isDownTime = activeTabIndex?.includes('downtime') ? true : false;

    useEffect(() => {
        if (isModalOpen && echartsRef.current) {
            echartsRef.current.getEchartsInstance().resize();
        }
        if (isFlip && echartsRef.current) {
            echartsRef.current.getEchartsInstance().resize();
        }
    }, [isModalOpen, isFlip]);7
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


    const keys = data && data.length > 0 ? Object.keys(data[0]) : [];

    const possibleCategoryKeys = ['product', 'shift', 'line', 'workcenterId', 'itemBo', 'resourceId'];

    const reasonsKey = keys.find(key =>
        typeof data[0][key] === 'object' &&
        key.toLowerCase() === 'reasons'
    );

    const categoryKey = keys.find(key =>
        possibleCategoryKeys.includes(key.toLowerCase())
    ) || keys[0];

    const valueKeys = keys.filter(key =>
        typeof data[0][key] === 'number' ||
        key.toLowerCase().includes('percentage') ||
        key.toLowerCase().includes('value')
    );

    const groupingKey = keys.find(key =>
        key !== categoryKey &&
        !valueKeys.includes(key) &&
        typeof data[0][key] === 'string'
    );

    let seriesKeys: string[] = [];
    if (reasonsKey) {
        const allReasons = new Set<string>();
        data.forEach(item => {
            Object.keys(item[reasonsKey]).forEach(reason =>
                allReasons.add(reason)
            );
        });
        seriesKeys = Array.from(allReasons);
    } else {
        seriesKeys = groupingKey
            ? Array.from(new Set(data.map(item => item[groupingKey])))
            : valueKeys;
    }

    const categoriesArray = Array.from(new Set(Array.isArray(data) ? data.map(item => item[categoryKey]) : []));

    const seriesMap: Record<string, any> = {};
    seriesKeys.forEach(key => {
        seriesMap[key] = {
            name: key,
            type: 'bar',
            stack: tabkey === 'oee' ? 'oeeStack' : 'total',
            emphasis: { focus: 'series' },
            data: Array(categoriesArray.length).fill(0),
            colorBy: 'series',
            label: {
                show: true,
                position: 'inside',
                formatter: function(params) {
                    // Only show label if value is not 0
                    return params.value !== 0 ? (isDownTime ? `${params.value} min` : `${params.value}%`) : '';
                },
                fontSize: 12,
                color: '#fff'
            }
        };
 
        // if (tabkey === 'oee') {
        //     seriesMap[`${key}_remaining`] = {
        //         name: `${key} Remaining`,
        //         type: 'bar',
        //         stack: 'oeeStack',
        //         emphasis: { focus: 'series' },
        //         data: Array(categoriesArray.length).fill(0),
        //         itemStyle: {
        //             color: '#dcd9d9'
        //         },
        //         label: {
        //             show: false
        //         }
        //     };
        // }
    });

    if (Array.isArray(data)) {
        data.forEach(item => {
            const categoryIndex = categoriesArray.indexOf(item[categoryKey]);
            if (categoryIndex !== -1) {
                if (reasonsKey) {
                    Object.entries(item[reasonsKey]).forEach(([reason, value]) => {
                        if (seriesMap[reason]) {
                            seriesMap[reason].data[categoryIndex] = value;
                            if (tabkey === 'oee') {
                                seriesMap[`${reason}_remaining`].data[categoryIndex] = 100 - Number(value);
                            }
                        }
                    });
                } else if (groupingKey) {
                    const group = item[groupingKey];
                    const value = valueKeys.reduce((acc, key) => acc || item[key], 0);
                    if (seriesMap[group]) {
                        seriesMap[group].data[categoryIndex] = value;
                    }
                } else {
                    valueKeys.forEach(valueKey => {
                        if (seriesMap[valueKey]) {
                            const value = item[valueKey];
                            seriesMap[valueKey].data[categoryIndex] = value.toFixed(2);
                            if (tabkey === 'oee' && seriesMap[`${valueKey}_remaining`]) {
                                seriesMap[`${valueKey}_remaining`].data[categoryIndex] = (100 - value).toFixed(2);
                            }
                        }
                    });
                }
            }
        });
    }

    // Create series in alternating order (value, remaining, value, remaining)
    const series = Object.entries(seriesMap).reduce((acc: any[], [key, value]) => {
        if (tabkey === 'oee') {
            // If it's not a "remaining" series
            if (!key.includes('_remaining')) {
                // Push the main value series
                acc.push(value);
                // Push its corresponding remaining series immediately after
                acc.push(seriesMap[`${key}_remaining`]);
            }
        } else {
            acc.push(value);
        }
        return acc;
    }, []);

    const option = {
      toolbox: {
        show: true,
        right: "10%",
        feature: {
          saveAsImage: { show: true },
        },
      },

      color: getSeriesColor(tabkey, color),
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },

      legend: {
        data:
          tabkey === "oee"
            ? series
                .filter((s) => s?.name && !s.name.includes("Remaining"))
                .map((s) => s.name) // Only show main values in legend
            : series.map((s) => s?.name).filter(Boolean),
        bottom: "20px",
        type: "scroll",
        orient: "horizontal",
      },
      xAxis: {
        type: "category",
        data: categoriesArray,
      },
      yAxis: { type: "value" },
      series,
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
      stackLabel: {
        show: true,
      },
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const showDetail = () => {
        setIsFlip(!isFlip);
    };

    const handleChartClick = (params) => {
        if (params && params.data) {
            console.log('Clicked bar data:', params);
            setBarName(params.name)
        }
    };
    
    return (
        <Card
            ref={chartContainerRef}
            // style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ margin: 0, fontFamily: 'roboto', fontSize: '16px' }}>{title}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <AiOutlineFullscreen onClick={showDetail} />
                    </div>
                </div>
            }
        >
            {data.length === 0 ? (
               <NoDataFound />
            ) : (
                <>
                    <ReactECharts option={option} style={{ height: 'calc(100vh - 305px)' }} ref={echartsRef} onEvents={{
                        click: (params) => {
                            const xValue = params.name; 
                            const yValue = params.value; 
                            onBarClick && onBarClick(xValue, yValue);
                        },
                    }} />
                    <Modal title={title} open={isModalOpen} centered onCancel={() => setIsModalOpen(false)} footer={null} width='100%'>
                        <ReactECharts option={option} style={{ height: 'calc(100vh - 100px)', width: '100%' }} ref={echartsRef} />
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
                                transition: 'width 0.3s ease-in-out',
                                float: 'left'
                            }} />
                            {open && (
                                <div style={{
                                    width: '30%',
                                    padding: '20px',
                                    opacity: open ? 1 : 0,
                                    transform: open ? 'translateX(0)' : 'translateX(100%)',
                                    transition: 'all 0.3s ease-in-out',
                                    overflow: 'hidden',
                                    float: 'right'
                                }}>
                                    <Title level={5}>Graph Details</Title>
                                    <div style={{ marginBottom: '20px' }}>
                                        <p><strong>Description:</strong></p>
                                        <p>{description}</p>
                                    </div>

                                    <Title level={5}>Performance Thresholds</Title>
                                    <div style={{ marginBottom: '20px' }}>
                                        {tabkey && (
                                            <>
                                                {series
                                                    .filter(s => !s.name.includes('Remaining'))
                                                    .map((serie, index) => (
                                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                            <div style={{ 
                                                                width: '20px', 
                                                                height: '20px', 
                                                                backgroundColor: getSeriesColor(tabkey, color)?.[index], 
                                                                marginRight: '10px' 
                                                            }}></div>
                                                            <span>
                                                                {serie.name}
                                                                {/* {tabkey === 'oee' && ` (${serie.data[0]}%)`} */}
                                                            </span>
                                                        </div>
                                                    ))
                                                }
                                                {/* Show remaining bar for OEE with explanation */}
                                                {tabkey === 'oee' && (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                            <div style={{ 
                                                                width: '20px', 
                                                                height: '20px', 
                                                                backgroundColor: '#dcd9d9', 
                                                                marginRight: '10px' 
                                                            }}></div>
                                                            <span>Remaining</span>
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '12px', 
                                                            color: '#666', 
                                                            marginLeft: '30px', 
                                                            marginBottom: '12px' 
                                                        }}>
                                                            Note: The "Remaining" portion represents the gap between the current value of 100%. 
                                                            For example, if OEE is 65%, the remaining portion is 35%.
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <Title level={5}>Graph Analysis</Title>
                                    <div style={{ marginBottom: '20px' }}>
                                        <p><strong>Range:</strong> {categoriesArray[0]} to {categoriesArray[categoriesArray.length - 1]}</p>
                                        <p><strong>Total Categories:</strong> {categoriesArray.length}</p>
                                        <p><strong>Average Value:</strong> {
                                            (data?.reduce((acc, item) => acc + (Number(item[valueKeys[0]]) || 0), 0) / data?.length).toFixed(2)
                                        }%</p>
                                    </div>
                                    <div style={{ marginTop: '15px' }}>
                                    <p><strong>Graph Usage:</strong></p>
                                    <ul style={{ paddingLeft: '20px' }}>
                                        <li>Click on legend items to show/hide specific metrics</li>
                                        <li>Hover over bars to see detailed values</li>
                                        <li>Use the save icon to download the chart</li>
                                    </ul>
                                </div>
                                </div>
                            )}
                        </div>
                    </Modal>
                </>
            )}
        </Card>
    );
};

export default StackedBarChart;
