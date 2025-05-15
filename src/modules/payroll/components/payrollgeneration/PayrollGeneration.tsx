import React, { useState } from "react";
import styles from "../../styles/payrollgeneration.module.css";
import ReuseTable from "../ReuseTable";
import { TableProps, Form, Input } from "antd";
import { PercentageOutlined } from '@ant-design/icons'; 
import { PayrollGenerationData, PayrollMeta } from "../../types/payrollTypes";
function PayrollGeneration() {
  const [tableData, setTableData] = useState<PayrollGenerationData[]>([
    {
      key: "1",
      empId: "EMP001",
      userName: "TEST EMPLOYEE",
      role: "Developer",
      department: "Engineering",
      overtimeHours: 0,
      totalDaysWorked: 0,
      paidLeave: 0,
      attendance: 0,
      grossSalary: 18000,
      totalDeductions: 0,
      netPay: 0,
    },
  ]);

  // Payroll meta information
  const payrollMeta:PayrollMeta = {
    workingDays: 22,
    weekends: 8,
    holidays: 2,
    totalDaysInMonth: 31,
    payPeriod: "Dec 2024",
    payDate: "31st Dec 2024",
  };

  const handleInputChange = (key: string, field: keyof PayrollGenerationData, value: string) => {
    // Remove leading zeros and handle empty/invalid values
    let processedValue = value;
    if (field.includes('total') || field.includes('paid') || field.includes('attendance') || field.includes('overtime')) {
      if (value === '') {
        processedValue = '';
      } else {
        // Remove leading zeros and convert to number
        processedValue = String(parseInt(value, 10) || '');
      }
    }

    setTableData(prevData =>
      prevData.map(row =>
        row.key === key ? {
          ...row,
          [field]: field.includes('total') || field.includes('paid') || field.includes('attendance') || field.includes('overtime')
            ? processedValue === '' ? '' : Number(processedValue)
            : processedValue
        } : row
      )
    );
  };

  const columns = [
    {
      title: "Emp ID",
      dataIndex: "empId",
      key: "empId",
      searchable: true,
      sortable: true,
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      searchable: true,
      sortable: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      searchable: true,
      sortable: true,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      searchable: true,
      sortable: true,
    },
    {
      title: "Gross Salary",
      dataIndex: "grossSalary",
      key: "grossSalary",
      render: (text: number) => (
        <span>₹{text.toLocaleString()}</span>
      ),
    },
    {
      title: "Total Days Worked",
      dataIndex: "totalDaysWorked",
      key: "totalDaysWorked",
      render: (text: number | string, record: PayrollGenerationData) => (
        <Form.Item noStyle>
          <Input
            type="number"
            value={text === 0 ? '' : text}
            onChange={(e) => handleInputChange(record.key, "totalDaysWorked", e.target.value)}
            style={{ width: '120px' }}
            min={0}
          />
        </Form.Item>
      ),
    },
    {
      title: "Paid Leave",
      dataIndex: "paidLeave",
      key: "paidLeave",
      render: (text: number | string, record: PayrollGenerationData) => (
        <Form.Item noStyle>
          <Input
            type="number"
            value={text === 0 ? '' : text}
            onChange={(e) => handleInputChange(record.key, "paidLeave", e.target.value)}
            style={{ width: '120px' }}
            min={0}
          />
        </Form.Item>
      ),
    },
    {
      title: "Attendance",
      dataIndex: "attendance",
      key: "attendance",
      render: (text: number | string, record: PayrollGenerationData) => (
        <Form.Item noStyle>
          <Input
            type="number"
            value={text === 0 ? '' : text}
            onChange={(e) => handleInputChange(record.key, "attendance", e.target.value)}
            style={{ width: '120px' }}
            min={0}
            max={100}
            suffix={<PercentageOutlined />}
          />
        </Form.Item>
      ),
    },
    {
      title: "Overtime Hours",
      dataIndex: "overtimeHours",
      key: "overtimeHours",
      render: (text: number | string, record: PayrollGenerationData) => (
        <Form.Item noStyle>
          <Input
            type="number"
            value={text === 0 ? '' : text}
            onChange={(e) => handleInputChange(record.key, "overtimeHours", e.target.value)}
            style={{ width: '120px' }}
            min={0}
          />
        </Form.Item>
      ),
    },
    {
      title: "Total Deductions",
      dataIndex: "totalDeductions",
      key: "totalDeductions",
      render: (text: number) => (
        <span>₹{text.toLocaleString()}</span>
      ),
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      render: (text: number) => (
        <span>₹{text.toLocaleString()}</span>
      ),
    },
  ];

  const handleTableChange: TableProps<PayrollGenerationData>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("Table params:", { pagination, filters, sorter, extra });
  };

  const handleGeneratePayroll = () => {
    // Add your payroll generation logic here
    console.log("Generating payroll for:", tableData);
  };

  const buttonStyle = {
    backgroundColor: '#1976d2',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'uppercase',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'background-color 0.2s',
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.dataFieldBodyContentsTop} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <p className={styles.dataLength}>All Employee ({tableData.length})</p>
          <div style={{
            display: 'flex',
            gap: '24px',
            backgroundColor: '#f5f5f5',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Pay Period</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{payrollMeta.payPeriod}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Working Days</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{payrollMeta.workingDays}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Holidays</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{payrollMeta.holidays}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Employees</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{tableData.length}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Payroll</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                ₹{tableData.reduce((sum, row) => sum + (row.grossSalary || 0), 0).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid #ddd', paddingLeft: '24px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Pay Date</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{payrollMeta.payDate}</div>
            </div>
            <div style={{ 
              borderLeft: '1px solid #ddd', 
              paddingLeft: '24px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <button
                onClick={handleGeneratePayroll}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: '#1976d2',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1565c0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                }}
              >
                Generate Payroll
              </button>
            </div>
          </div>
        </div>
        <ReuseTable
          columns={columns}
          dataSource={tableData}
          onChange={handleTableChange}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginTop: '20px',
          padding: '16px'
        }}>
          <button
            onClick={handleGeneratePayroll}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#1976d2',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1565c0';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1976d2';
            }}
          >
            Submit Payroll
          </button>
        </div>
      </div>
    </div>
  );
}

export default PayrollGeneration;