import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { StageContext } from '@modules/stageMaintenance/hooks/stageContext';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import { DynamicBrowse } from '@components/BrowseComponent';

interface SubStep {
  id: number;
  subStep: string;
  subStepDescription: string;
}

const SubStepTable: React.FC = () => {
  const { formData, setFormData } = useContext(StageContext);
  const { t } = useTranslation();

  // Initialize dataSource from formData on component mount
  const [dataSource, setDataSource] = useState<SubStep[]>(() => 
    (formData.subStepList || []).map((item, index) => ({
      id: index + 1,
      subStep: item.subStep,
      subStepDescription: item.subStepDescription
    }))
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // Update dataSource when formData changes
  useEffect(() => {
    if (formData.subStepList) {
      const updatedDataSource = formData.subStepList.map((item, index) => ({
        id: index + 1,
        subStep: item.subStep,
        subStepDescription: item.subStepDescription
      }));
      // Avoid setting state if it hasn't changed
      if (JSON.stringify(updatedDataSource) !== JSON.stringify(dataSource)) {
        setDataSource(updatedDataSource);
      }
    }
  }, [formData.subStepList]);

  // Update formData when dataSource changes
  useEffect(() => {
    // Avoid updating formData if it hasn't changed
    if (JSON.stringify(dataSource) !== JSON.stringify(formData.subStepList)) {
      setFormData(prevFormData => ({
        ...prevFormData,
        subStepList: dataSource
      }));
    }
  }, [dataSource, setFormData]);

  const handleAdd = () => {
    const newId = dataSource.length ? Math.max(...dataSource.map(item => item.id)) + 1 : 1;
    setDataSource(prevDataSource => [...prevDataSource, {
      id: newId,
      subStep: '',
      subStepDescription: ''
    }]);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item.id));
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
  };

  const handleChange = debounce((newValue: string, id: number, field: 'subStep' | 'subStepDescription') => {
    if (field === 'subStep' && dataSource.some(item => item.subStep === newValue && item.id !== id)) {
      message.error('SubStep must be unique.');
      return;
    }

    const updatedDataSource = dataSource.map(item =>
      item.id === id ? { ...item, [field]: newValue } : item
    );
    // Avoid setting state if it hasn't changed
    if (JSON.stringify(updatedDataSource) !== JSON.stringify(dataSource)) {
      setDataSource(updatedDataSource);
    }
  })

  const uiSubStepConfig = {
    pagination: {
      current: 1,
      pageSize: 3,
      total: 10 // Adjust as needed
    },  
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select SubStep',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'substep', // Adjust API endpoint as needed
    tabledataApi: 'certificate-service'
  };

  const columns: ColumnsType<SubStep> = [
    {
      title: (
        <span>
         <span style={{ color: 'red' }}>*</span>  {t('subStep')}
        </span>
      ),
      dataIndex: 'subStep',
      render: (_, record) => (
        <DynamicBrowse 
          uiConfig={uiSubStepConfig} 
          initial={record.subStep} 
          onSelectionChange={value => handleChange(value[0]?.certification || '', record.id, 'subStep')}
        />
      ),
    },
    {
      title: (
        <span>
          {`${t('subStep')} ${t('description')}`} 
        </span>
      ),
      dataIndex: 'subStepDescription',
      render: (_, record) => (
        <Input
          value={record.subStepDescription}
          onChange={e => handleChange(e.target.value, record.id, 'subStepDescription')}
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
        scroll={{ y: 'calc(100vh - 440px)' }}
      />
    </div>
  );
};

export default SubStepTable;
