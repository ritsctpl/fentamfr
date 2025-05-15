import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash';

interface QualityDeviation {
  deviationId: string;
  condition: string;
  impact: string;
  requiredAction: string;
  sequence: string;
}

const QualityDeviationsManagement: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();

  const [qualityDeviations, setQualityDeviations] = useState<QualityDeviation[]>(() => 
    (formData.yieldTracking?.qualityDeviations || []).map(item => ({
      deviationId: item.deviationId,
      condition: item.condition,
      impact: item.impact,
      requiredAction: item.requiredAction,
      sequence: item.sequence,
    }))
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Update qualityDeviations when formData changes
  useEffect(() => {
    if (formData.yieldTracking) {
      setQualityDeviations(formData.yieldTracking.qualityDeviations || []);
    } else {
      setQualityDeviations([]); // Reset the form if yieldTracking is null
    }
  }, [formData]);

  // Debounced function to update only qualityDeviations
  const debouncedSaveQualityDeviations = debounce((updatedQualityDeviations: QualityDeviation[]) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      yieldTracking: {
        ...prevFormData.yieldTracking,
        qualityDeviations: updatedQualityDeviations,
      },
    }));
  });

  // Update formData when qualityDeviations change
  useEffect(() => {
    debouncedSaveQualityDeviations(qualityDeviations);
  }, [qualityDeviations]);

  const handleAddQualityDeviation = () => {
    const newId = `QD${String(qualityDeviations.length + 1).padStart(3, '0')}`;
    setQualityDeviations(prevQualityDeviations => [
      ...prevQualityDeviations,
      {
        deviationId: newId,
        condition: '',
        impact: '',
        requiredAction: '',
        sequence: String((qualityDeviations.length + 1) * 10),
      },
    ]);
  };

  const handleDeleteAllQualityDeviations = () => {
    setQualityDeviations([]);
    setSelectedRowKeys([]);
  };

  const handleRemoveSelectedQualityDeviations = () => {
    const newQualityDeviations = qualityDeviations.filter(item => !selectedRowKeys.includes(item.deviationId));
    setQualityDeviations(newQualityDeviations);
    setSelectedRowKeys([]);
  };

  const handleChangeQualityDeviation = (newValue: string, id: string, field: keyof QualityDeviation) => {
    const updatedQualityDeviations = qualityDeviations.map(item =>
      item.deviationId === id ? { ...item, [field]: newValue } : item
    );
    setQualityDeviations(updatedQualityDeviations); // Immediate update
  };

  const columns = [
    {
      title: t('DeviationId'),
      dataIndex: 'deviationId',
      render: (text: string) => <span>{text}</span>,
      hidden: true,
    },
    {
      title: t('Condition'),
      dataIndex: 'condition',
      render: (_, record) => (
        <Input.TextArea
          value={record.condition}
          onChange={e => handleChangeQualityDeviation(e.target.value, record.deviationId, 'condition')}
          rows={2}
        />
      ),
    },
    {
      title: t('Impact'),
      dataIndex: 'impact',
      render: (_, record) => (
        <Input.TextArea
          value={record.impact}
          onChange={e => handleChangeQualityDeviation(e.target.value, record.deviationId, 'impact')}
          rows={2}
        />
      ),
    },
    {
      title: t('Required Action'),
      dataIndex: 'requiredAction',
      render: (_, record) => (
        <Input.TextArea
          value={record.requiredAction}
          onChange={e => handleChangeQualityDeviation(e.target.value, record.deviationId, 'requiredAction')}
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
        <Button onClick={handleAddQualityDeviation}>{t('insert')}</Button>
        <Button onClick={handleDeleteAllQualityDeviations}>{t('removeAll')}</Button>
        <Button onClick={handleRemoveSelectedQualityDeviations}>{t('removeSelected')}</Button>
      </Space>
      <Table
        bordered={true}
        rowSelection={rowSelection}
        dataSource={qualityDeviations}
        columns={columns}
        size="small"
        rowKey="deviationId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 540px)' }}
      />
    </div>
  );
};

export default QualityDeviationsManagement;
