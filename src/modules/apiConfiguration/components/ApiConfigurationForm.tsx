import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button } from 'antd';
import { useMyContext } from '../hooks/apiConfigurationContext';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const ApiConfigurationForm = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { payloadData, setPayloadData, showAlert, setShowAlert } = useMyContext();


    useEffect(() => {
        form.setFieldsValue({
            apiName: payloadData?.apiName,
            storedProcedure: payloadData?.storedProcedure,
            httpMethod: payloadData?.httpMethod,
            inputParameters: payloadData?.inputParameters,
            outputStructure: payloadData?.outputStructure
        });
    }, []);

    const handleInputChange = (fieldName: string, value: string) => {
        if (fieldName == 'apiName' || fieldName == 'storedProcedure') {
            value = value.replace(/ /g, '').replace(/[^a-zA-Z0-9_]/g, '');
        }

        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: value
        }));
        setShowAlert(true);
    };

    const handleSelectChange = (fieldName: string, value: string) => {
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: value
        }));
        setShowAlert(true);
    }

    return (
        <Form
            form={form}
            >
            <Form.Item
                label={t('apiName')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                required={true}
            >
                <Input
                    value={payloadData?.apiName}
                    onChange={(e) => handleInputChange("apiName", e.target.value)}
                />
            </Form.Item>
            <Form.Item
                label={t('storedProcedure')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                required={true}
            >
                <Input
                    value={payloadData?.storedProcedure}
                    onChange={ (e) => handleInputChange("storedProcedure", e.target.value)}
                />
            </Form.Item>
            <Form.Item
                label={t('httpMethod')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                required
            >
                <Select
                    value={payloadData?.httpMethod}
                    onChange={(value) => handleSelectChange("httpMethod", value)}
                >
                    <Option value="POST">POST</Option>
                    <Option value="GET">GET</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="DELETE">DELETE</Option>
                </Select>
            </Form.Item>
            <Form.Item
                label={t('inputParameters')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
            >
                <Input.TextArea
                    value={payloadData?.inputParameters}
                    onChange={(e) => handleInputChange("inputParameters", e.target.value)}
                />
            </Form.Item>
            <Form.Item
                label={t('outputStructure')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
            >
                <Input.TextArea
                    value={payloadData?.outputStructure}
                    onChange={(e) => handleInputChange("outputStructure", e.target.value)}
                />
            </Form.Item>

        </Form>
    );
};

export default ApiConfigurationForm;