import React, { useContext, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { LogBuyOffContext } from '../hooks/logBuyOffContext';
import { retrieveNcCode } from '@services/logNCService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { getListOfBuyoff } from '@services/logBuyOffService';
import InstructionModal from '@components/InstructionModal';
import LogBuyOffManual from './LogBuyOffManual';



const BuyOffList: React.FC<any> = ({ call2, filterFormData, selectedRowData }) => {



  const { selectedRow, setSelectedRow, buyoffList, selectedRowKey, setSelectedRowKey } = useContext(LogBuyOffContext);
 
  let { selectedBuyOffRow } = useContext(LogBuyOffContext);

  const { t } = useTranslation();
  useEffect(() => {
    setSelectedRow(null);
    setSelectedRowKey(null);
  }, [call2, filterFormData, selectedRowData]);

  const columns: ColumnsType<any> = [
  
    {
      title: t('buyOff'),
      dataIndex: 'buyOff',
      key: 'buyOff',
      ellipsis: true,
    },
   
    // {
    //   title: t('batchNo'),
    //   dataIndex: 'batchNo',
    //   key: 'batchNo',
    //   ellipsis: true,
    // },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('action'),
      dataIndex: 'buyOffAction',
      key: 'buyOffAction',
      render: (text: string) => {
        return <span style={{ 
          backgroundColor: text === 'A' ? '#f5f5f5' : 'transparent',
          color: text === 'A' ? '#999999' : 'inherit',
          opacity: text === 'A' ? 0.65 : 1
        }}>
          {text}
        </span>
      }
    }, 
    {
      title: t('comments'),
      dataIndex: 'comments',
      key: 'comments',
      ellipsis: true,
    },  {
      title: t('state'),
      dataIndex: 'state',
      key: 'state',
      ellipsis: true,
    },
    {
      title: t('info'),
      dataIndex: 'state',
      key: 'state',
      ellipsis: true,
      render: (_, record) => (
        <Tooltip title={`Task: ${record.taskName}\nDescription: ${record.description}`}>
            <InstructionModal isButton={true}>
<LogBuyOffManual />
</InstructionModal>
        </Tooltip>
    )
    },

  ];

  const onRow = (record: any) => ({
    onClick: () => {
      // Don't allow selection if state is Closed
      if (record.state === 'Closed') return;
      
      if (selectedRowKey == record.buyOffBO) {
        setSelectedRow(null);
        setSelectedRowKey(null);
        selectedBuyOffRow = null;
      } else {
        setSelectedRow(record);
        setSelectedRowKey(record.buyOffBO);
        selectedBuyOffRow = record;
      }
    },
    style: {
      cursor: record.state === 'Closed' ? 'not-allowed' : 'pointer',
      backgroundColor: record.state === 'Closed' ? '#f5f5f5' : undefined,
      color: record.state === 'Closed' ? '#999999' : undefined,
      opacity: record.state === 'Closed' ? 0.65 : 1
    }
  });

  const rowSelection: TableRowSelection<any> = {
    type: 'radio',
    columnWidth: 30,
    selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
    onChange: (selectedRowKeys: React.Key[]) => {
      const newKey = selectedRowKeys[0] as string;
      const selectedRecord = buyoffList.find(item => item.buyOffBO === newKey);
      
      // Don't allow selection if state is Closed
      if (selectedRecord?.state === 'Closed') return;

      if (selectedRowKey === newKey) {
        setSelectedRowKey(null);
        selectedBuyOffRow = null;
        setSelectedRow(null);
      } else {
        setSelectedRowKey(newKey);
        setSelectedRow(selectedRecord);
        selectedBuyOffRow = selectedRecord;
      }
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.state === 'Closed'
    })
  };

  return (
    <>
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={buyoffList}
          rowKey="buyOffBO"
          rowSelection={rowSelection}
          onRow={onRow}
          pagination={false}
          bordered={true}
          scroll={{ y: 125 }}
          // scroll={{ y : 'calc(100vh - 100px)' }}
          size="small"
          style={{
            fontSize: '11px',
          }}
          className="compact-table"
        />
      </div>
      <style>
        {`
          .compact-table .ant-table-tbody > tr > td {
            padding: 4px 8px !important;
            line-height: 1.2;
            font-size: 11px !important;
          }
          .compact-table .ant-table {
            font-size: 11px !important;
          }
        `}
      </style>
    </>
  )

}
export default BuyOffList;
