// import React, { useState, useRef, useEffect, useContext } from 'react';
// import { Table, Input, InputNumber, DatePicker, Switch, Select, Button, Space, Alert } from 'antd';
// import Highlighter from 'react-highlight-words';
// import { SearchOutlined } from '@ant-design/icons';
// import dayjs from 'dayjs';
// import { RoutingContext } from '../hooks/routingContext';


// const { Option } = Select;

// interface Column {
//   title: string;
//   dataIndex: string;
//   type: 'text' | 'number' | 'date' | 'switch' | 'select';
//   maxLength?: number;
//   minLength?: number;
//   min?: number;
//   max?: number;
//   step?: number;
//   pattern?: string;
//   required?: boolean;
//   readOnly?: boolean;
//   disabled?: boolean;
//   options?: { value: string | number; label: string }[];
// }

// interface PaginationSettings {
//   pageSize: number;
//   showSizeChanger: boolean;
//   pageSizeOptions: string[];
// }

// interface DynamicTableProps {
//   columns: any;
//   dataSource: any[];
//   paginationSettings: any;
//   selectionMode: string;
//   onDataChange: (data: any[]) => void;
//   buttonVisibility: boolean;
//   customDataOnRowSelect: any[];
//   customDataForCreate: any[];
  
// }

// interface DataRecord {
//   id: number;
//   [key: string]: any;
// }

// const DynamicTable: React.FC<DynamicTableProps> = ({ columns, dataSource: initialDataSource, paginationSettings, selectionMode,
//    onDataChange, buttonVisibility, customDataOnRowSelect, customDataForCreate }) => {
//     const {payloadData, setShowAlert} = useContext<any>(RoutingContext);
//   const [searchText, setSearchText] = useState<string>('');
//   const [searchedColumn, setSearchedColumn] = useState<string>('');
//   const [dataSource, setDataSource] = useState<any[]>(initialDataSource || []);
//   const [pagination, setPagination] = useState<any>({
//     current: 1,
//     pageSize: paginationSettings.pageSize,
//     showSizeChanger: paginationSettings.showSizeChanger,
//     pageSizeOptions: paginationSettings.pageSizeOptions,
//   });
//   const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
//   const [error, setError] = useState<string>('');

//   // const searchInput = useRef<Input>(null);

  
//   useEffect(() => {
//     setDataSource(customDataForCreate);
//     }, [customDataForCreate]);

//     useEffect(() => {
//       setDataSource(payloadData.customDataList);
//     }, [payloadData]);
//   // Error handling for missing columns
//   if (!columns || columns.length === 0) {
//     return <Alert message="No columns provided" type="error" showIcon />;
//   }

//   const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//   };

//   const handleReset = (clearFilters: () => void) => {
//     clearFilters();
//     setSearchText('');
//   };

//   const handleTableChange = (pagination: any, filters: any, sorter: any) => {
//     setPagination(pagination);
//   };

//   const handleInputChange = (value: any, record: DataRecord, dataIndex: string) => {
//     const updatedData = dataSource.map(row =>
//       row.id === record.id ? { ...row, [dataIndex]: value } : row
//     );
//     setDataSource(updatedData);
//     onDataChange(updatedData);
//     setShowAlert(true);
//   };

//   const handleDateChange = (date: any, record: DataRecord, dataIndex: string) => {
//     const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
//     handleInputChange(formattedDate, record, dataIndex);
//   };

//   const getColumnSearchProps = (dataIndex: string) => ({
//     filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
//       <div style={{ padding: 8 }}>
//         <Input
          
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//           onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{ marginBottom: 8, display: 'block' }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Search
//           </Button>
//           <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
//             Reset
//           </Button>
//         </Space>
//       </div>
//     ),
//     filterIcon: (filtered: boolean) => (
//       <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
//     ),
//     render: (text: string) =>
//       searchedColumn === dataIndex ? (
//         <Highlighter
//           highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
//           searchWords={[searchText]}
//           autoEscape
//           textToHighlight={text ? text.toString() : ''}
//         />
//       ) : (
//         text
//       ),
//   });

//   const getColumnInputProps = (column: Column) => {
//     const { type, maxLength, minLength, min, max, step, pattern, required, readOnly, disabled, options } = column;

//     return {
//       render: (text: any, record: DataRecord) => {
//         let inputElement = <span>{text}</span>;

