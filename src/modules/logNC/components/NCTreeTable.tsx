import React, { useContext, useEffect } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { LogNCContext } from '../hooks/logNCContext';
import { retrieveNcCode } from '@services/logNCService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';

interface NCDataFields {
  handle: string;
  changeStamp: string;
  ncContextGbo: string;
  userBo: string;
  dateTime: string;
  sequence: string;
  site: string;
  parentNcDataBo: any;
  ncState: string;
  ncCodeBo: string;
  ncDataTypeBo: string;
  qty: number;
  secondaryNCDataList: NCDataFields[] | null;
  count?: number;
  // ... add other fields as needed
}

const NCTreeTable: React.FC<{call2: number}> = ({call2}) => {



const { setNcCodeValue, setNcDataTypeValue, setSelectedNcRow, selectedNcTreeRowKey, setSelectedNcTreeRowKey,
  setNcCodeList, isNcTreeSelected, setIsNcTreeSelected, setOGetAllNcByPCUResponse, setChildNC, setParentNC, oGetAllNcByPCUResponse, count,
  setCount,
  } = useContext(LogNCContext);


  const { t } = useTranslation();
  useEffect(() => {
    // debugger

    setSelectedNcRow(null);
    setIsNcTreeSelected(false); // Ensure the state is consistent

  }, []);

  useEffect(() => {
    if(!selectedNcTreeRowKey){
      setIsNcTreeSelected(false);
      // setChildNC(null);
      // setParentNC(null);
    }
  }, [selectedNcTreeRowKey]);


  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);

  // Add useEffect to handle call2 changes
  useEffect(() => {
    if (call2 > 0 && oGetAllNcByPCUResponse) {
      // Get all handles (keys) from the data including children
      const getAllKeys = (data: NCDataFields[]): string[] => {
        let keys: string[] = [];
        data.forEach(item => {
          keys.push(item.handle);
          if (item.secondaryNCDataList && item.secondaryNCDataList.length > 0) {
            keys = [...keys, ...getAllKeys(item.secondaryNCDataList)];
          }
        });
        return keys;
      };

      const allKeys = getAllKeys(oGetAllNcByPCUResponse);
      setExpandedKeys(allKeys);
    }
  }, [call2, oGetAllNcByPCUResponse]);

  const columns: ColumnsType<any> = [
    {
      title: t('pcu'),
      dataIndex: 'ncContextGbo',
      key: 'ncContextGbo',
      render: (text: string) => text.split(',')[1] // Extract PCU number after comma
    },
    {
      title: t('ncCode'),
      dataIndex: 'ncCodeBo',
      key: 'ncCodeBo',
      render: (text: string) => text.split(',')[1] // Extract NC code after comma
    },
    {
      title: t('status'),
      dataIndex: 'ncState',
      key: 'ncState'
    },
    {
      title: t('qty'),
      dataIndex: 'qty',
      key: 'qty'
    },
    // {
    //   title: 'Date Time',
    //   dataIndex: 'dateTime',
    //   key: 'dateTime',
    //   render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    // }
  ];

  // Configure row selection for single selection
  const rowSelection1: TableRowSelection<NCDataFields> = {
    type: 'radio',
    selectedRowKeys: selectedNcTreeRowKey ? [selectedNcTreeRowKey] : [],
    onChange: (selectedKeys, selectedRows) => {
      // debugger
      setSelectedNcTreeRowKey(selectedKeys[0]);
      const selectedRecord = selectedRows[0];
      setSelectedNcRow(selectedRecord);
      handleNcTreeRowClick(selectedRecord?.ncCodeBo);
      setCount(selectedRecord?.count);
    },
    preserveSelectedRowKeys: false
  };

 

const rowSelection: TableRowSelection<NCDataFields> = {
  type: 'radio',
  selectedRowKeys: selectedNcTreeRowKey ? [selectedNcTreeRowKey] : [],
  onChange: (selectedKeys, selectedRows) => {
      const selectedKey = selectedKeys[0] || undefined;
      const selectedRow = selectedRows[0] || null;

      console.log('Selected Key:', selectedKey);
      console.log('Selected Row:', selectedRow);

      setSelectedNcTreeRowKey(selectedKey);
      setSelectedNcRow(selectedRow);

      if (selectedKey) {
          handleNcTreeRowClick(selectedRow?.ncCodeBo);
          setCount(selectedRow?.count);
      } else {
          setIsNcTreeSelected(false); // Ensure no selection
      }
  },
  preserveSelectedRowKeys: false,
};

const onRow = (record: NCDataFields) => ({
  onClick: () => {
    // debugger
      const newSelectedKey = record.handle === selectedNcTreeRowKey ? undefined : record.handle;
      console.log('New Selected Key:', newSelectedKey);

      setSelectedNcTreeRowKey(newSelectedKey);

      if (newSelectedKey) {
          setSelectedNcRow(record);
      } else {
          // Clear selections when deselecting
          setSelectedNcRow(null);
          setIsNcTreeSelected(false); // Ensure no selection
      }
      setCount(record?.count);
      handleNcTreeRowClick(record?.ncCodeBo.split(",")[1]);
  },
  className: record.handle === selectedNcTreeRowKey ? 'ant-table-row-selected custom-row-selected' : '',
  style: {
      cursor: 'pointer',
  }
});

                                                                                                     

  const handleNcTreeRowClick = async (ncCode: string) => {
    // setNcCodeValue(ncCode);
    setIsNcTreeSelected(true);
    const cookies = parseCookies();
    const site = cookies.site;
    const request = {site, ncCode};
    try {
      const response = await retrieveNcCode(request);
      if(!response.errorCode){
        let oNcCodeList = response?.secondariesGroupsList;
        oNcCodeList = oNcCodeList.map((item: any, index: number) => ({
            
                ...item,
                key: index,
                ncCode: item.secondaries
            
        }));
        setNcCodeList(oNcCodeList);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {/* <style>
        {`
          .custom-row-selected {
            background-color: #1890ff45 !important;
          }
          .custom-row-selected:hover > td {
            background-color: #1890ff60 !important;
          }
          .ant-radio-wrapper {
            margin-right: 0;
          }
        `}
      </style> */}
      <Table
        columns={columns}
        dataSource={oGetAllNcByPCUResponse}
        rowKey="handle"
        rowSelection={rowSelection}
        onRow={onRow}
        childrenColumnName="secondaryNCDataList"
        pagination={false}
        bordered={true}
        scroll={{ y: 200 }}
        size="small"
        style={{ fontSize: '12px' }}
        expandedRowKeys={expandedKeys} // Add this prop
        onExpand={(expanded, record) => {
          if (expanded) {
            setExpandedKeys([...expandedKeys, record.handle]);
          } else {
            setExpandedKeys(expandedKeys.filter(key => key !== record.handle));
          }
        }}
      />
    </>
  );
};

export default NCTreeTable;
