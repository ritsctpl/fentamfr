import { Input } from "antd";
import React from "react";

const { TextArea } = Input;
interface BuilderSectionProps {
    isEditable?: boolean;
    props: {
        title: string;
        data: {
            title: string;
            placeholder: string;
            value: string;
        }[];
        style?: {
            heading?: {
                titleAlign?: "left" | "center" | "right";
            };
            textarea?: React.CSSProperties;
        };
        onChange?: (index: number, value: string) => void;
    };
}

const BuilderSection: React.FC<BuilderSectionProps> = ({ isEditable = true, props }) => {
    const { title, data, style = {}, onChange } = props;
    const { heading = {}, textarea = {} } = style;

    return (
        <div style={{ width: '100%', height: 'auto' }}>
            <h3 style={{
                fontWeight: 600,
                textAlign: heading.titleAlign || 'left',
            }}>
                {title}
            </h3>

            {data.map((step, index) => (
                <div key={index} style={{ marginBottom: 20,height:'auto' }}>
                    <span style={{ display: 'block', marginBottom: 8, fontWeight: 600, }}>
                        {step.title}
                    </span>
                    <TextArea
                        disabled={!isEditable}
                        placeholder={step.placeholder}
                        value={step.value}
                        onChange={(e) => onChange?.(index, e.target.value)}
                        style={{
                            minHeight:'100px'
                        }}
                    />
                </div>
            ))}

        </div>
    );
};

export default BuilderSection;
