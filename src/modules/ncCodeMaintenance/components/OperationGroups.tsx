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
import { retrieveTop50Operation } from '@services/dataCollectionServices';


interface TableRow {
  key: any;
  validOperations: string;
  dispositionGroups: string;
  enabled: boolean;
}

const OperationGroups: React.FC = () => {
  const { formData, setFormData, setFormChange } = useContext<any>(NcCodeContext);
  const [dataSource, setDataSource] = useState<TableRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (formData && formData.operationGroupsList) {
      const updatedData = formData.operationGroupsList.map((group) => ({
        key: uuidv4(),
        ...group
      }));
      setDataSource(updatedData);
    }
  }, [formData]);


  const columns: ColumnsType<TableRow> = [
    {
      title: t('validOperations'),
      dataIndex: 'validOperations',
      key: 'validOperations',
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
        record.validOperations
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (_, record, index) => (
        <Input
          value={record.validOperations}
          required={true}
          onChange={(e) => handleFieldChange(e.target.value, index, 'validOperations')}
          suffix={<GrChapterAdd onClick={() => openModal(record.key)} />}
        />
      ),
    },
    {
      title: t('dispositionGroups'),
      dataIndex: 'dispositionGroups',
      key: 'dispositionGroups',
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
        record.dispositionGroups
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (_, record, index) => (
        <Input
          value={record.dispositionGroups}
          required={true}
          onChange={(e) => handleFieldChange(e.target.value, index, 'dispositionGroups')}
          suffix={<GrChapterAdd onClick={() => openModal1(record.key)} />}
        />
      ),
    },
    {
      title: t('enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (_, record, index) => (
        <Checkbox
          checked={record.enabled}
          onChange={(e) => handleFieldChange(e.target.checked, index, 'enabled')}
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

    // Update operationGroupsList instead of activityHookList
    setFormData(prevData => {
      const updatedData = {
        ...prevData,
        operationGroupsList: newData,
      };
      return updatedData;
    });
    setFormChange(true);
  };


  const handleInsert = () => {
    const newRow: TableRow = {
      key: uuidv4(),
      validOperations: '',
      dispositionGroups: '',
      enabled: false
    };

    const newData = [...dataSource, newRow];
    setDataSource(newData);
    setFormData(prevData => ({
      ...prevData,
      operationGroupsList: newData.map(({ key, ...rest }) => rest),
    }));
    setFormChange(true);
  };


  const handleRemoveSelected = () => {
    const newData = dataSource.filter(item => !selectedRowKeys.includes(item.key));
    setDataSource(newData);
    setSelectedRowKeys([]);
    setFormChange(true);
    setFormData(prevData => ({
      ...prevData,
      operationGroupsList: newData,
    }));
  };


  const handleRemoveAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setFormChange(true);
    setFormData(prevData => ({
      ...prevData,
      operationGroupsList: [],
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
      const retrieveHookActivityResponse = await retrieveTop50Operation(site);
      const updatedData = retrieveHookActivityResponse.map(item => ({
        operation: item.operation,
        description: item.description,
        revision: item.revision
      }));

      setModalData(updatedData);

    } catch (error) {
      console.error('Error fetching top 50 activities:', error);
    }
    setIsModalVisible(true);
  };

  const openModal1 = async (key: any) => {
    // setSelectedActivityId(key);
    // try {
    //   const cookies = parseCookies();
    //   const site = cookies.site;
    //   const retrieveHookActivityResponse = await retrieveTop50Operation(site);
    //   console.log("retrieveHookActivityResponse", retrieveHookActivityResponse);
    //   const updatedData = retrieveHookActivityResponse.map(item => ({
    //     operation: item.operation,
    //     description: item.description,
    //     revision: item.revision
    //   }));

    //   setModalData(updatedData); 

    // } catch (error) {
    //   console.error('Error fetching top 50 activities:', error);
    // }
    // setIsModalVisible(true);
  };

  const handleModalRowSelect = (operation: string) => {
    if (selectedActivityId !== null) {
      const newData = [...dataSource];
      const index = newData.findIndex(row => row.key === selectedActivityId);
      if (index !== -1) {
        newData[index].validOperations = operation;
        setDataSource(newData);
        setFormData(prevData => ({
          ...prevData,
          operationGroupsList: newData,
        }));
      }
    }
    setFormChange(true);
    setIsModalVisible(false);
  };

  const handleModalRowSelect1 = (dispositionGroups: string) => {
    if (selectedActivityId !== null) {
      const newData = [...dataSource];
      const index = newData.findIndex(row => row.key === selectedActivityId);
      if (index !== -1) {
        newData[index].dispositionGroups = dispositionGroups;
        setDataSource(newData);
        setFormData(prevData => ({
          ...prevData,
          operationGroupsList: newData,
        }));
      }
    }
    setFormChange(true);
    setIsModalVisible(false);
  };

  const modalColumns = [
    {
      title: t('operation'),
      dataIndex: 'operation',
      key: 'operation',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('revision'),
      dataIndex: 'revision',
      key: 'revision',
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
        title={t("selectOperation")}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Table
          columns={modalColumns}
          dataSource={modalData}
          rowKey="operation"
          onRow={(record) => ({
            onDoubleClick: () => handleModalRowSelect(record.operation),
          })}
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      <Modal
        title={t("selectDispositionGroup")}
        open={isModalVisible1}
        onCancel={() => setIsModalVisible1(false)}
        footer={null}
      >
        <Table
          columns={modalColumns}
          dataSource={modalData}
          rowKey="dispositionGroups"
          onRow={(record) => ({
            onDoubleClick: () => handleModalRowSelect1(record.dispositionGroups),
          })}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </>
  );
};

export default OperationGroups;
