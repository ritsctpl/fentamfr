import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Select, Input, Checkbox, Form, Row, Col, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { WorkCenterContext } from '../hooks/workCenterContext';
import { SearchOutlined } from '@ant-design/icons';
import { GrChapterAdd } from "react-icons/gr";
import { retrieveHookActivity } from '@services/workCenterService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import styles from '../styles/WorkCenterMaintenance.module.css';

interface TableRow {
  key: any;
  sequence: number;
  hookPoint: string;
  activity: string;
  hookableMethod: string;
  enabled: boolean;
  userArgument: string;
  required: boolean;
}

const ActivityHooks: React.FC = () => {
  const { payloadData, setPayloadData, setShowAlert } = useContext<any>(WorkCenterContext);
  const [dataSource, setDataSource] = useState<TableRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (payloadData && payloadData?.activityHookList) {
      const updatedData = payloadData?.activityHookList.map((hook, index) => ({
        key: hook.key || index, // Ensure the key is unique
        ...hook
      }));
      setDataSource(updatedData);
    }
  }, [payloadData, setPayloadData]);




  const columns: ColumnsType<TableRow> = [
    {
      title: t('hookPoint'),
      dataIndex: 'hookPoint',
      key: 'hookPoint',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.hookPoint
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (_, record, index) => (
        <Select
          style={{ width: '100%' }}
          value={record.hookPoint || 'PRE_START'}
          onChange={(value) => handleFieldChange(value, index, 'hookPoint')}
        >
          <Select.Option value="PRE_START">PRE_START</Select.Option>
          <Select.Option value="POST_START">POST_START</Select.Option>
          <Select.Option value="POST_COMPLETE">POST_COMPLETE</Select.Option>
          <Select.Option value="POST_SIGNOFF">POST_SIGNOFF</Select.Option>
        </Select>
      ),
    },
    {
      title: (
        <span>
          <span style={{ color: 'red' }}>*</span> {t('activity')}
        </span>
      ),
      dataIndex: 'activity',
      key: 'activity',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.activity
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (_, record, index) => (
        <Input
          value={record.activity}
          required={true}
          onChange={(e) => handleFieldChange(e.target.value, index, 'activity')}
          suffix={<GrChapterAdd onClick={() => openModal(record.key)} />}
        />
      ),
    },
    {
      title: t('enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      // filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,

      render: (_, record, index) => (
        <Checkbox
          checked={record.enabled}
          onChange={(e) => handleFieldChange(e.target.checked, index, 'enabled')}
        />
      ),
    },
    {
      title: t('userArgument'),
      dataIndex: 'userArgument',
      key: 'userArgument',
      filterIcon: <SearchOutlined style={{ fontSize: '15px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            {t('search')}
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            {t('reset')}
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.userArgument
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (_, record, index) => (
        <Input
          value={record.userArgument}
          onChange={(e) => handleFieldChange(e.target.value, index, 'userArgument')}
        />
      ),
    },
  ];



  const handleFieldChange = (value: any, index: number, key: keyof any) => {
    const newData = [...dataSource];
    setShowAlert(true);
    // Check if the key is 'activity'
    if (key === 'activity' || key == 'hookableMethod') {
      // Convert value to uppercase, remove spaces, and replace special characters with underscores
      value = value
        .toUpperCase() // Convert to uppercase
        .replace(/\s+/g, '') // Remove all spaces
        .replace(/[^A-Z0-9_]/g, ''); // Remove all special characters except underscores
    }

    newData[index][key] = value;
    setDataSource(newData);

    // Update payloadData directly
    setPayloadData(prevData => {
      const updatedData = {
        ...prevData,
        activityHookList: newData,
      };
      console.log("Updated payloadData:", updatedData); // Debugging
      return updatedData;
    });
  };


  const handleInsert = () => {
    // Generate a unique vvid (for example, using a timestamp or a library like uuid)
    const vvid = new Date().getTime().toString(); // Example unique identifier
    setShowAlert(true);
    // Determine the new sequence value
    const newSequence = dataSource.length === 0 ? 10 : +dataSource[dataSource.length - 1].sequence + 10;

    // Create a new row with the unique vvid
    const newRow: any = {
      key: `${newSequence}_${vvid}`, // Concatenate sequence and vvid
      sequence: newSequence,
      hookPoint: 'PRE_START',
      activity: '',
      hookableMethod: '',
      enabled: false,
      userArgument: '',
    };

    // Update the data source with the new row
    const newData = [...dataSource, newRow];
    setDataSource(newData);

    // Update payloadData directly
    setPayloadData(prevData => ({
      ...prevData,
      activityHookList: newData,
    }));
    setShowAlert(true);
  };


  const handleRemoveSelected = () => {
    const vvid = new Date().getTime().toString();
    // Step 1: Remove selected rows
    const newData = dataSource.filter(item => !selectedRowKeys.includes(item.key));

    // Step 2: Reset sequence and update key for remaining rows
    const updatedData = newData.map((item, index) => ({
      ...item,
      sequence: (index + 1) * 10,
      key: `${vvid}`
    }));

    // Update state and payload data
    setDataSource(updatedData);
    setSelectedRowKeys([]);

    // Update payloadData directly
    setPayloadData(prevData => ({
      ...prevData,
      activityHookList: updatedData,
    }));
    setShowAlert(true);
  };


  const handleRemoveAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);

    // Update payloadData directly
    setPayloadData(prevData => ({
      ...prevData,
      activityHookList: [],
    }));
    setShowAlert(true);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys as number[]);
    },
  };

  const openModal = async (key: number) => {
    setSelectedActivityId(key);
    debugger
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      const retrieveHookActivityResponse = await retrieveHookActivity(site);
      console.log("Top 50 activities response: ", retrieveHookActivityResponse);
      if (retrieveHookActivityResponse) {
        const updatedData = retrieveHookActivityResponse.map(item => ({
          activity: item.activityId,
          description: item.description
        }));

        setModalData(updatedData); // Set dummy data in modal
      }
      else {
        setModalData([]);
      }

    } catch (error) {
      console.error('Error fetching top 50 activities:', error);
    }
    // setModalData(dummyData); 
    setIsModalVisible(true);
  };

  const handleModalRowSelect = (activity: string) => {
    if (selectedActivityId !== null) {
      const newData = [...dataSource];
      const index = newData.findIndex(row => row.key === selectedActivityId);
      if (index !== -1) {
        newData[index].activity = activity;
        setDataSource(newData);
        setPayloadData(prevData => ({
          ...prevData,
          activityHookList: newData,
        }));
      }
    }
    setIsModalVisible(false);
  };

  const modalColumns = [
    {
      title: t('activity'),
      dataIndex: 'activity',
      key: 'activity',

    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',

    },
  ];

  return (
    <>
      <Row justify="end" gutter={[16, 16]} style={{ margin: "16px 0px" }}>
        <Col>
          <Button className={styles.cancelButton} onClick={handleInsert}>
            {t("insert")}
          </Button>
        </Col>
        <Col>
          <Button onClick={handleRemoveSelected} className={styles.cancelButton} disabled={selectedRowKeys.length === 0}>
            {t("removeSelected")}
          </Button>
        </Col>
        <Col>
          <Button onClick={handleRemoveAll} className={styles.cancelButton} disabled={dataSource.length === 0}>
            {t("removeAll")}
          </Button>
        </Col>
      </Row>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ y: 'calc(100vh - 400px)' }}
        bordered={true}
        size="small"
        style={{ width: '95%', marginLeft: '20px' }}
      />
      <Modal
        title={t("selectActivity")}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Table
          columns={modalColumns}
          dataSource={modalData}
          rowKey="activity"
          onRow={(record) => ({
            onDoubleClick: () => handleModalRowSelect(record.activity),
          })}
          pagination={false}
          scroll={{y: 'calc(100vh - 450px)'}} 
          bordered
          size='small'
        />
      </Modal>
    </>
  );
};

export default ActivityHooks;
