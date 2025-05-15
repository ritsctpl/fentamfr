import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space, Pagination, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash';

interface Mitigation {
  sequence: string;
  mitigationOp: string;
}

interface SafetyProcedure {
  opId: string;
  riskFactor: string;
  sequence: string;
  mitigation: Mitigation[];
}

const SafetyProcedureTable: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState<SafetyProcedure[]>(() => 
    (formData.safetyProcedures || []).map(item => ({
      opId: item.opId,
      sequence: item.sequence,
      riskFactor: item.riskFactor,
      mitigation: item.mitigation || [],
    }))
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(2); // Adjust as needed

  useEffect(() => {
    if (formData.safetyProcedures) {
      const updatedDataSource = formData.safetyProcedures.map(item => ({
        opId: item.opId,
        sequence: item.sequence,
        riskFactor: item.riskFactor,
        mitigation: item.mitigation || [],
      }));
      if (JSON.stringify(updatedDataSource) !== JSON.stringify(dataSource)) {
        setDataSource(updatedDataSource);
      }
    }
  }, [formData]);

  const debouncedSave = debounce((updatedDataSource: SafetyProcedure[]) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      safetyProcedures: updatedDataSource,
    }));
  });

  useEffect(() => {
    debouncedSave(dataSource);
  }, [dataSource]);

  const handleAdd = () => {
    message.destroy();
    const lastRow = dataSource[dataSource.length - 1];
    if (lastRow && lastRow.riskFactor === '') {
      message.warning(t('Please fill in the Risk Factor before adding a new row.'));
      return;
    }
    
    const newId = `STEP${String(dataSource.length + 1).padStart(3, '0')}`;
    setDataSource(prevDataSource => [...prevDataSource, {
      opId: newId,
      sequence: String((dataSource.length + 1) * 10), // Creates sequence 10, 20, 30...
      riskFactor: '',
      mitigation: [],
    }]);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item.opId));
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
  };

  const handleChange = (newValue: string, id: string, field: keyof SafetyProcedure) => {
    const updatedDataSource = dataSource.map(item =>
      item.opId === id ? { ...item, [field]: newValue } : item
    );
    setDataSource(updatedDataSource);
  };

  const handleMitigationChange = (newValue: string, opId: string, index: number) => {
    const updatedDataSource = dataSource.map(item => {
      if (item.opId === opId) {
        const updatedMitigation = [...item.mitigation];
        updatedMitigation[index] = { sequence: newValue, mitigationOp: newValue };
        return { ...item, mitigation: updatedMitigation };
      }
      return item;
    });
    setDataSource(updatedDataSource);
  };

  const handleAddMitigation = (opId: string) => {
    message.destroy();
    const item = dataSource.find(item => item.opId === opId);
    const lastMitigation = item?.mitigation[item.mitigation.length - 1];
    
    if (lastMitigation && lastMitigation.mitigationOp === '') {
      message.warning(t('Please fill in the current Mitigation Step before adding a new one.'));
      return;
    }

    const updatedDataSource = dataSource.map(item => {
      if (item.opId === opId) {
        const nextSequence = String((item.mitigation.length + 1) * 10); // Creates sequence 10, 20, 30...
        return {
          ...item,
          mitigation: [...item.mitigation, { sequence: nextSequence, mitigationOp: '' }]
        };
      }
      return item;
    });
    setDataSource(updatedDataSource);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRemoveMitigation = (opId: string, index: number) => {
    const updatedDataSource = dataSource.map(item => {
      if (item.opId === opId) {
        const updatedMitigation = item.mitigation.filter((_, i) => i !== index);
        return { ...item, mitigation: updatedMitigation };
      }
      return item;
    });
    setDataSource(updatedDataSource);
  };

  const columns = [
    {
      title: t('Step ID'),
      dataIndex: 'opId',
      render: (text: string) => <span>{text}</span>,
      size: 'small',
    },
    {
      title: t('Risk Factor'),
      dataIndex: 'riskFactor',
      render: (_, record) => (
        <Input
          value={record.riskFactor}
          onChange={e => handleChange(e.target.value, record.opId, 'riskFactor')}
        />
      ),
    },
    {
      title: t('Mitigation Steps'),
      dataIndex: 'mitigation',
      render: (_, record) => {
        const { mitigation } = record;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedMitigation = mitigation.slice(startIndex, endIndex);

        return (
          <>
            {paginatedMitigation.map((mitigation, index) => (
              <Space key={index} style={{ marginBottom: 8 }}>
                <Input
                  value={mitigation.mitigationOp}
                  onChange={e => handleMitigationChange(e.target.value, record.opId, startIndex + index)}
                />
                <Button onClick={() => handleRemoveMitigation(record.opId, startIndex + index)}>{t('Remove')}</Button>
              </Space>
            ))}
            <Button onClick={() => handleAddMitigation(record.opId)}>{t('Add Mitigation')}</Button>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={mitigation.length}
              onChange={handlePageChange}
              style={{ marginTop: 16 }}
            />
          </>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: string[]) => setSelectedRowKeys(keys),
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
        <Button onClick={handleAdd}>{t('Insert')}</Button>
        <Button onClick={handleDeleteAll}>{t('Remove All')}</Button>
        <Button onClick={handleRemoveSelected}>{t('Remove Selected')}</Button>
      </Space>
      <Table
        bordered
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        rowKey="opId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 480px)' }}
      />
    </div>
  );
};

export default SafetyProcedureTable;
