import React, { useState, useEffect, useContext } from "react";
import { Table, Modal, Input, Button, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import { parseCookies } from "nookies";
import { v4 as uuidv4 } from "uuid";
import styles from "@modules/podMaintenances/styles/podMainStyles.module.css";
import { useTranslation } from "react-i18next";
import { lineClearanceContext } from "../hooks/lineClearanceContext";
import { Task } from "../types/lineClearanceTypes";
const LineClearanceTasksDataTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<Task[]>([]);
  const [isActivityVisible, setIsActivityVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalDataSample, setModalDataSample] = useState<any[]>([]);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const { formData, setFormData, setFormChange } =
    useContext<any>(lineClearanceContext);

  const { t } = useTranslation();

  useEffect(() => {
    if (formData?.tasks && formData.tasks.length > 0) {
      setDataSource(
        formData.tasks.map((row: { key: any; }) => ({
          ...row,
          key: row.key || uuidv4(),
        }))
      );
    } else {
      setDataSource([]);
    }
  }, [formData?.tasks]);

  const updateFormData = (newDataSource: Task[]) => {
    setDataSource(newDataSource);
    setFormData({
      ...formData,
      tasks: newDataSource,
    });
    setFormChange(true);
  };
  const handleInsert = () => {
    const newRow: Task = {
      key: uuidv4(),
      taskId: ((dataSource.length + 1) * 10).toString(),
      taskName: "",
      taskDescription: "",
      isMandatory: false,
      evidenceRequired: false,
    };

    const updatedDataSource = [...dataSource, newRow];
    updateFormData(updatedDataSource);
  };

  const handleRemoveSelected = () => {
    const filteredData = dataSource.filter(
      (row) => !selectedRowKeys.includes(row.key)
    );
    const resequencedData = filteredData.map((row, index) => ({
      ...row,
      taskId: ((index + 1) * 10).toString(),
    }));
    updateFormData(resequencedData);
    setSelectedRowKeys([]);
  };

  const handleRemoveAll = () => {
    updateFormData([]);
    setSelectedRowKeys([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    field: string
  ) => {
    let value = e.target.value;

    if (field === "taskName") {
      value = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    }

    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, [field]: value } : row
    );

    updateFormData(updatedDataSource);
  };

  const handleChange = (checked: boolean, key: string, field: keyof Task) => {
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, [field]: checked } : row
    );
    updateFormData(updatedDataSource);
  };

  const columns: ColumnsType<Task> = [
    {
      title: t("taskid"),
      dataIndex: "taskId",
      key: "taskId",
      render: (text: string) => (
        <Input value={text} readOnly/>
      ),
    },
    {
      title: t("taskname"),
      dataIndex: "taskName",
      key: "taskName",
      render: (text: string, record: Task) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, "taskName")}
        />
      ),
    },
    {
      title: t("description"),
      dataIndex: "taskDescription",
      key: "taskDescription",
      render: (text: string, record: Task) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, "taskDescription")}
        />
      ),
    },
    {
      title: t("mandatory"),
      dataIndex: "isMandatory",
      render: (_, record: Task) => (
        <Switch
          checked={record.isMandatory}
          onChange={(checked) =>
            handleChange(checked, record.key, "isMandatory")
          }
        />
      ),
    },
    {
      title: t("evidencerequired"),
      dataIndex: "evidenceRequired",
      render: (_, record: Task) => (
        <Switch
          checked={record.evidenceRequired}
          onChange={(checked) =>
            handleChange(checked, record.key, "evidenceRequired")
          }
        />
      ),
    },
  ];
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
        scroll={{ y: "calc(100vh - 440px)" }}
      />
    </div>
  );
};

export default LineClearanceTasksDataTable;
function setActivitySequence(value: string) {
  throw new Error("Function not implemented.");
}
