import React, { useState, useContext } from 'react';
import { Table, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ReasonCodeContext } from '../hooks/reasonCodeContext';

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
  const [tableData, setTableData] = useState<TableData[]>(initialData);
  const { payloadData, setPayloadData, setShowAlert } = useContext<any>(ReasonCodeContext);

  const handleInputChange = (id: string, value: string) => {
    setPayloadData((prevData) => ({
      ...prevData,
      customDataList: prevData.customDataList.map(item =>
        item.id === id ? { ...item, value } : item
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
          onChange={(e) => handleInputChange(record.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <Table
        columns={columns}
        dataSource={payloadData.customDataList}
        pagination={false}
        rowKey="id"
        bordered
        style={{
          marginTop: '15px',
          width: '98%',
          justifyContent: 'center'
        }}
      />
    </div>
  );
};

export default DynamicTable;
