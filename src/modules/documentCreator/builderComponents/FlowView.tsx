import { Input } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface FlowViewProps {
    isEditable?: boolean;
    props: {
        title: string;
        type?: string;
        metaData?: any[] | any;
        data: any[] | any;
        style?: any;
        onChange?: () => void;
    }
}

const FlowContainer = styled.div`

`;


const FlowStep = styled.div`
  background-color: white;
  position: relative;
  margin-bottom: 20px;
  
  &:after {
    content: '⇩';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
  }
  
  &:last-child:after {
    display: none;
  }
`;


const FlowView: React.FC<FlowViewProps> = ({ isEditable = true, props }) => {
    const { title, data, onChange, type, metaData } = props;
    const { heading } = props?.style || { heading: { titleAlign: 'left' } };

    return (
        <FlowContainer>
            <h3 style={{ fontWeight: 600, textAlign: heading.titleAlign }}>{title}</h3>
            {data.map((step, index) => (
                <div>
                    <h4 style={{ margin: 5, marginBottom: 20, fontWeight: 600, textAlign: 'left' }}>{step.title}</h4>
                    {step.steps.map((step, index) => (
                        <FlowStep key={index}>
                            <Input.TextArea style={{ textAlign: 'center' }} value={step} />
                        </FlowStep>
                    ))}
                </div>
            ))}
        </FlowContainer>
    );
};

export default FlowView;
