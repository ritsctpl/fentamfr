import React, { useState, useRef } from "react";
import { Table, Input, Button, Tooltip, Space, Tag, Modal, Select } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import {
  SearchOutlined,
  FilePdfOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  MdCancel,
  MdCheckCircle,
  MdPending,
  MdRateReview,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import styles from "../styles/CommonTab.module.css";

interface DataRow {
  [key: string]: string | number;
  documentName: string;
  createdBy: string;
  status: string;
  view: string;
}

interface CommonTableProps {
  data: DataRow[];
  onRowSelect?: (row: DataRow) => void;
  onApprove?: (row: DataRow, nextGroup: string, nextUser: string) => void;
  onReject?: (row: DataRow) => void;
  onView?: (row: DataRow) => void;
}

const CommonTable: React.FC<CommonTableProps> = ({
  data,
  onRowSelect,
  onApprove,
  onReject,
  onView,
}) => {
  const { t } = useTranslation();
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [selectedNextGroup, setSelectedNextGroup] = useState<string>("");
  const [selectedNextUser, setSelectedNextUser] = useState<string>("");
  const [recordToApprove, setRecordToApprove] = useState<DataRow | null>(null);
  const searchInput = useRef<HTMLInputElement | null>(null);

  // Dummy data for groups and users - replace with actual data
  const groups = [
    { value: "group1", label: "group A" },
    { value: "group2", label: "group B" },
    { value: "group3", label: "group C" },
  ];

  const users = [
    { value: "user1", label: "user 1" },
    { value: "user2", label: "user 2" },
    { value: "user3", label: "user 3" },
  ];

  const handleApproveClick = (record: DataRow) => {
    setRecordToApprove(record);
    setSelectedNextGroup(groups[0].value);
    setSelectedNextUser(users[0].value);
    setIsApproveModalVisible(true);
  };

  const handleRejectClick = (record: DataRow) => {
    Modal.confirm({
      title: t("Confirm Rejection"),
      content: (
        <p>
          Are you sure you want to reject this document? It will be sent back to{" "}
          <span style={{ fontWeight: "bolder" }}>{record.createdBy}</span> for
          review.
        </p>
      ),
      okText: t("Yes, Reject"),
      cancelText: t("No, Cancel"),
      onOk() {
        if (onReject) {
          onReject(record);
        }
      },
    });
  };

  const handleModalOk = () => {
    if (recordToApprove && onApprove) {
      onApprove(recordToApprove, selectedNextGroup, selectedNextUser);
    }
    setIsApproveModalVisible(false);
    setSelectedNextGroup("");
    setSelectedNextUser("");
    setRecordToApprove(null);
  };

  const handleModalCancel = () => {
    setIsApproveModalVisible(false);
    setSelectedNextGroup("");
    setSelectedNextUser("");
    setRecordToApprove(null);
  };

  const handleRowClick = (row: DataRow) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row);
    }
  };

  const handleViewDocument = (record: DataRow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(record);
    }
  };

  const getColumnSearchProps = (
    dataIndex: string
  ): Partial<ColumnType<DataRow>> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
          >
            Search
          </Button>
          <Button onClick={() => clearFilters?.()} size="small">
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
  });

  const columns: ColumnsType<DataRow> = [
    ...Object.keys(data[0] || {})
      .filter(
        (column) =>
          column !== "action" &&
          column !== "nextGroup" &&
          column !== "nextUser" &&
          column !== "type" &&
          column !== "pdfUrl"
      )
      .map((column): ColumnType<DataRow> => {
        if (column === "view") {
          return {
            title: t("view"),
            dataIndex: column,
            key: column,
            align: "center" as const,
            render: (text: string, record: DataRow) => (
              <Tooltip title={`View ${text}`}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    // color: "#1890ff",
                  }}
                  onClick={(e) => handleViewDocument(record, e)}
                >
                  <EyeOutlined style={{ fontSize: "16px" }} />
                  <span>{text}</span>
                </div>
              </Tooltip>
            ),
          };
        }

        if (column === "status") {
          return {
            title: t(column),
            dataIndex: column,
            key: column,
            align: "center" as const,
            render: (text: string) => {
              const statusConfig: {
                [key: string]: { color: string; icon: React.ReactNode };
              } = {
                "In-Review": {
                  color: "#faad14",
                  icon: <MdRateReview style={{ fontSize: "20px" }} />,
                },
                Approved: {
                  color: "#52c41a",
                  icon: <MdCheckCircle style={{ fontSize: "20px" }} />,
                },
                Rejected: {
                  color: "#ff4d4f",
                  icon: <MdCancel style={{ fontSize: "20px" }} />,
                },
                Pending: {
                  color: "#1890ff",
                  icon: <MdPending style={{ fontSize: "20px" }} />,
                },
              };

              const config = statusConfig[text] || {
                color: "#d9d9d9",
                icon: null,
              };

              return (
                <Tooltip title={text}>
                  <div
                    style={{
                      color: config.color,
                      backgroundColor: `${config.color}15`,
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      margin: "0 auto",
                    }}
                  >
                    {config.icon}
                  </div>
                </Tooltip>
              );
            },
          };
        }

        return {
          title: t(column),
          dataIndex: column,
          key: column,
          ...getColumnSearchProps(column),
        };
      }),
    {
      title: t("Actions"),
      key: "actions",
      align: "center" as const,
      render: (_, record: DataRow) => {
        const isDisabled =
          record.status === "Approved" || record.status === "Rejected";
        return (
          <Space size="small">
            <Tooltip title={isDisabled ? "Already Approved" : "Approve"}>
              <Button
                type="text"
                icon={
                  <MdCheckCircle
                    style={{ color: isDisabled ? "#d9d9d9" : "#52c41a" }}
                  />
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveClick(record);
                }}
                disabled={isDisabled}
              />
            </Tooltip>
            <Tooltip title={isDisabled ? "Already Rejected" : "Reject"}>
              <Button
                type="text"
                icon={
                  <MdCancel
                    style={{ color: isDisabled ? "#d9d9d9" : "#ff4d4f" }}
                  />
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectClick(record);
                }}
                disabled={isDisabled}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Table
        className={styles.table}
        dataSource={data}
        columns={columns}
        rowKey={(record) => record.documentName}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: record === selectedRow ? styles.selectedRow : "",
          style: { fontSize: "12px" },
        })}
        pagination={false}
        scroll={{ y: "calc(100vh - 250px)" }}
        size="small"
        bordered={false}
      />

      <Modal
        title={t("Approve Document")}
        open={isApproveModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t("Approve")}
        cancelText={t("Cancel")}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>{t("Move to Next Group")}:</div>
          <Select
            style={{ width: "100%" }}
            placeholder={t("Select next group")}
            options={groups}
            value={selectedNextGroup}
            onChange={(value) => setSelectedNextGroup(value)}
          />
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>{t("Move to Next User")}:</div>
          <Select
            style={{ width: "100%" }}
            placeholder={t("Select next user")}
            options={users}
            value={selectedNextUser}
            onChange={(value) => setSelectedNextUser(value)}
          />
        </div>
      </Modal>
    </>
  );
};

export default CommonTable;
