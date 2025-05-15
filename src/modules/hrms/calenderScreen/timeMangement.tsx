import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./style/timemangement.module.css";
import {
  Button,
  Card,
  Checkbox,
  Drawer,
  Input,
  message,
  Select,
  Table,
  Tag,
} from "antd";
import {
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
const TimeManagementScreen = () => {
  const [date, setDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<{
    [key: string]: string;
  }>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  // Updated dummy data structure
  const dummyTimeData = {
    timeEntries: [
      {
        entrydate: "2024-11-12",
        hours: 6,
        status: "Approved",
      },
      {
        entrydate: "2024-11-14",
        hours: 9,
        status: "Pending",
      },
    ],
  };

  const projectData = [
    {
      project_id: "1",
      project_name: "Project A",
      modules: [
        { module_id: "1", module_name: "Module A1" },
        { module_id: "2", module_name: "Module A2" },
      ],
    },
    {
      project_id: "2",
      project_name: "Project B",
      modules: [
        { module_id: "1", module_name: "Module B1" },
        { module_id: "2", module_name: "Module B2" },
      ],
    },
    {
      project_id: "3",
      project_name: "Project C",
      modules: [
        { module_id: "1", module_name: "Module C1" },
        { module_id: "2", module_name: "Module C2" },
      ],
    },
  ];

  // Calculate total hours for current month
  const getCurrentMonthHours = () => {
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    return dummyTimeData.timeEntries
      .filter((entry) => {
        const entryDate = new Date(entry.entrydate);
        return (
          entryDate.getMonth() + 1 === currentMonth &&
          entryDate.getFullYear() === currentYear
        );
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getDateInfo = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Format date to match dummy data format (YYYY-MM-DD)
    const dateKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // Find matching entry in the new data structure
    const entry = dummyTimeData.timeEntries.find(
      (entry) => entry.entrydate === dateKey
    );

    if (entry) {
      return entry;
    }

    // For future dates or current date
    if (date >= today) {
      return { hours: 0, status: "No Entry" };
    }

    // For past dates without entries
    return { hours: 0, status: "Missing" };
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(timeEntries.map((entry) => entry.key));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, key]);
    } else {
      setSelectedRows(selectedRows.filter((k) => k !== key));
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={
            timeEntries.length > 0 && selectedRows.length === timeEntries.length
          }
          indeterminate={
            selectedRows.length > 0 && selectedRows.length < timeEntries.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
          style={{ display: "flex", justifyContent: "center" }}
        />
      ),
      dataIndex: "selected",
      key: "selected",
      width: "5%",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => handleSelectRow(record.key, e.target.checked)}
          style={{ display: "flex", justifyContent: "center" }}
        />
      ),
    },
    {
      title: (
        <span>
          Project <span style={{ color: "#ff4d4f" }}>*</span>
        </span>
      ),
      dataIndex: "project",
      key: "project",
      width: "35%",
      render: (_, record: any) => (
        <Select
          style={{ width: "100%" }}
          onChange={(value) => {
            setSelectedProjects((prev) => ({
              ...prev,
              [record.key]: value,
            }));
          }}
          placeholder="Select Project"
          status={showErrors && !selectedProjects[record.key] ? "error" : ""}
        >
          {projectData.map((project) => (
            <Select.Option key={project.project_id} value={project.project_id}>
              {project.project_name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: (
        <span>
          Module <span style={{ color: "#ff4d4f" }}>*</span>
        </span>
      ),
      dataIndex: "module",
      key: "module",
      width: "35%",
      render: (_, record: any) => {
        const selectedProjectId = selectedProjects[record.key];
        const selectedProject = projectData.find(
          (p) => p.project_id === selectedProjectId
        );
        const modules = selectedProject?.modules || [];

        return (
          <Select
            style={{ width: "100%" }}
            disabled={!selectedProjectId}
            placeholder="Select Module"
            status={
              showErrors && selectedProjectId && !record.module ? "error" : ""
            }
          >
            {modules.map((module) => (
              <Select.Option key={module.module_id} value={module.module_id}>
                {module.module_name}
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: (
        <span>
          Hours <span style={{ color: "#ff4d4f" }}>*</span>
        </span>
      ),
      dataIndex: "hours",
      key: "hours",
      width: "15%",
      render: (_, record: any) => (
        <Input
          type="number"
          style={{ width: "100%" }}
          required
          placeholder="Hours"
          status={showErrors && !record.hours ? "error" : ""}
        />
      ),
    },
  ];

  const handleDateClick = (value: Date) => {
    setSelectedDate(value);
    setIsDrawerOpen(true);
  };

  const handleInsert = () => {
    setShowErrors(false);
    setTimeEntries([
      ...timeEntries,
      {
        key: timeEntries.length,
        project: "",
        module: "",
        hours: "",
      },
    ]);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateInfo = getDateInfo(date);

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Approved":
          return "success";
        case "Pending":
          return "warning";
        case "Rejected":
          return "error";
        case "Missing":
          return "#e6e6e6";
        case "No Entry":
          return "default";
        default:
          return "default";
      }
    };

    return (
      <div className={styles.tileContent}>
        <div className={styles.hours}>{dateInfo.hours}hrs</div>
        <Tag color={getStatusColor(dateInfo.status)} className={styles.status}>
          {dateInfo.status}
        </Tag>
      </div>
    );
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return { bg: "#f6ffed", border: "#b7eb8f", tagColor: "success" };
      case "Pending":
        return { bg: "#fff7e6", border: "#ffd591", tagColor: "warning" };
      case "Rejected":
        return { bg: "#fff1f0", border: "#ffa39e", tagColor: "error" };
      case "Missing":
        return { bg: "#f5f5f5", border: "#d9d9d9", tagColor: "default" };
      case "No Entry":
        return { bg: "#ffffff", border: "#f0f0f0", tagColor: "default" };
      default:
        return { bg: "#ffffff", border: "#f0f0f0", tagColor: "default" };
    }
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateInfo = getDateInfo(date);
    const colors = getStatusColor(dateInfo.status);
    return `${styles.customTile} ${styles[dateInfo.status]}`;
  };

  const timeEntryHeaderStyles = {
    textAlign: "center" as const,
    padding: "16px 0",
    marginBottom: "24px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
    borderRadius: "8px",
  };

  const timeEntryTitleStyles = {
    margin: 0,
    fontSize: "24px",
    color: "#1890ff",
    fontWeight: 600,
  };

  const timeEntrySubtitleStyles = {
    margin: "8px 0 0",
    color: "#666",
    fontSize: "14px",
  };

  return (
    <div className={styles.calendarContainer}>
      <Card
        className={styles.calendarCard}
        styles={{ body: { padding: "0px" } }}
        title={
          <div
            className={styles.monthSummary}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <h3
              style={{
                margin: "8px 0",
                fontSize: "18px",
                color: "#1890ff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ClockCircleOutlined />
              Total Hours:{" "}
              <span style={{ fontWeight: "bold" }}>
                {getCurrentMonthHours()}
              </span>{" "}
              hrs
            </h3>
          </div>
        }
      >
        <Calendar
          onChange={(value: Date) => setDate(value as Date)}
          value={date}
          className={styles.calendar}
          tileContent={tileContent}
          tileDisabled={tileDisabled}
          tileClassName={tileClassName}
          minDate={new Date(1900, 0, 1)}
          maxDate={new Date(2100, 11, 31)}
          showNeighboringMonth={true}
          onClickDay={handleDateClick}
          calendarType="gregory"
        />
      </Card>

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px"
            }}
          >
            <span>Time Entry ({selectedDate?.toLocaleDateString()})</span>
            {selectedDate && (
              <Tag
                color={getStatusColor(getDateInfo(selectedDate).status).tagColor}
                style={{ fontSize: "12px" }}
              >
                {getDateInfo(selectedDate).status}
              </Tag>
            )}
          </div>
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={600}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              style={{ marginRight: 8 }}
              onClick={() => {
                setShowErrors(true);
                // Add validation logic here
                const hasErrors = timeEntries.some(
                  (entry) =>
                    !selectedProjects[entry.key] ||
                    !entry.module ||
                    !entry.hours
                );

                if (hasErrors) {
                  message.error("Please fill in all required fields");
                } else {
                  // Your submit logic here
                  setIsDrawerOpen(false);
                  setShowErrors(false);
                }
              }}
            >
              Submit Entry
            </Button>
            <Button
              onClick={() => {
                setIsDrawerOpen(false);
                setShowErrors(false);
              }}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div className={styles.timeEntryHeader}>
          <div className={styles.timeStats}>
            <div className={styles.timeBlock}>
              <LoginOutlined className={styles.timeIcon} style={{ fontSize: "16px" }} />
              <div className={styles.timeLabel} style={{ fontSize: "12px" }}>Sign In</div>
              <h3 className={styles.timeValue} style={{ fontSize: "14px" }}>09:00 AM</h3>
            </div>

            <div className={`${styles.timeBlock} ${styles.timeBlockCenter}`}>
              <ClockCircleOutlined className={styles.timeIcon} style={{ fontSize: "16px" }} />
              <div className={styles.timeLabel} style={{ fontSize: "12px" }}>Total Hours</div>
              <h3 className={`${styles.timeValue} ${styles.timeValueCenter}`} style={{ fontSize: "14px" }}>
                7 Hours
              </h3>
              <p className={styles.timeSubtitle} style={{ fontSize: "11px" }}>Working Hours Today</p>
            </div>

            <div className={styles.timeBlock}>
              <LogoutOutlined className={styles.timeIcon} style={{ fontSize: "16px" }} />
              <div className={styles.timeLabel} style={{ fontSize: "12px" }}>Sign Off</div>
              <h3 className={styles.timeValue} style={{ fontSize: "14px" }}>04:00 PM</h3>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button
            onClick={handleInsert}
            style={{
              marginRight: 8,
              background: "white",
              borderColor: "#1890ff",
              color: "#1890ff",
              fontSize: "12px"
            }}
          >
            Insert
          </Button>
          <Button
            style={{ marginRight: 8, fontSize: "12px" }}
            disabled={selectedRows.length === 0}
            onClick={() => {
              // Remove selected rows logic
              const newTimeEntries = timeEntries.filter(
                (entry) => !selectedRows.includes(entry.key)
              );
              setTimeEntries(newTimeEntries);
              setSelectedRows([]);
            }}
          >
            Remove Selected
          </Button>
          <Button
            disabled={timeEntries.length === 0}
            style={{ fontSize: "12px" }}
            onClick={() => {
              setTimeEntries([]);
              setSelectedRows([]);
            }}
          >
            Remove All
          </Button>
        </div>

        <Table
          columns={columns.map(col => ({
            ...col,
            title: typeof col.title === 'string' 
              ? <span style={{ fontSize: '13px' }}>{col.title}</span>
                : col.title,
          }))}
          dataSource={timeEntries}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            position: ["bottomRight"],
            size: "small",
          }}
          style={{ fontSize: "12px" }}
          rowClassName={(record) =>
            selectedRows.includes(record.key) ? styles.selectedRow : ""
          }
        />
      </Drawer>
    </div>
  );
};

export default TimeManagementScreen;