//         switch (type) {
//           case 'number':
//             inputElement = (
//               <InputNumber
//                 value={text}
//                 maxLength={maxLength}
//                 minLength={minLength}
//                 min={min}
//                 max={max}
//                 step={step}
//                 pattern={pattern}
//                 required={required}
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 onChange={(value) => handleInputChange(value, record, column.dataIndex)}
//               />
//             );
//             break;
//           case 'date':
//             inputElement = (
//               <DatePicker
//                 value={text ? dayjs(text, 'DD-MM-YYYY') : null}
//                 required={required}
//                 format="DD-MM-YYYY"
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 onChange={(date) => handleDateChange(date, record, column.dataIndex)}
//               />
//             );
//             break;
         
         
            
//           default:
//             inputElement = (
//               <Input
//                 value={text}
//                 maxLength={maxLength}
//                 minLength={minLength}
//                 pattern={pattern}
//                 required={required}
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 onChange={(e) => handleInputChange(e.target.value, record, column.dataIndex)}
//               />
//             );
//         }

//         return inputElement;
//       },
//     };
//   };

//   const handleAdd = () => {
//     // Calculate the sequence value based on the length of the dataSource
//     const newSequence = dataSource.length;

//     // Generate a new record object with default values based on column definitions
//     const newRecord = columns.reduce((record, column) => {
//       // Set default values based on column type
//       switch (column.type) {
//         case 'number':
//           record[column.dataIndex] = 0; // Default for number type
//           break;
//         case 'date':
//           record[column.dataIndex] = ''; // Default for date type (empty string for unselected date)
//           break;
//         case 'switch':
//           record[column.dataIndex] = false; // Default for switch type
//           break;
//         case 'select':
//           record[column.dataIndex] = column.options?.length > 0 ? column.options[0].value : ''; // Default for select type
//           break;
//         default:
//           record[column.dataIndex] = ''; // Default for other types (input text)
//       }
//       return record;
//     }, { sequence: newSequence } as any);

//     // Ensure the new record includes a unique id
//     const newRecordWithId = {
//       ...newRecord,
//       id: dataSource.length ? dataSource[dataSource.length - 1].id + 1 : 1,
//       sequence: dataSource.length ? dataSource[dataSource.length - 1].id + 1 : 1,
//     };

//     // Update the data source with the new record
//     setDataSource([...dataSource, newRecordWithId]);
//   };

//   const getColumnProps = (column: Column) => ({
//     ...getColumnSearchProps(column.dataIndex),
//     ...getColumnInputProps(column),
//   });

//   const enhancedColumns = columns.map(column => ({
//     ...column,
//     ...getColumnProps(column),
//   }));

//   const rowSelection = {
//     selectedRowKeys,
//     onChange: (selectedKeys: number[]) => setSelectedRowKeys(selectedKeys),
//     type: selectionMode,
//   };

//   const handleRemoveAll = () => {
//     // Clear the dataSource by setting it to an empty array
//     setDataSource([]);
//     onDataChange([]);
//   };

//   const handleRemoveSelected = () => {
//     // Filter out the selected rows
//     const filteredData = dataSource.filter(item => !selectedRowKeys.includes(item.id));

//     // Update the sequence for the remaining rows
//     const updatedData = filteredData.map((item, index) => ({
//       ...item,
//       sequence: index + 1, // Sequence should start from 1 and be consecutive
//       id: index + 1
//     }));

//     // Update the data source and reset selected row keys
//     setDataSource(updatedData);
//     onDataChange(updatedData);
//     setSelectedRowKeys([]);
//   };

//   return (
//     <>
//       {error && <Alert message={error} type="error" showIcon />}
//       {buttonVisibility && (
//         <div style={{ textAlign: 'right', paddingRight: 20 }}>
//           <Space style={{ marginBottom: 5 }} size="middle">
//             <Button onClick={handleAdd} type='primary'>Insert</Button>
//             <Button onClick={handleRemoveSelected} type='primary'>Remove</Button>
//             <Button onClick={handleRemoveAll} type='primary'>Remove All</Button>
//           </Space>
//         </div>
//       )}

//       <Table
//         columns={enhancedColumns}
//         dataSource={dataSource}
//         rowKey="id"
//         pagination={pagination}
//         onChange={handleTableChange}
        
//       />
//     </>
//   );
// };

// export default DynamicTable;


// import React, { useState, useRef, useEffect, useContext } from 'react';
// import { Table, Input, InputNumber, DatePicker, Switch, Select, Button, Space, Alert } from 'antd';
// import Highlighter from 'react-highlight-words';
// import { SearchOutlined } from '@ant-design/icons';
// import dayjs from 'dayjs';
// import { ItemContext } from '../hooks/itemContext';


