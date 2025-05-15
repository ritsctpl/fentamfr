import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserContext } from '../hooks/userContext';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

// Define SerialPcu interface
interface SerialPcu {
  count: number;
  serialNumber: string;
  pcuNumber: string;
  pcuQuantity: string;
  state: string;
  enabled: boolean;
}

const generateSerialNumber = (count: number): string => {
  return `SN-${count.toString().padStart(4, '0')}`;
};

const SerialPUC: React.FC = () => {
  const { formData, setFormData,setValueChange } = useContext(UserContext);
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState<SerialPcu[]>([]);

  // Update dataSource whenever formData.serialPcu changes
  useEffect(() => {
    if (formData.serialPcu) {
      const updatedDataSource = formData.serialPcu.map((item, index) => ({
        count: index + 1,
        ...item,
        serialNumber: item.serialNumber || generateSerialNumber(index + 1),
      }));
      setDataSource(updatedDataSource);
    }
  }, [formData.serialPcu]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const handleAdd = () => {
    setValueChange(true);
    const newCount = dataSource.length ? Math.max(...dataSource.map(item => item.count)) + 1 : 1;
    const newData: SerialPcu = {
      count: newCount,
      serialNumber: generateSerialNumber(newCount),
      pcuNumber: '',
      pcuQuantity: '',
      state: '',
      enabled: true,
    };
    const updatedDataSource = [...dataSource, newData];
    setDataSource(updatedDataSource);
    updateFormData(updatedDataSource);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    updateFormData([]);
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item.count));
    setValueChange(true);
    // Reassign count after deletion
    const updatedDataSource = newDataSource.map((item, index) => ({
      ...item,
      count: index + 1,
    }));
    setDataSource(updatedDataSource);
    setSelectedRowKeys([]);
    updateFormData(updatedDataSource);
  };

  const debounceHandleChange = debounce((newValue: any, count: number, field: keyof SerialPcu) => {
    setValueChange(true);
    const updatedDataSource = dataSource.map(item =>
      item.count === count ? { ...item, [field]: newValue } : item
    );
    setDataSource(updatedDataSource);
    updateFormData(updatedDataSource);
  }, 300);

  const updateFormData = (newData: SerialPcu[]) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      serialPcu: newData,
    }));
  };

  const columns: ColumnsType<SerialPcu> = [
    {
      title: t('pcuNumber'),
      dataIndex: 'pcuNumber',
      render: (_, record) => (
        <Input
          value={record?.pcuNumber}
          onChange={e => debounceHandleChange(e.target.value, record?.count, 'pcuNumber')}
        />
      ),
    },
    {
      title: t('pcuQuantity'),
      dataIndex: 'pcuQuantity',
      render: (_, record) => (
        <Input
          value={record?.pcuQuantity}
          onChange={e => debounceHandleChange(e.target.value, record?.count, 'pcuQuantity')}
        />
      ),
    },
    {
      title: t('state'),
      dataIndex: 'state',
      render: (_, record) => (
        <span>{record?.state || t('New')}</span>
      ),
    },
    {
      title: t('enabled'),
      dataIndex: 'enabled',
      render: (_, record) => (
        <Input
          type="checkbox"
          checked={record?.enabled}
          onChange={e => debounceHandleChange(e.target.checked, record?.count, 'enabled')}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys),
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
        rowKey="count" 
        pagination={false}
        scroll={{ y: 'calc(100vh - 420px)' }}
      />
    </div>
  );
};

export default SerialPUC;
