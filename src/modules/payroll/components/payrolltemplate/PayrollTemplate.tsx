import React, { useState } from "react";
import styles from "../../styles/payrolltempalte.module.css";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReuseTable from "../ReuseTable";
import { TableProps } from "antd";
import PayrollTemplateBody from "./PayrollTemplateBody";
import { PayrollTemplateData } from "../../types/payrollTypes";


function PayrollTemplate() {
  //state
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PayrollTemplateData | null>(null);
  //dummy data
  const columns = [
    {
      title: "Template Name",
      dataIndex: "Template Name",
      key: "Template Name",
      searchable: true,
      sortable: true,
    },
    {
      title: "Earnings (%)",
      dataIndex: "Earnings",
      key: "Earnings",
      searchable: false,
      sortable: false,
    },
    {
      title: "Deductions (%)",
      dataIndex: "Deductions",
      key: "Deductions",
      searchable: false,
      sortable: false,
    },
  ];

  const data: PayrollTemplateData[] = [
    {
      key: "1",
      "Template Name": "Test_1 Payroll",
      Earnings: 80,
      Deductions: 20,
    },
    {
      key: "2",
      "Template Name": "Test_2 Payroll",
      Earnings: 80,
      Deductions: 20,
    },
  ];
  //function
  const handleTableChange: TableProps<PayrollTemplateData>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("Table params:", { pagination, filters, sorter, extra });
  };

  const handleRowClick = (record: PayrollTemplateData) => {
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
          <p className={styles.dataLength}>Payroll Template ({data.length})</p>
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
        <PayrollTemplateBody
          isOpen={isOpen}
          onClose={handleClose}
          onFullScreenClose={handleFullScreenClose}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
          selectedTemplate={selectedTemplate}
        />
      </div>
    </div>
  );
}

export default PayrollTemplate;