// const { Option } = Select;

// interface Column {
//   title: string;
//   dataIndex: string;
//   type: 'text' | 'number' | 'date' | 'switch' | 'select';
//   maxLength?: number;
//   minLength?: number;
//   min?: number;
//   max?: number;
//   step?: number;
//   pattern?: string;
//   required?: boolean;
//   readOnly?: boolean;
//   disabled?: boolean;
//   options?: { value: string | number; label: string }[];
// }

// interface PaginationSettings {
//   pageSize: number;
//   showSizeChanger: boolean;
//   pageSizeOptions: string[];
// }

// interface DynamicTableProps {
//   columns: any;
//   dataSource: any[];
//   paginationSettings: PaginationSettings;
//   selectionMode: string;
//   onDataChange: (data: any[]) => void;
//   buttonVisibility: boolean;
//   customDataOnRowSelect: any[];
//   customDataForCreate: any[];
  
// }

// interface DataRecord {
//   id: number;
//   [key: string]: any;
// }

// const DynamicTable: React.FC<DynamicTableProps> = ({ columns, dataSource: initialDataSource, paginationSettings, selectionMode,
//    onDataChange, buttonVisibility, customDataOnRowSelect, customDataForCreate }) => {
//     const {payloadData, setShowAlert} = useContext<any>(ItemContext);
//   const [searchText, setSearchText] = useState<string>('');
//   const [searchedColumn, setSearchedColumn] = useState<string>('');
//   const [dataSource, setDataSource] = useState<any[]>(initialDataSource || []);
//   const [pagination, setPagination] = useState<any>({
//     current: 1,
//     pageSize: paginationSettings.pageSize,
//     showSizeChanger: paginationSettings.showSizeChanger,
//     pageSizeOptions: paginationSettings.pageSizeOptions,
//   });
//   const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
//   const [error, setError] = useState<string>('');

//   // const searchInput = useRef<Input>(null);

  
//   useEffect(() => {
//     setDataSource(customDataForCreate);
//     }, [customDataForCreate]);

//     useEffect(() => {
//       setDataSource(payloadData.customDataList);
//     }, [payloadData]);
//   // Error handling for missing columns
//   if (!columns || columns.length === 0) {
//     return <Alert message="No columns provided" type="error" showIcon />;
//   }

//   const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//   };

//   const handleReset = (clearFilters: () => void) => {
//     clearFilters();
//     setSearchText('');
//   };

//   const handleTableChange = (pagination: any, filters: any, sorter: any) => {
//     setPagination(pagination);
//   };

//   const handleInputChange = (value: any, record: DataRecord, dataIndex: string) => {
//     const updatedData = dataSource.map(row =>
//       row.id === record.id ? { ...row, [dataIndex]: value } : row
//     );
//     setDataSource(updatedData);
//     onDataChange(updatedData);
//     setShowAlert(true);
//   };

//   const handleDateChange = (date: any, record: DataRecord, dataIndex: string) => {
//     const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
//     handleInputChange(formattedDate, record, dataIndex);
//   };

//   const getColumnSearchProps = (dataIndex: string) => ({
//     filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
//       <div style={{ padding: 8 }}>
//         <Input
          
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//           onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{ marginBottom: 8, display: 'block' }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Search
//           </Button>
//           <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
//             Reset
//           </Button>
//         </Space>
//       </div>
//     ),
//     filterIcon: (filtered: boolean) => (
//       <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
//     ),
//     render: (text: string) =>
//       searchedColumn === dataIndex ? (
//         <Highlighter
//           highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
//           searchWords={[searchText]}
//           autoEscape
//           textToHighlight={text ? text.toString() : ''}
//         />
//       ) : (
//         text
//       ),
//   });

//   const getColumnInputProps = (column: Column) => {
//     const { type, maxLength, minLength, min, max, step, pattern, required, readOnly, disabled, options } = column;

//     return {
//       render: (text: any, record: DataRecord) => {
//         let inputElement = <span>{text}</span>;

