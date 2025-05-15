import React, { useState } from 'react'
import styles from './style/payrollProcessingScreen.module.css'
import { DatePicker, Button, Card, Table, Space, Tooltip, message, Upload, Modal, Statistic, Input } from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

// Add interface for payroll data
interface PayrollData {
  employeeId: string;
  name: string;
  grossSalary: number;
  totalDeductions: number;
  netPay: number;
  daysWorked: number;
  overtimeHours: number;
  attendance: number;
}

// Add interface for Excel row data
interface ExcelRow {
  employeeId: string;
  name: string;
  daysWorked: string | number;
  attendance:  number;
}

function PayrollProcessingScreen() {
  const payrollDataService: PayrollData[] = [
    {
      employeeId: "EMP001",
      name: "John Doe",
      grossSalary: 75000,
      totalDeductions: 15000,
      netPay: 60000,
      daysWorked: 22,
      overtimeHours: 10,
      attendance: 0,
    },
    {
      employeeId: "EMP002",
      name: "Jane Doe",
      grossSalary: 75000,
      totalDeductions: 15000,
      netPay: 60000,
      daysWorked: 22,
      overtimeHours: 10,
      attendance: 0,
    },
  ];
  // Add state and handlers for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustSalaryModalOpen, setIsAdjustSalaryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollData | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollData[]>(payrollDataService);

  // Add state for preview modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Add new state for date range
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const columns: ColumnsType<PayrollData> = [
    {
      title: "Employee ID",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Gross Salary",
      dataIndex: "grossSalary",
      key: "grossSalary",
      render: (value: number) => (
        <span style={{ color: '#059669' }}>₹{value.toLocaleString()}</span>
      ),
    },
    {
      title: "Total Deductions",
      dataIndex: "totalDeductions",
      key: "totalDeductions",
      render: (value: number) => (
        <span style={{ color: '#DC2626' }}>₹{value.toLocaleString()}</span>
      ),
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      render: (value: number) => (
        <span style={{ fontWeight: 600 }}>₹{value.toLocaleString()}</span>
      ),
    },
    {
      title: "Days Worked",
      dataIndex: "daysWorked",
      key: "daysWorked",
    },
    {
      title: "Attendance",
      dataIndex: "attendance",
      key: "attendance",
      render: (text: string, record: PayrollData) => {
        const percentage = record.attendance;
        
        // Determine color based on percentage
        const percentageColor = 
          Number(percentage) >= 90 ? '#059669' :  
          Number(percentage) < 75 ? '#DC2626' : 
          '#F59E0B';

        return (
          <Space direction="vertical" size={1}>
            <span style={{ 
               color: percentageColor,
               fontWeight: 500
            }}>
              {record.attendance>0?`${record.attendance}%`:"Upload Attendance"}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Overtime Hours",
      dataIndex: "overtimeHours",
      key: "overtimeHours",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Details">
            <EditOutlined
              style={{ color: '#6366f1', cursor: 'pointer' }}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <EyeOutlined
              style={{ color: '#6366f1', cursor: 'pointer' }}
              onClick={() => handleViewClick(record)}
            />
          </Tooltip>
          <Tooltip title="Adjust Salary">
            <span 
              style={{ color: '#6366f1', cursor: 'pointer' }}
              onClick={() => handleAdjustSalaryClick(record)}
            >₹</span>
          </Tooltip>
        </Space>
      ),
    },
  ];
  // Custom Rupee icon component
  const RupeeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <span style={{ ...style, fontWeight: 600 }}>₹</span>
  );

  // Add this function to handle Excel processing
  const processExcelFile = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert Excel data to JSON with proper typing
          const excelData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
          console.log("excelData", excelData);
          
          // Update payroll data with new attendance values
          const updatedPayrollData = payrollDataService.map(employee => {
            // Find matching attendance record from Excel
            const attendanceRecord = excelData.find(
              record => record['Employee ID'] === employee.employeeId
            );
            
            // If found, update attendance, otherwise keep existing data
            return {
              ...employee,
              attendance: attendanceRecord ? attendanceRecord["Attendance"]*100 : employee.attendance
            };
          });

          setPayrollData(updatedPayrollData);
          message.success('Attendance data updated successfully');
          resolve();
        } catch (error) {
          console.error('Excel processing error:', error);
          message.error('Failed to process Excel file');
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('File reading error:', error);
        message.error('Failed to read Excel file');
        reject(error);
      };

      reader.readAsBinaryString(file);
    });
  };

  // Add upload props configuration
  const uploadProps: UploadProps = {
    accept: '.xlsx, .xls',
    showUploadList: false,
    beforeUpload: (file) => {
      processExcelFile(file)
        .catch(error => {
          console.error('Error processing file:', error);
        });
      return false; // Prevent default upload behavior
    }
  };

  // Add helper functions to calculate summary data
  const calculateTotalPayroll = () => {
    return payrollData.reduce((sum, employee) => sum + employee.netPay, 0);
  };

  // Add helper function to calculate average attendance
  const calculateAverageAttendance = () => {
    const totalAttendance = payrollData.reduce((sum, employee) => sum + employee.attendance, 0);
    return (totalAttendance / payrollData.length).toFixed(1);
  };

  // Add handlers for preview modal
  const handlePreviewClick = () => {
    setIsPreviewModalOpen(true);
  };

  const handlePreviewModalClose = () => {
    setIsPreviewModalOpen(false);
  };

  // Add handler for date range changes
  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
  };

  // Add function to format date range for display
  const getPayPeriodDisplay = () => {
    if (!dateRange[0] || !dateRange[1]) return "Not Selected";
    
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    
    const formatMonth = (date: Date) => {
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };
    
    if (formatMonth(startDate) === formatMonth(endDate)) {
      return formatMonth(startDate);
    }
    
    return `${formatMonth(startDate)} - ${formatMonth(endDate)}`;
  };

  // Add handlers for modals
  const handleEditClick = (employee: PayrollData) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (employee: PayrollData) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleAdjustSalaryClick = (employee: PayrollData) => {
    setSelectedEmployee(employee);
    setIsAdjustSalaryModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.dashboardToolbar}>
        <div className={styles.leftSection}>
          <RangePicker 
            size="middle" 
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
          />
        </div>
        <div className={styles.rightSection}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} size="middle">
              Upload Attendance
            </Button>
          </Upload>
          <Button 
            icon={<FileTextOutlined />} 
            size="middle"
            onClick={handlePreviewClick}
          >
            Preview Payroll Summary
          </Button>
          <Button icon={<RupeeIcon />} size="middle">
            Generate Payroll
          </Button>
        </div>
      </div>
      
      <Card 
        className={styles.card}
        bordered={false}
        bodyStyle={{ padding: "16px" }}
        style={{ boxShadow: 'none' }}
        title={
          <Space style={{ margin: 0 }}>
            <RupeeIcon style={{ fontSize: "15px", color: "#6366f1" }} />
            <span style={{ fontSize: "13px", fontWeight: 600 }}>
              Payroll Processing
            </span>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={payrollData}
          scroll={{ x: 'max-content' }}
          pagination={false}
          style={{ minWidth: '100%' }}
          className={styles.customTable}
        />
      </Card>

      {/* Add Preview Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#6366f1' }} />
            <span>Payroll Summary Preview</span>
          </Space>
        }
        open={isPreviewModalOpen}
        onCancel={handlePreviewModalClose}
        footer={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%' 
          }}>
            <span style={{ 
              color: '#6B7280',
              fontSize: '14px'
            }}>
              Pay Period: {dateRange[0] && dateRange[1] ? 
                `${new Date(dateRange[0]).toLocaleDateString()} - ${new Date(dateRange[1]).toLocaleDateString()}` : 
                "Not Selected"
              }
            </span>
            <Space>
              <Button key="close" onClick={handlePreviewModalClose}>
                Close
              </Button>
              <Button 
                key="generate" 
                type="primary" 
                icon={<RupeeIcon />}
                style={{ backgroundColor: '#6366f1' }}
              >
                Generate Payroll
              </Button>
            </Space>
          </div>
        }
        width={800}
      >
        <div style={{ 
          padding: '24px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
        }}>
          {/* Total Payroll - Full Width */}
          <div style={{ 
            gridColumn: '1 / -1',
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Statistic
              title={<span style={{ fontSize: '16px', color: '#4B5563' }}>Total Payroll Amount</span>}
              value={calculateTotalPayroll()}
              prefix="₹"
              precision={2}
              valueStyle={{ 
                color: '#6366f1',
                fontSize: '28px',
                fontWeight: 600 
              }}
            />
          </div>

          {/* Other Stats - 2 Columns */}
          <div style={{ 
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Statistic
              title={<span style={{ fontSize: '14px', color: '#4B5563' }}>Employees Processed</span>}
              value={payrollData.length}
              valueStyle={{ 
                color: '#059669',
                fontSize: '24px',
                fontWeight: 600 
              }}
            />
          </div>

          <div style={{ 
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Statistic
              title={<span style={{ fontSize: '14px', color: '#4B5563' }}>Overall Attendance</span>}
              value={calculateAverageAttendance()}
              suffix="%"
              valueStyle={{ 
                fontSize: '24px',
                fontWeight: 600,
                color: Number(calculateAverageAttendance()) >= 90 ? '#059669' : 
                       Number(calculateAverageAttendance()) < 75 ? '#DC2626' : 
                       '#F59E0B'
              }}
            />
          </div>

          {/* Pay Period - Full Width */}
          <div style={{ 
            gridColumn: '1 / -1',
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Statistic
              title={<span style={{ fontSize: '14px', color: '#4B5563' }}>Pay Period</span>}
              value={getPayPeriodDisplay()}
              valueStyle={{ 
                color: '#6366f1',
                fontSize: '24px',
                fontWeight: 600 
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Add Edit Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#6366f1' }} />
            <span>Manual Entry</span>
          </Space>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            style={{ backgroundColor: '#6366f1' }}
          >
            Save Changes
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <div style={{ marginBottom: '8px', color: '#4B5563' }}>Employee</div>
              <Input value={selectedEmployee?.name} disabled />
            </div>
            <div>
              <div style={{ marginBottom: '8px', color: '#4B5563' }}>Days Worked</div>
              <Input type="number" defaultValue={selectedEmployee?.daysWorked} />
            </div>
            <div>
              <div style={{ marginBottom: '8px', color: '#4B5563' }}>Overtime Hours</div>
              <Input type="number" defaultValue={selectedEmployee?.overtimeHours} />
            </div>
          </Space>
        </div>
      </Modal>

      {/* Update View Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '14px' }}>Employee Payroll Details</span>
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '16px 0' }}>
          {selectedEmployee && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              {/* Left Column */}
              <div>
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Employee ID</span>}
                  value={selectedEmployee.employeeId}
                  valueStyle={{ fontSize: '14px' }}
                />
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Gross Salary</span>}
                  value={selectedEmployee.grossSalary}
                  prefix="₹"
                  valueStyle={{ fontSize: '14px', color: '#059669' }}
                />
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Net Pay</span>}
                  value={selectedEmployee.netPay}
                  prefix="₹"
                  valueStyle={{ fontSize: '14px', fontWeight: 600 }}
                />
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Days Worked</span>}
                  value={selectedEmployee.daysWorked}
                  valueStyle={{ fontSize: '14px' }}
                />
              </div>

              {/* Right Column */}
              <div>
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Name</span>}
                  value={selectedEmployee.name}
                  valueStyle={{ fontSize: '14px' }}
                />
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Total Deductions</span>}
                  value={selectedEmployee.totalDeductions}
                  prefix="₹"
                  valueStyle={{ fontSize: '14px', color: '#DC2626' }}
                />
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Attendance</span>}
                  value={selectedEmployee.attendance}
                  suffix="%"
                  valueStyle={{ 
                    fontSize: '14px',
                    color: selectedEmployee.attendance >= 90 ? '#059669' : 
                           selectedEmployee.attendance < 75 ? '#DC2626' : 
                           '#F59E0B'
                  }}
                />
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#6B7280' }}>Overtime Hours</span>}
                  value={selectedEmployee.overtimeHours}
                  valueStyle={{ fontSize: '14px' }}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Adjust Salary Modal */}
      <Modal
        title={
          <Space>
            <RupeeIcon style={{ color: '#6366f1' }} />
            <span>Adjust Salary</span>
          </Space>
        }
        open={isAdjustSalaryModalOpen}
        onCancel={() => setIsAdjustSalaryModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAdjustSalaryModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            style={{ backgroundColor: '#6366f1' }}
          >
            Save Changes
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <div style={{ marginBottom: '8px', color: '#4B5563' }}>Employee</div>
              <Input value={selectedEmployee?.name} disabled />
            </div>
            <div>
              <div style={{ marginBottom: '8px', color: '#4B5563' }}>Current Gross Salary</div>
              <Input 
                prefix="₹" 
                value={selectedEmployee?.grossSalary.toLocaleString()} 
                disabled 
              />
            </div>
            <div>
              <div style={{ marginBottom: '8px', color: '#4B5563' }}>New Gross Salary</div>
              <Input prefix="₹" type="number" />
            </div>
            <div>
              <div style={{ marginBottom: '8px', color: '#4B5563' }}>Adjustment Reason</div>
              <Input.TextArea rows={4} />
            </div>
          </Space>
        </div>
      </Modal>
    </div>
  )
}

export default PayrollProcessingScreen