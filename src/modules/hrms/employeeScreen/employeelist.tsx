/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Input, Button, Card, Avatar, Select, Badge, Tag } from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
  UserOutlined,
  BranchesOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import styles from "../employeeScreen/employeelist.module.css";

// EmployeeCard Component
const EmployeeCard = ({ employee }) => {
  const isActive = employee.status === "active";

  return (
    <Card
      className={styles.employeeCard}
      hoverable
    >
      {/* Status Tag */}
      <Tag 
        color={isActive ? "success" : "default"} 
        className={styles.statusTag}
      >
        {isActive ? "Active" : "Inactive"}
      </Tag>

      {/* Profile Image */}
      <Avatar
        size={64}
        src={employee.image || "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"}
        className={styles.avatar}
      />

      {/* Basic Info */}
      <div className={styles.basicInfo}>
        <h4>{employee.name}</h4>
        <p>{employee.role}</p>
      </div>

      {/* Employee Details */}
      <div className={styles.details}>
        <div className={styles.detailRow}>
          <UserOutlined />
          <span>#{employee.id}</span>
        </div>
        <div className={styles.detailRow}>
          <TeamOutlined />
          <span>Managerial</span>
        </div>
        <div className={styles.detailRow}>
          <ClockCircleOutlined />
          <span>Full-time</span>
        </div>
        <div className={styles.detailRow}>
          <MailOutlined />
          <span>{employee.email}</span>
        </div>
        <div className={styles.detailRow}>
          <PhoneOutlined />
          <span>{employee.phone}</span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <span>Joined at {employee.joinDate}</span>
      </div>
    </Card>
  );
};

// Main Employee Dashboard Component
const EmployeeDashboard = () => {
  const employees = [
    {
      id: "EMP01",
      name: "Bagus Fikri",
      role: "CEO",
      email: "bagusfikri@gmail.com",
      phone: "+62 123 123 123",
      joinDate: "29 Oct, 2020",
      status: "active",
    },
    {
      id: "EMP02",
      name: "Ihdiazin",
      role: "Illustrator",
      email: "ihdiazin@gmail.com",
      phone: "(410) 768 082 716",
      joinDate: "1 Feb, 2019",
      status: "inactive",
    },
    {
      id: "EMP03",
      name: "Mufti Hidayat",
      role: "Project Manager",
      email: "mufti@gmail.com",
      phone: "(63) 130 689 256",
      joinDate: "1 Feb, 2021",
      status: "active",
    },
    {
      id: "EMP04",
      name: "Fauzan Ardhiansyah",
      role: "UI Designer",
      email: "hefaozan@gmail.com",
      phone: "(64) 630 613 343",
      joinDate: "21 Sep, 2018",
      status: "inactive",
    },
  ];

  // Handle change for filter select dropdowns
  const handleFilterChange = (value) => {
    console.log(value);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerTitle}>
          <h1>Employee</h1>
          <div className={styles.employeeCount}>
            <span className={styles.active}>• Active 28</span>
            <span className={styles.inactive}>• Inactive 4</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          {/* <Button icon={<UploadOutlined />}>Import</Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Employee
          </Button> */}
        </div>
      </div>

      <div className={styles.dashboardToolbar}>
        <div className={styles.searchFilters}>
          <Input
            placeholder="Search"
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Select
            defaultValue="Team"
            style={{ width: 120 }}
            onChange={handleFilterChange}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="managerial">
              <UserOutlined /> Managerial
            </Select.Option>
            <Select.Option value="technical">
              <BranchesOutlined /> Technical
            </Select.Option>
            <Select.Option value="support">
              <UserOutlined /> Support
            </Select.Option>
          </Select>

          <Select
            defaultValue="Status"
            style={{ width: 120 }}
            onChange={handleFilterChange}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>

          <Select
            defaultValue="Role"
            style={{ width: 120 }}
            onChange={handleFilterChange}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="ceo">CEO</Select.Option>
            <Select.Option value="manager">Manager</Select.Option>
            <Select.Option value="developer">Developer</Select.Option>
          </Select>

          <Select
            defaultValue="Advanced Filter"
            style={{ width: 160 }}
            onChange={handleFilterChange}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="all">All Employees</Select.Option>
            <Select.Option value="trainee">Trainee</Select.Option>
            <Select.Option value="full-time">Full-time</Select.Option>
          </Select>
        </div>

        <div className={styles.viewOptions}>
          <Button>
            <SwapOutlined /> Transfer Employee
          </Button>
          <Button icon={<AppstoreOutlined />} style={{ color: '#1a237e', borderColor: '#1a237e', backgroundColor: '#f8fafc' }} />
          <Button icon={<BarsOutlined />} />
        </div>
      </div>

      <div className={styles.employeesGrid}>
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
