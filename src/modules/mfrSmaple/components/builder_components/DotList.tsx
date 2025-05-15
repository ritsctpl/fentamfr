import { Input } from "antd";
import React from "react";

interface Section {
    title: string;
    list: string[];
}

interface DotListProps {
    isEditable?: boolean;
    props: {
        title: string;
        data: Section[];
        style?: {
            heading?: {
                titleAlign?: 'left' | 'center' | 'right';
            };
            list?: React.CSSProperties;
        };
        onChange?: (newData: Section[]) => void;
    };
}

const DotList: React.FC<DotListProps> = ({ isEditable = true, props }) => {
    const { title, data, style = {} } = props;
    const { heading = {}, list = {} } = style;

    const handleItemChange = (sectionIndex: number, itemIndex: number, value: string) => {
        const newData = [...data];
        newData[sectionIndex].list[itemIndex] = value;
        props.onChange?.(newData);
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%' }}>
            <h3
                style={{
                    margin: 5,
                    marginBottom: 20,
                    fontWeight: 600,
                    textAlign: heading.titleAlign || 'left',
                }}
            >
                {title}
            </h3>
            {data.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                    <h4
                        style={{
                            margin: 5,
                            marginBottom: 20,
                            fontWeight: 600,
                            textAlign: heading.titleAlign || 'left',
                        }}
                    >
                        {section.title}
                    </h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, listStyleType: 'disc', ...list }}>
                        {section.list.map((item, itemIndex) => (
                            <li key={itemIndex} style={{ marginBottom: 4 }}>
                                {isEditable ? (
                                    <Input
                                        value={item}
                                        disabled={!isEditable}
                                        onChange={(e) => handleItemChange(sectionIndex, itemIndex, e.target.value)}
                                    />
                                ) : (
                                    item
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default DotList;
