import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Select, Input, Checkbox, Row, Col, Modal } from 'antd';
  import { ColumnsType } from 'antd/lib/table';
import { SearchOutlined } from '@ant-design/icons';
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import styles from '@modules/ncCodeMaintenance/styles/ncCode.module.css';
import { v4 as uuidv4 } from 'uuid';
import { NcCodeContext } from '@modules/ncCodeMaintenance/hooks/NcCodeUseContext';
import { retrieveHookActivity } from '@services/activityService';


interface TableRow {
  key: any;
  hookPoint: string;
  activity: string;
  enable: boolean;
  userArgument: string;
  url: string;
}

const NcCodeActivityHooks: React.FC = () => {
  const { formData, setFormData, setFormChange } = useContext<any>(NcCodeContext);
  const [dataSource, setDataSource] = useState<TableRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (formData && formData.activityHookList) {
      const updatedData = formData.activityHookList.map((hook) => ({
        key: uuidv4(),
        ...hook
      }));
      setDataSource(updatedData);
    }
  }, [formData]);


  const columns: ColumnsType<TableRow> = [
    {
      title: t('hookPoint'),
      dataIndex: 'hookPoint',
      key: 'hookPoint',
      filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            // icon={<SearchOutlined />}
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
          <span style={{ color: 'red' }}>*</span>  {t('activity')}
        </span>
      ),
      filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            // icon={<SearchOutlined />}
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
          value={record.activity} required={true}
          onChange={(e) => handleFieldChange(e.target.value, index, 'activity')}
          suffix={<GrChapterAdd onClick={() => openModal(record.key)} />}
        />
      ),
    },
    {
      title: t('enabled'),
      dataIndex: 'enable',
      key: 'enable',
      render: (_, record, index) => (
        <Checkbox
          checked={record.enable}
          onChange={(e) => handleFieldChange(e.target.checked, index, 'enable')}
        />
      ),
    },
    {
      title: t('userArgument'),
      dataIndex: 'userArgument',
      key: 'userArgument',
      filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            // icon={<SearchOutlined />}
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
    setFormData(prevData => {
      const updatedData = {
        ...prevData,
        activityHookList: newData,
      };
      console.log("Updated payloadData:", updatedData); // Debugging
      return updatedData;
    });
    setFormChange(true)
  };


  const handleInsert = () => {
    const newRow: TableRow = {
      key: uuidv4(),
      hookPoint: '',
      activity: '',
      enable: false,
      userArgument: '',
      url: ''
    };

    const newData = [...dataSource, newRow];
    setDataSource(newData);
    setFormData(prevData => ({
      ...prevData,
      activityHookList: newData.map(({ key, ...rest }) => rest),
    }));
    setFormChange(true);
  };


  const handleRemoveSelected = () => {
    const newData = dataSource.filter(item => !selectedRowKeys.includes(item.key));

    // Do not regenerate keys here, just update the sequence
    const updatedData = newData.map((item, index) => ({
      ...item,
      sequence: (index + 1) * 10,
    }));

    setDataSource(updatedData);
    setSelectedRowKeys([]);
    setFormChange(true);
    setFormData(prevData => ({
      ...prevData,
      activityHookList: updatedData,
    }));
  };


  const handleRemoveAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setFormChange(true)
    // Update payloadData directly
    setFormData(prevData => ({
      ...prevData,
      activityHookList: [],
    }));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys as number[]);
    },
  };

  const openModal = async (key: any) => {
    setSelectedActivityId(key);
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      const retrieveHookActivityResponse = await retrieveHookActivity(site);
      const updatedData = retrieveHookActivityResponse.map(item => ({
        activity: item.activityId,
        description: item.description
      }));

      setModalData(updatedData); // Set dummy data in modal

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
        setFormData(prevData => ({
          ...prevData,
          activityHookList: newData,
        }));
      }
    }
    setFormChange(true)
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
      <Row justify="end" gutter={[16, 16]}>
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
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </>
  );
};

export default NcCodeActivityHooks;
