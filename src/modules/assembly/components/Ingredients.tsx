import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface QCParameter {
  sequence: string;
  qcId: string;
  qcDescription: string;
  parameter: string;
  actualValue: string;
  expectedValue: string;
  tolerance: string;
}

interface AlternateIngredient {
  sequence: string;
  ingredientId: string;
  ingreDescription: string;
  quantity: number;
  uom: string;
}

interface ByProduct {
  sequence: string;
  byProductId: string;
  description: string;
  uom: string;
  byProductQuantity: string;
}

interface Ingredient {
  sequence: string;
  ingredientId: string;
  ingreDescription: string;
  quantity: string;
  uom: string;
  materialType: string;
  materialDescription?: string;
  storageLocation?: string;
  tolerance?: string;
  supplierId?: string;
  sourceLocation?: string;
  qcParameters?: QCParameter[];
  handlingInstructions?: string;
  storageInstructions?: string;
  unitCost?: string;
  totalCost?: string;
  wasteQuantity?: string;
  wasteUoM?: string;
  byProduct?: ByProduct;
  hazardous?: boolean;
  alternateIngredients?: AlternateIngredient[];
  status?: 'active' | 'inactive';
}

interface IngredientsProps {
  ingredients: {
    ingredients: {
      active: Ingredient[];
      inactive: Ingredient[];
    }
  };
  onSelectionChange?: (selectedRowKey: React.Key | undefined, selectedRow: Ingredient | undefined) => void;
}

const Ingredients: React.FC<IngredientsProps> = ({ ingredients, onSelectionChange }) => {
  const [selectedRowKey, setSelectedRowKey] = useState<React.Key>();

  useEffect(() => {
    setSelectedRowKey(undefined);
  }, [ingredients]);

  const allIngredients = [
    ...(ingredients?.ingredients?.active?.map(ing => ({ ...ing, status: 'Active' as const })) || []),
    ...(ingredients?.ingredients?.inactive?.map(ing => ({ ...ing, status: 'In Active' as const })) || [])
  ];

  const handleSelection = (record: Ingredient) => {
    if (selectedRowKey === record?.ingredientId) {
      // Deselect if clicking the same row
      setSelectedRowKey(undefined);
      onSelectionChange?.(undefined, undefined);
    } else {
      // Select new row
      setSelectedRowKey(record?.ingredientId);
      onSelectionChange?.(record?.ingredientId, record);
      console.log("record",record);
    }
  };

  const rowSelection = {
    type: 'radio' as const,
    selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
    onChange: (selectedKeys: React.Key[], selectedRows: Ingredient[]) => {
      const selectedKey = selectedKeys[0];
      const selectedRow = selectedRows[0];
      if (selectedKey === selectedRowKey) {
        setSelectedRowKey(undefined);
        onSelectionChange?.(undefined, undefined);
      } else {
        setSelectedRowKey(selectedKey);
        onSelectionChange?.(selectedKey, selectedRow);
      }
    },
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Ingredient ID',
      dataIndex: 'ingredientId',
      key: 'ingredientId',
      align: 'center',
    },
    {
      title: 'Description',
      dataIndex: 'ingreDescription',
      key: 'ingreDescription',
      align: 'center',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (text, record) => `${text} ${record?.uom}`,
    },
    {
      title: 'Material Type',
      dataIndex: 'materialType',
      key: 'materialType',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => (
        <span 
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: status === 'Active' ? '#f6ffed' : '#fff1f0',
            color: status === 'Active' ? '#52c41a' : '#ff4d4f',
            border: `1px solid ${status === 'Active' ? '#b7eb8f' : '#ffa39e'}`,
            display: 'inline-block',
            minWidth: '80px',
          }}
        >
          {status}
        </span>
      ),
    }
  ];

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={allIngredients}
      rowKey="ingredientId"
      pagination={false}
      bordered
      
      scroll={{ y: 'calc(100vh - 225px)' }}
      onRow={(record) => ({
        onDoubleClick: () => handleSelection(record),
        style: { cursor: 'pointer',  fontSize: '12px', }
      })}
      expandable={{
        expandedRowRender: (record) => (
          <div className="p-4">
            <h4 className="font-medium mb-2">Additional Details</h4>
            <div className="grid grid-cols-3 gap-4">
              {record?.materialDescription && (
                <p><span className="font-medium">Material Description:</span> {record?.materialDescription}</p>
              )}
              {record?.handlingInstructions && (
                <p><span className="font-medium">Handling Instructions:</span> {record?.handlingInstructions}</p>
              )}
              {record?.storageInstructions && (
                <p><span className="font-medium">Storage Instructions:</span> {record?.storageInstructions}</p>
              )}
              {record?.storageLocation && (
                <p><span className="font-medium">Storage Location:</span> {record?.storageLocation}</p>
              )}
              {record?.unitCost && (
                <p><span className="font-medium">Unit Cost:</span> ${record?.unitCost}</p>
              )}
              {record?.totalCost && (
                <p><span className="font-medium">Total Cost:</span> ${record?.totalCost}</p>
              )}
              {record?.qcParameters && record?.qcParameters?.length > 0 && (
                <div className="col-span-3">
                  <h5 className="font-medium mb-2">QC Parameters</h5>
                  <ul className="list-disc pl-5">
                    {record?.qcParameters?.map((qc, index) => (
                      <li key={index}>
                        {qc?.parameter}: Expected {qc?.expectedValue} ± {qc?.tolerance}, Actual {qc?.actualValue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ),
        defaultExpandAllRows: false,
        expandRowByClick: false
      }}
      rowClassName={(record) => 
        record?.status === 'Active' 
          ? 'ant-table-row-active' 
          : 'ant-table-row-inactive'
      }
      className="w-full"
      // style={{
      //   ['--active-row-bg' as any]: '#f6ffed',
      //   ['--inactive-row-bg' as any]: '#fff1f0',
        
      // }}
      size="small"
      style={{
        fontSize: '12px',
        maxHeight: '100vh',
       
      }}
    />
  );
};

export default Ingredients;