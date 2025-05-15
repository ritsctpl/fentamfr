import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select, Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { NcCodeContext } from '../hooks/NcCodeUseContext';
import { fetchAllAssyDataType, fetchTop50AssyDataType } from '@services/BomService';
import { fetchTop50NCDataType } from '@services/ncCodeService';

interface FormValues {
    [key: string]: any;
    ncCode?: string;
    description?: string;
    status?: string;
    assignNCtoComponent?: boolean;
    ncCategory?: string;
    dpmoCategory?: string;
    ncDatatype?: string;
    collectRequiredNCDataonNC?: boolean;
    messageType?: string;
    ncPriority?: number;
    maximumNCLimit?: number;
    ncSeverity?: string;
    secondaryCodeSpecialInstruction?: string;
    canBePrimaryCode?: boolean;
    closureRequired?: boolean;
    autoClosePrimaryNC?: boolean;
    autoCloseIncident?: boolean;
    secondaryRequiredForClosure?: boolean;
    erpQNCode?: string;
    erpCatalog?: string;
    erpCodeGroup?: string;
    erpCode?: string;
    oeeQualityKPIRelevant?: boolean;
}

interface DynamicFormProps {
    data: any;
    fields: string[];
    onValuesChange: (changedValues: FormValues) => void;
    style?: React.CSSProperties;
}

const { Option } = Select;

const assignNCtoComponentOptions = [
    { value: 'Stay', label: 'Stay' },
    { value: 'Copy', label: 'Copy' },
    { value: 'Move', label: 'Move' },
];

const statusOptions = [
    { value: 'Enabled', label: 'Enabled' },
    { value: 'Disabled', label: 'Disabled' },
];

const ncCategoryOptions = [
    { value: 'Failure', label: 'Failure' },
    { value: 'Defect', label: 'Defect' },
    { value: 'Repair', label: 'Repair' },
];

const dpmoCategoryOptions = [
    { value: 'None', label: 'None' },
    { value: 'Termination', label: 'Termination' },
    { value: 'Assembly', label: 'Assembly' },
    { value: 'Component', label: 'Component' },
    { value: 'Placement', label: 'Placement' },
];

const collectRequiredNCDataOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'Close', label: 'Close' },
    { value: 'Both', label: 'Both' },
];

