import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash';

interface Correction {
  correctionId: string;
  condition: string;
  action: string;
  impact: string;
}

const CorrectionsManagement: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();

  const [corrections, setCorrections] = useState<Correction[]>(() => 
    (formData.yieldTracking?.corrections || []).map(item => ({
      correctionId: item.correctionId,
      condition: item.condition,
      action: item.action,
      impact: item.impact,
    }))
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Update corrections when formData changes
  useEffect(() => {
    if (formData.yieldTracking) {
      setCorrections(formData.yieldTracking.corrections || []);
    } else {
      setCorrections([]); // Reset the form if yieldTracking is null
    }
  }, [formData]);

  // Debounced function to update only corrections
  const debouncedSaveCorrections = debounce((updatedCorrections: Correction[]) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      yieldTracking: {
        ...prevFormData.yieldTracking,
        corrections: updatedCorrections,
      },
    }));
    
  });

  // Update formData when corrections change
  useEffect(() => {
    debouncedSaveCorrections(corrections);
  }, [corrections]);

  const handleAddCorrection = () => {
    const newId = `COR${String(corrections.length + 1).padStart(3, '0')}`;
    setCorrections(prevCorrections => [
      ...prevCorrections,
      {
        correctionId: newId,
        condition: '',
        action: '',
        sequence: String((corrections.length + 1) * 10),
        impact: '',
      },
    ]);
  };

  const handleDeleteAllCorrections = () => {
    setCorrections(null);
    setSelectedRowKeys([]);
  };

  const handleRemoveSelectedCorrections = () => {
    const newCorrections = corrections.filter(item => !selectedRowKeys.includes(item.correctionId));
    setCorrections(newCorrections);
    setSelectedRowKeys([]);
  };

  const handleChangeCorrection = (newValue: string, id: string, field: keyof Correction) => {
    const updatedCorrections = corrections.map(item =>
      item.correctionId === id ? { ...item, [field]: newValue } : item
    );
    setCorrections(updatedCorrections); // Immediate update
  };

  const columns = [
    {
      title: t('CorrectionId'),
      dataIndex: 'correctionId',
      render: (text: string) => <span>{text}</span>,
      hidden: true,
    },
    {
      title: t('Condition'),
      dataIndex: 'condition',
      render: (_, record) => (
        <Input.TextArea
          value={record.condition}
          onChange={e => handleChangeCorrection(e.target.value, record.correctionId, 'condition')}
          rows={2}
        />
      ),
    },
    {
      title: t('Action'),
      dataIndex: 'action',
      render: (_, record) => (
        <Input
          value={record.action}
          onChange={e => handleChangeCorrection(e.target.value, record.correctionId, 'action')}
        />
      ),
    },
    {
      title: t('Impact'),
      dataIndex: 'impact',
      render: (_, record) => (
        <Input.TextArea
          value={record.impact}
          onChange={e => handleChangeCorrection(e.target.value, record.correctionId, 'impact')}
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
        <Button onClick={handleAddCorrection}>{t('insert')}</Button>
        <Button onClick={handleDeleteAllCorrections}>{t('removeAll')}</Button>
        <Button onClick={handleRemoveSelectedCorrections}>{t('removeSelected')}</Button>
      </Space>
      <Table
        bordered={true}
        rowSelection={rowSelection}
        dataSource={corrections}
        columns={columns}
        rowKey="correctionId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 540px)' }}
      />
    </div>
  );
};

export default CorrectionsManagement;
