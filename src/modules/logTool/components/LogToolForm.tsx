import React from 'react';
import { Form, Row, Col, Button, Table, Card, Input } from 'antd';
import styles from '@modules/logTool/styles/logTool.module.css';
import { useTranslation } from 'react-i18next';

interface DataField {
    key: number;
    name: string;
    input: JSX.Element;
}

interface LogToolFormProps {
    form: any;
    initialValues: any;
    dataFieldData: DataField[];
    onSubmit: (values: any) => void;
    onClose: () => void;
    dataType: any;
}

const LogToolForm: React.FC<LogToolFormProps> = ({ form, initialValues, dataFieldData, onSubmit, onClose, dataType }) => {
    const { t } = useTranslation();

    const dataFieldColumns = [
        {
            title: t('dataField'),
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <span>
                    {text}
                    {dataType.dataFieldList[record.key].required && <span style={{ color: 'red' }}> *</span>} 
                </span>
            ),
        },
        { title: t('dataAttribute'), dataIndex: 'input', key: 'input' },
    ];

    const handleSubmit = (values: any) => {
        const dataFieldValues: Array<{ dataField: string; value: any }> = [];

        dataFieldData.forEach((field) => {
            dataFieldValues.push({
                dataField: field.name,
                value: values[field.name]
            });
            delete values[field.name];
        });

        const formattedValues = {
            ...values,
            dataFields: dataFieldValues
        };

        console.log(formattedValues, 'formattedValues');
        

        onSubmit(formattedValues);
    };

    return (
        <Form
            form={form}
            onFinish={handleSubmit}
            initialValues={initialValues}
            className={styles.assemblyForm}
        >
            <h3>{t('component')} {t('details')}</h3>
            <Row gutter={24}>
                <Col span={7}>
                    <Form.Item label={t('component')} name="component">
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label={t('remaining') + ' ' + t('qty')} name="remainingQty">
                        <Input type="number" disabled />
                    </Form.Item>
                </Col>
                <Col span={9}>
                    <Form.Item
                            label={t('assembled') + ' ' + t('qty')}
                        name="assembledQty"
                        rules={[
                            { required: true, message: 'Please input the assembled quantity!' },
                            { validator: (_, value) => (value < 0 ? Promise.reject(new Error('Cannot be negative')) : Promise.resolve()) },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const remainingQty = getFieldValue('remainingQty');
                                    if (value > remainingQty) {
                                        return Promise.reject(new Error('Cannot exceed remaining quantity'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <h3>{t('dataField')}</h3>
                    <Table
                        className={styles.dataFieldTable}
                        dataSource={dataFieldData}
                        columns={dataFieldColumns}
                        pagination={false}
                        scroll={{ y: 55 * 5 }}
                        rowKey="key"
                        size="middle"
                    />
                </Col>
            </Row>
            <div className={styles.cardFooter}>
                <Button type="primary" htmlType="submit">{t('assemble')}</Button>
                <Button type="default" onClick={onClose}>{t('returnToPod')}</Button>
            </div>
        </Form>
    );
};

export default LogToolForm;
