import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Input, Button, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { GrChapterAdd } from "react-icons/gr";
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { fetchTop50, retrieveAllItem } from '@services/itemServices';
import { parseCookies } from 'nookies';
import styles from '@modules/item/styles/ItemMaintenance.module.css';
import { useTranslation } from 'react-i18next';
import { ItemContext } from '@modules/item/hooks/itemContext';


interface DataType {
  key: number;
  sequence: number;
  alternateComponent: string;
  alternateComponentVersion: string;
  parentMaterial: string;
  parentMaterialVersion: string;
  validFromDateTime: string;
  validToDateTime: string;
}

const initialData: DataType[] = [
  {
    key: 1,
    sequence: 10,
    alternateComponent: 'Component A',
    alternateComponentVersion: '1.0',
    parentMaterial: 'Parent A',
    parentMaterialVersion: '1.10',
    validFromDateTime: '01-08-2024',
    validToDateTime: '11-08-2024',
  },
];

interface AlternateComponentTableProps {
  dataSource: any[];
  itemData: any[];
  itemRowData: any[];
  alt: any[];
  selectionMode: 'checkbox' | 'radio';
  onDataChange: (data: any[]) => void;
  setAlt: (data: any[]) => void;
  buttonVisibility: boolean;
  resetValue: boolean;
  resetValueCall: number;
  payloadData: object;
  setPayloadData: () => void;
}


