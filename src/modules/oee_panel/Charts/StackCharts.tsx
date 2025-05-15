import React, { useEffect, useRef } from 'react'
import ReactEcharts from 'echarts-for-react';
import { EChartsOption, BarSeriesOption } from 'echarts';
import { Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

interface StackChartsProps {
    data: any[];
    colorSchema?: any;
    per:any
}

const StackCharts: React.FC<StackChartsProps> = ({ data, colorSchema ,per }) => {
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


    const processData = (data: any[]) => {
        const firstItem = data[0];
        const keys = Object.keys(firstItem);

        // Check if we have multiple number values (first schema)
        const numberKeys = keys.filter(key => typeof firstItem[key] === 'number');
        const stringKeys = keys.filter(key => typeof firstItem[key] === 'string');

        // If we have multiple number keys, use first schema processing
        if (numberKeys.length > 1) {
            const categoryKey = stringKeys[0];
            const categories = Array.from(new Set(data.map(item => item[categoryKey])));

            const series: BarSeriesOption[] = numberKeys.map(key => ({
                name: key,
                type: 'bar',
                stack: 'total',
                data: data.map((item) => Number(item[key].toFixed(2))),
                emphasis: {
                    focus: 'series'
                },
                itemStyle: colorSchema?.itemColor[0]?.color ? {
                    color: (params) => getColor(params.data),
                } : undefined,
                label: {
                    show: true,
                    position: "inside",
                    formatter: `{c}${per}`,
                },
            }));

            return {
                categories,
                series,
                legendData: numberKeys
            };
        }

        // Otherwise, use second schema processing (category-subcategory)
        const valueKey = numberKeys[0];
        const categoryKey = stringKeys[0];
        const subCategoryKey = stringKeys[1];

        const groupedByCategory = data.reduce((acc: any, curr) => {
            const category = curr[categoryKey];
            if (!acc[category]) {
                acc[category] = {};
            }
            acc[category][curr[subCategoryKey]] = curr[valueKey];
            return acc;
        }, {});

        const categories = Object.keys(groupedByCategory);
        const subCategories = Array.from(new Set(data.map(item => item[subCategoryKey])));

        const series: BarSeriesOption[] = subCategories.map(subCategory => ({
            name: subCategory,
            type: 'bar',
            stack: 'total',
            data: categories.map(category => groupedByCategory[category][subCategory] || 0),
            emphasis: {
                focus: 'series'
            },
            itemStyle: colorSchema?.itemColor[0]?.color ? {
                color: (params) => getColor(params.data),
            } : undefined,
            label: {
                show: true,
                position: "inside",
                formatter: function (params) {
                    return params.value === 0 ? '' : `${params.value}${per}`;
                },
            },
        }));

        return {
            categories,
            series,
            legendData: subCategories
        };
    };

    function getColor(data: any) {
        if (!colorSchema?.itemColor?.length) return undefined;
        const sortedColors = [...colorSchema.itemColor].sort((a, b) => b.range - a.range);
        const matchingColor = sortedColors.find(item => data >= item.range);
        return matchingColor?.color || sortedColors[sortedColors.length - 1]?.color;
    }

    const getChartOptions = (): EChartsOption => {
        const { categories, series, legendData } = processData(data);

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: legendData.map(key => ({
                    name: key,
                    itemStyle: {
                        color: colorSchema?.itemColor[0]?.color ? getColor(data[0][key]) : undefined
                    }
                })),
                type: 'scroll',
                orient: 'horizontal',
                left: 'center',
            },
            xAxis: {
                type: 'category',
                data: categories,
                axisLabel: {
                    rotate: 0
                }
            },
            yAxis: {
                type: 'value',
            },
            series: series,
            dataZoom: [
                {
                    show: true,
                    type: 'slider',
                    bottom: 'bottom',
                    height: '6%',
                    start: 0,
                    end: (10 / data.length) * 100
                },
            ],
        };
    };

    return <ReactEcharts
        ref={echartsRef}
        style={{ height: '100%', width: '100%' }}
        option={getChartOptions()}
        notMerge={true}
    />;
}

export default StackCharts;
