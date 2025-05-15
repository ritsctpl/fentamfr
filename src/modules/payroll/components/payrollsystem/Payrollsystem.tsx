import React, { useState } from "react";
import styles from "../../styles/payrollsystem.module.css";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReuseTable from "../ReuseTable";
import { TableProps } from "antd";
import PayrollSystemBody from "./PayrollSystemBody";
import { PayrollsystemData } from "../../types/payrollTypes";



function Payrollsystem() {
  //state
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PayrollsystemData | null>(null);

  //dummy data
  const columns = [
    {
      title: "Emp_ID",
      dataIndex: "Emp_ID",
      key: "Emp_ID",
      searchable: true,
      sortable: true,
    },
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      searchable: true,
      sortable: true,
    },
    {
      title: "Role",
      dataIndex: "Role",
      key: "Role",
      searchable: true,
      sortable: true,
    },
    {
      title: "CTC",
      dataIndex: "ctc",
      key: "ctc",
      searchable: false,
      sortable: true,
    },
    {
      title: "Payroll Template",
      dataIndex: "Payroll Template",
      key: "Payroll Template",
      searchable: true,
      sortable: true,
    },
  ];

  const data: PayrollsystemData[] = [
    {
      key: "1",
      Emp_ID: "EMP001",
      Name: "TEST USER",
      Role: "TEST ROLE",
      ctc: 300000,
      "Payroll Template": "Test_Template",
    },
  ];

  //function
  const handleTableChange: TableProps<PayrollsystemData>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("Table params:", { pagination, filters, sorter, extra });
  };

  const handleRowClick = (record: PayrollsystemData) => {
    setSelectedTemplate(record);
    setIsOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTemplate(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFullScreen(false);
    setSelectedTemplate(null);
  };

  const handleFullScreenClose = () => {
    setIsFullScreen(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.mainContent} ${
          isOpen && !isFullScreen ? styles.mainContentShrink : ""
        } ${isFullScreen ? styles.mainContentHidden : ""}`}
      >
        <div className={styles.dataFieldBodyContentsTop}>
          <p className={styles.dataLength}>Employee ({data.length})</p>
          <IconButton
            className={styles.circleButton}
            onClick={handleAddClick}
          >
            <AddIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </div>
        <ReuseTable
          columns={columns}
          dataSource={data}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>

      <div
        className={`${styles.sideWindow} ${
          isOpen ? styles.sideWindowOpen : ""
        } ${isFullScreen ? styles.sideWindowFullScreen : ""}`}
      >
        <PayrollSystemBody
          isOpen={isOpen}
          onClose={handleClose}
          onFullScreenClose={handleFullScreenClose}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
        //   selectedTemplate={selectedTemplate}
        />
      </div>
    </div>
  );
}

export default Payrollsystem;