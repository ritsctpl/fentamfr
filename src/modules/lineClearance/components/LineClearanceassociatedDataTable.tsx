import React, { useState, useEffect, useContext } from "react";
import { Table, Modal, Input, Button,Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import { v4 as uuidv4 } from "uuid";
import styles from "@modules/podMaintenances/styles/podMainStyles.module.css";
import { useTranslation } from "react-i18next";
import { lineClearanceContext } from "../hooks/lineClearanceContext";
import { AssociatedTo } from "../types/lineClearanceTypes";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import {
  fetchAllResource,
  fetchAllWorkCenter,
  fetchTop50Resource,
  fetchTop50WorkCenter,
} from "@services/cycleTimeService";
import {
  ResourceData,
  WorkCenterData,
} from "@modules/cycleTimeMaintenance/types/cycleTimeTypes";

const LineClearanceAssociatedDataTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<AssociatedTo[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { formData, setFormData, setFormChange } =
    useContext<any>(lineClearanceContext);
  const { t } = useTranslation();
  const [activeRow, setActiveRow] = useState<string>("");
  const [resourceData, setResourceData] = useState<ResourceData[]>([]);
  const [workCenterData, setWorkCenterData] = useState<WorkCenterData[]>([]);
  const [isResourceVisible, setIsResourceVisible] = useState(false);
  const [isWorkCenterVisible, setIsWorkCenterVisible] = useState(false);

  useEffect(() => {
    if (formData?.associatedTo && formData.associatedTo.length > 0) {
      setDataSource(
        formData.associatedTo.map((row) => ({
          ...row,
          key: row.key || uuidv4(),
        }))
      );
    } else {
      setDataSource([]);
    }
  }, [formData?.associatedTo]);

  const showAlternateModal = async (
    key: string,
    typedValue: string,
    field: string
  ) => {
    setActiveRow(key);
    const cookies = parseCookies();
    const site = cookies.site;

    if (field === "resourceId") {
      try {
        const newValue = { resource: typedValue };
        let response = typedValue
          ? await fetchAllResource(site, newValue)
          : await fetchTop50Resource(site);
        if (response && !response.errorCode) {
          const formattedData = response.map((item: any, index: number) => ({
            id: index,
            ...item,
          }));
          setResourceData(formattedData);
        } else {
          setResourceData([]);
        }
        setIsResourceVisible(true);
      } catch (error) {
        console.error("Error", error);
      }
    } else if (field === "workcenterId") {
      try {
        const newValue = { workCenter: typedValue };
        let response = typedValue
          ? await fetchAllWorkCenter(site, newValue)
          : await fetchTop50WorkCenter(site);
        if (response && !response.errorCode) {
          const formattedData = response.workCenterList.map(
            (item: any, index: number) => ({ id: index, ...item })
          );
          setWorkCenterData(formattedData);
        } else {
          setWorkCenterData([]);
        }
        setIsWorkCenterVisible(true);
      } catch (error) {
        console.error("Error", error);
      }
    }
  };

  const handleResourceOk = (selectedRow: ResourceData) => {
    if (selectedRow && activeRow) {
      const updatedDataSource = dataSource.map((row) =>
        row.key === activeRow
          ? { ...row, resourceId: selectedRow.resource }
          : row
      );
      updateFormData(updatedDataSource);
    }
    setIsResourceVisible(false);
  };

  const handleWorkCenterOk = (selectedRow: WorkCenterData) => {
    if (selectedRow && activeRow) {
      const updatedDataSource = dataSource.map((row) =>
        row.key === activeRow
          ? { ...row, workcenterId: selectedRow.workCenter }
          : row
      );
      updateFormData(updatedDataSource);
    }
    setIsWorkCenterVisible(false);
  };

  const handleCancel = () => {
    setIsResourceVisible(false);
    setIsWorkCenterVisible(false);
  };

  const ResourceColumn = [
    { title: t("resource"), dataIndex: "resource", key: "resource" },
    { title: t("description"), dataIndex: "description", key: "description" },
    { title: t("status"), dataIndex: "status", key: "status" },
  ];

  const WorkCenterColumn = [
    { title: t("workCenter"), dataIndex: "workCenter", key: "workCenter" },
    { title: t("description"), dataIndex: "description", key: "description" },
  ];

  const updateFormData = (newDataSource: AssociatedTo[]) => {
    setDataSource(newDataSource);
    setFormData({
      ...formData,
      associatedTo: newDataSource,
    });
    setFormChange(true);
  };

  const handleInsert = () => {
    const newRow: AssociatedTo = {
      key: uuidv4(),
      workcenterId: "",
      resourceId: "",
      enable: false,
    };

    const updatedDataSource = [...dataSource, newRow];
    updateFormData(updatedDataSource);
  };

  const handleRemoveSelected = () => {
    const filteredData = dataSource.filter(
      (row) => !selectedRowKeys.includes(row.key)
    );
    updateFormData(filteredData);
    setSelectedRowKeys([]);
  };

  const handleRemoveAll = () => {
    updateFormData([]);
    setSelectedRowKeys([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    field: keyof AssociatedTo
  ) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, [field]: value } : row
    );
    updateFormData(updatedDataSource);
  };
  const handleEnableChange = (checked: boolean, key: string) => {
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, enable: checked } : row
    );
    updateFormData(updatedDataSource);
  };

  const columns: ColumnsType<AssociatedTo> = [
    {
      title: t("workcenterId"),
      dataIndex: "workcenterId",
      key: "workcenterId",
      render: (text: string, record: AssociatedTo) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, "workcenterId")}
          suffix={
            <GrChapterAdd
              onClick={() =>
                showAlternateModal(record.key, text, "workcenterId")
              }
            />
          }
        />
      ),
    },
    {
      title: t("resourceId"),
      dataIndex: "resourceId",
      key: "resourceId",
      render: (text: string, record: AssociatedTo) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, "resourceId")}
          suffix={
            <GrChapterAdd
              onClick={() => showAlternateModal(record.key, text, "resourceId")}
            />
          }
        />
      ),
    },
    {
      title: t("enable"),
      dataIndex: "enable",
      key: "enable",
      render: (value: boolean, record: AssociatedTo) => (
        <Switch
          checked={value}
          onChange={(checked) => handleEnableChange(checked, record.key)}
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

      {/* Resource Modal */}
      <Modal
        title={t("selectResource")}
        open={isResourceVisible}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <Table
          style={{ overflow: "auto" }}
          onRow={(record) => ({
            onDoubleClick: () => handleResourceOk(record),
          })}
          columns={ResourceColumn}
          dataSource={resourceData}
          rowKey="resource"
          pagination={{ pageSize: 6 }}
        />
      </Modal>

      {/* WorkCenter Modal */}
      <Modal
        title={t("selectWorkCenter")}
        open={isWorkCenterVisible}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <Table
          style={{ overflow: "auto" }}
          onRow={(record) => ({
            onDoubleClick: () => handleWorkCenterOk(record),
          })}
          columns={WorkCenterColumn}
          dataSource={workCenterData}
          rowKey="workCenter"
          pagination={{ pageSize: 6 }}
        />
      </Modal>
    </div>
  );
};

export default LineClearanceAssociatedDataTable;
