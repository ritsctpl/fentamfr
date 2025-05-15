import React, { useContext, useEffect } from 'react';
import { Checkbox, Form, Input, InputNumber, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { ProcessOrderReleaseContext } from '@modules/processOrderRelease/hooks/ProcessOrderReleaseUseContext';

const { Text } = Typography;

interface FormValues {
    [key: string]: any;
    processOrder: string;
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
    const { formData, setFormData } = useContext<any>(ProcessOrderReleaseContext);

    useEffect(() => {
        if (data || formData) {
            form.setFieldsValue({ ...data });
        }
    }, [data, form, formData]);

    useEffect(() => { 
        if (data.orderNumber) {
            form.setFieldsValue({ qtyToRelease: 0 });
        }
    }, [data.orderNumber, data.availableQtyToRelease]);

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
                    case 'orderedQty':
                        return (
                            <Form.Item key={key} name={key} label={t(key)}>
                                <Text>{value}</Text>
                            </Form.Item>
                        );
                    case 'material':
                    case 'orderNumber':
                    case 'materialVersion':
                    case 'recipe':
                    case 'recipeVersion':
                    case 'mrpController':
                    case 'productionScheduler':
                    case 'reservationNumber':
                    case 'productionStartDate':
                    case 'productionFinishDate':
                    case 'actualStartDate':
                    case 'actualFinishDate':
                    case 'uom':
                    case 'measuredUom':
                    case 'targetQuantity':
                    case 'availableQtyToRelease':
                    case 'priority':
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
                    case 'qtyToRelease':
                        const availableQty = data.targetQuantity || 0;
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
                    case 'inUse':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Checkbox
                                    checked={value}
                                    onChange={(e) => handleCheckBoxChange(e.target.checked, key)}
                                    disabled={true}
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
