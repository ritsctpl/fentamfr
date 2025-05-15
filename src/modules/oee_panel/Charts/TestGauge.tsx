import React from 'react';
import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

const TestGauge = ({data, colorSchema}:{data:any, colorSchema:any}) => {
    let gaugeData;
    if(Array.isArray(data) && data.length > 0){
        gaugeData = Object.values(data[0])[0];
        console.log(gaugeData,'gaugeData');
    }else{
        gaugeData = data;
    }
    
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '500px' }}>
                <GaugeComponent
                    id="gauge-component4"
                    type="semicircle"
                    arc={{
                        gradient: true,
                        width: 0.15,
                        padding: 0,
                        subArcs: [
                            {
                                limit: 5,
                                color: '#EA4228'
                            },
                            {
                                limit: 20,
                                color: '#F5CD19'
                            },
                            {
                                limit: 58,
                                color: '#5BE12C'
                            },
                            {
                                limit: 75,
                                color: '#F5CD19'
                            },
                            { color: '#EA4228' }
                        ]
                    }}
                    labels={{
                        tickLabels: {
                            type: "outer",
                            ticks: [
                                { value: 0 },
                                { value: 20 },
                                { value: 40 },
                                { value: 60 },
                                { value: 80 },
                            ]
                        },
                        valueLabel: {
                            formatTextValue: value => value + '%',
                            style: {
                                textShadow: 'none',
                                fill: 'rgb(128,128,128)',
                                fontSize: '32'
                            }
                        }
                    }}
                    value={Number(gaugeData)}
                    pointer={{ type: "arrow", color: '#dfa810' }}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    )
};

export default TestGauge;
