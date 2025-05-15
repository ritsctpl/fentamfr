import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { OperationContext } from '@modules/operationMaintenance/hooks/operationContext';
import { useTranslation } from 'react-i18next';
import { DynamicBrowse } from '@components/BrowseComponent';

interface Certification {
  id: number;
  certification: string;
  certificationDescription: string;
}

const CertificationTable: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();


  const [dataSource, setDataSource] = useState<Certification[]>(() =>
    (formData.certificationList || []).map((item, index) => ({
      id: index + 1,
      certification: item.certification,
      certificationDescription: item.certificationDescription,
    }))
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  useEffect(() => {
    if (formData.certificationList) {
      const updatedDataSource = formData.certificationList.map((item, index) => ({
        id: index + 1,
        certification: item.certification,
        certificationDescription: item.certificationDescription,
      }));
      setDataSource(updatedDataSource);
    }
  }, [formData.certificationList]);

  const handleAdd = () => {
    const newId = dataSource.length ? Math.max(...dataSource.map((item) => item.id)) + 1 : 1;
    const newData = [
      ...dataSource,
      { id: newId, certification: '', certificationDescription: '' },
    ];
    setDataSource(newData);
    setFormData((prevFormData) => ({
      ...prevFormData,
      certificationList: newData.map(({ certification, certificationDescription }) => ({
        certification,
        certificationDescription,
      })),
    }));
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      certificationList: [],
    }));
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item.id));
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
    setFormData((prevFormData) => ({
      ...prevFormData,
      certificationList: newDataSource,
    }));
  };

  const handleChange = (newValue: any, id: number, field: 'certification' | 'certificationDescription') => {
    let valueGet;
    if(field === 'certification'){
     valueGet = newValue[0]?.certification
    }
    if(field === 'certificationDescription'){
     valueGet = newValue
    }
    if (field === 'certification' && dataSource.some((item) => item.certification === valueGet && item.id !== id)) {
      message.error('Certification must be unique.');
      return;
    }

    const updatedDataSource = dataSource.map((item) =>
      item.id === id ? { ...item, [field]: valueGet } : item
    );
    setDataSource(updatedDataSource);
    setFormData((prevFormData) => ({
      ...prevFormData,
      certificationList: updatedDataSource,
    }));
  };

  const uiReasonCode = {
    pagination: {
      current: 1,
      pageSize: 3,
      total: 10,
    },
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Certification',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'certification',
    tabledataApi: 'certificate-service',
  };

  const columns: ColumnsType<Certification> = [
    {
      title: (
        <span>
         <span style={{ color: 'red' }}>*</span>  {t('certification')}
        </span>
      ),
      dataIndex: 'certification',
      render: (_, record) => (
        <DynamicBrowse
          uiConfig={uiReasonCode}
          initial={record.certification}
          onSelectionChange={(value) =>
            handleChange(value || '', record.id, 'certification')
          }
        />
      ),
    },
    {
      title: t('description'),
      dataIndex: 'certificationDescription',
      render: (_, record) => (
        <Input
          value={record.certificationDescription}
          onChange={(e) => handleChange(e.target.value, record.id, 'certificationDescription')}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: number[]) => setSelectedRowKeys(keys),
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
      <Button onClick={handleAdd}>
          {t('insert')}
        </Button>
        <Button onClick={handleDeleteAll}>
        {t('removeAll')}
        </Button>
        <Button onClick={handleRemoveSelected}>
        {t('removeSelected')}
        </Button>
      </Space>
      <Table
        bordered
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ y: 'calc(100vh - 500px)' }}
      />
    </div>
  );
};

export default CertificationTable;