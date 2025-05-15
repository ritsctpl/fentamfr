import React, { useState } from 'react';
import { Table, Button, Modal, Input, Form } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface DataType {
  key: number;
  materialId: string;
  materialName: string;
  uom: string;
  expectedQty: number;
  unit: string;
  receivedQty: number;
}

const MyTable: React.FC = () => {
  const { t } = useTranslation(); 
  const [basket, setBasket] = useState<DataType[]>([
    {
      key: 1,
      materialId: 'ING001',
      materialName: 'Flour',
      uom: 'kg',
      expectedQty: 2,
      unit: 'bags',
      receivedQty: 1.5,
    },
    {
      key: 2,
      materialId: 'ING002',
      materialName: 'Sugar',
      uom: 'kg',
      expectedQty: 1,
      unit: 'bags',
      receivedQty: 0.8,
    },
    {
      key: 3,
      materialId: 'ING003',
      materialName: 'Eggs',
      uom: 'pcs',
      expectedQty: 12,
      unit: 'dozen',
      receivedQty: 10,
    },
    {
      key: 4,
      materialId: 'ING004',
      materialName: 'Butter',
      uom: 'kg',
      expectedQty: 1,
      unit: 'packs',
      receivedQty: 0.5,
    },
  ]);
  
  
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const handleInsert = async () => {
    const values = await form.validateFields();
    setBasket([...basket, { key: basket.length + 1, ...values }]);
    setVisible(false);
    form.resetFields();
  };

  const handleDelete = (key: number) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to remove this entry?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        setBasket(basket.filter(item => item.key !== key));
      },
    });
  };

  const handleDeleteAll = () => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to remove all entries?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        setBasket([]);
      },
    });
  };

  const customFooter = (
    <>
      <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
        {t("cancel")}
      </Button>
      <Button
        style={{
          backgroundColor: '#BEA260',
          borderColor: '#BEA260',
          color: 'white',
        }}
        onClick={handleInsert}
      >
         {t("ok")}
      </Button>
    </>
  );

  return (
    <div>
      <style>
        {`
          .insert-button {
            background-color: #BEA260;
            border-color: #BEA260;
            color: white; /* Text color */
            transition: background-color 0.3s;
          }
          .insert-button:hover {
            background-color: #D4C66E; /* Light gold color */
          }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        {/* <Button
          className="insert-button"
          onClick={() => setVisible(true)}
          style={{ marginRight: '8px' }} 
        >
           {t("insert")}
        </Button>
        <Button onClick={handleDeleteAll} >
        {t("removeAll")}
        </Button> */}
      </div>
      <Modal
        title={t('insert')} 
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={customFooter} // Use the custom footer
      >
        <Form form={form} layout="vertical">
          <Form.Item name="materialId" label={t('prelautid')}  rules={[{ required: true }]}>
            <Input placeholder="Enter materialId" />
          </Form.Item>
          <Form.Item name="materialName" label={t('materialName')} rules={[{ required: true }]}>
            <Input placeholder="Enter Matera Name" />
          </Form.Item>
          <Form.Item name="uom" label={t('uom')} rules={[{ required: true }]}>
            <Input placeholder="Enter UOM" />
          </Form.Item>
          <Form.Item name="expectedQty" label={t('expectedQty')} rules={[{ required: true }]}>
            <Input type="number" placeholder="Enter Expected Qty" />
          </Form.Item>
          <Form.Item name="unit" label={t('unit')}rules={[{ required: true }]}>
            <Input placeholder="Enter Unit" />
          </Form.Item>
          <Form.Item name="receivedQty" label={t('receivedQty')}  rules={[{ required: true }]}>
            <Input type="number" placeholder="Enter Received Qty" />
          </Form.Item>
        </Form>
      </Modal>
      <Table
        dataSource={basket}
        pagination={false}
        rowKey="key"
      >
       <Table.Column title={t('prelautid')} dataIndex="materialId" />
        <Table.Column title={t('materialName')} dataIndex="materialName" />
        <Table.Column title={t('uom')} dataIndex="uom" />
        <Table.Column title={t('expectedQty')} dataIndex="expectedQty" />
        <Table.Column title={t('unit')} dataIndex="unit" />
        <Table.Column title={t('receivedQty')} dataIndex="receivedQty" />

        <Table.Column
          title="Actions"
          render={(text, record) => (
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.key)}
            />
          )}
        />
      </Table>
    </div>
  );
};

export default MyTable;
