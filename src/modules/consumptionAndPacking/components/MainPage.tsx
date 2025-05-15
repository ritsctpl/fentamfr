import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Table, Select, message } from 'antd';
import styles from '../styles/ConsumptionAndPackingBody.module.css';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface BoxFormData {
    boxNumber: string;
    boxCapacity: string;
    packetId: string;
    packetDescription: string;
    qtyConsumed: string;
    remainingCapacity: string;
    totalPacketsInBox: string;
}

interface TableData extends BoxFormData {
    key: number;
}

const ConsumptionAndPackingBody: React.FC = () => {
    const [form] = Form.useForm();
    const [formData, setFormData] = useState<any>({
        boxNumber: '',
        boxCapacity: '4',
        packetId: '',
        packetDescription: '',
        qtyConsumed: '0',
        remainingCapacity: '4',
        totalPacketsInBox: '0',
    });

    const [lastValidBoxCapacity, setLastValidBoxCapacity] = useState<string>('4');
    const [tableData, setTableData] = useState<any[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [currentKey, setCurrentKey] = useState<number>(1);
    const { t } = useTranslation();

    const handleInputChange = (changedValues: any, allValues: any) => {
        setFormData(allValues);
    };

    const handleBoxCapacityChange = (value: string) => {
        const boxCapacity = parseInt(value);
        const qtyConsumed = parseInt(formData.qtyConsumed);
        const remainingCapacity = boxCapacity - qtyConsumed;

        if (remainingCapacity < 0) {
            message.error('Box capacity cannot be less than the quantity consumed.');
            form.setFieldsValue({ boxCapacity: lastValidBoxCapacity });
            return;
        }

        const updatedFormData = {
            ...formData,
            boxCapacity: value,
            remainingCapacity: remainingCapacity.toString(),
        };

        setFormData(updatedFormData);
        setLastValidBoxCapacity(value);
        form.setFieldsValue(updatedFormData);
    };

    const handleAdd = () => {
        const currentQtyConsumed = parseInt(formData.qtyConsumed);
        const boxCapacity = parseInt(formData.boxCapacity);

        if (currentQtyConsumed >= boxCapacity) {
            message.error('Box is full! Cannot add more packets.');
            return;
        }

        if (!formData.boxNumber) {
            message.error("Box Number cannot be empty");
            return;
        }
        if (!formData.packetId) {
            message.error("Packet Id cannot be empty");
            return;
        }

        const newQtyConsumed = (currentQtyConsumed + 1).toString();
        const newRemainingCapacity = (boxCapacity - parseInt(newQtyConsumed)).toString();
        const newTotalPacketsInBox = (parseInt(formData.totalPacketsInBox) + 1).toString();

        const newEntry: TableData = {
            ...formData,
            key: currentKey,
            qtyConsumed: newQtyConsumed,
            remainingCapacity: newRemainingCapacity,
            totalPacketsInBox: newTotalPacketsInBox,
        };

        setTableData([...tableData, newEntry]);
        setCurrentKey(currentKey + 1);

        // Clear packetId and packetDescription in the form
        const updatedFormData = {
            ...formData,
            qtyConsumed: newQtyConsumed,
            remainingCapacity: newRemainingCapacity,
            totalPacketsInBox: newTotalPacketsInBox,
            packetId: '', // Clear Packet ID
            packetDescription: '', // Clear Packet Description
        };

        setFormData(updatedFormData);
        form.setFieldsValue(updatedFormData);
    };

    const handleRemove = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select rows to remove.');
            return;
        }

        const selectedData = tableData.filter(item => selectedRowKeys.includes(item.key));
        const totalQtyConsumedToRemove = selectedData.length;

        const newQtyConsumed = (parseInt(formData.qtyConsumed) - totalQtyConsumedToRemove).toString();
        const newRemainingCapacity = (parseInt(formData.boxCapacity) - parseInt(newQtyConsumed)).toString();
        const newTotalPacketsInBox = (parseInt(formData.totalPacketsInBox) - totalQtyConsumedToRemove).toString();

        setTableData(tableData.filter(item => !selectedRowKeys.includes(item.key)));
        setSelectedRowKeys([]);

        const updatedFormData = {
            ...formData,
            qtyConsumed: newQtyConsumed,
            remainingCapacity: newRemainingCapacity,
            totalPacketsInBox: newTotalPacketsInBox,
        };

        setFormData(updatedFormData);
        form.setFieldsValue(updatedFormData);
    };

    const handleClear = () => {
        setFormData({
            boxNumber: '',
            boxCapacity: form.getFieldsValue().boxCapacity,
            packetId: '',
            packetDescription: '',
            qtyConsumed: '0',
            remainingCapacity: form.getFieldsValue().boxCapacity,
            totalPacketsInBox: '0',
        });
        setTableData([]);
        setSelectedRowKeys([]);
        setCurrentKey(1);
        form.setFieldsValue({
            boxNumber: '',
            packetId: '',
            packetDescription: '',
            boxCapacity: form.getFieldsValue().boxCapacity,
            qtyConsumed: '0',
            remainingCapacity: form.getFieldsValue().boxCapacity,
            totalPacketsInBox: '0',
        });
        setLastValidBoxCapacity(form.getFieldsValue().boxCapacity);
    };



    const columns = [
        {
            title: t('sl_no'), // Use i18n key
            dataIndex: 'key',
            key: 'key',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: t('packet_id'), // Use i18n key
            dataIndex: 'packetId',
            key: 'packetId',
        },
        {
            title: t('packet_description'), // Use i18n key
            dataIndex: 'packetDescription',
            key: 'packetDescription',
        },
        {
            title: t('qty_consumed'), // Use i18n key
            dataIndex: 'qtyConsumed',
            key: 'qtyConsumed',
        },
        {
            title: t('total_packets'), // Use i18n key
            dataIndex: 'totalPacketsInBox',
            key: 'totalPacketsInBox',
        },
        {
            title: t('remaining_capacity'), // Use i18n key
            dataIndex: 'remainingCapacity',
            key: 'remainingCapacity',
        },
    ];

    // const handleInputChange = (changedValues: any, allValues: any) => {
    //     if (changedValues.boxNumber) {
    //         changedValues.boxNumber = handleNumericInputChange({ target: { value: changedValues.boxNumber } });
    //     }
    //     if (changedValues.packetId) {
    //         changedValues.packetId = handleNumericInputChange({ target: { value: changedValues.packetId } });
    //     }
    //     setFormData(allValues);
    // };


    // const handleNumericInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const { value } = event.target;
    //     // Remove non-numeric characters and the letter 'e'
    //     const numericValue = value.replace(/[^0-9]/g, '');
    //     return numericValue;
    // };

    // const handleValidInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const { value } = event.target;
    //     // Remove all special characters except for underscore
    //     const validValue = value.replace(/[^a-zA-Z0-9_]/g, '');
    //     return validValue;
    // };

    // const handleInputChange = (changedValues: any, allValues: any) => {
    //     if (changedValues.boxNumber) {
    //         changedValues.boxNumber = handleNumericInputChange(changedValues.boxNumber);
    //     }
    //     if (changedValues.packetId) {
    //         changedValues.packetId = handleValidInputChange(changedValues.packetId);
    //     }
    //     setFormData(allValues);
    // };
    
    // const handleNumericInputChange = (value: any) => {
    //     // Ensure the value is a string before calling replace
    //     const numericValue = String(value).replace(/[^0-9]/g, '');
    //     return numericValue;
    // };
    
    // const handleValidInputChange = (value: any) => {
    //     // Ensure the value is a string before calling replace
    //     const validValue = String(value).replace(/[^a-zA-Z0-9_]/g, '');
    //     return validValue;
    // };
    



    return (
        <div className={styles.formContainer}>
          <Form layout="horizontal" form={form} initialValues={formData} onValuesChange={handleInputChange}>
    <Row gutter={16}>
        {/* Left Column */}
        <Col span={12}>
            <Form.Item
                label={t('boxNumber')}
                name="boxNumber"
                labelCol={{ span: 8 }} // Adjust this value based on your layout needs
                wrapperCol={{ span: 16 }} // Adjust this value based on your layout needs
                required= {true }
            >
                <Input
                    type="text"
                    style={{ width: '100%', height: '50px' }} // Make input bigger
                />
            </Form.Item>

            <Form.Item
                label={t('packetId')}
                name="packetId"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                required= {true }
                style={{ marginTop: '80px' }} // Add space between inputs
            >
                <Input
                    type="text"
                    style={{ width: '100%', height: '50px' }} // Make input bigger
                />
            </Form.Item>
        </Col>

        {/* Right Column */}
        <Col span={12}>
            <Form.Item
                label={t('boxCapacity')}
                name="boxCapacity"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
            >
                <Select
                    defaultValue="4"
                    onChange={handleBoxCapacityChange}
                >
                    <Option value="4">4</Option>
                    <Option value="6">6</Option>
                    <Option value="10">10</Option>
                </Select>
            </Form.Item>

            <Form.Item
                label={t('packetDescription')}
                name="packetDescription"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
            >
                <Input  style={{ width: '100%' }}/>
            </Form.Item>

            <Form.Item
                label={t('qtyConsumed')}
                name="qtyConsumed"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
            >
                <Input value={formData.qtyConsumed}  disabled />
            </Form.Item>

            <Form.Item
                label={t('remainingCapacity')}
                name="remainingCapacity"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
            >
                <Input value={formData.remainingCapacity} disabled />
            </Form.Item>

            <Form.Item
                label={t('totalPacketsInBox')}
                name="totalPacketsInBox"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
            >
                <Input value={formData.totalPacketsInBox} disabled />
            </Form.Item>
        </Col>
    </Row>

    {/* Buttons */}
    <div className={styles.buttonContainer} style={{ marginTop: '-10px' }}>
        <Button type="default" className={styles.button} onClick={handleAdd} style={{ marginRight: '5px' }}>
            {t('add')}
        </Button>
        <Button type="default" className={styles.button} onClick={handleRemove} disabled={!selectedRowKeys.length} style={{ marginRight: '10px' }}>
            {t('remove')}
        </Button>
        <Button type="default" className={styles.button} onClick={handleClear}>
            {t('clear')}
        </Button>
    </div>
</Form>



            {/* Table with Scrollable Rows */}
            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: (newSelectedRowKeys: React.Key[]) => {
                        setSelectedRowKeys(newSelectedRowKeys);
                    },
                }}
                columns={columns}
               
                dataSource={tableData}
                // pagination={{ pageSize: 4 }}\
                pagination={false} 
                scroll={{ y: 240 }}
                style={{ marginTop: '-15px', width: "100vw" }}
            />

        </div>
    );
};

export default ConsumptionAndPackingBody;
