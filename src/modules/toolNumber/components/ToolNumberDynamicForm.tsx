import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select, Modal, Table, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { ToolNumberContext } from '../hooks/ToolNumberUseContext';
import { fetchToolGroupAll, fetchToolGroupTop50 } from '@services/toolNumberService';

interface FormValues {
    [key: string]: any;
    toolNumber: string;
    description: string;
    status: string;
    toolGroup: string;
    qtyAvailable: number;
    erpEquipmentNumber: string;
    erpPlanMaintenanceOrder: string;
    toolQty: number;
    duration: number;
    location: string;
}

interface DynamicFormProps {
    data: any;
    fields: string[];
    onValuesChange: (changedValues: any) => void;
    style?: React.CSSProperties;
}

const { Option } = Select;

const statusOptions = [
    { value: 'Enabled', label: 'Enabled' },
    { value: 'Disabled', label: 'Disabled' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Hold', label: 'Hold' },
    { value: 'Hold Consec NC', label: 'Hold Consec NC' },
    { value: 'Hold SPC Viol', label: 'Hold SPC Viol' },
    { value: 'Hold SPC Warn', label: 'Hold SPC Warn' },
    { value: 'Hold Yield Rate', label: 'Hold Yield Rate' },
    { value: 'Non-Scheduled', label: 'Non-Scheduled' },
    { value: 'Productive', label: 'Productive' },
    { value: 'Scheduled Down', label: 'Scheduled Down' },
    { value: 'Standby', label: 'Standby' },
    { value: 'Unknown', label: 'Unknown' },
    { value: 'Unknown Down', label: 'Unknown Down' }
];

const ToolNumberDynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange, style }) => {

    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { formData, setFormData } = useContext(ToolNumberContext);

    // browse states

    const [toolGroupVisible, setToolGroupVisible] = useState(false);
    const [toolGroupData, setToolGroupData] = useState<[]>([]);

    useEffect(() => {
        if (data || formData) {
            form.setFieldsValue({
                ...data,
            });
        }
    }, [data, form, formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        let newValue = e.target.value;

        const patterns: { [key: string]: RegExp } = {
            toolNumber: /^[A-Z0-9_]*$/,
        };

        if (key === 'toolNumber') {
            newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }

        if (patterns[key]?.test(newValue)) {
            form.setFieldsValue({ [key]: newValue });
            onValuesChange({ [key]: newValue });
        }
    };

    const handleSubmit = (values: any) => {
        setFormData(values);
    };

    const handleCancel = () => {
        setToolGroupVisible(false);
    };

    // tool group

    const handleToolGroupClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('toolGroup');

        const newValue = {
            toolGroup: typedValue,
        }

        try {
            let response;
            if (typedValue) {
                response = await fetchToolGroupAll(site, newValue);
                console.log(response, 'Tool Group All');
            } else {
                response = await fetchToolGroupTop50(site);
                console.log(response, 'Tool Group Top 50');
            }

            if (response && !response.errorCode) {
                const formattedData = response.toolGroupList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setToolGroupData(formattedData);
            } else {
                setToolGroupData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setToolGroupVisible(true);
    };

    const handleToolGroupOk = (selectedRow: any | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                toolGroup: selectedRow.toolGroup,
                toolQty: selectedRow.toolQty,
            });
            onValuesChange({
                toolGroup: selectedRow.toolGroup,
                toolQty: selectedRow.toolQty,
            });
        }

        setToolGroupVisible(false);
    };

    const toolGroupColumn = [
        {
            title: t("toolGroup"),
            dataIndex: "toolGroup",
            key: "toolGroup",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]

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

                const formattedKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());

                switch (key) {

                    case 'status':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value}>
                                    {statusOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'toolGroup':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[{ required: true, message: `Please input ${formattedKey}` }]}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleToolGroupClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'toolNumber':
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

                    case 'description':
                    case 'erpEquipmentNumber':
                    case 'erpPlanMaintenanceOrder':
                    case 'location':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'qtyAvailable':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                rules={[
                                    { required: true, message: `Please input ${formattedKey}` },
                                    {
                                        validator: async (_, value) => {
                                            const toolQty = form.getFieldValue('toolQty');
                                            if (value > toolQty) {
                                                throw new Error(`Quantity available cannot exceed ${toolQty}`);
                                            }
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    value={value}
                                    onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>, key)}
                                    min={0}
                                    max={form.getFieldValue('toolQty')}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        );

                    case 'toolQty':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <InputNumber
                                    readOnly
                                    value={value}
                                    onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>, key)}
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        );

                    case 'duration':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <InputNumber
                                    value={value}
                                    onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>, key)}
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        );

                    default:
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
            })}


            <Modal
                title={t("selectToolGroup")}
                open={toolGroupVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleToolGroupOk(record),
                    })}
                    columns={toolGroupColumn}
                    dataSource={toolGroupData}
                    rowKey="toolGroup"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>
        </Form>
    );
};

export default ToolNumberDynamicForm;
