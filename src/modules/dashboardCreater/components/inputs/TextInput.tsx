import React from 'react';
import { Input } from 'antd';
import { TextInputConfig } from '../../types';

interface TextInputProps {
    value?: string;
    onChange?: (value: string) => void;
    style?: React.CSSProperties;
    config?: TextInputConfig;
    labelStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
}

const TextInput: React.FC<TextInputProps> = ({
    value,
    onChange,
    style,
    config = {},
    labelStyle,
    inputStyle
}) => {
    const {
        placeholder,
        disabled,
        size = 'middle',
        allowClear,
        maxLength,
        showCount,
        type = 'text'
    } = config;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <Input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            allowClear={allowClear}
            maxLength={maxLength}
            showCount={showCount}
            type={type}
            style={{
                ...inputStyle,
            }}
        />
    );
};

export default TextInput;