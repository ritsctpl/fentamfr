import React, { useState, useEffect, useContext } from "react";
import { Table, Modal, Input, Button, Switch } from "antd";
import { GrChapterAdd } from "react-icons/gr";
import type { ColumnsType } from "antd/es/table";
import { parseCookies } from "nookies";
import { v4 as uuidv4 } from "uuid";
import styles from "@modules/podMaintenances/styles/podMainStyles.module.css";
import { useTranslation } from "react-i18next";
import { CustomDataContext } from "../hooks/CustomDataContext";
import {
  fetchDataFieldAll,
  fetchDataFieldTop50,
} from "@services/customDataService";

interface Activity {
  key: string;
  sequence?: string;
  customData?: string;
  fieldLabel?: string;
  required?: boolean;
}

const CustomDataTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<Activity[]>([]);
  const [isActivityVisible, setIsActivityVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalDataSample, setModalDataSample] = useState<any[]>([]);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const { formData, setFormData, setFormChange } = useContext<any>(CustomDataContext);

  const { t } = useTranslation();

  useEffect(() => {
    if (formData && formData.length > 0) {
      setDataSource(
        formData.map((row) => ({
          ...row,
          key: row.key || uuidv4(),
        }))
      );
    } else {
      setDataSource([]);
    }
  }, [formData]);

  const showAlternateModal = async (key: string, typedValue: string) => {
    setActiveRow(key);
    let oItemList;
    const cookies = parseCookies();
    const site = cookies.site;
    try {
      // If typedValue is empty, fetch all data
      if (!typedValue) {
        oItemList = await fetchDataFieldAll(site, typedValue);
      } else {
        // If typedValue has a value, fetch filtered data
        oItemList = await fetchDataFieldTop50(site, typedValue);
        if (oItemList && oItemList.dataFieldList) {
          const filteredData = oItemList.dataFieldList.filter((item) =>
            item.dataField.toLowerCase().includes(typedValue.toLowerCase())
          );
          oItemList = { ...oItemList, dataFieldList: filteredData };
        }
      }

      if (oItemList && oItemList.dataFieldList) {
        const processedData = oItemList.dataFieldList.map((item) => ({
          ...item,
          key: uuidv4(),
        }));
        setModalDataSample(processedData);
      } else {
        setModalDataSample([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsActivityVisible(true);
  };

  const handleCancel = () => {
    setIsActivityVisible(false);
  };

  const recalculateSequences = (data: Activity[]) => {
    return data.map((row, index) => ({
      ...row,
      sequence: ((index + 1) * 10).toString(),
    }));
  };

  const handleInsert = () => {
    const newSequence =
      dataSource.length > 0 ? (dataSource.length + 1) * 10 : 10;
    const newRow: Activity = {
      key: uuidv4(),
      sequence: newSequence.toString(),
      customData: "",
      fieldLabel: "",
      required: false,
    };

    const updatedDataSource = [...dataSource, newRow];
    setDataSource(updatedDataSource);
    setFormData(updatedDataSource);
    setFormChange(true);
  };

  const handleRemoveSelected = () => {
    const filteredData = dataSource.filter(
      (row) => !selectedRowKeys.includes(row.key)
    );
    const updatedData = recalculateSequences(filteredData);

    setDataSource(updatedData);
    setFormData(updatedData);
    setSelectedRowKeys([]);
  };

  const handleRemoveAll = () => {
    setDataSource([]);
    setFormData([]);
    setSelectedRowKeys([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    field: string
  ) => {
    let value = e.target.value;

    if (field === "customData") {
      value = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    }

    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, [field]: value } : row
    );

    setDataSource(updatedDataSource);
    setFormData(updatedDataSource);
    setFormChange(true);
  };

  const handleChange = (
    checked: boolean,
    key: string,
    field: keyof Activity
  ) => {
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, [field]: checked } : row
    );
    setDataSource(updatedDataSource);
    setFormData(updatedDataSource);
    setFormChange(true);
  };

  const columns: ColumnsType<Activity> = [
    {
      title: t("sequence"),
      dataIndex: "sequence",
      key: "sequence",
      width: 200,
      render: (text: string, record: Activity) => (
        <Input
          value={text}
          readOnly
        />
      ),
    },
    {
      title: t("data field"),
      dataIndex: "customData",
      key: "customData",
      width: 200,
      render: (text: string, record: Activity) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, "customData")}
          suffix={
            <GrChapterAdd
              onClick={() => showAlternateModal(record.key, text)}
            />
          }
        />
      ),
    },
    {
      title: t("field label"),
      dataIndex: "fieldLabel",
      key: "fieldLabel",
      width: 200,
      render: (text: string, record: Activity) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, "fieldLabel")}
        />
      ),
    },
    {
      title: t("required"),
      dataIndex: "required",
      width: 200,
      render: (_, record) => (
        <Switch
          checked={record.required}
          onChange={(checked) => handleChange(checked, record.key, "required")}
        />
      ),
    },
  ];

  const modalColumns = [
    { title: t("data field"), dataIndex: "dataField", key: "dataField" },
    { title: t("description"), dataIndex: "description", key: "description" },
  ];

  const handleModalOk = (record) => {
    if (activeRow) {
      const updatedData = dataSource.map((row) => {
        if (row.key === activeRow) {
          return {
            ...row,
            customData: record.dataField,
          };
        }
        return row;
      });

      setDataSource(updatedData);
      setFormData(updatedData);
    }

    handleCancel();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button
          onClick={handleInsert}
          style={{ marginRight: 8 }}
          className={`${styles.cancelButton}`}
        >
          {t("insert")}
        </Button>
        <Button
          className={`${styles.cancelButton}`}
          onClick={handleRemoveSelected}
          style={{ marginRight: 8 }}
          disabled={selectedRowKeys.length === 0}
        >
          {t("removeSelected")}
        </Button>
        <Button
          className={`${styles.cancelButton}`}
          onClick={handleRemoveAll}
          disabled={dataSource.length === 0}
        >
          {t("removeAll")}
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
        scroll={{ y: 'calc(100vh - 440px)' }}
      />

      {/* Modal for Alternate Component */}
      <Modal
        title={t("selectdataField")}
        open={isActivityVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
      >
        <Table 
          dataSource={modalDataSample}
          columns={modalColumns}
          rowKey="dataField"
          onRow={(record) => ({
            onDoubleClick: () => handleModalOk(record),
          })}
          pagination={{
            pageSize: 7,
            showSizeChanger: false,
          }}
        />
      </Modal>
    </div>
  );
};

export default CustomDataTable;
function setActivitySequence(value: string) {
  throw new Error("Function not implemented.");
}
