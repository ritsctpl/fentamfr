import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Input, Row, Col } from 'antd';
  import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import styles from '@modules/ncCodeMaintenance/styles/ncCode.module.css';
import { v4 as uuidv4 } from 'uuid';
import { ToolNumberContext } from '../hooks/ToolNumberUseContext';


interface TableRow {
  key: any;
  measurementPoint: string;
}

const MeasurementPoints: React.FC = () => {
  const { formData, setFormData, setFormChange } = useContext<any>(ToolNumberContext);
  const [dataSource, setDataSource] = useState<TableRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (formData && formData.measurementPointsList) {
      const updatedData = formData.measurementPointsList.map((group) => ({
        key: uuidv4(),
        ...group
      }));
      setDataSource(updatedData);
    }
  }, [formData]);


  const columns: ColumnsType<TableRow> = [
    {
      title: t('measurementPoint'),
      dataIndex: 'measurementPoint',
      key: 'measurementPoint',
      render: (_, record, index) => (
        <Input
          value={record.measurementPoint}
          onChange={(e) => handleFieldChange(e.target.value, index, 'measurementPoint')}
        />
      ),
    },
  ];

  const handleFieldChange = (value: any, index: number, key: keyof any) => {
    const newData = [...dataSource];

    newData[index][key] = value;
    setDataSource(newData);
    setFormData(prevData => {
      const updatedData = {
        ...prevData,
        measurementPointsList: newData,
      };
      return updatedData;
    });
    setFormChange(true);
  };


  const handleInsert = () => {
    const newRow: TableRow = {
      key: uuidv4(),
      measurementPoint: '',
    };

    const newData = [...dataSource, newRow];
    setDataSource(newData);
    setFormData(prevData => ({
      ...prevData,
      measurementPointsList: newData.map(({ key, ...rest }) => rest),
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
      measurementPointsList: newData,
    }));
  };


  const handleRemoveAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
    setFormChange(true);
    setFormData(prevData => ({
      ...prevData,
      measurementPointsList: [],
    }));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys as number[]);
    },
  };

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
    </>
  );
};

export default MeasurementPoints;
