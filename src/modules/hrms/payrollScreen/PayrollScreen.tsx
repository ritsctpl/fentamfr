import React from 'react';
import {Tabs } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styles from './style/payrollscreen.module.css';
import PayrollDashboard from './PayrollDashboard';
import EmployeeManagementScreen from './EmployeeManagementScreen';
import PayrollProcessingScreen from './PayrollProcessingScreen';

function PayrollScreen() {
  const items = [
    {
      label: "Dashboard",
      key: "1",
      icon: <DashboardOutlined />,
      children: <PayrollDashboard />  ,
    },
    {
      label: "Employee Management",
      key: "2",
      icon: <TeamOutlined />,
      children: <EmployeeManagementScreen />,
    },
    {
      label: "Payroll Processing",
      key: "3",
      icon: <span>₹</span>,
      children: <PayrollProcessingScreen />,
    },
    {
      label: "Payslip Generation",
      key: "4",
      icon: <FileTextOutlined />,
      children: <div>Payslip Generation Content</div>,
    },
    {
      label: "Reports",
      key: "5",
      icon: <BarChartOutlined />,
      children: <div>Reports Content</div>,
    },
    {
      label: "Settings",
      key: "6",
      icon: <SettingOutlined />,
      children: <div>Settings Content</div>,
    },
  ];

  return (
    <div className={styles.payrollContainer}>
      <Tabs
        size="small"
        tabPosition="left"
        items={items}
        className={styles.tabs}
        defaultActiveKey="1"
        destroyInactiveTabPane={true}
      />
    </div>
  );
}

export default PayrollScreen;