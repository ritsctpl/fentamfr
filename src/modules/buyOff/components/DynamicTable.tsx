import React, { useState, useContext } from 'react';
import { Table, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DataCollectionContext } from '../hooks/DataCollectionContext';

interface TableData {
  sequence: string;
  customData: string;
  fieldLabel: string;
  required: boolean;
  key: string;
  id: string;
  value: string;
}

interface DynamicTableProps {
  initialData: TableData[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({ initialData }) => {
  const { payloadData, setPayloadData, setShowAlert } = useContext<any>(DataCollectionContext);

  const handleInputChange = (customData: string, value: string) => {
    // debugger
    setPayloadData((prevData) => ({
      ...prevData,
      customDataList: prevData.customDataList.map(item =>
        item.customData == customData ? { ...item, value } : item
      )
    }));
  };

  const columns: ColumnsType<TableData> = [
    {
      title: 'Custom Data',
      dataIndex: 'customData',
      key: 'customData',
      render: (text: string, record: TableData) => (
        <span>
          {text}
          {/* {record.required && <span style={{ color: 'red' }}> *  </span>}           */}
        </span>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text: string, record: TableData) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(record.customData, e.target.value)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={payloadData.customDataList}
      pagination={false}
      rowKey="id"
      bordered
    />
  );
};

export default DynamicTable;

