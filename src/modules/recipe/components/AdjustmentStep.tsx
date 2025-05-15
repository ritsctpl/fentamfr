import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';

interface Adjustment {
  adjustmentId: string;
  adjustmentType: string;
  reason: string;
  impactOnProcess: string;
  impactOnYield: string;
  sequence: number;
}

interface AdjustmentProps {
  stepArray: {
    adjustments: Adjustment[];
  };
  setStep: (value: any) => void;
}

const AdjustmentTable: React.FC<AdjustmentProps> = ({ stepArray, setStep }) => {
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState<Adjustment[]>(() => {
    return (stepArray?.adjustments || []).map(item => ({
      adjustmentId: item.adjustmentId,
      adjustmentType: item.adjustmentType,
      reason: item.reason,
      impactOnProcess: item.impactOnProcess,
      impactOnYield: item.impactOnYield,
      sequence: item.sequence,
    }));
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (stepArray?.adjustments && stepArray.adjustments.length > 0) {
      const newDataSource = stepArray.adjustments.map(item => ({
        adjustmentId: item.adjustmentId,
        adjustmentType: item.adjustmentType,
        reason: item.reason,
        impactOnProcess: item.impactOnProcess,
        impactOnYield: item.impactOnYield,
        sequence: item.sequence,
      }));
      setDataSource(newDataSource);
    } else {
      setDataSource([]); // Set to empty array if adjustments are empty or undefined
    }
  }, [stepArray]);
  

  const handleAdd = () => {
    const nextSequence = (dataSource.length + 1) * 10; // Generate sequence: 10, 20, 30, ...
    setDataSource(prevDataSource => [
      ...prevDataSource,
      {
        adjustmentId: `ADJ_${Date.now()}`,
        adjustmentType: '',
        reason: '',
        impactOnProcess: '',
        impactOnYield: '',
        sequence: nextSequence, // Add sequence number
      },
    ]);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setStep(prev => ({
      ...prev, 
      adjustments: null
    }));
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter((_, index) => !selectedRowKeys.includes(String(index)));
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
    setStep(prev => ({
      ...prev, 
      adjustments: newDataSource?.length > 0 ? newDataSource : null
    }));
  };

  const handleChange = (newValue: string, index: number, field: keyof Adjustment) => {
    const updatedDataSource = dataSource.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: newValue };
      }
      return item;
    });

    setDataSource(updatedDataSource);
    setStep(prev => ({
      ...prev,
      adjustments: updatedDataSource,
    }));
  };

  const columns = [
    
    {
      title: t('Adjustment Type'),
      dataIndex: 'adjustmentType',
      render: (_, record, index) => (
        <Input
          value={record.adjustmentType}
          onChange={e => handleChange(e.target.value, index, 'adjustmentType')}
        />
      ),
    },
    {
      title: t('Reason'),
      dataIndex: 'reason',
      render: (_, record, index) => (
        <Input
          value={record.reason}
          onChange={e => handleChange(e.target.value, index, 'reason')}
        />
      ),
    },
    {
      title: t('Impact on Process'),
      dataIndex: 'impactOnProcess',
      render: (_, record, index) => (
        <Input
          value={record.impactOnProcess}
          onChange={e => handleChange(e.target.value, index, 'impactOnProcess')}
        />
      ),
    },
    {
      title: t('Impact on Yield'),
      dataIndex: 'impactOnYield',
      render: (_, record, index) => (
        <Input
          value={record.impactOnYield}
          onChange={e => handleChange(e.target.value, index, 'impactOnYield')}
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
        bordered
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        rowKey={(record, index) => String(index)} // Use index as key for simplicity
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 350px)' }}
      />
    </div>
  );
};

export default AdjustmentTable;