//         switch (type) {
//           case 'number':
//             inputElement = (
//               <InputNumber
//                 value={text}
//                 maxLength={maxLength}
//                 minLength={minLength}
//                 min={min}
//                 max={max}
//                 step={step}
//                 pattern={pattern}
//                 required={required}
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 onChange={(value) => handleInputChange(value, record, column.dataIndex)}
//               />
//             );
//             break;
//           case 'date':
//             inputElement = (
//               <DatePicker
//                 value={text ? dayjs(text, 'DD-MM-YYYY') : null}
//                 required={required}
//                 format="DD-MM-YYYY"
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 onChange={(date) => handleDateChange(date, record, column.dataIndex)}
//               />
//             );
//             break;
         
         
            
//           default:
//             inputElement = (
//               <Input
//                 value={text}
//                 maxLength={maxLength}
//                 minLength={minLength}
//                 pattern={pattern}
//                 required={required}
//                 readOnly={readOnly}
//                 disabled={disabled}
//                 onChange={(e) => handleInputChange(e.target.value, record, column.dataIndex)}
//               />
//             );
//         }

//         return inputElement;
//       },
//     };
//   };

//   const handleAdd = () => {
//     // Calculate the sequence value based on the length of the dataSource
//     const newSequence = dataSource.length;

//     // Generate a new record object with default values based on column definitions
//     const newRecord = columns.reduce((record, column) => {
//       // Set default values based on column type
//       switch (column.type) {
//         case 'number':
//           record[column.dataIndex] = 0; // Default for number type
//           break;
//         case 'date':
//           record[column.dataIndex] = ''; // Default for date type (empty string for unselected date)
//           break;
//         case 'switch':
//           record[column.dataIndex] = false; // Default for switch type
//           break;
//         case 'select':
//           record[column.dataIndex] = column.options?.length > 0 ? column.options[0].value : ''; // Default for select type
//           break;
//         default:
//           record[column.dataIndex] = ''; // Default for other types (input text)
//       }
//       return record;
//     }, { sequence: newSequence } as any);

//     // Ensure the new record includes a unique id
//     const newRecordWithId = {
//       ...newRecord,
//       id: dataSource.length ? dataSource[dataSource.length - 1].id + 1 : 1,
//       sequence: dataSource.length ? dataSource[dataSource.length - 1].id + 1 : 1,
//     };

//     // Update the data source with the new record
//     setDataSource([...dataSource, newRecordWithId]);
//   };

//   const getColumnProps = (column: Column) => ({
//     ...getColumnSearchProps(column.dataIndex),
//     ...getColumnInputProps(column),
//   });

//   const enhancedColumns = columns.map(column => ({
//     ...column,
//     ...getColumnProps(column),
//   }));

//   const rowSelection = {
//     selectedRowKeys,
//     onChange: (selectedKeys: number[]) => setSelectedRowKeys(selectedKeys),
//     type: selectionMode,
//   };

//   const handleRemoveAll = () => {
//     // Clear the dataSource by setting it to an empty array
//     setDataSource([]);
//     onDataChange([]);
//   };

//   const handleRemoveSelected = () => {
//     // Filter out the selected rows
//     const filteredData = dataSource.filter(item => !selectedRowKeys.includes(item.id));

//     // Update the sequence for the remaining rows
//     const updatedData = filteredData.map((item, index) => ({
//       ...item,
//       sequence: index + 1, // Sequence should start from 1 and be consecutive
//       id: index + 1
//     }));

//     // Update the data source and reset selected row keys
//     setDataSource(updatedData);
//     onDataChange(updatedData);
//     setSelectedRowKeys([]);
//   };

//   return (
//     <>
//       {error && <Alert message={error} type="error" showIcon />}
//       {buttonVisibility && (
//         <div style={{ textAlign: 'right', paddingRight: 20 }}>
//           <Space style={{ marginBottom: 5 }} size="middle">
//             <Button onClick={handleAdd} type='primary'>Insert</Button>
//             <Button onClick={handleRemoveSelected} type='primary'>Remove</Button>
//             <Button onClick={handleRemoveAll} type='primary'>Remove All</Button>
//           </Space>
//         </div>
//       )}

//       <Table
//         columns={enhancedColumns}
//         dataSource={dataSource}
//         rowKey="id"
//         pagination={pagination}
//         onChange={handleTableChange}
//         style={{ marginTop: '2%' }}
//       />
//     </>
//   );
// };

// export default DynamicTable;

import React, { useState, useContext } from 'react';
import { Table, Input } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { RoutingContext } from '../hooks/routingContext';

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
  const { payloadData, setPayloadData, setShowAlert } = useContext<any>(RoutingContext);

  const handleInputChange = (customData: string, value: string) => {
    debugger
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
    />
  );
};

export default DynamicTable;

