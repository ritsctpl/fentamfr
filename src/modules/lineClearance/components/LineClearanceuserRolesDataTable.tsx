import React, { useState, useEffect, useContext } from "react";
import { Table, Modal, Input, Button, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { v4 as uuidv4 } from "uuid";
import styles from "@modules/podMaintenances/styles/podMainStyles.module.css";
import { useTranslation } from "react-i18next";
import { lineClearanceContext } from "../hooks/lineClearanceContext";
import { UserRole } from "../types/lineClearanceTypes";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import { fetchUserTop50, fetchUserAllData } from "@services/userService";

const LineClearanceUserRolesDataTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<UserRole[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { formData, setFormData, setFormChange } =
    useContext<any>(lineClearanceContext);
  const { t } = useTranslation();
  const [activeRow, setActiveRow] = useState<string>("");
  const [isUserVisible, setIsUserVisible] = useState(false);
  const [userData, setUserData] = useState<any[]>([]);

  const permissionOptions = [
    "Initiate Clearance",
    "Complete Tasks",
    "Approve Clearance",
    "Edit Checklist",
    "Manage Templates",
    "Manage Resources",
    "Edit Roles",
  ];

  const roleNameOptions = ["Operator", "Supervisor", "Admin"];

  useEffect(() => {
    if (formData?.userRoles && formData.userRoles.length > 0) {
      setDataSource(
        formData.userRoles.map((row) => ({
          ...row,
          key: row.key || uuidv4(),
        }))
      );
    } else {
      setDataSource([]);
    }
  }, [formData?.userRoles]);

  const showAlternateModal = async (key: string, typedValue: string) => {
    setActiveRow(key);
    try {
      let response = typedValue
        ? await fetchUserAllData(typedValue)
        : await fetchUserTop50();

      console.log("API Response:", response); // Debug log

      if (response) {
        const formattedData = response.map((item: any, index: number) => ({
          id: index,
          ...item,
        }));
        console.log("Formatted Data:", formattedData); // Debug log
        setUserData(formattedData);
      } else {
        setUserData([]);
      }
      setIsUserVisible(true);
    } catch (error) {
      console.error("Error", error);
    }
  };

  const handleUserOk = (selectedRow: any) => {
    console.log("Selected Row:", selectedRow);
    if (selectedRow && activeRow) {
      const updatedDataSource = dataSource.map((row) =>
        row.key === activeRow ? { ...row, roleId: selectedRow.user } : row
      );
      updateFormData(updatedDataSource);
    }
    setIsUserVisible(false);
  };

  const handleCancel = () => {
    setIsUserVisible(false);
  };

  const UserColumn = [
    { title: t("user"), dataIndex: "user", key: "user" },
    { title: t("lastName"), dataIndex: "lastName", key: "lastName" },
    { title: t("status"), dataIndex: "status", key: "status" },
  ];

  const updateFormData = (newDataSource: UserRole[]) => {
    setDataSource(newDataSource);
    setFormData({
      ...formData,
      userRoles: newDataSource,
    });
    setFormChange(true);
  };

  const handleInsert = () => {
    const newRow: UserRole = {
      key: uuidv4(),
      roleId: "",
      roleName: "",
      permissions: [],
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
    field: keyof UserRole
  ) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, [field]: value } : row
    );
    updateFormData(updatedDataSource);
  };

  const handlePermissionsChange = (value: string[], key: string) => {
    const updatedDataSource = dataSource.map((row) =>
      row.key === key ? { ...row, permissions: value } : row
    );
    updateFormData(updatedDataSource);
  };

  const defaultRolePermissions = {
    Operator: ["Initiate Clearance", "Complete Tasks"],
    Supervisor: ["Approve Clearance", "Edit Checklist"],
    Admin: ["Manage Templates", "Manage Resources", "Edit Roles"],
  };

  const handleRoleNameChange = (value: string, key: string) => {
    const defaultPermissions = defaultRolePermissions[value as keyof typeof defaultRolePermissions] || [];
    
    const updatedDataSource = dataSource.map((row) =>
      row.key === key 
        ? { 
            ...row, 
            roleName: value,
            permissions: defaultPermissions
          } 
        : row
    );
    updateFormData(updatedDataSource);
  };

  const columns: ColumnsType<UserRole> = [
    {
      title: t("userid"),
      dataIndex: "roleId",
      key: "roleId",
      render: (text: string, record: UserRole) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(e, record.key, "roleId")}
          suffix={
            <GrChapterAdd
              onClick={() => showAlternateModal(record.key, text)}
            />
          }
        />
      ),
    },
    {
      title: t("username"),
      dataIndex: "roleName",
      key: "roleName",
      render: (text: string, record: UserRole) => (
        <Select
          style={{ width: "100%" }}
          placeholder="Select role"
          value={text}
          onChange={(value) => handleRoleNameChange(value, record.key)}
          options={roleNameOptions.map((role) => ({
            label: role,
            value: role,
          }))}
        />
      ),
    },
    {
      title: t("permissions"),
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string[], record: UserRole) => (
        <Select
          style={{ width: "100%" }}
          mode="multiple"
          placeholder="Select permissions"
          value={permissions}
          onChange={(value) => handlePermissionsChange(value, record.key)}
          options={permissionOptions.map((permission) => ({
            label: permission,
            value: permission,
          }))}
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

      {/* User Modal */}
      <Modal
        title={t("selectUser")}
        open={isUserVisible}
        onCancel={handleCancel}
        width={1200}
        footer={null}
      >
        <Table
          style={{ overflow: "auto" }}
          onRow={(record) => ({
            onDoubleClick: () => handleUserOk(record),
          })}
          columns={UserColumn}
          dataSource={userData}
          rowKey="user"
          pagination={{ pageSize: 6 }}
        />
      </Modal>
    </div>
  );
};

export default LineClearanceUserRolesDataTable;
