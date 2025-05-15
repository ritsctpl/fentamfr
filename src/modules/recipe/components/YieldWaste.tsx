import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash';

interface Waste {
  wasteId: string;
  description: string;
  quantity: string;
  uom: string;
  handlingProcedure: string;
  costOfDisposal: string;
}

const WasteManagement: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();

  const [wastes, setWastes] = useState<Waste[]>(() => 
    (formData.yieldTracking?.waste || []).map(item => ({
      wasteId: item.wasteId,
      description: item.description,
      quantity: item.quantity,
      uom: item.uom,
      handlingProcedure: item.handlingProcedure,
      costOfDisposal: item.costOfDisposal,
    }))
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Update wastes when formData changes
  useEffect(() => {
    if (formData.yieldTracking) {
      setWastes(formData.yieldTracking.waste || []);
    } else {
      setWastes([]); // Reset the form if yieldTracking is null
    }
  }, [formData]);

  // Debounced function to update only wastes
  const debouncedSaveWastes = debounce((updatedWastes: Waste[]) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      yieldTracking: {
        ...prevFormData.yieldTracking,
        waste: updatedWastes,
      },
    }));
  });

  // Update formData when wastes change
  useEffect(() => {
    debouncedSaveWastes(wastes);
  }, [wastes]);

  const handleAddWaste = () => {
    const newId = `W${String(wastes.length + 1).padStart(3, '0')}`;
    setWastes(prevWastes => [
      ...prevWastes,
      {
        wasteId: newId,
        description: '',
        quantity: '',
        sequence: String((wastes.length + 1) * 10),
        uom: '',
        handlingProcedure: '',
        costOfDisposal: '',
      },
    ]);
  };

  const handleDeleteAllWastes = () => {
    setWastes(null);
    setSelectedRowKeys([]);
  };

  const handleRemoveSelectedWastes = () => {
    const newWastes = wastes.filter(item => !selectedRowKeys.includes(item.wasteId));
    setWastes(newWastes);
    setSelectedRowKeys([]);
  };

  const handleChangeWaste = (newValue: string, id: string, field: keyof Waste) => {
    const updatedWastes = wastes.map(item =>
      item.wasteId === id ? { ...item, [field]: newValue } : item
    );
    setWastes(updatedWastes); // Immediate update
  };

  const columns = [
    {
      title: t('WasteId'),
      dataIndex: 'wasteId',
      render: (text: string) => <span>{text}</span>,
      hidden: true,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      render: (_, record) => (
        <Input.TextArea
          value={record.description}
          onChange={e => handleChangeWaste(e.target.value, record.wasteId, 'description')}
          rows={2}
        />
      ),
    },
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      render: (_, record) => (
        <Input
          value={record.quantity}
          onChange={e => handleChangeWaste(e.target.value, record.wasteId, 'quantity')}
        />
      ),
    },
    {
      title: t('UOM'),
      dataIndex: 'uom',
      render: (_, record) => (
        <Input
          value={record.uom}
          onChange={e => handleChangeWaste(e.target.value, record.wasteId, 'uom')}
        />
      ),
    },
    {
      title: t('Handling Procedure'),
      dataIndex: 'handlingProcedure',
      render: (_, record) => (
        <Input.TextArea
          value={record.handlingProcedure}
          onChange={e => handleChangeWaste(e.target.value, record.wasteId, 'handlingProcedure')}
          rows={2}
        />
      ),
    },
    {
      title: t('Cost of Disposal'),
      dataIndex: 'costOfDisposal',
      render: (_, record) => (
        <Input
          value={record.costOfDisposal}
          onChange={e => handleChangeWaste(e.target.value, record.wasteId, 'costOfDisposal')}
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
        <Button onClick={handleAddWaste}>{t('insert')}</Button>
        <Button onClick={handleDeleteAllWastes}>{t('removeAll')}</Button>
        <Button onClick={handleRemoveSelectedWastes}>{t('removeSelected')}</Button>
      </Space>
      <Table
        bordered={true}
        rowSelection={rowSelection}
        dataSource={wastes}
        columns={columns}
        size="small"
        rowKey="wasteId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 540px)' }}
      />
    </div>
  );
};

export default WasteManagement;
