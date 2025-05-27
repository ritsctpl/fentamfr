import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Switch } from 'antd';
import { useMyContext } from '../hooks/WorkflowStatesContext';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const WorlFlowStatesForm = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { payloadData, setPayloadData, showAlert, setShowAlert } = useMyContext();


    useEffect(() => {
        form.setFieldsValue({
            ...payloadData
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

    const handleSelectChange = (fieldName: string, value: any) => {
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: value
        }));
        setShowAlert(true);
    }
    
    const handleSwitchChange = (fieldName: string, value: any) => {
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
                label={t('name')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                required={true}
            >
                <Input
                    value={payloadData?.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                />
            </Form.Item>
            <Form.Item
                label={t('description')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                required={false}
            >
                <Input
                    value={payloadData?.description}
                    onChange={ (e) => handleInputChange("description", e.target.value)}
                />
            </Form.Item>
            <Form.Item
                label={t('appliesTo')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                required
            >
                <Select
                    mode="multiple"
                    value={payloadData?.appliesTo}
                    onChange={(value) => handleSelectChange("appliesTo", value)}
                >
                    <Option value="MFR">MFR</Option>
                    <Option value="BMR">BMR</Option>
                    <Option value="BPR">BPR</Option>
                    <Option value="eBMR">eBMR</Option>
                    <Option value="Deviation">Deviation</Option>
                    <Option value="Change Control">Change Control</Option>
                    <Option value="*">All</Option>
                </Select>
            </Form.Item>
            <Form.Item
                label={t('editableFields')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
            >
                <Select
                    mode="multiple"
                    value={payloadData?.editableFields}
                    onChange={(value) => handleSelectChange("editableFields", value)}
                >
                    <Option value="Comments">Comments</Option>
                    <Option value="Attachments">Attachments</Option>
                    <Option value="*">All</Option>
                </Select>
            </Form.Item>
            <Form.Item
                label={t('isEnd')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
            >
                <Switch
                    checked={payloadData?.isEnd}
                    onChange={(checked) => handleSwitchChange("isEnd", checked)}
                />
            </Form.Item>
            <Form.Item
                label={t('isActive')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
            >
                <Switch
                    checked={payloadData?.isActive}
                    onChange={(checked) => handleSwitchChange("isActive", checked)}
                />
            </Form.Item>

        </Form>
    );
};

export default WorlFlowStatesForm;