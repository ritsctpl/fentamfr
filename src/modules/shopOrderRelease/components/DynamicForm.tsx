import React, { useContext, useEffect } from 'react';
import { Checkbox, Form, Input, InputNumber, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { ShopOrderReleaseContext } from '@modules/shopOrderRelease/hooks/ShopOrderReleaseUseContext';

const { Text } = Typography;

interface FormValues {
    [key: string]: any;
    shopOrder: string;
    status: string;
    orderType: string;
    plannedMaterial: string;
    materialVersion: string;
    bomType: string;
    plannedBom: string;
    bomVersion: string;
    plannedRouting: string;
    routingVersion: string;
    lcc: string;
    plannedWorkCenter: string;
    priority: number;
    orderedQty: number;
    buildQty: string;
    qtyToRelease: number;
    plannedStart: Date;
    plannedCompletion: Date;
    scheduledStart: Date;
    scheduledEnd: Date;
    customerOrder: string;
    customer: string;
    availableQtyToRelease: string;
    addToNewProcessLot: boolean;
}

interface DynamicFormProps {
    data: any;
    fields: string[];
    onValuesChange: (changedValues: any) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange }) => {

    console.log(data, 'formss');

    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { formData, setFormData } = useContext<any>(ShopOrderReleaseContext);

    useEffect(() => {
        if (data || formData) {
            form.setFieldsValue({ ...data });
        }
    }, [data, form, formData]);

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    //     let newValue = e.target.value;
    //     const patterns: { [key: string]: RegExp } = {
    //         resource: /^[A-Z0-9_]*$/,
    //         workCenter: /^[A-Z0-9_]*$/,
    //         operation: /^[A-Z0-9_]*$/,
    //         material: /^[A-Z0-9_]*$/,
    //         operationVersion: /^[A-Z0-9_]*$/,
    //         materialVersion: /^[A-Z0-9_]*$/,
    //         cycleTime: /.*/,
    //         manufacturedTime: /.*/,
    //     };

    //     if (patterns[key]?.test(newValue)) {
    //         form.setFieldsValue({ [key]: newValue });
    //         onValuesChange({ [key]: newValue });
    //     }
    // };

    const handleInputChange = (value: any, key: string) => {
        let newValue = value;
        if (typeof value === 'object' && 'target' in value) {
            newValue = value.target.value;
        }

        const patterns: { [key: string]: RegExp } = {
            resource: /^[A-Z0-9_]*$/,
            workCenter: /^[A-Z0-9_]*$/,
            operation: /^[A-Z0-9_]*$/,
            material: /^[A-Z0-9_]*$/,
            operationVersion: /^[A-Z0-9_]*$/,
            materialVersion: /^[A-Z0-9_]*$/,
            cycleTime: /.*/,
            manufacturedTime: /.*/,
        };

        if (!patterns[key] || patterns[key].test(newValue)) {
            form.setFieldsValue({ [key]: newValue });
            onValuesChange({ [key]: newValue });
        }
    };

    const handleCheckBoxChange = (checked: boolean, key: string) => {
        form.setFieldsValue({ [key]: checked });
        onValuesChange({ [key]: checked });
    };

    const handleSubmit = (values: any) => {
        setFormData(values);
    };

    return (
        <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            onValuesChange={(changedValues) => {
                onValuesChange({ ...changedValues });
            }}
            style={{ width: '100%' }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
        >
            {fields.map((key) => {
                const value = data[key];
                if (value === undefined) {
                    return null;
                }

                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                switch (key) {

                    case 'status':
                    case 'orderType':
                    case 'buildQty':
                    case 'availableQtyToRelease':
                    case 'orderedQty':
                        return (
                            <Form.Item key={key} name={key} label={t(key)}>
                                <Text>{value}</Text>
                            </Form.Item>
                        );

                    case 'plannedMaterial':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    disabled={true}
                                    value={key}
                                    min={0}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'shopOrder':
                    case 'materialVersion':
                    case 'bomType':
                    case 'plannedBom':
                    case 'bomVersion':
                    case 'plannedRouting':
                    case 'routingVersion':
                    case 'lcc':
                    case 'plannedWorkCenter':
                    case 'plannedStart':
                    case 'plannedCompletion':
                    case 'scheduledStart':
                    case 'scheduledEnd':
                    case 'customerOrder':
                    case 'customer':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    disabled={true}
                                    value={key}
                                    min={0}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'priority':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <InputNumber
                                    value={value}
                                    onChange={(value) => handleInputChange({ target: { value } }, key)}
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        );
                    case 'qtyToRelease':
                        const availableQty = data.availableQtyToRelease || 0;
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <InputNumber
                                    value={value}
                                    onChange={(value) => handleInputChange({ target: { value } }, key)}
                                    min={0}
                                    max={availableQty}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        );
                    case 'addToNewProcessLot':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            // valuePropName="checked"
                            >
                                <Checkbox
                                    checked={value}
                                    onChange={(e) => handleCheckBoxChange(e.target.checked, key)}
                                />
                            </Form.Item>

                        );
                    default:
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(key)}
                            >
                                <Input
                                    autoComplete='off'
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );
                }
            })}
        </Form>

    );
};

export default DynamicForm;
