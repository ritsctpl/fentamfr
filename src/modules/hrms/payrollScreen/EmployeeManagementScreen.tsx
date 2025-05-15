import React, { useState } from "react";
import {
  Input,
  Select,
  Space,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Typography,
  Row,
  Col,
  InputNumber,
  Descriptions,
  message,
  DatePicker,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BranchesOutlined,
  DeleteOutlined,
  UsergroupAddOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  UserOutlined,
  PlusOutlined
} from "@ant-design/icons";
import styles from "./style/employeeManagementScreen.module.css";
import type { ColumnsType } from "antd/es/table";
interface EmployeeData {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  basicSalary: number;
  allowances: {
    hra: number;
    conveyance: number;
  };
  deductions: {
    pf: number;
    taxes: number;
  };
  bankDetails: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
}

function EmployeeManagementScreen() {
  const handleFilterChange = (value) => {
    console.log(value);
  };

  // Add state for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Add message handler
  const [messageApi, contextHolder] = message.useMessage();
  const showModal = () => {
    setIsModalVisible(true);
  };
  // Add modal handlers
  const handleEditClick = (record: EmployeeData) => {
    setSelectedEmployee(record);
    form.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleSalaryClick = (record: EmployeeData) => {
    if (!record.basicSalary) {
      messageApi.open({
        type: "warning",
        content: "Salary details not available for this employee.",
        duration: 3,
      });
      return;
    }
    setSelectedEmployee(record);
    setIsSalaryModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsEditModalOpen(false);
    setIsSalaryModalOpen(false);
    form.resetFields();
  };
  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    message.success('Employee added successfully!');
    form.resetFields();
    setIsModalVisible(false);
  };
  // Update form submit handler
  const handleFormSubmit = async (values: EmployeeData) => {
    try {
      // Add your API call here
      // await updateEmployee(values);

      messageApi.open({
        type: "success",
        content: "Employee details updated successfully!",
        duration: 3,
      });

      setIsEditModalOpen(false);
      form.resetFields();

      // Refresh your table data here
      // fetchEmployees();
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Failed to update employee details. Please try again.",
        duration: 3,
      });
    }
  };
  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };
  // Update the table columns configuration
  const columns: ColumnsType<EmployeeData> = [
    {
      title: "Employee ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (text: string) => (
        <span style={{ color: "#6366f1" }}>{text}</span>
      ),
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      render: (text: string) => (
        <span style={{ color: "#6366f1" }}>{text}</span>
      ),
    },
    {
      title: "Contact",
      children: [
        {
          title: "Email",
          dataIndex: "email",
          key: "email",
          ellipsis: true,
        },
        {
          title: "Phone",
          dataIndex: "phone",
          key: "phone",
        },
      ],
    },
    {
      title: "Salary Details",
      children: [
        {
          title: "Basic",
          dataIndex: "basicSalary",
          key: "basicSalary",
          render: (value: number) => (
            <span style={{ fontWeight: 600 }}>₹{value.toLocaleString()}</span>
          ),
        },
        {
          title: "Allowances",
          children: [
            {
              title: "HRA",
              dataIndex: ["allowances", "hra"],
              key: "hra",
              render: (value: number) => (
                <span style={{ color: "#10B981" }}>
                  ₹{value.toLocaleString()}
                </span>
              ),
            },
            {
              title: "Conveyance",
              dataIndex: ["allowances", "conveyance"],
              key: "conveyance",
              render: (value: number) => (
                <span style={{ color: "#10B981" }}>
                  ₹{value.toLocaleString()}
                </span>
              ),
            },
          ],
        },
        {
          title: "Deductions",
          children: [
            {
              title: "PF",
              dataIndex: ["deductions", "pf"],
              key: "pf",
              render: (value: number) => (
                <span style={{ color: "#EF4444" }}>
                  ₹{value.toLocaleString()}
                </span>
              ),
            },
            {
              title: "Taxes",
              dataIndex: ["deductions", "taxes"],
              key: "taxes",
              render: (value: number) => (
                <span style={{ color: "#EF4444" }}>
                  ₹{value.toLocaleString()}
                </span>
              ),
            },
          ],
        },
      ],
    },
    {
      title: "Bank Details",
      children: [
        {
          title: "Account Number",
          dataIndex: ["bankDetails", "accountNumber"],
          key: "accountNumber",
        },
        {
          title: "Bank Name",
          dataIndex: ["bankDetails", "bankName"],
          key: "bankName",
        },
        {
          title: "IFSC Code",
          dataIndex: ["bankDetails", "ifscCode"],
          key: "ifscCode",
        },
      ],
    },
    {
      title: (
        <div
          style={{
            textAlign: "center",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          Actions
        </div>
      ),
      key: "actions",
      fixed: "right",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Employee">
            <EditOutlined
              style={{ color: '#6366f1', fontSize: '14px', cursor: 'pointer' }}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>
          <Tooltip title="View Salary">
            <span
              style={{ color: '#6366f1', fontSize: '14px', cursor: 'pointer' }}
              onClick={() => handleSalaryClick(record)}
            >
              ₹
            </span>
          </Tooltip>
          <Tooltip title="Delete Employee">
            <DeleteOutlined
              style={{ color: '#EF4444', fontSize: '14px', cursor: 'pointer' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Add sample data (replace with your actual data)
  const data: EmployeeData[] = [
    {
      id: "1",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "2",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "3",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "4",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "5",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "6",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "7",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "8",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    {
      id: "9",
      name: "John Doe",
      department: "Technical",
      designation: "Senior Developer",
      email: "john@example.com",
      phone: "1234567890",
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        conveyance: 5000,
      },
      deductions: {
        pf: 5000,
        taxes: 8000,
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Example Bank",
        ifscCode: "EXBK0001234",
      },
    },
    // Add more sample data as needed
  ];

  // Add modals and forms before the return statement
  const addEmployeeModal = (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: '#6366f1' }} />
          <span>Add New Employee</span>
        </div>
      }
      open={isModalVisible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      width={700}
      okText="Add Employee"
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
          border: "none",
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="Emp_ID"
            label="Employee ID"
            rules={[{ required: true, message: 'Please enter Employee ID' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Enter Employee ID" />
          </Form.Item>

          <Form.Item
            name="userName"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="Software Engineer">Software Engineer</Select.Option>
              <Select.Option value="Trainee Engineer">Trainee Engineer</Select.Option>
              <Select.Option value="SAP Developer">SAP Developer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reportingManager"
            label="Reporting Manager"
            rules={[{ required: true, message: 'Please enter reporting manager' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter reporting manager" />
          </Form.Item>

          <Form.Item
            name="dateOfJoin"
            label="Date of Joining"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="employmentStatus"
            label="Employment Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="Trainee">Trainee</Select.Option>
              <Select.Option value="Full-Time">Full Time</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Select department">
              <Select.Option value="Fenta MES">Fenta MES</Select.Option>
              <Select.Option value="SAP">SAP</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="salary_range"
            label="Salary Range"
            rules={[{ required: true, message: 'Please enter salary range' }]}
          >
            <Input prefix={<span>₹</span>} placeholder="Enter salary range" />
          </Form.Item>

          <Form.Item
            name="probationPeriod"
            label="Probation Period"
            rules={[{ required: true, message: 'Please select probation period' }]}
          >
            <Select placeholder="Select probation period">
              <Select.Option value="3 months">3 Months</Select.Option>
              <Select.Option value="6 months">6 Months</Select.Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
  const editModal = (
    <Modal
      title={
        <Space>
          <EditOutlined style={{ color: "#6366f1" }} />
          <span>Edit Employee Details</span>
        </Space>
      }
      open={isEditModalOpen}
      onCancel={handleModalCancel}
      footer={null}
      width={800}
      centered
      bodyStyle={{
        padding: "24px",
        paddingBottom: 0, // Remove bottom padding to avoid gap
        height: "calc(100vh - 200px)", // Set fixed height for modal
        overflow: "hidden", // Prevent modal body from scrolling
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        className={styles.employeeForm}
        initialValues={selectedEmployee}
      >
        <div className={styles.formContent}>
          <Row gutter={16}>
            <Col span={12}>
              <Typography.Title level={5}>Employee Details</Typography.Title>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item
                name="id"
                label="Employee ID"
                rules={[{ required: true }]}
              >
                <Input prefix={<IdcardOutlined />} />
              </Form.Item>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="technical">Technical</Select.Option>
                  <Select.Option value="managerial">Managerial</Select.Option>
                  <Select.Option value="support">Support</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="designation"
                label="Designation"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Typography.Title level={5}>Contact Information</Typography.Title>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Typography.Title level={5}>Salary Structure</Typography.Title>
              <Form.Item
                name="basicSalary"
                label="Basic Salary"
                rules={[{ required: true }]}
              >
                <InputNumber
                  prefix="₹"
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  // parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
              <Form.Item label="Allowances">
                <Input.Group>
                  <Form.Item name={["allowances", "hra"]} label="HRA">
                    <InputNumber
                      prefix="₹"
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      // parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                      min={0}
                    />
                  </Form.Item>
                  <Form.Item
                    name={["allowances", "conveyance"]}
                    label="Conveyance"
                  >
                    <InputNumber prefix="₹" style={{ width: "100%" }} />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Typography.Title level={5}>Bank Details</Typography.Title>
              <Form.Item
                name={["bankDetails", "accountNumber"]}
                label="Account Number"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["bankDetails", "bankName"]}
                label="Bank Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["bankDetails", "ifscCode"]}
                label="IFSC Code"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className={styles.formFooter}>
          <Button onClick={handleModalCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );

  const salaryModal = (
    <Modal
      title={
        <Space>
          <span style={{ fontWeight: 600 }}>Salary Details</span>
        </Space>
      }
      open={isSalaryModalOpen}
      onCancel={handleModalCancel}
      footer={[
        <Button key="close" onClick={handleModalCancel}>
          Close
        </Button>,
      ]}
      width={600}
      centered
    >
      {selectedEmployee && (
        <Card bordered={false}>
          <Descriptions column={1}>
            <Descriptions.Item label="Basic Salary">
              <Typography.Text strong>
                ₹{selectedEmployee.basicSalary?.toLocaleString("en-IN")}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="HRA">
              <Typography.Text style={{ color: "#059669" }}>
                ₹{selectedEmployee.allowances?.hra?.toLocaleString("en-IN")}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Conveyance">
              <Typography.Text style={{ color: "#059669" }}>
                ₹
                {selectedEmployee.allowances?.conveyance?.toLocaleString(
                  "en-IN"
                )}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="PF Deduction">
              <Typography.Text style={{ color: "#DC2626" }}>
                -₹{selectedEmployee.deductions?.pf?.toLocaleString("en-IN")}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tax Deduction">
              <Typography.Text style={{ color: "#DC2626" }}>
                -₹{selectedEmployee.deductions?.taxes?.toLocaleString("en-IN")}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Net Salary">
              <Typography.Text strong style={{ fontSize: "16px" }}>
                {/* ₹{calculateNetSalary(selectedEmployee).toLocaleString('en-IN')} */}
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </Modal>
  );

  // Add helper function to calculate net salary
  const calculateNetSalary = (employee: EmployeeData) => {
    const { basicSalary, allowances, deductions } = employee;
    return (
      basicSalary +
      (allowances?.hra || 0) +
      (allowances?.conveyance || 0) -
      (deductions?.pf || 0) -
      (deductions?.taxes || 0)
    );
  };

  // Add button style
  const addEmployeeButton = (
    <Button  
      type="primary" 
      icon={<PlusOutlined style={{ color: "#ffffff" }} />}
      onClick={showModal}
      style={{
        background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
        border: "none", 
        boxShadow: "0 4px 12px rgba(26, 35, 126, 0.15)",
        color: "#ffffff"
      }}
    >
      Add Employee
    </Button>
  );

  return (
    <div className={styles.container}>
      {contextHolder}
      {addEmployeeModal}
      <div className={styles.dashboardToolbar}>
        <div className={styles.searchFilters}>
          <Input
            placeholder="Employee Name/ID"
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Select
            defaultValue="Department"
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
            defaultValue="Designation"
            style={{ width: 120 }}
            onChange={handleFilterChange}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </div>
        {addEmployeeButton}
      </div>
      <div className={styles.fullWidthCard}>
        <Card
          className={styles.card}
          bordered={false}
          bodyStyle={{ padding: "0" }}
          style={{ boxShadow: 'none' }}
          title={
            <Space style={{ margin: 0 }}>
              <UsergroupAddOutlined
                style={{ fontSize: "15px", color: "#6366f1" }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                Employee Management Screen
              </span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowKey="id"
            style={{ minWidth: '100%' }}
            className={styles.customTable}
          />
        </Card>
      </div>
      {editModal}
      {salaryModal}
    </div>
  );
}

export default EmployeeManagementScreen;
