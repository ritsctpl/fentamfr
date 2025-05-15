import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash'; // Using lodash for debounce

interface TriggerPoint {
  triggerPointId: string;
  description: string;
  condition: string;
  sequence: string;
  action: string;
}
const emptyAray = []
const TriggerPointTable: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState<TriggerPoint[]>(() => 
    (formData?.triggerPoints || []).map(item => ({
      triggerPointId: item.triggerPointId,
      description: item.description,
      condition: item.condition,
      action: item.action,
      sequence: item.sequence
    }))
  );
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Update dataSource when formData changes
  useEffect(() => {
    if (formData?.triggerPoints) {
      const updatedDataSource = formData?.triggerPoints.map(item => ({
        triggerPointId: item.triggerPointId,
        description: item?.description,
        condition: item?.condition,
        action: item?.action,
        sequence: item?.sequence || ''
      }));
      if (JSON.stringify(updatedDataSource) !== JSON.stringify(dataSource)) {
        setDataSource(updatedDataSource);
      }
    }
  }, [formData]);

  // Debounced function to update formData
  const debouncedSave = debounce((updatedDataSource: TriggerPoint[]) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      triggerPoints: updatedDataSource.length === 0 ? null : updatedDataSource,
    }));
  });

  // Update formData when dataSource changes
  useEffect(() => {
    debouncedSave(dataSource);
  }, [dataSource]);

  const handleAdd = () => {
    const newId = `TP${String(dataSource.length + 1).padStart(3, '0')}`;
    const newSequence = (dataSource.length + 1) * 10; 
    setDataSource(prevDataSource => [...prevDataSource, {
      triggerPointId: newId,
      description: '',
      condition: '',
      action: '',
      sequence: String(newSequence)
    }]);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setFormData(prevFormData => ({
      ...prevFormData,
      triggerPoints: null,
    }));
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item.triggerPointId));
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
    setFormData(prevFormData => ({
      ...prevFormData,
      triggerPoints: newDataSource,
    }));
  };

  const handleChange = (newValue: string, id: string, field: keyof TriggerPoint) => {
    const updatedDataSource = dataSource.map(item =>
      item.triggerPointId === id ? { ...item, [field]: newValue } : item
    );
    setDataSource(updatedDataSource); // Immediate update
  };

  const columns = [
    {
      title: t('Trigger PointId'),
      dataIndex: 'triggerPointId',
      render: (text: string) => <span>{text}</span>,
      hidden: true,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      render: (_, record) => (
        <Input.TextArea
          value={record.description}
          onChange={e => handleChange(e.target.value, record.triggerPointId, 'description')}
          rows={2}
        />
      ),
    },
    {
      title: t('Condition'),
      dataIndex: 'condition',
      render: (_, record) => (
        <Input
          value={record.condition}
          onChange={e => handleChange(e.target.value, record.triggerPointId, 'condition')}
        />
      ),
    },
    {
      title: t('sequence'),
      dataIndex: 'sequence',
      render: (_, record) => (
        <Input
          value={record.sequence}
          onChange={e => handleChange(e.target.value, record.triggerPointId, 'sequence')}
          disabled={true}
        />
      ),
    },
    {
      title: t('action'),
      dataIndex: 'action',
      render: (_, record) => (
        <Input.TextArea
          value={record.action}
          onChange={e => handleChange(e.target.value, record.triggerPointId, 'action')}
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
        <Button onClick={handleAdd}>{t('insert')}</Button>
        <Button onClick={handleDeleteAll}>{t('removeAll')}</Button>
        <Button onClick={handleRemoveSelected}>{t('removeSelected')}</Button>
      </Space>
      <Table
        bordered={true}
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        rowKey="triggerPointId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 480px)' }}
      />
    </div>
  );
};

export default TriggerPointTable;
