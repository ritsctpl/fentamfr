import React from 'react';

interface JsonFormatterProps {
    data: any;
}

const JsonFormatter: React.FC<JsonFormatterProps> = ({ data }) => {
    const formatValue = (value: any): JSX.Element => {
        if (value === null) return <span style={{ color: '#808080' }}>null</span>;
        if (value === undefined) return <span style={{ color: '#808080' }}>undefined</span>;
        
        switch (typeof value) {
            case 'string':
                return <span style={{ color: '#008000' }}>&quot;{value}&quot;</span>;
            case 'number':
                return <span style={{ color: '#0000FF' }}>{value}</span>;
            case 'boolean':
                return <span style={{ color: '#0000FF' }}>{value.toString()}</span>;
            case 'object':
                return formatObject(value);
            default:
                return <span>{String(value)}</span>;
        }
    };

    const formatObject = (obj: any): JSX.Element => {
        if (Array.isArray(obj)) {
            return (
                <div style={{ paddingLeft: 20 }}>
                    [
                    {obj.map((item, index) => (
                        <div key={index} style={{ paddingLeft: 20 }}>
                            {formatValue(item)}
                            {index < obj.length - 1 && ','}
                        </div>
                    ))}
                    ]
                </div>
            );
        }

        return (
            <div style={{ paddingLeft: 20 }}>
                {'{'}
                {Object.entries(obj).map(([key, value], index, arr) => (
                    <div key={key} style={{ paddingLeft: 20 }}>
                        <span style={{ color: '#A52A2A' }}>&quot;{key}&quot;</span>: {formatValue(value)}
                        {index < arr.length - 1 && ','}
                    </div>
                ))}
                {'}'}
            </div>
        );
    };

    return (
        <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '14px',
            backgroundColor: '#f8f8f8',
            padding: '16px',
            borderRadius: '4px',
            border: '1px solid #e8e8e8'
        }}>
            {formatValue(data)}
        </div>
    );
};

export default JsonFormatter;
