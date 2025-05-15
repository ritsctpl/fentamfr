import React, { useState, useRef } from 'react';
import { Table, Input, Button, InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import styles from '@modules/cycleTimeMaintenance/styles/CycleTime.module.css';
 
import { useTranslation } from 'react-i18next';
 
interface RecordItem {
  site: string;
  operation: string;
  operationVersion: string;
  resource: string;
  resourceType: string;
  workCenter: string;
  cycleTime: number;
  manufacturedTime: number;
}
 
interface DataRow {
  itemAndVersion: string;
  records: RecordItem[];
  [key: string]: string | number | boolean | RecordItem[];
}
 
interface CommonTableProps {
  data: DataRow[];
  onRowSelect?: (row: DataRow) => void; // Callback function for row selection
}
 
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};
 
const CommonTable: React.FC<CommonTableProps> = ({ data, onRowSelect }) => {
  const { t } = useTranslation();
 
  const columns: ColumnsType<DataRow> = [
    {
      title: 'Item and Version',
      dataIndex: 'itemAndVersion',
      key: 'itemAndVersion',
      render: text => text || '---'
    },
  ];
 
  // New state to track the selected nested row
  const [selectedNestedRow, setSelectedNestedRow] = useState<RecordItem | null>(null);
 
  // const expandedRowRender = (record: DataRow) => {
  //   const columns = [
  //     { title: t('operation'), dataIndex: 'operation', key: 'operation', render: text => text || '---' },
  //     { title: t('operationVersion'), dataIndex: 'operationVersion', key: 'operationVersion', render: text => text || '---' },
  //     // { title: t('resource'), dataIndex: 'resource', key: 'resource', render: text => text || '---' },
  //     { title: t('resourceType'), dataIndex: 'resourceType', key: 'resourceType', render: text => text || '---' },
  //     { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter', render: text => text || '---' },
  //     { title: t('cycleTime'), dataIndex: 'cycleTime', key: 'cycleTime', render: text => text !== null && text !== undefined ? text : '---' },
  //     { title: t('manufacturedTime'), dataIndex: 'manufacturedTime', key: 'manufacturedTime', render: text => text !== null && text !== undefined ? text : '---' },
  //     { title: t('targetQuantity'), dataIndex: 'targetQuantity', key: 'targetQuantity', render: text => text !== null && text !== undefined ? text : '---' },
  //   ];
 
  //   const handleNestedRowClick = (nestedRecord: RecordItem) => {
  //     setSelectedNestedRow(nestedRecord);
  //   };
 
  //   return <Table
  //     columns={columns}
  //     dataSource={record.records}
  //     pagination={false}  
  //     onRow={(nestedRecord: RecordItem) => ({
  //       onClick: () => {
  //         setSelectedNestedRow(nestedRecord);
  //         if (onRowSelect) {
  //           const [item, itemVersion] = record.itemAndVersion.split(' ');
  //           onRowSelect({
  //             itemAndVersion: record.itemAndVersion,  
  //             records: record.records,
  //             operation: nestedRecord.operation,
  //             operationVersion: nestedRecord.operationVersion,
  //             resource: nestedRecord.resource,
  //             item: item?.split('/')?.[0] || '',
  //             itemVersion: item?.split('/')?.[1] || '',
  //             workCenter: nestedRecord.workCenter,
  //             cycleTime: nestedRecord.cycleTime,
  //             manufacturedTime: nestedRecord.manufacturedTime
  //           });
  //         }
  //       },
  //       className: nestedRecord === selectedNestedRow ? styles.selectedRow : '',
  //       style: {
  //         fontSize: '13.5px',
  //       },
  //     })}
  //   />;
  // };
 
  const expandedRowRender = (record: DataRow) => {
    const columns = [
      { title: t('operation'), dataIndex: 'operation', key: 'operation', render: text => text || '---' },
      { title: t('operationVersion'), dataIndex: 'operationVersion', key: 'operationVersion', render: text => text || '---' },
      { title: t('resourceType'), dataIndex: 'resourceType', key: 'resourceType', render: text => text || '---' },
      { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter', render: text => text || '---' },
      { title: t('cycleTime'), dataIndex: 'cycleTime', key: 'cycleTime', render: text => text !== null && text !== undefined ? Number(text).toFixed(4) : '---' },
      { title: t('manufacturedTime'), dataIndex: 'manufacturedTime', key: 'manufacturedTime', render: text => text !== null && text !== undefined ? Number(text).toFixed(4) : '---' },
      { title: t('targetQuantity'), dataIndex: 'targetQuantity', key: 'targetQuantity', render: text => text !== null && text !== undefined ? text : '---' },
    ];
 
    const handleNestedRowClick = (nestedRecord: RecordItem) => {
      setSelectedNestedRow(nestedRecord);
      if (onRowSelect) {
        const [item, itemVersion] = record.itemAndVersion.split(' ');
        onRowSelect({
          itemAndVersion: record.itemAndVersion,
          records: [nestedRecord], 
          operation: nestedRecord.operation,
          operationVersion: nestedRecord.operationVersion,
          resource: nestedRecord.resource,
          item: item?.split('/')?.[0] || '',
          itemVersion: item?.split('/')?.[1] || '',
          workCenter: nestedRecord.workCenter,
          cycleTime: nestedRecord.cycleTime,
          manufacturedTime: nestedRecord.manufacturedTime
        });
      }
    };
 
    return (
      <Table
        columns={columns}
        dataSource={record.records}
        pagination={false}
        onRow={(nestedRecord: RecordItem) => ({
          onClick: () => handleNestedRowClick(nestedRecord),
          className: nestedRecord === selectedNestedRow ? styles.selectedRow : '',
          style: {
            fontSize: '13.5px',
          },
        })}
      />
    );
  };
  
 
  return (
    <Table
      className={styles.table}
      size='small'
      dataSource={data}
      columns={columns}
      rowKey={(record: any) => record.itemAndVersion}
      expandedRowRender={expandedRowRender}
      pagination={false}
      scroll={{ y: 'calc(100vh - 260px)' }}
    />
  );
};
 
export default CommonTable;