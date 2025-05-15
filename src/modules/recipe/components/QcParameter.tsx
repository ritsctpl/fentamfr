import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs
import { useTranslation } from 'react-i18next';

interface QcParameter {
  qcId: string;
  parameter: string;
  actualValue: string;
  sequence:string;
  tolerance: string;
}

interface QcParameterTableProps {
  selectedIngredient: { qcParameters: QcParameter[] }; // The ingredient object containing QC parameters
  setQcParameter: React.Dispatch<React.SetStateAction<QcParameter[]>>;
  qcParameter:any;
}

const QcParameterTable: React.FC<QcParameterTableProps> = ({ selectedIngredient, setQcParameter ,qcParameter}) => {
  console.log(qcParameter, "qcParameter");
  const { t } = useTranslation();
  const initialQcParameters = qcParameter || [];
  const [localQcParameters, setLocalQcParameters] = useState<QcParameter[]>(initialQcParameters); // Local state for managing changes
  const [currentPage, setCurrentPage] = useState<number>(1); // Local state for current page
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    // Sync local state with selected ingredient's parameters on mount
    setLocalQcParameters(initialQcParameters);
  }, [initialQcParameters ,qcParameter]);

  const handleAdd = () => {
    const newQcId = `QC_${Date.now()}`;
    const sequenceNumber = (localQcParameters?.length || 0) * 10 + 10;
  // Generate a new ID for the QC parameter
    const newQcParameter: QcParameter = { qcId: newQcId, sequence: sequenceNumber.toString(), parameter: '', actualValue: '', tolerance: '' };

    // Update the local state to include the new parameter
    setLocalQcParameters(prevQcParameters => [...prevQcParameters, newQcParameter]);
    // setQcParameter(prevQcParameters => [...prevQcParameters, newQcParameter]);
    console.log("Previous Parameters:", qcParameter);
  setQcParameter(prevQcParameters => [...prevQcParameters, newQcParameter]);
  };

  const handleDeleteAll = () => {
    setLocalQcParameters([]);
  };

  const handleRemoveSelected = () => {
    const newQcParameters = localQcParameters.filter(item => !selectedRowKeys.includes(item.qcId));
    setLocalQcParameters(newQcParameters);
    setQcParameter(newQcParameters);
    setSelectedRowKeys([]); // Clear selected keys after deletion
  };

  const handleChange = (newValue: string, id: string, field: keyof QcParameter) => {
    const updatedQcParameters = localQcParameters.map(item =>
      item.qcId === id ? { ...item, [field]: newValue } : item
    );
    setLocalQcParameters(updatedQcParameters);
    setQcParameter(updatedQcParameters);
  };

  const handleSaveChanges = () => {
    // Commit local changes to the parent state
    setQcParameter(localQcParameters);
  };

  const columns = [
    // {
    //   title: t('QC ID'),
    //   dataIndex: 'qcId',
    //   render: (text: string) => <span>{text}</span>,
    // },
    {
      title: t('Parameter'),
      dataIndex: 'parameter',
      render: (_, record) => (
        <Input
          value={record.parameter}
          onChange={e => handleChange(e.target.value, record.qcId, 'parameter')}
        />
      ),
    },
    {
      title: t('Actual Value'),
      dataIndex: 'actualValue',
      render: (_, record) => (
        <Input
          value={record.actualValue}
          onChange={e => handleChange(e.target.value, record.qcId, 'actualValue')}
        />
      ),
    },
    {
      title: t('Tolerance'),
      dataIndex: 'tolerance',
      render: (_, record) => (
        <Input
          value={record.tolerance}
          onChange={e => handleChange(e.target.value, record.qcId, 'tolerance')}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: string[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        <Button onClick={handleAdd}>{t('Insert')}</Button>
        <Button onClick={handleDeleteAll}>{t('Remove All')}</Button>
        <Button onClick={handleRemoveSelected}>
          {t('Remove Selected')}
        </Button>
      </Space>
      <Table
        rowSelection={rowSelection}
        dataSource={localQcParameters} // Use local state for the table
        columns={columns}
        rowKey="qcId"
        bordered={true}
        pagination={false}
        scroll={{ y: 'calc(100vh - 470px)' }}
        // pagination={{
        //   current: currentPage, // Current page from state
        //   pageSize: 5, // Number of items per page
        //   onChange: (page) => setCurrentPage(page), // Update current page state
        // }} 
      />
    </div>
  );
};

export default QcParameterTable;
