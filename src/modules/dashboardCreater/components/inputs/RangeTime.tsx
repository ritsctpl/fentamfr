import React, { useEffect, useState } from 'react';
import { DatePicker, Form } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface RangeTimeProps {
    value?: [string, string] | null;
    onChange?: (value: [string, string] | null) => void;
    style?: React.CSSProperties;
    config?: {
        placeholder?: [string, string];
        disabled?: boolean;
        size?: 'small' | 'middle' | 'large';
        allowClear?: boolean;
        format?: string;
        startTimeFieldName?: string;
        endTimeFieldName?: string;
    };
}

const RangeTime: React.FC<RangeTimeProps> = ({
    value,
    onChange,
    style,
    config = {}
}) => {
    const {
        placeholder = ['Start time', 'End time'],
        disabled = false,
        size = 'middle',
        allowClear = true,
        format = 'YYYY-MM-DD HH:mm:ss',
        startTimeFieldName = 'startTime',
        endTimeFieldName = 'endTime'
    } = config;

    const form = Form.useFormInstance();
    const [localValue, setLocalValue] = useState<[Dayjs, Dayjs] | null>(null);

    // Update local state when form values change
    useEffect(() => {
        const startValue = form.getFieldValue(startTimeFieldName);
        const endValue = form.getFieldValue(endTimeFieldName);
        
        if (startValue && endValue) {
            setLocalValue([dayjs(startValue), dayjs(endValue)]);
        } else {
            setLocalValue(null);
        }
    }, [form, startTimeFieldName, endTimeFieldName]);

    const handleChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
        if (dates && dateStrings) {
            const [startDate, endDate] = dateStrings;
            setLocalValue([dayjs(startDate), dayjs(endDate)]);
            
            // Update form values
            form.setFieldsValue({
                [startTimeFieldName]: startDate,
                [endTimeFieldName]: endDate
            });
            
            // Notify parent
            onChange?.([startDate, endDate]);
        } else {
            setLocalValue(null);
            
            // Clear form values
            form.setFieldsValue({
                [startTimeFieldName]: null,
                [endTimeFieldName]: null
            });
            
            // Notify parent
            onChange?.(null);
        }
    };

    return (
        <RangePicker
            showTime={{ format: 'HH:mm:ss' }}
            format={format}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            style={{ width: '100%', ...style }}
            allowClear={allowClear}
            value={localValue}
        />
    );
};

export default RangeTime;