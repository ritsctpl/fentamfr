import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';

interface DataPoint {
  dataPointId: string;
  description: string;
  frequency: string;
  expectedValueRange: string;
}

interface DataCollectionProps {
  stepArray: {
    dataCollection: DataPoint[];
  };
  setStep: (value: any) => void;
}

const DataCollectionTable: React.FC<DataCollectionProps> = ({ stepArray, setStep }) => {
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState<DataPoint[]>(() => {
    return (stepArray?.dataCollection || []).map(item => ({
      dataPointId: item.dataPointId,
      description: item.description,
      frequency: item.frequency,
      expectedValueRange: item.expectedValueRange,
    }));
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (stepArray?.dataCollection && stepArray.dataCollection.length > 0) {
      const newDataSource = stepArray.dataCollection.map(item => ({
        dataPointId: item.dataPointId,
        description: item.description,
        frequency: item.frequency,
        expectedValueRange: item.expectedValueRange,
      }));
      setDataSource(newDataSource);
    } else {
      setDataSource([]); // Set to empty array if dataCollection is empty or undefined
    }
  }, [stepArray]);

  const handleAdd = () => {
    const newId = `DP${String(dataSource.length + 1).padStart(3, '0')}`;
    setDataSource(prevDataSource => [
      ...prevDataSource,
      {
        dataPointId: newId,
        description: '',
        frequency: '',
        expectedValueRange: '',
      },
    ]);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setStep(prev => ({
      ...prev, 
      dataCollection: null
    }));
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item.dataPointId));
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
    setStep(prev => ({
      ...prev, 
      dataCollection: newDataSource?.length > 0 ? newDataSource : null
    }));
  };

  const handleChange = (newValue: string, id: string, field: keyof DataPoint) => {
    const updatedDataSource = dataSource.map(item => {
      if (item.dataPointId === id) {
        return { ...item, [field]: newValue };
      }
      return item;
    });

    setDataSource(updatedDataSource);
    setStep(prev => ({
      ...prev,
      dataCollection: updatedDataSource,
    }));
  };

  const columns = [
    // {
    //   title: t('dataPointID'),
    //   dataIndex: 'dataPointId',
    //   render: (text: string) => <span>{text}</span>,
    // },
    {
      title: t('description'),
      dataIndex: 'description',
      render: (_, record) => (
        <Input
          value={record.description}
          onChange={e => handleChange(e.target.value, record.dataPointId, 'description')}
        />
      ),
    },
    {
      title: t('frequency'),
      dataIndex: 'frequency',
      render: (_, record) => (
        <Input
          value={record.frequency}
          onChange={e => handleChange(e.target.value, record.dataPointId, 'frequency')}
        />
      ),
    },
    {
      title: t('expectedValueRange'),
      dataIndex: 'expectedValueRange',
      render: (_, record) => (
        <Input
          value={record.expectedValueRange}
          onChange={e => handleChange(e.target.value, record.dataPointId, 'expectedValueRange')}
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
        rowKey="dataPointId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 350px)' }}
      />
    </div>
  );
};

export default DataCollectionTable;
