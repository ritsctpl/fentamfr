import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { TextInputConfig } from '../../types';
import { commonApi } from '@services/dashboard';
import { parseCookies } from 'nookies';
const cookies = parseCookies();

interface SelectFeildProps {
    value?: string[];
    onChange?: (value: string[]) => void;
    style?: React.CSSProperties;
    config?: TextInputConfig;
    labelStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
}

const SelectFeild: React.FC<SelectFeildProps> = ({
    value,
    onChange,
    style,
    config = {},
    labelStyle,
    inputStyle
}) => {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const {
        placeholder,
        disabled,
        size = 'middle',
        allowClear,
        maxLength,
        showCount,
        url,
        arrayParameter,
        fieldValue,
        payload,
        customOptions = [],
        multiple = false
    } = config;

    const parseCustomOptions = (customOptions: string) => {
        try {
            return JSON.parse(customOptions);
        } catch (error) {
            console.error("Invalid JSON format for customOptions:", error);
            return [];
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            let processedPayload = payload;
            if (typeof payload === 'string') {
                processedPayload = payload.replace(/\${cookies\.(\w+)}/g, (match, cookieName) => {
                    return cookies[cookieName] || '';
                });
                processedPayload = JSON.parse(processedPayload);
            }
            try {
                const response = await commonApi(url, processedPayload);
                const data = arrayParameter ? response[arrayParameter] : response;
                // Ensure that data is always an array
                setOptions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load options');
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchData();
        }
    }, [url, payload, arrayParameter]);

    const handleChange = (selectedValues: any) => {
        onChange?.(selectedValues);
    };

    return (
            <Select
                mode={multiple ? 'multiple' : undefined}
                value={value}
                options={url ? options.map((option) => ({
                    label: option[fieldValue],
                    value: option[fieldValue]
                })) : parseCustomOptions(customOptions)}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                size={size}
                allowClear={allowClear}
                maxLength={maxLength}
                style={{
                    ...inputStyle,
                }}
                loading={loading}
            />
    );
};

export default SelectFeild;
