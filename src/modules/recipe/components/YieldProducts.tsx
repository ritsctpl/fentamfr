import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash';

interface ByProduct {
  byProductId: string;
  description: string;
  expectedQuantity: string;
  uom: string;
  handlingProcedure: string;
  sequence: string;
}

const YieldProducts: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();

  const [byProducts, setByProducts] = useState<ByProduct[]>(() => 
    (formData?.yieldTracking?.byProducts || []).map(item => ({
      byProductId: item.byProductId,
      description: item.description,
      expectedQuantity: item.expectedQuantity,
      uom: item.uom,
      handlingProcedure: item.handlingProcedure,
      sequence: item.sequence,
    }))
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Update byProducts when formData changes
  useEffect(() => {
    if (formData?.yieldTracking) {
      setByProducts(formData?.yieldTracking?.byProducts || []);
    }
    else {
        setByProducts([]); // Reset the form if yieldTracking is null
    }
  }, [formData]);

  // Debounced function to update only byProducts
  const debouncedSaveByProducts = debounce((updatedByProducts: ByProduct[]) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      yieldTracking: {
        ...prevFormData?.yieldTracking,
        byProducts: updatedByProducts,
      },
    }));
  });

  // Update formData when byProducts changes
  useEffect(() => {
    debouncedSaveByProducts(byProducts);
  }, [byProducts]);

  const handleAddByProduct = () => {
    const newId = `BY${String(byProducts.length + 1).padStart(3, '0')}`;
    setByProducts(prevByProducts => [
      ...prevByProducts,
      {
        byProductId: newId,
        description: '',
        expectedQuantity: '',
        uom: '',
        handlingProcedure: '',
        sequence: String((byProducts.length + 1) * 10),
      },
    ]);
  };

  const handleDeleteAllByProducts = () => {
    setByProducts([]);
    setSelectedRowKeys([]);
  };

  const handleRemoveSelectedByProducts = () => {
    const newByProducts = byProducts.filter(item => !selectedRowKeys.includes(item.byProductId));
    setByProducts(newByProducts);
    setSelectedRowKeys([]);
  };

  const handleChangeByProduct = (newValue: string, id: string, field: keyof ByProduct) => {
    const updatedByProducts = byProducts.map(item =>
      item.byProductId === id ? { ...item, [field]: newValue } : item
    );
    setByProducts(updatedByProducts); // Immediate update
  };

  const columns = [
    {
      title: t('ByProductId'),
      dataIndex: 'byProductId',
      render: (text: string) => <span>{text}</span>,
      hidden: true,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      render: (_, record) => (
        <Input.TextArea
          value={record.description}
          onChange={e => handleChangeByProduct(e.target.value, record.byProductId, 'description')}
          rows={2}
        />
      ),
    },
    {
      title: t('Expected Quantity'),
      dataIndex: 'expectedQuantity',
      render: (_, record) => (
        <Input
          value={record.expectedQuantity}
          onChange={e => handleChangeByProduct(e.target.value, record.byProductId, 'expectedQuantity')}
        />
      ),
    },
    {
      title: t('UOM'),
      dataIndex: 'uom',
      render: (_, record) => (
        <Input
          value={record.uom}
          onChange={e => handleChangeByProduct(e.target.value, record.byProductId, 'uom')}
        />
      ),
    },
    {
      title: t('Handling Procedure'),
      dataIndex: 'handlingProcedure',
      render: (_, record) => (
        <Input.TextArea
          value={record.handlingProcedure}
          onChange={e => handleChangeByProduct(e.target.value, record.byProductId, 'handlingProcedure')}
          rows={2}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: string[]) => setSelectedRowKeys(keys),
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        <Button onClick={handleAddByProduct}>{t('insert')}</Button>
        <Button onClick={handleDeleteAllByProducts}>{t('removeAll')}</Button>
        <Button onClick={handleRemoveSelectedByProducts}>{t('removeSelected')}</Button>
      </Space>
      <Table
        bordered={true}
        rowSelection={rowSelection}
        dataSource={byProducts}
        columns={columns}
        size="small"
        rowKey="byProductId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 540px)' }}
      />
    </div>
  );
};

export default YieldProducts;
