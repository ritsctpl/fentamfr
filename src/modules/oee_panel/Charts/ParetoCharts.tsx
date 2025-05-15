import React, { useRef, useEffect } from 'react'
import ReactEcharts from 'echarts-for-react';
import { EChartsOption, BarSeriesOption, LineSeriesOption } from 'echarts';
import { Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
interface ParetoChartsProps {
    data: any[];
    colorSchema: any;
    per:any
}

const ParetoCharts: React.FC<ParetoChartsProps> = ({ data, colorSchema, per }) => {
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

    function getColor(data: any) {
        if (!colorSchema?.itemColor?.length) return undefined;
        const sortedColors = [...colorSchema.itemColor].sort((a, b) => b.range - a.range);
        const matchingColor = sortedColors.find(item => data >= item.range);
        return matchingColor?.color || sortedColors[sortedColors.length - 1]?.color;
    }

    const getChartOptions = (): EChartsOption => {
        const allKeys = Object.keys(data[0] || {});
        const [categoryKey, frequencyKey, cumulativeKey] = allKeys;

        const barSeries: BarSeriesOption = {
            name: 'Frequency',
            type: 'bar',
            // data: data.map(item => item[frequencyKey]),
            data: data.map((item) => Number(item[frequencyKey].toFixed(2))),
            colorBy: "series",
            color: colorSchema?.itemColor[0]?.color ? colorSchema.itemColor.map((item) => item.color) : ['#5470c6'],
            itemStyle: colorSchema?.itemColor[0]?.color ? {
                color: (params) => getColor(params.data),
            } : undefined,
            label: {
                show: true,
                position: "inside",
                formatter: `{c}${per}`,
            },
        };

        const lineSeries: LineSeriesOption = {
            name: 'Cumulative Percentage',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: data.map(item => item[cumulativeKey]),
            color: colorSchema?.itemColor[0]?.color ? colorSchema.itemColor.map((item) => item.color) : ['#5470c6'],
            itemStyle: colorSchema?.itemColor[0]?.color ? {
                color: (params) => getColor(params.data),
            } : undefined,
            lineStyle: {
                color: colorSchema?.lineColor[0] ? colorSchema.lineColor[0] : 'red',
                width: 3
            },
            label: {
                show: true,
                position: "top",
                formatter: "{c}%",
            },
        };

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: ['Frequency', 'Cumulative Percentage'],
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item[categoryKey]),
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Frequency',
                    position: 'left',
                    alignTicks: true,
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                {
                    type: 'value',
                    name: 'Cumulative %',
                    position: 'right',
                    alignTicks: true,
                    axisLabel: {
                        formatter: '{value}%'
                    },
                    max: 100
                }
            ],
            series: [barSeries, lineSeries],
            dataZoom: [
                {
                  show: true,
                  type: 'slider',
                  bottom: 'bottom',
                  height: '6%',
                  start: 0,
                  end: (5 / data.length) * 100
                },
              ],
        };
    };

    return (
        <ReactEcharts
            ref={echartsRef}
            style={{ height: '100%', width: '100%' }}
            option={getChartOptions()}
            notMerge={true}
        />
    );
}

export default ParetoCharts;
