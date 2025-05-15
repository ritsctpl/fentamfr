import React, { useContext, useEffect, useState } from 'react';
import { DatePicker, Form, Input, InputNumber, message, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { ToolGroupContext } from '@modules/toolGroup/hooks/ToolGroupContext';

interface DynamicFormProps {
    data: any;
    fields: string[];
    onValuesChange: (changedValues: any) => void;
    style?: React.CSSProperties;
}

const { Option } = Select;

const CalibrationOptions = [
    { value: 'None', label: 'None' },
    { value: 'Time', label: 'Time' },
    { value: 'Count', label: 'Count' },
    { value: 'Date', label: 'Date' },
];

const DateOptions = [
    { value: 'Days', label: 'Days' },
    { value: 'Months', label: 'Months' },
    { value: 'Years', label: 'Years' },
];

const Calibration: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange, style }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { payloadData, setPayloadData } = useContext<any>(ToolGroupContext);
    const [selectedCalibrationType, setSelectedCalibrationType] = useState('None');

    useEffect(() => {
        if (data || payloadData) {
            form.setFieldsValue({
                ...data,
                calibrationType: data.calibrationType || 'None',
                calibrationCount: data.calibrationCount || 0,
                maximumCalibrationCount: data.maximumCalibrationCount || 0,
                startCalibrationDate: data.startCalibrationDate ? dayjs(data.startCalibrationDate, 'DD-MM-YYYY') : null,
                expirationDate: data.expirationDate ? dayjs(data.expirationDate, 'DD-MM-YYYY') : null,
            });
            setSelectedCalibrationType(data.calibrationType || 'None');
        }
    }, [data, form, payloadData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        let newValue = e.target.value;

        form.setFieldsValue({ [key]: newValue });
        onValuesChange({ [key]: newValue });
    };

    const handleSubmit = (values: any) => {
        setPayloadData(values);
    };

    let hasShownError = false;

    const validateDates = () => {
        const startCalibrationDate = form.getFieldValue('startCalibrationDate');
        const expirationDate = form.getFieldValue('expirationDate');

        if (startCalibrationDate && expirationDate) {
            const fromDate = dayjs(startCalibrationDate, 'DD-MM-YYYY');
            const toDate = dayjs(expirationDate, 'DD-MM-YYYY');

            if (toDate.isBefore(fromDate)) {
                if (!hasShownError) {
                    message.error('Expiration date must be after start calibration date.');
                    hasShownError = true;
                }
                return;
            }
        }

        hasShownError = false;
        return;
    };

    const handleDateChange = (date: Dayjs | null, key: string) => {
        const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
        if (key === 'validFrom' || key === 'validTo') {
            validateDates();
        }
        onValuesChange({ [key]: formattedDate });
    };

    const disabledDate = (current: Dayjs | null, dateType: string) => {
        if (dateType === 'expirationDate') {
            const startDate = form.getFieldValue('startCalibrationDate');
            return startDate ? current && current.isBefore(startDate, 'day') : false;
        } else if (dateType === 'startCalibrationDate') {
            const expirationDate = form.getFieldValue('expirationDate');
            return expirationDate ? current && current.isAfter(expirationDate, 'day') : false;
        }
        return false;
    };

    const renderConditionalFields = (key: string, value: any) => {
        if (!fields.includes(key)) return null;

        switch (key) {
            case 'calibrationType':
                return (
                    <Form.Item
                        key={key}
                        name={key}
                        label={t(`${key}`)}
                        initialValue={'None'}
                    >
                        <Select
                            defaultValue={value}
                            onChange={(value) => {
                                setSelectedCalibrationType(value);
                                const resetFields: any = {
                                    [key]: value
                                };
                                if (value === 'None') {
                                    resetFields.calibrationPeriod = null;
                                    resetFields.calibrationCount = null;
                                    resetFields.maximumCalibrationCount = null;
                                    resetFields.startCalibrationDate = null;
                                    resetFields.expirationDate = null;
                                } else {
                                    if (value === 'Time') {
                                        resetFields.calibrationCount = null;
                                        resetFields.maximumCalibrationCount = null;
                                        resetFields.startCalibrationDate = null;
                                        resetFields.expirationDate = null;
                                    } else if (value === 'Count') {
                                        resetFields.calibrationPeriod = null;
                                        resetFields.startCalibrationDate = null;
                                        resetFields.expirationDate = null;
                                    } else if (value === 'Date') {
                                        resetFields.calibrationPeriod = null;
                                        resetFields.calibrationCount = null;
                                        resetFields.maximumCalibrationCount = null;
                                    }
                                }
                                form.setFieldsValue(resetFields);
                                onValuesChange(resetFields);
                            }}
                        >
                            {CalibrationOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                );

            case 'calibrationPeriod':
                return selectedCalibrationType === 'Time' ? (
                    <Form.Item
                        key={key}
                        name={key}
                        label={t(`${key}`)}
                    >
                        {/* <InputNumber
                            value={parseInt(value?.split(' ')[0], 10) || 0}
                            onChange={(number) => {
                                const unit = form.getFieldValue('calibrationUnit') || 'Days';
                                const newValue = `${number} ${unit}`;
                                form.setFieldsValue({ [key]: newValue });
                                onValuesChange({ [key]: newValue });
                            }}
                            style={{ width: '49%', marginRight: '1%' }}
                        /> */}

                        <Input
                            type='number'
                            value={parseInt(value?.split(' ')[0], 10) || 0}
                            onChange={(e) => {
                                const number = e.target.value; // Extract value from event
                                const unit = form.getFieldValue('calibrationUnit') || 'Days';
                                const newValue = `${number} ${unit}`;
                                form.setFieldsValue({ [key]: newValue });
                                onValuesChange({ [key]: newValue });
                            }}
                            style={{ width: '49%', marginRight: '1%' }}
                            min={0}
                        />
                        <Select
                            value={value?.split(' ')[1] || 'Days'}
                            onChange={(unit) => {
                                const number = form.getFieldValue('calibrationPeriod')?.split(' ')[0] || 0;
                                const newValue = `${number} ${unit}`;
                                form.setFieldsValue({ [key]: newValue });
                                onValuesChange({ [key]: newValue });
                            }}
                            style={{ width: '49%', marginLeft: '1%' }}
                        >
                            {DateOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                ) : null;

            case 'calibrationCount':
            case 'maximumCalibrationCount':
                return selectedCalibrationType === 'Count' ? (
                    <Form.Item
                        key={key}
                        name={key}
                        label={t(`${key}`)}
                        initialValue={0}
                    >
                        <Input
                            type='number'
                            value={value || 0}
                            onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                handleInputChange({ target: { value: val.toString() } } as any, key);
                            }}
                            min={0}
                        />
                    </Form.Item>
                ) : null;

            case 'startCalibrationDate':
            case 'expirationDate':
                return selectedCalibrationType === 'Date' ? (
                    <Form.Item
                        key={key}
                        name={key}
                        label={t(`${key}`)}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD-MM-YYYY"
                            onChange={(date) => handleDateChange(date, key)}
                            disabledDate={(current) => disabledDate(current, key)}
                        />
                    </Form.Item>
                ) : null;

            default:
                const formattedKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());

                return (
                    <Form.Item
                        key={key}
                        name={key}
                        label={t(`${key}`)}
                        rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                    >
                        <Input
                            value={value}
                            onChange={(e) => handleInputChange(e, key)}
                        />
                    </Form.Item>
                );
        }
    };

    return (
        <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            onValuesChange={(changedValues) => {
                onValuesChange({ ...changedValues });
            }}
            style={style}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
        >
            {fields.map((key) => {
                const value = data[key];
                if (value === undefined) {
                    return null;
                }
                return renderConditionalFields(key, value);
            })}
        </Form>
    );
};

export default Calibration;
