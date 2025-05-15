'use client'
import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Input, Button, DatePicker, Switch, message } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { fetchTop50, retrieveAllItem } from '@services/itemServices';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid'; 
import styles from '@modules/bom/styles/bomStyles.module.css';
import { useTranslation } from 'react-i18next';
import { BomContext } from '@modules/bom/hooks/useContext';
import moment from 'moment';

interface DataType {
  key: string;
  alternateComponent: string;
  alternateComponentVersion: string;
  enabled: boolean;
  validfromDateTime: string;
  validToDateTime: string;
}

const AlternateComponentTable: React.FC = () => {
  const { componentForm, setComponentForm, formChange, setFormChange } = useContext<any>(BomContext);
  const [dataSource, setDataSource] = useState<DataType[]>();
  const [isAlternateModalVisible, setAlternateModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalDataSample, setModalDataSample] = useState<any[]>([]);
  const [activeRow, setActiveRow] = useState<string | null>(null);

  const { t } = useTranslation();
  
  useEffect(() => {
    if (componentForm?.alternateComponentList) {
      setDataSource(componentForm.alternateComponentList.map(row => ({
        ...row,
        key: row.key || uuidv4()
      })));
    }
  }, [componentForm]);

  const showAlternateModal = async (key: string, typedValue: string) => {
    setActiveRow(key);
    let oItemList;
    const cookies = parseCookies();
    const site = cookies.site;
    try {
      if (typedValue) oItemList = await retrieveAllItem(site, typedValue);
      else oItemList = await fetchTop50(site);

      if (oItemList) {
        const processedData = oItemList.map((item, index) => ({
          ...item,
          key: uuidv4(),
        }));
        setModalDataSample(processedData);
      } else {
        setModalDataSample([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setAlternateModalVisible(true);
  };

  const handleCancel = () => {
    setAlternateModalVisible(false);
  };

  const handleInsert = () => {
    const newRow: DataType = {
      key: uuidv4(),
      alternateComponent: '',
      alternateComponentVersion: '',
      enabled: false,
      validfromDateTime: '',
      validToDateTime: '',
    };
    const updatedDataSource = [...dataSource, newRow];
    setDataSource(updatedDataSource);
    setComponentForm((prevData) => ({
      ...prevData,
      alternateComponentList: updatedDataSource
    }));
  };

  const handleRemoveSelected = () => {
    const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
    setDataSource(filteredData);
    setComponentForm((prevData) => ({
      ...prevData,
      alternateComponentList: filteredData
    }));
    setSelectedRowKeys([]);
  };

  const handleRemoveAll = () => {
    setDataSource([]);
    setComponentForm((prevData) => ({
      ...prevData,
      alternateComponentList: []
    }));
    setSelectedRowKeys([]);
  };

    const handleDateChange = (date: any, key: 'validfromDateTime' | 'validToDateTime', rowId: string) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : '';
    const updatedDataSource = dataSource.map(item =>
        item.key === rowId ? { ...item, [key]: formattedDate } : item
    );

    if (key === 'validfromDateTime' || key === 'validToDateTime') {
        const updatedItem = updatedDataSource.find(item => item.key === rowId);
        if (updatedItem) {
            const validFrom = updatedItem.validfromDateTime;
            const validTo = updatedItem.validToDateTime;

            if (validFrom && validTo && moment(validTo).isBefore(moment(validFrom))) {
                message.error(t('validToDateError'));
                return;
            }
        }
    }

    setDataSource(updatedDataSource);
    setComponentForm((prevData) => ({
      ...prevData,
      alternateComponentList: updatedDataSource
    }));
    setFormChange(true);
};


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    field: string
  ) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, [field]: value } : row
    );
    setDataSource(updatedDataSource);
    setComponentForm((prevData) => ({
      ...prevData,
      alternateComponentList: updatedDataSource
    }));
  };

  const handleChange = (checked: boolean, key: string) => {
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, enabled: checked } : row
    );
    setDataSource(updatedDataSource);
    setComponentForm((prevData) => ({
      ...prevData,
      alternateComponentList: updatedDataSource
    }));
  };

    const disabledDate = (current: any, type: 'validfromDateTime' | 'validToDateTime', rowId: string) => {
    const validFrom = dataSource.find(item => item.key === rowId)?.validfromDateTime;
    const today = moment().startOf('day');

    if (type === 'validfromDateTime') {
        return current && current.isBefore(today, 'day');
    } else if (type === 'validToDateTime') {
        if (!validFrom) {
            return false; 
        }
        const fromDate = moment(validFrom).startOf('day');
        return current && (current.isBefore(fromDate, 'day') || current.isBefore(today, 'day'));
    }
    return false;
};

  const columns: ColumnsType<DataType> = [
    {
        title: t('alternateComponent'),
        dataIndex: 'alternateComponent',
        key: 'alternateComponent',
        render: (text: string, record: DataType) => (
            <Input
                value={text}
                onChange={(e) => handleInputChange(e, record.key, 'alternateComponent')}
                suffix={<GrChapterAdd onClick={() => showAlternateModal(record.key, record.alternateComponent)} />}
            />
        ),
    },
    {
        title: t('version'),
        dataIndex: 'alternateComponentVersion',
        key: 'alternateComponentVersion',
        render: (text: string, record: DataType) => (
            <Input
                value={text}
                onChange={(e) => handleInputChange(e, record.key, 'alternateComponentVersion')}
            />
        ),
    },
    {
        title: t('enabled'),
        dataIndex: 'enabled',
        render: (_, record) => (
            <Switch
                checked={record.enabled}
                onChange={(checked) => handleChange(checked, record.key)}
            />
        ),
    },
    {
        title: t('validFrom'),
        dataIndex: 'validfromDateTime',
        render: (_, record) => (
            <DatePicker
                value={record.validfromDateTime ? dayjs(record.validfromDateTime) : undefined}
                onChange={(date) => handleDateChange(date, 'validfromDateTime', record.key)}
                disabledDate={(current) => disabledDate(current, 'validfromDateTime', record.key)}
            />
        ),
    },
    {
        title: t('validTo'),
        dataIndex: 'validToDateTime',
        render: (_, record) => (
            <DatePicker
                value={record.validToDateTime ? dayjs(record.validToDateTime) : undefined}
                onChange={(date) => handleDateChange(date, 'validToDateTime', record.key)}
                disabledDate={(current) => disabledDate(current, 'validToDateTime', record.key)}
            />
        ),
    },
];

  const modalColumns = [
    { title: t("item"), dataIndex: 'item', key: 'item' },
    { title: t("version"), dataIndex: 'revision', key: 'revision' },
    { title: t("description"), dataIndex: 'description', key: 'description' },
    { title: t("status"), dataIndex: 'status', key: 'status' },
    {
      title: t("procurementType"),
      dataIndex: 'procurementType',
      key: 'procurementType',
    },
    { title: t("lotSize"), dataIndex: 'lotSize', key: 'lotSize' },
  ];

  const handleModalOk = (record) => {
    if (activeRow) {
      const updatedData = dataSource.map((row) => {
        if (row.key === activeRow) {
          return {
            ...row,
            alternateComponent: record.item,
            alternateComponentVersion: record.revision,
          };
        }
        return row;
      });

      setDataSource(updatedData);
      setComponentForm((prevData) => ({
        ...prevData,
        alternateComponentList: updatedData,
      }));
    }
    handleCancel();
  };

  return (
    <div> 
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={handleInsert} style={{ marginRight: 8 }} className={`${styles.cancelButton}`}>
          {t('insert')}
        </Button>
        <Button
          className={`${styles.cancelButton}`}
          onClick={handleRemoveSelected}
          style={{ marginRight: 8 }}
        >
          {t('removeSelected')}
        </Button>
        <Button className={`${styles.cancelButton}`} onClick={handleRemoveAll}>
          {t('removeAll')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          columnWidth: 30,
        }}
        pagination={false}
        scroll={{ y: 'calc(100vh - 400px)' }}
      />

      <Modal
        title={t("selectAlternateComponent")}
        open={isAlternateModalVisible}
        onCancel={handleCancel}
        onOk={() => handleModalOk(modalDataSample[0])} 
        width={1000}
        footer={null}
      >
        <Table
          columns={modalColumns}
          dataSource={modalDataSample}
          onRow={(record) => ({
            onDoubleClick: () => handleModalOk(record),
          })}
          // pagination={{ pageSize: 6 }}
          pagination={false}
          scroll={{ y: 'calc(100vh - 300px)' }}
        />
      </Modal>
    </div>
  );
};

export default AlternateComponentTable;