const TableComponent: React.FC<AlternateComponentTableProps> = ({  setAlt, alt, resetValue, resetValueCall, itemData, itemRowData }) => {
  const { payloadData, setPayloadData, setShowAlert, username } = useContext(ItemContext);
  let [dataSource, setDataSource] = useState<DataType[]>([]);

  const [isAlternateModalVisible, setAlternateModalVisible] = useState(false);
  const [isParentModalVisible, setParentModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalDataSample, setModalDataSample] = useState<any[]>([]);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  useEffect(() => {
    setDataSource(payloadData.alternateComponentList);
  }, [payloadData]);


  const showAlternateModal = async (key: number, typedValue: string) => {
    setActiveRow(key);
    let oItemList;
    const cookies = parseCookies();
    const userId = username;
    const site = cookies.site;
    try {
      if (typedValue)
        oItemList = await retrieveAllItem(site, typedValue);
      else
        oItemList = await fetchTop50(site);
      if (oItemList) {
        const processedData = oItemList.map((item, index) => ({
          ...item,
          key: index + 1,
          id: index + 1, 
        }));
        setModalDataSample(processedData); 
      }
      else {
        setModalDataSample([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setAlternateModalVisible(true);
  };

  const showParentModal = async (key: number, typedValue: string) => {
    setActiveRow(key);
    let oItemList;
    const cookies = parseCookies();
    const userId = username;
    const site = cookies.site;
    try {
      if (typedValue)
        oItemList = await retrieveAllItem(site, typedValue);
      else
        oItemList = await fetchTop50(site);
      if (oItemList) {
        const processedData = oItemList.map((item, index) => ({
          ...item,
          key: index + 1,
          id: index + 1, 
        }));
        setModalDataSample(processedData); 
      }
      else {
        setModalDataSample([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }


    setParentModalVisible(true);
  };

  const handleCancel = () => {
    setAlternateModalVisible(false);
    setParentModalVisible(false);
  };

  const handleInsert = () => {
    const newRow: DataType = {
      key: dataSource.length + 1,
      sequence: (dataSource.length + 1) * 10,
      alternateComponent: '',
      alternateComponentVersion: '',
      parentMaterial: '',
      parentMaterialVersion: '',
      validFromDateTime: '',
      validToDateTime: '',
    };
    setDataSource([...dataSource, newRow]);
    setPayloadData((prevData) => ({
      ...prevData,
      alternateComponentList: [...dataSource, newRow]
    }))
    setShowAlert(true);
  };

  const handleRemoveSelected = () => {
    const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
    const updatedData = filteredData.map((row, index) => ({
      ...row,
      sequence: (index + 1) * 10,
    }));
    setDataSource(updatedData);
    setPayloadData((prevData) => ({
      ...prevData,
      alternateComponentList: updatedData
    }));

    setSelectedRowKeys([]);
    setShowAlert(true);
  };

  const handleRemoveAll = () => {
    setDataSource([]);
    setPayloadData((prevData) => ({
      ...prevData,
      alternateComponentList: []
    }));
    setSelectedRowKeys([]);
    setShowAlert(true);
  };

  const handleDateChange = (
    date: Dayjs | null,
    dateString: string,
    key: number,
    field: 'validFromDateTime' | 'validToDateTime'
  ) => {
    const updatedDataSource = dataSource.map((row) => {
      if (row.key === key) {
        if (field === 'validFromDateTime') {
          const validTo = row.validToDateTime ? dayjs(row.validToDateTime) : null;
          if (validTo && date && validTo.isBefore(date)) {
            return { ...row, validToDateTime: null }; // Reset validTo if invalid
          }
        } else if (field === 'validToDateTime') {
          const validFrom = row.validFromDateTime ? dayjs(row.validFromDateTime) : null;
          if (validFrom && date && validFrom.isAfter(date)) {
            return { ...row, validFromDateTime: null }; // Reset validFrom if invalid
          }
        }
        return { ...row, [field]: dateString };
      }
      return row;
    });
  
    setDataSource(updatedDataSource);
    setPayloadData((prevData) => ({
      ...prevData,
      alternateComponentList: updatedDataSource,
    }));
    setShowAlert(true);
  };

  const { t } = useTranslation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: number,
    field: string
  ) => {
    let value = e.target.value;
    value = value.toUpperCase();
    value = value.replace(/\s+/g, "");
    value = value.replace(/[^a-zA-Z0-9_]/g, "");
    setDataSource((prevData) => {
      const updatedDataSource = prevData.map((row) =>
        row.key === key ? { ...row, [field]: value } : row
      );
      setPayloadData((prevData) => ({
        ...prevData,
        alternateComponentList: updatedDataSource
      }));

      return updatedDataSource;
    });
    setShowAlert(true);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: t('sequence'),  
      dataIndex: 'sequence',
      key: 'sequence',
      // width: 10, 
    },
    {
      title: t('alternateComponent'),  
      dataIndex: 'alternateComponent',
      key: 'alternateComponent',
      // width: 500, 
      filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={()=>confirm()}
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
        record.alternateComponent
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (text: string, record: DataType) => (
        <Input
          value={text}
          onChange={(e) => {
            handleInputChange(e, record.key, 'alternateComponent');
          }}
          suffix={<GrChapterAdd onClick={() => showAlternateModal(record.key, record.alternateComponent)} />}
        />
      ),
    },
    {
      title: t('version'),  
      dataIndex: 'alternateComponentVersion',
      key: 'alternateComponentVersion',
      // width: 50, 
      filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={()=>confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={()=>confirm()}
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
        record.alternateComponentVersion
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (text: string, record: DataType) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, 'alternateComponentVersion')}
        />
      ),
    },
    {
      title: t('parentMaterial'),
      dataIndex: 'parentMaterial',
      key: 'parentMaterial',
      // width: 500, 
      filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input

            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={()=>confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={()=>confirm()}
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
        record.parentMaterial
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (text: string, record: DataType) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, 'parentMaterial')}
          suffix={<GrChapterAdd onClick={() => showParentModal(record.key, record.parentMaterial)} />}
        />
      ),
    },
    {
      title: t('version'), 
      dataIndex: 'parentMaterialVersion',
      key: 'parentMaterialVersion',
      // width: 50, 
      filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={()=>confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={()=>confirm()}
            
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
        record.parentMaterialVersion
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (text: string, record: DataType) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, 'parentMaterialVersion')}
        />
      ),
    },
    {
      title: t('validFrom'),
      dataIndex: 'validFromDateTime',
      key: 'validFromDateTime',
      // width: 500,
      render: (text: string, record: DataType) => (
        <DatePicker
          showTime
          value={text ? dayjs(text, 'YYYY-MM-DDTHH:mm:ss') : null}
          format="DD-MM-YYYY HH:mm:ss"
          onChange={(date, dateString) => {
            const formattedDate = date ? date.format('YYYY-MM-DDTHH:mm:ss') : null;
            handleDateChange(date, formattedDate, record.key, 'validFromDateTime');
          }}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: t('validTo'),
      dataIndex: 'validToDateTime',
      key: 'validToDateTime',
      // width: 500,
      render: (text: string, record: DataType) => (
        <DatePicker
          showTime
          value={text ? dayjs(text, 'YYYY-MM-DDTHH:mm:ss') : null}
          format="DD-MM-YYYY HH:mm:ss"
          onChange={(date, dateString) => {
            const formattedDate = date ? date.format('YYYY-MM-DDTHH:mm:ss') : null;
            handleDateChange(date, formattedDate, record.key, 'validToDateTime');
          }}
          disabledDate={(current) => {
            const validFromDate = record.validFromDateTime ? dayjs(record.validFromDateTime) : null;
            return current && validFromDate && current.isBefore(validFromDate, 'day');
          }}
          style={{ width: '100%' }}
        />
      ),
    },
  ];



  const modalColumns = [
    { title: t('item'), dataIndex: 'item', key: 'item' },
    { title: t('revision'), dataIndex: 'revision', key: 'revision' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
    { title: t('status'), dataIndex: 'status', key: 'status' },
    {
      title: t('procurementType'),
      dataIndex: 'procurementType',
      key: 'procurementType',
    },
    { title: t('lotSize'), dataIndex: 'lotSize', key: 'lotSize' },
  ];
  

  const handleModalOk = (record) => {
    if (activeRow !== null) {
      const updatedData = dataSource.map((row) => {
        if (row.key === activeRow) {
          if (isAlternateModalVisible) {
            return {
              ...row,
              alternateComponent: record.item,
              alternateComponentVersion: record.revision,
            };
          }
          if (isParentModalVisible) {
            return {
              ...row,
              parentMaterial: record.item,
              parentMaterialVersion: record.revision,
            };
          }
        }
        return row;
      });

      setDataSource(updatedData);

      setPayloadData((prevData) => ({
        ...prevData,
        alternateComponentList: updatedData,
      }));
    }
    setShowAlert(true);
    handleCancel();
  };


  // console.log("Payload data from alternate compoenent list: ", payloadData.alternateComponentList)

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right',   marginTop: '2%'  }}>
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
        dataSource={payloadData.alternateComponentList}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          columnWidth: 30,

        }}
        // pagination={{
        //   pageSize: 5,
        //   showSizeChanger: false,
        //   pageSizeOptions: ['5', '10', '20', '50'],
        // }}
        pagination={false}
        scroll={{ y: 'calc(100vh - 450px)' }}
        // scroll={{ y: 250 }}
      />

      <Modal
        title={t("manageAlternateComponents")}
        open={isAlternateModalVisible}
        onCancel={handleCancel}
        onOk={handleModalOk}
        width={1000}
        footer={null}
      >
        <Table
          columns={modalColumns}
          dataSource={modalDataSample}
          onRow={(record) => ({
            onDoubleClick: () => handleModalOk(record),
          })}
          pagination={false}
          scroll={{y: 'calc(100vh - 450px)'}} 
          bordered
          size='small'
        />
      </Modal>
      <Modal
        title={t("manageParentComponents")}
        open={isParentModalVisible}
        onCancel={handleCancel}
        onOk={handleModalOk}
        width={1000}
        footer={null}
      >
        <Table
          columns={modalColumns}
          dataSource={modalDataSample} 

          onRow={(record) => ({
            onDoubleClick: () => handleModalOk(record),
          })}
          pagination={false}
          scroll={{y: 'calc(100vh - 450px)'}} 
          bordered
          size='small'

        />
      </Modal>
    </div>
  );
};

export default TableComponent;
