import React, { useState, useRef, useContext } from 'react';
import { Table, Input, Button, InputRef, Modal, Popconfirm, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import styles from '@modules/cycleTimeMaintenance/styles/CycleTime.module.css';
import DynamicModal from '@components/DynamicModal';
import ResourceDetails from './ResourceDetails';
import { useTranslation } from 'react-i18next';
import { AiFillEdit } from 'react-icons/ai';
import { FcFullTrash } from 'react-icons/fc';
import { addCycleTime, deleteCycleTime, retriveCycleTimeRow } from '@services/cycleTimeService';
import { parseCookies } from 'nookies';
import { CycleTimeUseContext } from '../hooks/CycleTimeUseContext';
import dayjs from 'dayjs';
import { defaultCycleTimeRequest } from '../types/cycleTimeTypes';

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

const CommonTable: React.FC<CommonTableProps> = ({ data, onRowSelect  }) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const { formData, setFormData, setFormChange, formChange, call, setCall, isFormDisabled, setIsFormDisabled } = useContext<any>(CycleTimeUseContext);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: any) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            // icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          {/* <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button> */}
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: DataRow) =>
      record.itemAndVersion
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleEdit = async (record: any) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    try {

      const payload = {
        site: site,
        userId: userId,
        resourceType: record.resourceType,
        time: record.time,
        ...record
      }

      const rowData = await retriveCycleTimeRow(site, payload);
      setSelectedRecord(rowData);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleDelete = async (record: any) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    try {
      const payload = {
        site: site,
        userId: userId,
        resourceType: record.resourceType,
        time: record.time,
        ...record  
      }
      
      const rowData = await retriveCycleTimeRow(site, payload);
      const response = await deleteCycleTime(site, userId, rowData);
      if (response.message) {
        message.error(response.message)
      }
      else {
        message.success(response.message_details.msg)
        setCall(call + 1);
        setFormChange(false)
        setFormData(defaultCycleTimeRequest)
      }
    } catch (error) {
      message.error('Error deleting CycleTime.');
    }
  };

  const columns: ColumnsType<DataRow> = [
    {
      title: 'Item and Version',
      dataIndex: 'itemAndVersion',
      key: 'itemAndVersion',
      ...getColumnSearchProps('itemAndVersion'),
      render: text => text || '---'
    },
  ];

  // New state to track the selected nested row
  const [selectedNestedRow, setSelectedNestedRow] = useState<RecordItem | null>(null);

  const expandedRowRender = (record: DataRow) => {
    const columns = [
      { title: t('operation'), dataIndex: 'operation', key: 'operation', render: text => text || '---' },
      { title: t('operationVersion'), dataIndex: 'operationVersion', key: 'operationVersion', render: text => text || '---' },
      { title: t('resourceType'), dataIndex: 'resourceType', key: 'resourceType', render: text => text || '---' },
      { title: t('workCenter'), dataIndex: 'workCenter', key: 'workCenter', render: text => text || '---' },
      { title: t('cycleTime'), dataIndex: 'cycleTime', key: 'cycleTime', render: text => text !== null && text !== undefined ? Number(text).toFixed(4) : '---' },
      { title: t('manufacturedTime'), dataIndex: 'manufacturedTime', key: 'manufacturedTime', render: text => text !== null && text !== undefined ? Number(text).toFixed(4) : '---' },
      { title: t('targetQuantity'), dataIndex: 'targetQuantity', key: 'targetQuantity', render: text => text !== null && text !== undefined ? text : '---' },
      {
        title: t('actions'),
        key: 'actions',
        render: (_, record: RecordItem) => (
          <span onClick={(e) => e.stopPropagation()}>
            {(record.resource || record.resourceType) && (
              <AiFillEdit
                className={styles.actionIcon}
                onClick={() => handleEdit(record)}
                style={{ color: 'green', marginRight: 8 }}
              />
            )}
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this cycle time?"
              onConfirm={() => handleDelete(record)}
              onCancel={() => console.log('Cancel')}
              okText="Yes"
              cancelText="No"
            >
              <FcFullTrash
                className={styles.actionIcon}
                style={{ color: 'red !important', marginRight: 8 }}
              />
            </Popconfirm>
          </span>
        ),
      },
    ];

    const handleNestedRowClick = (nestedRecord: RecordItem) => {
      setSelectedNestedRow(nestedRecord);

      const nestedRecordData = {
        ...nestedRecord,
        resource: nestedRecord.resource || '',
        resourceType: nestedRecord.resourceType || '',
      }

      if (onRowSelect) {
        const [item, itemVersion] = record.itemAndVersion.split(' ');
        onRowSelect({
          itemAndVersion: record.itemAndVersion,
          records: [nestedRecordData],
          operation: nestedRecord.operation,
          operationVersion: nestedRecord.operationVersion,
          resource: nestedRecord.resource || '',
          resourceType: nestedRecord.resourceType || '',
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

  const handleOk = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;
      const timeValue = formData.time || '00:00:00';
      const formattedTime = typeof timeValue === 'string' ?
        timeValue :
        dayjs(timeValue).isValid() ?
          dayjs(timeValue).format('HH:mm:ss') :
          '00:00:00';

      const payload = {
        ...formData,
        site: site,
        userId: userId,
        time: formattedTime,
        cycleTimeRequestList: formData?.cycleTimeResponseList
          ? formData.cycleTimeResponseList.map(item => ({
            ...item,
            site: site
          }))
          : []
      };

      const response = await addCycleTime(site, userId, payload);
      if (response.message) {
        message.error(response.message)
      }
      else {
        message.success(response.message_details.msg)
        setCall(call + 1);
        setFormChange(false)
        // setIsFormDisabled(false);
        setModalVisible(false);
      }
    }
    catch (error) {
      message.error('An error occurred while saving the CycleTime.');
    }
  };

  return (
    <>
      <Table
        className={styles.table}
        size='small'
        dataSource={data}
        columns={columns}
        rowKey={(record: any) => record.itemAndVersion}
        expandedRowRender={expandedRowRender}
        pagination={false}
        scroll={{ y: 'calc(100vh - 390px)' }}
        // scroll={{ y: 'calc(100vh - 250px)' }}
        style={{ marginTop: '10px' }}
      />
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleOk}
        title={t('resourceDetails')}
        width={1200}
      >
        <ResourceDetails selected={selectedRecord} setSelected={setSelectedRecord} />
      </Modal>
    </>
  );
};

export default CommonTable;