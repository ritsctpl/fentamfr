import React from "react";
import styles from "./dashboardscreen.module.css";
import AnalyticsDashboard from "./AnalyticsDashboard";
import TileDashboard from "./TileDashboard";
import EmployeeData from "./employeeData";
// import BirthdayTimeline from "./employeeData";

const DashboardScreen = () => {
  return (
    <div className={styles.dashboardContainer}>
      <TileDashboard />
      <AnalyticsDashboard />
      <EmployeeData/>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>© Fenta, 2024 Powered By Rits</p>
    </div>
  );
};

export default DashboardScreen;
