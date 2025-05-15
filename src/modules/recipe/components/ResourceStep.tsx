import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash';

interface Resource {
  resourceId: string;
  description: string;
  workCenterId: string;
  sequence: string;
  parameters: {
    rpm: number;
    duration: string;
    pressure: string;
  };
}

interface Step {
  operationId: string;
  resources: Resource[]; // Assuming each step has an array of resources
}

interface ResourceTableProps {
  stepArray:any;
  setStep: (value: Object) => void;
  operationId: string;
}

const ResourceTable: React.FC<ResourceTableProps> = ({ stepArray, setStep, operationId }) => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState<Resource[]>(() => {
    return (stepArray?.resources || []).map(item => ({
      resourceId: item.resourceId,
      description: item.description,
      workCenterId: item.workCenterId,
      parameters: item.parameters,
      sequence: item.sequence,
    }));
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (stepArray?.resources && stepArray.resources.length > 0) {
      const newDataSource = stepArray.resources.map(item => ({
        resourceId: item.resourceId,
        description: item.description,
        workCenterId: item.workCenterId,
        parameters: item.parameters,
        sequence: item.sequence,
      }));
      setDataSource(newDataSource);
    } else {
      setDataSource([]); // Set to empty array if resources are empty
    }
  }, [stepArray, formData, operationId]);
  


  const handleAdd = () => {
    const newSequence = (dataSource.length + 1) * 10;
    const newId = `RES${String(newSequence).padStart(3, '0')}`;
    setDataSource(prevDataSource => [...prevDataSource, {
      resourceId: newId,
      description: '',
      workCenterId: '',
      sequence: String(newSequence),
      parameters: { rpm: 0, duration: '', pressure: '' },
    }]);
  };

  const handleDeleteAll = () => {
    setDataSource(null);
    setSelectedRowKeys(null);
    setStep(prev => ({
      ...prev, 
      resources: null
    }));
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item.resourceId));
    setDataSource(newDataSource);
    setStep(prev => ({
      ...prev, 
      resources: newDataSource?.length > 0 ? newDataSource : null
    }));
    setSelectedRowKeys([]);
  };

  const handleChange = (newValue: string | number, id: string, field: keyof Resource | keyof Resource['parameters']) => {
    const updatedDataSource = dataSource.map(item => {
      if (item.resourceId === id) {
        if (item.parameters && field in item.parameters) {
          return { ...item, parameters: { ...item.parameters, [field]: newValue } };
        }
        return { ...item, [field]: newValue };
      }
      return item;
    });
  
    // Update local state
    setDataSource(updatedDataSource);
  
    setStep(prev => ({
      ...prev, 
      resources: updatedDataSource
    }));
    
    
  };

  const columns = [
    {
      title: t('resource'),
      dataIndex: 'resourceId',
      render: (_, record) => (
        <Input
          value={record.resourceId}
          onChange={e => handleChange(e.target.value, record.resourceId, 'resourceId')}
        />
      ),
    },
    {
      title: t('description'),
      dataIndex: 'description', 
      render: (_, record) => (
        <Input
          value={record.description}
          onChange={e => handleChange(e.target.value, record.resourceId, 'description')}
        />
      ),
    },
    {
      title: t('workCenter'),
      dataIndex: 'workCenterId',
      render: (_, record) => (
        <Input
          value={record.workCenterId}
          onChange={e => handleChange(e.target.value, record.resourceId, 'workCenterId')}
        />
      ),
    },
    {
      title: t('rpm'),
      dataIndex: 'parameters.rpm',
      render: (_, record) => (
        <Input
          type="number"
          value={record.parameters?.rpm}
          onChange={e => handleChange(Number(e.target.value), record.resourceId, 'rpm')}
        />
      ),
    },
    {
      title: t('duration'),
      dataIndex: 'parameters.duration',
      render: (_, record) => (
        <Input
          value={record?.parameters?.duration}
          onChange={e => handleChange(e.target.value, record.resourceId, 'duration')}
        />
      ),
    },
    {
      title: t('pressure'),
      dataIndex: 'parameters.pressure',
      render: (_, record) => (
        <Input
          value={record?.parameters?.pressure}
          onChange={e => handleChange(e.target.value, record.resourceId, 'pressure')}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: string[]) => setSelectedRowKeys(keys),
  };
console.log(stepArray,"dataSource");

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
        rowKey="resourceId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 350px)' }}
      />
    </div>
  );
};

export default ResourceTable;


