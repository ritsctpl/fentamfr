import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Input, Table, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {  WorkCenterContext } from '../hooks/workCenterContext';
import { useTranslation } from 'react-i18next';

interface RuleData {
    key: string;
    rule: string;
    setting: string;
}

interface ActivityRulesProps {
    
    payloadData: object;
    setPayloadData: () => void;
  }

const RulesTable: React.FC<ActivityRulesProps> = () => {
    const { payloadData, setPayloadData } = useContext<any>(WorkCenterContext); // Use the context
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [data, setData] = useState<RuleData[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (payloadData && payloadData.activityRules) {
          const keyedData = payloadData.activityRules.map((item, index) => ({
            ...item,
            key: index, // or use a unique identifier if available
          }));
          setData(keyedData);
        }
      }, [payloadData]);

    const columns: ColumnsType<RuleData> = [
        {
            title: t('rules'),
            dataIndex: 'ruleName',
            key: 'ruleName',
        },
        {
            title: t('setting'),
            dataIndex: 'setting',
            key: 'setting',
            render: (text, record) => <Input value={text} onChange={(e) => handleInputChange(e, record.key)} />,
        },
    ];

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleAddRule = () => {
        form.validateFields().then((values) => {
            const newData: any = {
                key: `${data.length + 1}`,
                ruleName: values.ruleName,
                setting: values.setting,
            };
            const updatedData = [...data, newData];
            setData(updatedData);

            // Update the payloadData with the new rule in the activityRules array
            const updatedPayload = {
                ...payloadData,
                activityRules: updatedData, // Ensure activityRules exists in payloadData
            };
            setPayloadData(updatedPayload); // Set the updated payload data

            closeModal();
            form.resetFields();
        });
    };

    const handleRestoreDefaults = () => {
        const updatedData = data.map((item) => ({
            ...item,
            setting: '', // Clear the setting value
        }));
        setData(updatedData);

        // Update the payloadData with the cleared settings in the activityRules array
        const updatedPayload = {
            ...payloadData,
            activityRules: updatedData,
        };
        setPayloadData(updatedPayload);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const newData = data.map(item =>
            item.key === key ? { ...item, setting: e.target.value } : item
        );
        setData(newData);

        // Update the payloadData with the changed setting in the activityRules array
        const updatedPayload = {
            ...payloadData,
            activityRules: newData,
        };
        setPayloadData(updatedPayload);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button type="primary" onClick={openModal} style={{ marginRight: '8px' }}>
                    {t("addRules")}
                </Button>
                <Button onClick={handleRestoreDefaults}>{t("restoreDefault")}</Button>
            </div>
            <Table columns={columns} dataSource={data} pagination={false} />
            <Modal
                title={t("addRule")}
                open={isModalOpen}
                onCancel={closeModal}
                footer={[
                    <Button key={t("cancel")} onClick={closeModal}>
                        {t("cancel")}
                    </Button>,
                    <Button key={t("add")} type="primary" onClick={handleAddRule}>
                        {t("add")}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label={t("rules")}
                        name="ruleName"
                        rules={[{ required: true, message: 'Please input the rule!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label={t("setting")}
                        name="setting"
                        rules={[{ required: false, message: 'Please input the setting!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RulesTable;
