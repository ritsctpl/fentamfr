import React, { useContext, useState, useEffect } from "react";
import { Table, Button, Input, Space, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { OperationContext } from "@modules/operationMaintenance/hooks/operationContext";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import { DynamicBrowse } from "@components/BrowseComponent";

const { Option } = Select;

// Define hook point options
const hookPointOptions = [
  { value: "Pre_Start", label: "Pre Start" },
  { value: "Pre_Batch_Start", label: "Pre Batch Start" },
  { value: "Pre_Validate_Start", label: "Pre Validate Start" },
  { value: "Post_Start", label: "Post Start" },
  { value: "Pre_Complete", label: "Pre Complete" },
  { value: "Pre_Batch_Complete", label: "Pre Batch Complete" },
  { value: "Post_Complete", label: "Post Complete" },
  { value: "Post_Batch_Complete", label: "Post Batch Complete" },
  { value: "Pre_SignOff", label: "Pre SignOff" },
  { value: "Post_SignOff", label: "Post SignOff" },
];

// Define the ActivityHook interface
interface ActivityHook {
  id: number;
  hookPoint: string;
  activity: string;
  enable: boolean;
  userArgument: string;
}

const ActivityHookTable: React.FC = () => {
  const { formData, setFormData, erpShift } = useContext(OperationContext);
  const { t } = useTranslation();

  // Initialize dataSource based on formData, with a fallback to an empty array
  const [dataSource, setDataSource] = useState<ActivityHook[]>(() =>
    (formData.activityHookList || []).map((item, index) => ({
      id: index + 1,
      hookPoint: item.hookPoint || hookPointOptions[0].value,
      activity: item.activity || "",
      enable: item.enable || false,
      userArgument: item.userArgument || "",
    }))
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // Reset dataSource when formData changes or when switching between operations
  useEffect(() => {
    const resetDataSource = (formDataList?: any[]) => {
      if (!formDataList || formDataList.length === 0) {
        // If no data, reset to an empty array
        setDataSource([]);
        setSelectedRowKeys([]);
        return;
      }

      // Map incoming data to the required format
      const updatedDataSource = formDataList.map((item, index) => ({
        id: index + 1,
        hookPoint: item.hookPoint || hookPointOptions[0].value,
        activity: item.activity || "",
        enable: item.enable || false,
        userArgument: item.userArgument || "",
      }));

      // Only update if the data has actually changed
      if (JSON.stringify(updatedDataSource) !== JSON.stringify(dataSource)) {
        setDataSource(updatedDataSource);
        setSelectedRowKeys([]);
      }
    };

    resetDataSource(formData.activityHookList);
  }, [formData.activityHookList, erpShift]);

  // Update formData when dataSource changes
  useEffect(() => {
    // Avoid unnecessary updates
    if (
      JSON.stringify(dataSource) !== JSON.stringify(formData.activityHookList)
    ) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        activityHookList: dataSource.map(
          ({ hookPoint, activity, enable, userArgument }) => ({
            hookPoint,
            activity,
            enable,
            userArgument,
          })
        ),
      }));
    }
  }, [dataSource, setFormData]);

  const handleAdd = () => {
    const newId = dataSource.length
      ? Math.max(...dataSource.map((item) => item.id)) + 1
      : 1;
    setDataSource((prevDataSource) => [
      ...prevDataSource,
      {
        id: newId,
        hookPoint: hookPointOptions[0].value,
        activity: "",
        enable: false,
        userArgument: "",
      },
    ]);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setSelectedRowKeys([]);
  };

  const handleRemoveSelected = () => {
    const newDataSource = dataSource.filter(
      (item) => !selectedRowKeys.includes(item.id)
    );
    setDataSource(newDataSource);
    setSelectedRowKeys([]);
  };

  const handleChange = debounce(
    (newValue: any, id: number, field: keyof ActivityHook) => {
      // Validate activity field
      if (field === "activity" && !newValue) {
        message.error("Activity cannot be empty");
        return;
      }

      const updatedDataSource = dataSource.map((item) =>
        item.id === id ? { ...item, [field]: newValue } : item
      );

      // Avoid setting state if it hasn't changed
      if (JSON.stringify(updatedDataSource) !== JSON.stringify(dataSource)) {
        setDataSource(updatedDataSource);
      }
    },
    300
  );

  const UiActivity = {
    pagination: {
      current: 1,
      pageSize: 3,
      total: 10,
    },
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: "Select Activity",
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventApi: "activity",
    tabledataApi: "activity-service",
  };
  const columns: ColumnsType<ActivityHook> = [
    {
      title: t("hookPoint"),
      dataIndex: "hookPoint",
      render: (_, record) => (
        <Select
          value={record.hookPoint || hookPointOptions[0].value}
          onChange={(value) => handleChange(value, record.id, "hookPoint")}
          style={{ width: "100%" }}
        >
          {hookPointOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: (
        <span>
          <span style={{ color: "red" }}>*</span> {t("activity")}
        </span>
      ),
      dataIndex: "activity",
      render: (_, record) => (
        <DynamicBrowse
          uiConfig={UiActivity}
          initial={record.activity}
          onSelectionChange={(value) =>
            handleChange(value[0]?.activityId || "", record.id, "activity")
          }
        />
      ),
    },
    {
      title: t("enable"),
      dataIndex: "enable",
      render: (_, record) => (
        <Input
          type="checkbox"
          checked={record.enable}
          onChange={(e) => handleChange(e.target.checked, record.id, "enable")}
        />
      ),
    },
    {
      title: t("userArgument"),
      dataIndex: "userArgument",
      render: (_, record) => (
        <Input
          value={record.userArgument}
          onChange={(e) =>
            handleChange(e.target.value, record.id, "userArgument")
          }
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: number[]) => setSelectedRowKeys(keys),
  };

  return (
    <div>
      <Space
        style={{ marginBottom: 16, display: "flex", justifyContent: "end" }}
      >
        <Button onClick={handleAdd}>{t("insert")}</Button>
        <Button onClick={handleDeleteAll}>{t("removeAll")}</Button>
        <Button onClick={handleRemoveSelected}>{t("removeSelected")}</Button>
      </Space>
      <Table
        bordered
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ y: "calc(100vh - 500px)" }}
      />
    </div>
  );
};

export default ActivityHookTable;
