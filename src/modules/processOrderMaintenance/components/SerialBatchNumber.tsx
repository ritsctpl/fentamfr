import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserContext } from '@modules/processOrderMaintenance/hooks/userContext';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

interface SerialBatchNumbers {
  count: number;
  serialNumber: string; 
  batchNumber: string;
  batchNumberQuantity: string | number;
  state: string;
  enabled: boolean;
}

const SerialBatchNumber: React.FC = () => {
  const { formData, setFormData, setFormChange } = useContext(UserContext);
  const { t } = useTranslation();

  const generateSerialNumber = (count: number): string => {
    return `SN-${String(count).padStart(4, '0')}`;
  };

  const [dataSource, setDataSource] = useState<any>(() => {
    if (formData.batchNumber && formData.batchNumber.length > 0) {
      return formData.batchNumber.map((item, index) => ({
        count: index + 1,
        ...item,
      }));
    }
    // Changed to return empty array instead of default row
    return [];
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  useEffect(() => {
    if (formData.batchNumber && formData.batchNumber.length > 0) {
      const updatedDataSource = formData.batchNumber.map((item, index) => ({
        count: index + 1,
        ...item,
      }));
      setDataSource(updatedDataSource);
    }
  }, [formData.batchNumber]);

  const handleAdd = () => {
    const newCount = dataSource.length ? Math.max(...dataSource.map((item) => item.count)) + 1 : 1;
    const newData: SerialBatchNumbers[] = [
      ...dataSource,
      {
        count: newCount,
        serialNumber: generateSerialNumber(newCount),
        batchNumber: '',
        batchNumberQuantity: '',
        state: 'New',
        enabled: true,
      },
    ];
    setDataSource(newData);
    setFormData((prevFormData) => ({
      ...prevFormData,
      batchNumber: newData,
    }));
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      batchNumber: [],
    }));
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item.count));
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
    setFormData((prevFormData) => ({
      ...prevFormData,  
      batchNumber: newDataSource,
    }));
  };

  const hasInUseRecords = dataSource.some((record) => record.state === 'IN_USE');

  const debounceHandleChange = debounce((newValue: any, count: number, field: keyof SerialBatchNumbers) => {
    const record = dataSource.find(item => item.count === count);
    if (record?.state === 'IN_USE') return;
    
    const updatedDataSource = dataSource.map((item) => {
      if (item.count === count) {
        const updatedItem = { ...item, [field]: newValue };
        updatedItem.state = updatedItem.batchNumber && updatedItem.batchNumberQuantity ? 'New' : 'New';
        return updatedItem;
      }
      return item;
    });

    setDataSource(updatedDataSource);
    setFormChange(true)
    setFormData((prevFormData) => ({
      ...prevFormData,
      batchNumber: updatedDataSource,
    }));
  });

  const columns: ColumnsType<SerialBatchNumbers> = [
    {
      title: <span>{t('batchNumber')} <span style={{ color: '#ff4d4f' }}>*</span></span>,
      dataIndex: 'batchNumber',
      render: (_, record) => (
        <Input
          value={record.batchNumber}
          onChange={(e) => debounceHandleChange(e.target.value, record.count, 'batchNumber')}
          disabled={record.state === 'IN_USE'}
        />
      ),
    },
    {
      title: <span>{t('batchNumberQuantity')} <span style={{ color: '#ff4d4f' }}>*</span></span>,
      dataIndex: 'batchNumberQuantity',
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          value={record.batchNumberQuantity}
          onChange={(e) => debounceHandleChange(e.target.value, record.count, 'batchNumberQuantity')}
          disabled={record.state === 'IN_USE'}
        />
      ),
    },
    {
      title: t('state'),
      dataIndex: 'state',
      render: (_, record) => (
        <span>{record.state || t('New')}</span>
      ),
    },
    {
      title: t('enabled'),
      dataIndex: 'enabled',
      render: (_, record) => (
        <Input
          type='checkbox'
          checked={record.enabled}
          onChange={(e) => debounceHandleChange(e.target.checked, record.count, 'enabled')}
          disabled={record.state === 'IN_USE'}
        />
      ),
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: number[]) => setSelectedRowKeys(keys),
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        <Button onClick={handleAdd} disabled={hasInUseRecords}>
          {t('insert')}
        </Button>
        <Button onClick={handleDeleteAll} disabled={hasInUseRecords}>
          {t('removeAll')}
        </Button>
        <Button onClick={handleRemoveSelected} disabled={hasInUseRecords}>
          {t('removeSelected')}
        </Button>
      </Space>
      <Table
        bordered
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        rowKey="count"
        pagination={false}
        scroll={{ y: 'calc(100vh - 420px)' }}
      />
    </div>
  );
};

export default SerialBatchNumber;