const ncSeverityOptions = [
    { value: 'None', label: 'None' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
];

const NcDynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange, style }) => {

    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { formData, setFormData } = useContext(NcCodeContext);

    // browse states

    const [ncDatatypeVisible, setNcDatatypeVisible] = useState(false);
    const [ncDatatypeData, setNcDatatypeData] = useState<[]>([]);

    const [messageTypeVisible, setMessageTypeVisible] = useState(false);
    const [messageTypeData, setMessageTypeData] = useState<[]>([]);

    useEffect(() => {
        if (data || formData) {
            form.setFieldsValue({
                ...data,
            });
        }
    }, [data, form, formData]);

    const handleSwitchChange = (checked: boolean, key: string) => {
        form.setFieldsValue({ [key]: checked });
        onValuesChange({ [key]: checked });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        let newValue = e.target.value;

        const patterns: { [key: string]: RegExp } = {
            ncCode: /^[A-Z0-9_]*$/,
            ncDatatype: /^[A-Z0-9_]*$/,
            messageType: /^[A-Z0-9_]*$/,
        };

        if (key === 'ncCode' || key === 'ncDatatype' || key === 'messageType') {
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
        setNcDatatypeVisible(false);
        setMessageTypeVisible(false);
    };

    // nc datatype

    const handleNcDatatypeClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('ncDatatype');

        console.log(typedValue, 'typedValue');
        
        const newValue = {
            dataType: typedValue,
            category: 'NC'
          }

        try {
            let response;
            if (typedValue) {
                response = await fetchAllAssyDataType(site, newValue);

            } else {
                response = await fetchTop50NCDataType(site, 'NC');
                console.log(response, 'responscxcxe');
            }

            if (response && !response.errorCode) {
                // const filteredData = response.dataTypeList.filter((item: any) => item.category === 'NC');
                // const formattedData = filteredData.map((item: any, index: number) => ({
                //     id: index,
                //     ...item,
                // }));
                const formattedData = response.dataTypeList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setNcDatatypeData(formattedData);
            } else {
                setNcDatatypeData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setNcDatatypeVisible(true);
    };

    const handleNcDatatypeOk = (selectedRow: any | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                ncDatatype: selectedRow.dataType,
            });
            onValuesChange({
                ncDatatype: selectedRow.dataType,
            });
        }

        setNcDatatypeVisible(false);
    };

    const ncDatatypeColumn = [
        {
            title: t("dataType"),
            dataIndex: "dataType",
            key: "dataType",
        },
        {
            title: t("revision"),
            dataIndex: "revision",
            key: "revision",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
        },
    ]

    // message type

    const handleMessageTypeClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = form.getFieldValue('messageType');

        const newValue = {
            messageType: typedValue,
        }

        try {
            let response;
            // if (typedValue) {
            //     response = await fetchAllMessageType(site, newValue);

            // } else {
            //     response = await fetchTop50MessageType(site);
            // }

            if (response && !response.errorCode) {
                const formattedData = response.messageTypeList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setMessageTypeData(formattedData);
            } else {
                setMessageTypeData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }

        setMessageTypeVisible(true);
    };

    const handleMessageTypeOk = (selectedRow: any | undefined) => {
        if (selectedRow) {
            form.setFieldsValue({
                messageType: selectedRow.messageType,
            });
            onValuesChange({
                messageType: selectedRow.messageType,
            });
        }

        setMessageTypeVisible(false);
    };

    const messageTypeColumn = [
        {
            title: t("messageType"),
            dataIndex: "messageType",
            key: "messageType",
        },
        {
            title: t("revision"),
            dataIndex: "revision",
            key: "revision",
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
                    case 'assignNCtoComponent':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {assignNCtoComponentOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'ncCategory':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select
                                    defaultValue={value || 'master'}
                                    onChange={(value) => {
                                        onValuesChange({ ncCategory: value });
                                    }}
                                >
                                    {ncCategoryOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );


                    case 'dpmoCategory':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {dpmoCategoryOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'collectRequiredNCDataonNC':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {collectRequiredNCDataOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

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

                    case 'ncSeverity':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Select defaultValue={value || 'master'}>
                                    {ncSeverityOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        );

                    case 'ncDatatype':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleNcDatatypeClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'messageType':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                            >
                                <Input
                                    suffix={
                                        <GrChapterAdd
                                            onClick={() =>
                                                handleMessageTypeClick()
                                            }
                                        />
                                    }
                                    onChange={(e) => handleInputChange(e, key)}
                                />
                            </Form.Item>
                        );

                    case 'ncCode':
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
                    case 'ncPriority':
                    case 'maximumNCLimit':
                    case 'secondaryCodeSpecialInstruction':
                    case 'erpCatalog':
                    case 'erpCodeGroup':
                    case 'erpCode':
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

                    case 'canBePrimaryCode':
                    case 'closureRequired':
                    case 'autoClosePrimaryNC':
                    case 'autoCloseIncident':
                    case 'secondaryRequiredForClosure':
                    case 'erpQNCode':
                    case 'oeeQualityKPIRelevant':
                        return (
                            <Form.Item
                                key={key}
                                name={key}
                                label={t(`${key}`)}
                                valuePropName="checked"
                            >
                                <Switch
                                    defaultChecked={value}
                                    onChange={(checked) => handleSwitchChange(checked, key)}
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
                        )}
            })}

            <Modal
                title={t("selectNcDatatype")}
                open={ncDatatypeVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleNcDatatypeOk(record),
                    })}
                    columns={ncDatatypeColumn}
                    dataSource={ncDatatypeData}
                    rowKey="dataType"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>

            <Modal
                title={t("selectMessageType")}
                open={messageTypeVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleMessageTypeOk(record),
                    })}
                    columns={messageTypeColumn}
                    dataSource={messageTypeData}
                    rowKey="messageType"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>
        </Form>
    );
};

export default NcDynamicForm;
