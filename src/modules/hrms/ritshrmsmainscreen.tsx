"use client";

import CommonAppBar from "@components/CommonAppBar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, Badge, Avatar, Col, Row } from "antd";
import { BellOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import styles from "../hrms/styles/hrms.module.css";
import DashboardScreen from "./dashboardScreen/dashboardscreen";
import EmployeeDashboard from "./employeeScreen/employeelist";
import CalenderScreen from "./calenderScreen/calenderScreen";
import PayrollScreen from "./payrollScreen/PayrollScreen";

const RitsHrmsMain: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>("light");
  const [notifications, setNotifications] = useState<number>(5); // Example notification count

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const items = [
    {
      key: "1",
      label: "Dashboard",
      children: <DashboardScreen />,
    },
    {
      key: "2",
      label: "Employees",
      children: <EmployeeDashboard />,
    },
    {
      key: "3",
      label: "Calendar",
      children: <CalenderScreen />,
    },
    {
      key: "4",
      label: "PaySlip",
      children: <PayrollScreen />,
    },
    {
      key: "5",
      label: "Organization",
      children: "",
    },
  ];

  // Right container component (for search and notification icons)
  const RightContainer = () => (
    <div className={styles.rightContainer}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 14, fontWeight: 600}}>
          Rajasurya R
        </span>
        <span
          style={{
            fontSize: 10,
            color: "#8c8c8c",
            marginLeft: 4,
          }}
        >
          R2013080
        </span>
      </div>
      <Avatar style={{ backgroundColor: "#1890ff" }}>RS</Avatar>
      {/* Notification Icon with Count */}
      <div className={styles.iconButton}>
        <Badge count={notifications} offset={[5, 0]} className="ant-badge">
          <BellOutlined style={{ fontSize: 22, color: "#595959" }} />
        </Badge>
      </div>

      {/* Theme Toggle Icon */}
      <div
        onClick={handleThemeToggle}
        className={`${styles.iconButton} ${styles.themeToggle}`}
      >
        {theme === "light" ? <SunOutlined /> : <MoonOutlined />}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.container} data-theme={theme}>
        <CommonAppBar
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("RITS HRMS")}
          onSiteChange={null}
          onSearchChange={() => {}}
        />

        <div className={styles.header}>
          <Tabs
            size="small"
            defaultActiveKey="1"
            items={items}
            tabPosition="top"
            tabBarExtraContent={<RightContainer />}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>
      </div>
    </>
  );
};

export default RitsHrmsMain;
