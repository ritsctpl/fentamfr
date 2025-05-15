import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { OperationContext } from '../hooks/recipeContext';
import { debounce } from 'lodash';

interface Ingredient {
  ingredientId: string;
  ingredientName: string;
  ingreDescription: string;
  quantity: number;
  uom: string;
  sequence: number;
  associatedOp: string;
}

interface Step {
  operationId: string;
  opIngredients: Ingredient[]; // Assuming each step has an array of 
}

interface ResourceTableProps {
  stepArray: any;
  setStep: (value: Object) => void;
  operationId: string;
}

const OperationIngredients: React.FC<ResourceTableProps> = ({ stepArray, setStep, operationId }) => {
  const { formData, setFormData } = useContext(OperationContext);
  const { t } = useTranslation();
  console.log(stepArray, "stepArray");
  const [dataSource, setDataSource] = useState<Ingredient[]>(() => {
    return (stepArray?.opIngredients?.active || []).map(item => ({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      ingreDescription: item.ingreDescription,
      quantity: item.quantity,
      uom: item.uom,
      sequence: item.sequence,
      associatedOp: item.associatedOp,
    }));
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (stepArray?.opIngredients?.active && stepArray.opIngredients.active.length > 0) {
      const newDataSource = stepArray.opIngredients.active.map(item => ({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        ingreDescription: item.ingreDescription,
        quantity: item.quantity,
        uom: item.uom,
        sequence: item.sequence,
        associatedOp: item.associatedOp,
      }));
      setDataSource(newDataSource);
    } else {
      setDataSource([]); // Set to empty array if opIngredients are empty
    }
  }, [stepArray]);



  const handleAdd = () => {
   
    // const newId = 'ING_1733380076045'
    setDataSource(prevDataSource => [...prevDataSource, {
      ingredientId: '',
      ingredientName: '',
      ingreDescription: '',
      quantity: 0,
      uom: '',
      sequence: 0,
      associatedOp: '',
    }]);
  };

  const handleDeleteAll = () => {
    setDataSource(null);
    setSelectedRowKeys(null);
    setStep(prev => ({
      ...prev,
      opIngredients: null
    }));
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item.ingredientId));
    setDataSource(newDataSource);
    setStep(prev => ({
      ...prev,
      opIngredients: newDataSource?.length > 0 ? newDataSource : null
    }));
    setSelectedRowKeys([]);
  };

  const handleChange = (newValue: string | number, id: string, field: keyof Ingredient) => {
    const updatedDataSource = dataSource.map(item => {
      if (item.ingredientId === id) {
        if (field in item) {
          return { ...item, [field]: newValue };
        }
        return { ...item, [field]: newValue };
      }
      return item;
    });

    // Update local state
    setDataSource(updatedDataSource);

    setStep(prev => ({
      ...prev,
      opIngredients: updatedDataSource
    }));
  };

  const columns = [

    {
      title: t('name'),
      dataIndex: 'ingredientId',
      render: (_, record) => (
        <Input
          value={record.ingredientId}
          onChange={e => handleChange(e.target.value, record.ingredientId, 'ingredientId')}
        />
      ),
    },
    {
      title: t('description'),
      dataIndex: 'ingreDescription',
      render: (_, record) => (
        <Input
          value={record.ingreDescription}
          onChange={e => handleChange(e.target.value, record.ingredientId, 'ingreDescription')}
        />
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      render: (_, record) => (
        <Input
          type="number"
          value={record.quantity}
          onChange={e => handleChange(Number(e.target.value), record.ingredientId, 'quantity')}
        />
      ),
    },
    {
      title: t('uom'),
      dataIndex: 'uom',
      render: (_, record) => (
        <Input
          value={record.uom}
          onChange={e => handleChange(e.target.value, record.ingredientId, 'uom')}
        />
      ),
    },
    {
      title: t('sequence'),
      dataIndex: 'sequence',
      render: (_, record) => (
        <Input
          type="number"
          value={record.sequence}
          onChange={e => handleChange(Number(e.target.value), record.ingredientId, 'sequence')}
        />
      ),
    },
    {
      title: t('associatedStep'),
      dataIndex: 'associatedOp',
      render: (_, record) => (
        <Input
          value={record.associatedOp}
          onChange={e => handleChange(e.target.value, record.ingredientId, 'associatedOp')}
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
        rowKey="ingredientId"
        // pagination={{ pageSize: 5 }} 
        pagination={false}
        scroll={{ y: 'calc(100vh - 350px)' }}
      />
    </div>
  );
};

export default OperationIngredients;  