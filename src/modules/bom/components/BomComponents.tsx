import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Modal, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { useTranslation } from 'react-i18next';
import { BomContext } from '@modules/bom/hooks/useContext';
import { defaultBomComponent } from '@modules/bom/types/bomTypes';

interface DataType {
  key: number;
  sequence: string; 
  component: string;
  assemblyOperation: string;
  assemblyQuantity: number;
  componentType: string;
}

interface AlternateComponentTableProps {
  openHalfScreen: boolean;
  call: number;
  setOpenHalfScreen: (val: boolean) => void;
}

const BomComponents: React.FC<AlternateComponentTableProps> = ({
  setOpenHalfScreen,
  openHalfScreen,
  call
}) => {
  const { mainForm, setMainForm, setComponentForm, setSequence, formChange, setFormChange, componentCall, setActiveTab } = useContext<any>(BomContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<DataType | null>(null);
  
  const { t } = useTranslation();

  useEffect(() => {
    if (mainForm) {
      const mappedData = mainForm.bomComponentList?.map((component) => ({
        key: component.assySequence,
        sequence: String(component.assySequence),
        component: component.component,
        assemblyOperation: component.assyOperation,
        assemblyQuantity: component.assyQty,
        componentType: component.componentType,
      }));
      setDataSource(mappedData);
    } else {
      setDataSource([]);
    }
  }, [mainForm, componentCall, call]);

  const handleInsert = async () => {
    setOpenHalfScreen(true);
    setComponentForm(defaultBomComponent);
    setActiveTab(0);

    const newSequence = mainForm.bomComponentList.length === 0 ? 10 : +mainForm.bomComponentList[mainForm.bomComponentList.length - 1].assySequence + 10;
    setSequence(newSequence);
  };

  const handleRemoveSelected = () => {
    if (selectedRowKeys.length === 0) {
      return;
    }

    const filteredData = dataSource.filter(row => !selectedRowKeys.includes(row.key));
    const updatedData = filteredData.map((row, index) => ({
      ...row,
      key: index + 1,
      sequence: String((index + 1) * 10),
    }));

    const updatedBomComponentList = mainForm.bomComponentList.filter(
      component => !selectedRowKeys.includes(component.assySequence)
    );

    const reSequencedBomComponentList = updatedBomComponentList.map((component, index) => ({
      ...component,
      assySequence: String((index + 1) * 10),
    }));

    setDataSource(updatedData);
    setSelectedRowKeys([]);
    setMainForm(prevForm => ({
      ...prevForm,
      bomComponentList: reSequencedBomComponentList,
    }));
  };

  const handleRemoveAll = () => {
    if (dataSource.length === 0) {
      return;
    }

    setDataSource([]);
    setSelectedRowKeys([]);
    setMainForm(prevForm => ({
      ...prevForm,
      bomComponentList: []
    }));
  };

  const onRowSelect = (record: DataType) => {
    const selectedComponent = mainForm.bomComponentList.find(
      (component) => component.assySequence === record.sequence
    );
    setSequence('');

    if (formChange) {
      setSelectRowData(selectedComponent || null);
      setIsModalVisible(true);
      setFormChange(false);
    } else {
      setComponentForm(selectedComponent || null);
      setOpenHalfScreen(true);
      setActiveTab(0);
    }
  };

  const handleModalOk = () => {
    if (selectRowData) {
      setComponentForm(selectRowData);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => confirm()}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    onFilter: (value: string, record: DataType) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });

  const columns: ColumnsType<DataType> = [
    {
      title: t("sequence"),
      dataIndex: 'sequence',
      key: 'sequence',
      ...getColumnSearchProps('sequence'),
      sorter: (a, b) => parseInt(a.sequence) - parseInt(b.sequence),
      render: (text: string) => text,
    },
    {
      title: t("component"),
      dataIndex: 'component',
      key: 'component',
      ...getColumnSearchProps('component'),
      sorter: (a, b) => a.component.localeCompare(b.component),
      render: (text: string) => text,
    },
    {
      title: t("assemblyOperation"),
      dataIndex: 'assemblyOperation',
      key: 'assemblyOperation',
      ...getColumnSearchProps('assemblyOperation'),
      sorter: (a, b) => a.assemblyOperation.localeCompare(b.assemblyOperation),
      render: (text: string) => text,
    },
    {
      title: t("assemblyQuantity"),
      dataIndex: 'assemblyQuantity',
      key: 'assemblyQuantity',
      ...getColumnSearchProps('assemblyQuantity'),
      sorter: (a, b) => a.assemblyQuantity - b.assemblyQuantity,
      render: (text: number) => text,
    },
    {
      title: t("componentType"),
      dataIndex: 'componentType',
      key: 'componentType',
      ...getColumnSearchProps('componentType'),
      sorter: (a, b) => a.componentType.localeCompare(b.componentType),
      render: (text: string) => text,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={handleInsert} style={{ marginRight: 8 }} className={`${styles.cancelButton}`}>
          {t("insert")}
        </Button>
        {!openHalfScreen && (
          <>
            <Button
              className={`${styles.cancelButton}`}
              onClick={handleRemoveSelected}
              style={{ marginRight: 8 }}
            >
              {t("removeSelected")}
            </Button>
            <Button className={`${styles.cancelButton}`} onClick={handleRemoveAll}>
              {t("removeAll")}
            </Button>
          </>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        // pagination={{ pageSize: 5 }}
        pagination={false}
        scroll={{ y: 'calc(100vh - 480px)' }}
        rowSelection={
          !openHalfScreen
            ? {
                selectedRowKeys,
                onChange: (keys) => {
                  setSelectedRowKeys(keys);
                },
                columnWidth: 30,
              }
            : undefined
        }
        onRow={(record) => ({
          onClick: () => onRowSelect(record),
        })}
      />
      <Modal
        title={t('confirmation')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('confirm')}
        cancelText={t('cancel')}
      >
        <p>{t('alertRow')}</p>
      </Modal>
    </div>
  );
};

export default BomComponents;
