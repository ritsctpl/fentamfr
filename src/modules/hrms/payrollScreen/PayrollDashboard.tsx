import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Timeline,
  Typography,
  Space,
  DatePicker,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  HistoryOutlined,
  PlusOutlined,
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import styles from "./style/payrolldashboard.module.css";
import ReactECharts from "echarts-for-react";
const { RangePicker } = DatePicker;

function PayrollDashboard() {
  const dashboardData = [
    {
      icon: <TeamOutlined className={styles.icon} />,
      title: "Total Employees",
      value: "1,234",
    },
    {
      icon: <span className={styles.icon}>₹</span>,
      title: "Payroll Processed",
      value: "₹45,678",
    },
    {
      icon: <ClockCircleOutlined className={styles.icon} />,
      title: "Pending Approvals",
      value: "12",
    },
    {
      icon: <CalendarOutlined className={styles.icon} />,
      title: "Next Payroll Date",
      value: "25 Apr",
    },
  ];

  const payRunHistory = [
    {
      month: "JAN",
      date: "31/01/2024",
      time: "14:30",
      status: "Paid",
      details: {
        employees: 145,
        hours: 23040,
        amount: "₹8,76,000",
      },
    },
    {
      month: "FEB",
      date: "28/02/2024",
      time: "15:15",
      status: "Paid",
      details: {
        employees: 142,
        hours: 22720,
        amount: "₹8,65,000",
      },
    },
    {
      month: "MAR",
      date: "30/03/2024",
      time: "20:15",
      status: "Paid",
      details: {
        employees: 142,
        hours: 22720,
        amount: "₹8,65,000",
      },
    },
    {
      month: "APR",
      date: "31/04/2024",
      time: "19:15",
      status: "Paid",
      details: {
        employees: 142,
        hours: 22720,
        amount: "₹8,65,000",
      },
    },
    {
      month: "MAY",
      date: "30/05/2024",
      time: "16:15",
      status: "Paid",
      details: {
        employees: 142,
        hours: 22720,
        amount: "₹8,65,000",
      },
    },
    {
      month: "JUN",
      date: "29/06/2024",
      time: "17:30",
      status: "Paid",
      details: {
        employees: 142,
        hours: 22720,
        amount: "₹8,65,000",
      },
    },
    // ... Add more months as needed
  ];
  const totalPayRollExpence = {
    title: "Total Payroll Expenses Over Time",
    type: "line",
    data: [
      {
        date: "2024-01-01",
        total_expenses: 50000,
      },
      {
        date: "2024-02-01",
        total_expenses: 52000,
      },
      {
        date: "2024-03-01",
        total_expenses: 54000,
      },
      {
        date: "2024-04-01",
        total_expenses: 53000,
      },
      {
        date: "2024-05-01",
        total_expenses: 55000,
      },
      {
        date: "2024-06-01",
        total_expenses: 57000,
      },
      {
        date: "2024-07-01",
        total_expenses: 59000,
      },
      {
        date: "2024-08-01",
        total_expenses: 60000,
      },
      {
        date: "2024-09-01",
        total_expenses: 62000,
      },
      {
        date: "2024-10-01",
        total_expenses: 63000,
      },
      {
        date: "2024-11-01",
        total_expenses: 65000,
      },
    ],
  };

  const getChartOptions = () => ({
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        return `${
          data.name
        }<br/><span style="color: #6366f1; font-weight: bold">₹${data.value.toLocaleString()}</span>`;
      },
    },
    grid: {
      left: "5%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: totalPayRollExpence.data.map((item) => {
        const date = new Date(item.date);
        return date.toLocaleString("default", { month: "short" });
      }),
      name: "Months",
      nameLocation: "middle",
      nameGap: 35,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `₹${value.toLocaleString()}`,
      },
      name: "Amount (₹)",
      nameLocation: "middle",
      nameGap: 60,
      nameRotate: 90,
    },
    series: [
      {
        data: totalPayRollExpence.data.map((item) => item.total_expenses),
        type: "line",
        smooth: true,
        lineStyle: {
          color: "#6366f1",
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(99, 102, 241, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(99, 102, 241, 0.05)",
              },
            ],
          },
        },
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: "#6366f1",
        },
      },
    ],
  });

  const getSalaryDistributionOptions = () => ({
    tooltip: {
      trigger: "axis",
      formatter: "{b}: {c} employees",
    },
    grid: {
      left: "5%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: employeeSalaryDistribution.data.map((item) => item.salary_band),
      axisLabel: {
        rotate: 0,
        interval: 0,
        align: "center",
        overflow: "break",
      },
      name: "Salary Band",
      nameLocation: "middle",
      nameGap: 35,
    },
    yAxis: {
      type: "value",
      name: "Number of Employees",
      nameLocation: "middle",
      nameGap: 30,
      nameRotate: 90,
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "rgba(99, 102, 241, 0.1)",
        },
      },
    },
    series: [
      {
        data: employeeSalaryDistribution.data.map(
          (item) => item.number_of_employees
        ),
        type: "bar",
        barWidth: "40%",
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "#6366f1",
              },
              {
                offset: 1,
                color: "rgba(99, 102, 241, 0.3)",
              },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  });

  const getDeductionsChartOptions = () => ({
    tooltip: {
      trigger: "item",
      formatter: "{b}: ₹{c} ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: 20,
      left: "center",
      padding: [15, 0, 0, 0],
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "16",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: deductionsBreakdown.data.map((item) => ({
          value: item.amount,
          name: item.deduction_type,
        })),
        color: [
          {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#6366f1'
            }, {
              offset: 1,
              color: 'rgba(99, 102, 241, 0.3)'
            }]
          },
          {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#10B981'
            }, {
              offset: 1,
              color: 'rgba(16, 185, 129, 0.3)'
            }]
          },
          {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#F59E0B'
            }, {
              offset: 1,
              color: 'rgba(245, 158, 11, 0.3)'
            }]
          },
          {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#EF4444'
            }, {
              offset: 1,
              color: 'rgba(239, 68, 68, 0.3)'
            }]
          }
        ]
      },
    ],
  });

  const employeeSalaryBreakdown = {
    title: "Employee Salary Breakdown",
    data: [
      {
        employee_id: "E001",
        employee_name: "John Doe",
        position: "Software Engineer",
        basic_salary: 60000,
        allowances: 5000,
        deductions: 2000,
        bonuses: 3000,
        net_salary: 66000,
      },
      {
        employee_id: "E002",
        employee_name: "Jane Smith",
        position: "HR Manager",
        basic_salary: 70000,
        allowances: 7000,
        deductions: 2500,
        bonuses: 5000,
        net_salary: 73500,
      },
      {
        employee_id: "E003",
        employee_name: "Alice Brown",
        position: "Marketing Lead",
        basic_salary: 65000,
        allowances: 4000,
        deductions: 1500,
        bonuses: 4000,
        net_salary: 67000,
      },
      {
        employee_id: "E004",
        employee_name: "Bob White",
        position: "Accountant",
        basic_salary: 55000,
        allowances: 4000,
        deductions: 1000,
        bonuses: 2000,
        net_salary: 59000,
      },
      {
        employee_id: "E005",
        employee_name: "Charlie Green",
        position: "Project Manager",
        basic_salary: 80000,
        allowances: 8000,
        deductions: 3000,
        bonuses: 6000,
        net_salary: 86000,
      },
    ],
  };
  const employeeSalaryDistribution = {
    title: "Employee Salary Distribution",
    type: "bar",
    data: [
      {
        salary_band: "Below ₹40,000",
        number_of_employees: 5,
      },
      {
        salary_band: "₹40,000 - ₹60,000",
        number_of_employees: 10,
      },
      {
        salary_band: "₹60,000 - ₹80,000",
        number_of_employees: 15,
      },
      {
        salary_band: "₹80,000 - ₹100,000",
        number_of_employees: 8,
      },
      {
        salary_band: "₹100,000 and above",
        number_of_employees: 3,
      },
    ],
  };
  const deductionsBreakdown = {
    title: "Deductions Breakdown",
    type: "pie",
    data: [
      {
        deduction_type: "Taxes",
        amount: 12000,
      },
      {
        deduction_type: "PF",
        amount: 2000,
      },
      {
        deduction_type: "Insurance",
        amount: 5000,
      },
      {
        deduction_type: "Other Deductions",
        amount: 3000,
      },
    ],
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "employee_name",
      key: "employee_name",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (text: string) => (
        <span style={{ color: "#6366f1" }}>{text}</span>
      ),
    },
    {
      title: "Basic Salary",
      dataIndex: "basic_salary",
      key: "basic_salary",
      render: (value: number) => <span>₹{value.toLocaleString()}</span>,
    },
    {
      title: "Allowances",
      dataIndex: "allowances",
      key: "allowances",
      render: (value: number) => (
        <span style={{ color: "#10B981" }}>₹{value.toLocaleString()}</span>
      ),
    },
    {
      title: "Deductions",
      dataIndex: "deductions",
      key: "deductions",
      render: (value: number) => (
        <span style={{ color: "#EF4444" }}>₹{value.toLocaleString()}</span>
      ),
    },
    {
      title: "Bonuses",
      dataIndex: "bonuses",
      key: "bonuses",
      render: (value: number) => (
        <span style={{ color: "#10B981" }}>₹{value.toLocaleString()}</span>
      ),
    },
    {
      title: "Net Salary",
      dataIndex: "net_salary",
      key: "net_salary",
      render: (value: number) => (
        <span style={{ fontWeight: 600, color: "#6366f1" }}>
          ₹{value.toLocaleString()}
        </span>
      ),
    },
  ];
  const leaveOvertimeCosts = {
    title: "Leave & Overtime Costs vs. Payroll",
    type: "stackedBar",
    data: [
      {
        month: "2024-01",
        payroll_cost: 50000,
        leave_cost: 4000,
        overtime_cost: 2000,
      },
      {
        month: "2024-02",
        payroll_cost: 52000,
        leave_cost: 3500,
        overtime_cost: 2500,
      },
      {
        month: "2024-03",
        payroll_cost: 54000,
        leave_cost: 3000,
        overtime_cost: 3000,
      },
      {
        month: "2024-04",
        payroll_cost: 53000,
        leave_cost: 4500,
        overtime_cost: 2500,
      },
      {
        month: "2024-05",
        payroll_cost: 55000,
        leave_cost: 5000,
        overtime_cost: 3000,
      },
      {
        month: "2024-06",
        payroll_cost: 57000,
        leave_cost: 4000,
        overtime_cost: 4000,
      },
      {
        month: "2024-07",
        payroll_cost: 59000,
        leave_cost: 4500,
        overtime_cost: 3500,
      },
      {
        month: "2024-08",
        payroll_cost: 60000,
        leave_cost: 4000,
        overtime_cost: 4500,
      },
      {
        month: "2024-09",
        payroll_cost: 62000,
        leave_cost: 5500,
        overtime_cost: 3500,
      },
      {
        month: "2024-10",
        payroll_cost: 63000,
        leave_cost: 6000,
        overtime_cost: 4000,
      },
      {
        month: "2024-11",
        payroll_cost: 65000,
        leave_cost: 5500,
        overtime_cost: 4500,
      },
    ],
  };

  const getLeaveOvertimeCostsOptions = () => ({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["Payroll Cost", "Leave Cost", "Overtime Cost"],
      orient: "horizontal",
      bottom: 0,
    },
    grid: {
      left: "5%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: leaveOvertimeCosts.data.map((item) => item.month),
      name: "Month",
      nameLocation: "middle",
      nameGap: 28,
    },
    yAxis: {
      type: "value",
      name: "Cost in INR (₹)",
      nameLocation: "middle",
      nameGap: 60,
      nameRotate: 90,
    },
    series: [
      {
        name: "Payroll Cost",
        type: "bar",
        stack: "total",
        data: leaveOvertimeCosts.data.map((item) => item.payroll_cost),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#6366f1'
            }, {
              offset: 1,
              color: 'rgba(99, 102, 241, 0.3)'
            }]
          }
        }
      },
      {
        name: "Leave Cost",
        type: "bar",
        stack: "total",
        data: leaveOvertimeCosts.data.map((item) => item.leave_cost),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#10B981'
            }, {
              offset: 1,
              color: 'rgba(16, 185, 129, 0.3)'
            }]
          }
        }
      },
      {
        name: "Overtime Cost",
        type: "bar",
        stack: "total",
        data: leaveOvertimeCosts.data.map((item) => item.overtime_cost),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#F59E0B'
            }, {
              offset: 1,
              color: 'rgba(245, 158, 11, 0.3)'
            }]
          }
        }
      }
    ]
  });
  const payrollSummaryByDepartment = {
    title: "Payroll Summary by Department",
    data: [
      {
        department_name: "Engineering",
        total_payroll_cost: 250000,
        number_of_employees: 25,
        average_salary_per_employee: 10000,
        overtime_costs: 15000,
      },
      {
        department_name: "Marketing",
        total_payroll_cost: 180000,
        number_of_employees: 15,
        average_salary_per_employee: 12000,
        overtime_costs: 12000,
      },
      {
        department_name: "Sales",
        total_payroll_cost: 210000,
        number_of_employees: 18,
        average_salary_per_employee: 11667,
        overtime_costs: 18000,
      },
      {
        department_name: "HR",
        total_payroll_cost: 120000,
        number_of_employees: 10,
        average_salary_per_employee: 12000,
        overtime_costs: 8000,
      },
      {
        department_name: "Finance",
        total_payroll_cost: 150000,
        number_of_employees: 12,
        average_salary_per_employee: 12500,
        overtime_costs: 10000,
      },
      {
        department_name: "IT Support",
        total_payroll_cost: 130000,
        number_of_employees: 8,
        average_salary_per_employee: 16250,
        overtime_costs: 5000,
      },
    ],
  };

  const departmentColumns = [
    {
      title: "Department Name",
      dataIndex: "department_name",
      key: "department_name",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Total Payroll Cost",
      dataIndex: "total_payroll_cost",
      key: "total_payroll_cost",
      render: (value: number) => (
        <span style={{ fontWeight: 600, color: "#6366f1" }}>
          ₹{value.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Number of Employees",
      dataIndex: "number_of_employees",
      key: "number_of_employees",
      render: (value: number) => <span>{value}</span>,
    },
    {
      title: "Average Salary per Employee",
      dataIndex: "average_salary_per_employee",
      key: "average_salary_per_employee",
      render: (value: number) => (
        <span style={{ color: "#10B981" }}>₹{value.toLocaleString()}</span>
      ),
    },
    {
      title: "Overtime Costs",
      dataIndex: "overtime_costs",
      key: "overtime_costs",
      render: (value: number) => (
        <span style={{ color: "#F59E0B" }}>₹{value.toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.topSection}>
        <div className={styles.leftSection}>
          <Row gutter={[16, 16]}>
            {dashboardData.map((item, index) => (
              <Col span={12} key={index}>
                <Card className={styles.card} bordered={false}>
                  <div className={styles.cardContent}>
                    <div className={styles.iconWrapper}>{item.icon}</div>
                    <div className={styles.textContent}>
                      <p className={styles.title}>{item.title}</p>
                      <h2 className={styles.value}>{item.value}</h2>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}

            <Col span={24}>
              <Card
                className={styles.card}
                bordered={false}
                bodyStyle={{ padding: "0" }}
                title={
                  <Space style={{ margin: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>
                      <span className={styles.icon}>₹</span> Total Payroll
                      Expenses Over Time
                    </span>
                  </Space>
                }
              >
                <ReactECharts
                  option={getChartOptions()}
                  style={{ height: "300px", width: "100%", marginTop: "-20px" }}
                />
              </Card>
            </Col>
          </Row>
        </div>
        <div className={styles.rightSection}>
          {/* <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px", gap:"10px"}}>
            <RangePicker />
          </div> */}
          <Card
            className={styles.rightCard}
            title={
              <Space>
                <HistoryOutlined
                  style={{ fontSize: "15px", color: "#6366f1" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  Pay Run History Report
                </span>
              </Space>
            }

          >
            <div className={styles.timelineContainer}>
              <Timeline
                mode="left"
                items={payRunHistory.map((item) => ({
                  dot: <div className={styles.monthDot}>{item.month}</div>,
                  label: (
                    <div
                      className={styles.timelineLabel}
                      style={{ marginRight: "12px" }}
                    >
                      <div className={styles.date} style={{}}>
                        {item.date}
                      </div>
                      <div className={styles.time}>
                        {item.time} - {item.status}
                      </div>
                    </div>
                  ),
                  children: (
                    <Card size="small" className={styles.timelineCard}>
                      <div className={styles.timelineDetails}>
                        <div className={styles.detailItem}>
                          <Typography.Text type="secondary">
                            Employees
                          </Typography.Text>
                          <div>{item.details.employees}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <Typography.Text type="secondary">
                            Total Hours
                          </Typography.Text>
                          <div>{item.details.hours}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <Typography.Text type="secondary">
                            Amount Paid
                          </Typography.Text>
                          <div>{item.details.amount}</div>
                        </div>
                      </div>
                    </Card>
                  ),
                }))}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <Card
          className={styles.card}
          bordered={false}
          title={
            <Space>
              <TeamOutlined style={{ fontSize: "15px", color: "#6366f1" }} />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                Employee Salary Breakdown
              </span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={employeeSalaryBreakdown.data}
            pagination={{ pageSize: 5 }}
            rowKey="employee_id"
            className={styles.salaryTable}
          />
        </Card>
        <div className={styles.chartsSection} style={{ marginTop: "16px" }}>
          <Row gutter={[16, 16]}>
            <Col span={14}>
              <Card
                className={styles.card}
                bordered={false}
                bodyStyle={{ padding: "0" }}
                title={
                  <Space style={{ margin: 0 }}>
                    <TeamOutlined
                      style={{ fontSize: "15px", color: "#6366f1" }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>
                      {employeeSalaryDistribution.title}
                    </span>
                  </Space>
                }
              >
                <ReactECharts
                  option={getSalaryDistributionOptions()}
                  style={{ height: "300px", width: "100%", marginTop: "-20px" }}
                />
              </Card>
            </Col>
            <Col span={10}>
              <Card
                className={styles.card}
                bordered={false}
                bodyStyle={{ padding: "0" }}
                title={
                  <Space style={{ margin: 0 }}>
                    <TeamOutlined
                      style={{ fontSize: "15px", color: "#6366f1" }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>
                      {deductionsBreakdown.title}
                    </span>
                  </Space>
                }
              >
                <ReactECharts
                  option={getDeductionsChartOptions()}
                  style={{ height: "300px", width: "100%", marginTop: "-20px" }}
                />
              </Card>
            </Col>
          </Row>
        </div>
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={12}>
            <Card
              className={styles.card}
              bordered={false}
              bodyStyle={{ padding: "0", height: "100%" }}
              title={
                <Space style={{ margin: 0 }}>
                  <TeamOutlined style={{ fontSize: "15px", color: "#6366f1" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>
                    {leaveOvertimeCosts.title}
                  </span>
                </Space>
              }
            >
              <ReactECharts
                option={getLeaveOvertimeCostsOptions()}
                style={{ 
                  height: "450px", 
                  width: "100%", 
                  marginTop: "-20px" 
                }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card
              className={styles.card}
              bordered={false}
              bodyStyle={{ padding: "0", height: "100%" }}
              title={
                <Space style={{ margin: 0 }}>
                  <TeamOutlined style={{ fontSize: "15px", color: "#6366f1" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>
                    {payrollSummaryByDepartment.title}
                  </span>
                </Space>
              }
            >
              <Table
                columns={departmentColumns}
                dataSource={payrollSummaryByDepartment.data}
                pagination={{ pageSize: 5 }}
                rowKey="department_name"
                className={styles.salaryTable}
                scroll={{ y: 400 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default PayrollDashboard;
