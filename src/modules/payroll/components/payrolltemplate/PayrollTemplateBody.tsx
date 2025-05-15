import React, { useState, useEffect } from "react";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { t } from "i18next";
import {
  Button,
  Tabs,
  TabsProps,
  Tooltip,
  Form,
  Input,
  Table,
  Checkbox,
} from "antd";
import styles from "../../styles/payrolltempalte.module.css";
import ReuseTable, { TableColumnProps } from "../ReuseTable";
import { PayrollTemplateBodyProps,ComponentEntry,PreviewTableData } from "../../types/payrollTypes";


function PayrollTemplateBody({
  isOpen,
  onClose,
  onFullScreenClose,
  isFullScreen,
  setIsFullScreen,
  selectedTemplate,
}: PayrollTemplateBodyProps) {
  const handleOpenChange = () => {
    setIsFullScreen(true);
  };

  const handleCloseChange = () => {
    onFullScreenClose();
  };

  const [form] = Form.useForm();

  // States for Earnings
  const [newEarningsEntries, setNewEarningsEntries] = useState<ComponentEntry[]>([]);
  const [selectedEarnings, setSelectedEarnings] = useState<string[]>([]);
  
  // States for Deductions
  const [newDeductionsEntries, setNewDeductionsEntries] = useState<ComponentEntry[]>([]);
  const [selectedDeductions, setSelectedDeductions] = useState<string[]>([]);

  // Add state for preview data
  const [previewEarnings, setPreviewEarnings] = useState<PreviewTableData[]>([]);
  const [previewDeductions, setPreviewDeductions] = useState<PreviewTableData[]>([]);

  const [activeTab, setActiveTab] = useState("1");

  const onChange = (key: string) => {
    setActiveTab(key);
    form.setFieldValue("activeTab", key);
  };

  // Add preview table columns
  const previewColumns: TableColumnProps<PreviewTableData>[] = [
    {
      title: "Component Name",
      dataIndex: "componentName",
      width: "60%",
      searchable: true,
      sortable: true,
    },
    {
      title: "Value",
      dataIndex: "value",
      width: "40%",
      searchable: false,
      sortable: false,
    },
  ];

  // Earnings state management functions
  const handleEarningsInsert = () => {
    const newEntry = {
      key: `earnings_${newEarningsEntries.length}`,
      componentName: "",
      valueType: "",
    };
    setNewEarningsEntries([...newEarningsEntries, newEntry]);
    setSelectedEarnings([]);
  };

  const handleEarningsRemoveSelected = () => {
    setNewEarningsEntries(newEarningsEntries.filter((entry) => !selectedEarnings.includes(entry.key)));
    setSelectedEarnings([]);
  };

  const handleEarningsRemoveAll = () => {
    setNewEarningsEntries([]);
    setSelectedEarnings([]);
  };

  const handleEarningsRowChange = (key: string, field: 'componentName' | 'valueType', value: string) => {
    const updatedEntries = newEarningsEntries.map(entry => 
      entry.key === key ? { ...entry, [field]: value } : entry
    );
    setNewEarningsEntries(updatedEntries);
  };

  // Deductions state management functions
  const handleDeductionsInsert = () => {
    const newEntry = {
      key: `deductions_${newDeductionsEntries.length}`,
      componentName: "",
      valueType: "",
    };
    setNewDeductionsEntries([...newDeductionsEntries, newEntry]);
    setSelectedDeductions([]);
  };

  const handleDeductionsRemoveSelected = () => {
    setNewDeductionsEntries(newDeductionsEntries.filter((entry) => !selectedDeductions.includes(entry.key)));
    setSelectedDeductions([]);
  };

  const handleDeductionsRemoveAll = () => {
    setNewDeductionsEntries([]);
    setSelectedDeductions([]);
  };

  const handleDeductionsRowChange = (key: string, field: 'componentName' | 'valueType', value: string) => {
    const updatedEntries = newDeductionsEntries.map(entry => 
      entry.key === key ? { ...entry, [field]: value } : entry
    );
    setNewDeductionsEntries(updatedEntries);
  };

  // Selection handlers
  const handleEarningsSelectAll = (checked: boolean) => {
    setSelectedEarnings(checked ? newEarningsEntries.map((entry) => entry.key) : []);
  };

  const handleDeductionsSelectAll = (checked: boolean) => {
    setSelectedDeductions(checked ? newDeductionsEntries.map((entry) => entry.key) : []);
  };

  const handleEarningsRowSelect = (key: string, checked: boolean) => {
    setSelectedEarnings(checked
      ? [...selectedEarnings, key]
      : selectedEarnings.filter((k) => k !== key)
    );
  };

  const handleDeductionsRowSelect = (key: string, checked: boolean) => {
    setSelectedDeductions(checked
      ? [...selectedDeductions, key]
      : selectedDeductions.filter((k) => k !== key)
    );
  };

  // Table columns configuration
  const getColumns = (
    selectedRows: string[],
    onSelectRow: (key: string, checked: boolean) => void,
    type: 'earnings' | 'deductions'
  ) => [
    {
      title: (
        <Checkbox
          disabled={(type === 'earnings' ? newEarningsEntries : newDeductionsEntries).length === 0}
          checked={
            (type === 'earnings' ? newEarningsEntries : newDeductionsEntries).length > 0 &&
            selectedRows.length === (type === 'earnings' ? newEarningsEntries : newDeductionsEntries).length
          }
          indeterminate={
            selectedRows.length > 0 &&
            selectedRows.length < (type === 'earnings' ? newEarningsEntries : newDeductionsEntries).length
          }
          onChange={(e) =>
            (type === 'earnings' ? handleEarningsSelectAll : handleDeductionsSelectAll)(e.target.checked)
          }
        />
      ),
      dataIndex: "selected",
      width: "5%",
      render: (_: any, record: ComponentEntry) => (
        <Checkbox
          disabled={(type === 'earnings' ? newEarningsEntries : newDeductionsEntries).length === 0}
          checked={selectedRows.includes(record.key)}
          onChange={(e) => onSelectRow(record.key, e.target.checked)}
        />
      ),
    },
    {
      title: "Component Name",
      dataIndex: "componentName",
      width: "60%",
      render: (_: any, record: ComponentEntry) => (
        <Input 
          value={record.componentName}
          onChange={(e) => (type === 'earnings' ? handleEarningsRowChange : handleDeductionsRowChange)(record.key, 'componentName', e.target.value)}
          placeholder="Enter component name" 
        />
      ),
    },
    {
      title: "Value Type",
      dataIndex: "valueType",
      width: "35%",
      render: (_: any, record: ComponentEntry) => (
        <Input 
          value={record.valueType}
          onChange={(e) => (type === 'earnings' ? handleEarningsRowChange : handleDeductionsRowChange)(record.key, 'valueType', e.target.value)}
          placeholder="Enter value" 
          suffix="%" 
        />
      ),
    },
  ];

  // Table action handlers
  const getTableActions = (type: "earnings" | "deductions") => {
    return (
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Button
          onClick={() => (type === 'earnings' ? handleEarningsInsert : handleDeductionsInsert)()}
          style={{ marginRight: 8 }}
        >
          Insert
        </Button>
        <Button
          disabled={(type === 'earnings' ? selectedEarnings : selectedDeductions).length === 0}
          onClick={() => (type === 'earnings' ? handleEarningsRemoveSelected : handleDeductionsRemoveSelected)()}
          style={{ marginRight: 8 }}
        >
          Remove Selected
        </Button>
        <Button
          disabled={(type === 'earnings' ? newEarningsEntries : newDeductionsEntries).length === 0}
          onClick={() => (type === 'earnings' ? handleEarningsRemoveAll : handleDeductionsRemoveAll)()}
        >
          Remove All
        </Button>
      </div>
    );
  };

  // Modify items to include new preview content
  const items: TabsProps["items"] = selectedTemplate
    ? [
        {
          key: "1",
          label: t("PREVIEW"),
          children: (
            <div
              style={{
                height: isFullScreen
                  ? "calc(100vh - 120px)"
                  : "calc(85vh - 200px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  gap: "16px",
                  flexDirection: "row",
                }}
              >
                <div style={{ flex: 1, maxWidth: "50%" }}>
                  <h3>Earnings</h3>
                  <ReuseTable
                    columns={previewColumns}
                    dataSource={previewEarnings}
                    pagination={{
                      pageSize: Math.floor((window.innerHeight - 400) / 60),
                      position: ['bottomCenter'],
                      style: { marginBottom: 0 }
                    }}
                  />
                </div>
                <div style={{ flex: 1, maxWidth: "50%" }}>
                  <h3>Deductions</h3>
                  <ReuseTable
                    columns={previewColumns}
                    dataSource={previewDeductions}
                    pagination={{
                      pageSize: Math.floor((window.innerHeight - 400) / 60),
                      position: ['bottomCenter'],
                      style: { marginBottom: 0 }
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  marginTop: "16px",
                  paddingRight: "16px",
                  flex: "0 0 auto",
                  alignSelf: "flex-end",
                  position: isFullScreen ? "fixed" : "static",
                  bottom: isFullScreen ? "16px" : "unset",
                  right: isFullScreen ? "16px" : "unset",
                  backgroundColor: isFullScreen
                    ? "rgba(255, 255, 255, 0.8)"
                    : "transparent",
                  padding: isFullScreen ? "8px" : "0",
                  borderRadius: isFullScreen ? "4px" : "0",
                }}
              >
                <strong>Total Value: 0%</strong>
              </div>
            </div>
          ),
        },
        {
          key: "2",
          label: t("EARNINGS"),
          children: (
            <div style={{ height: '100%' }}>
              {getTableActions("earnings")}
              <div style={{ height: '100%',overflowY: 'auto' }}>
                <Table
                  columns={getColumns(selectedEarnings, handleEarningsRowSelect, "earnings")}
                  dataSource={newEarningsEntries}
                  pagination={false}
                  scroll={{ y: 'calc(100vh - 450px)' }}
                />
              </div>
            </div>
          ),
        },
        {
          key: "3",
          label: t("DEDUCTIONS"),
          children: (
            <div style={{ height: '100%' }}>
              {getTableActions("deductions")}
              <div style={{ height: '100%', overflowY: 'auto' }}>
                <Table
                  columns={getColumns(selectedDeductions, handleDeductionsRowSelect, "deductions")}
                  dataSource={newDeductionsEntries}
                  pagination={false}
                  scroll={{ y: 'calc(100vh - 450px)' }}
                />
              </div>
            </div>
          ),
        },
      ]
    : [
        {
          key: "1",
          label: t("MAIN"),
          children: (
            <div className={styles.formContainer}>
              <Form
                form={form}
                layout="horizontal"
                className={styles.centerForm}
              >
                <Form.Item
                  label="Payroll Template Name"
                  name="templateName"
                  rules={[
                    { required: true, message: "Please enter template name" },
                  ]}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 8 }}
                >
                  <Input placeholder="Enter template name" />
                </Form.Item>
                <Form.Item
                  label="Payroll Template Description"
                  name="templateDescription"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 8 }}
                >
                  <Input placeholder="Enter template description" />
                </Form.Item>
              </Form>
            </div>
          ),
        },
        {
          key: "2",
          label: t("EARNINGS"),
          children: (
            <div style={{ height: '100%' }}>
              {getTableActions("earnings")}
              <div style={{ height: '100%', overflowY: 'auto' }}>
                <Table
                  columns={getColumns(selectedEarnings, handleEarningsRowSelect, "earnings")}
                  dataSource={newEarningsEntries}
                  pagination={false}
                  scroll={{ y: 'calc(100vh - 350px)' }}
                />
              </div>
            </div>
          ),
        },
        {
          key: "3",
          label: t("DEDUCTIONS"),
          children: (
            <div style={{ height: '100%' }}>
              {getTableActions("deductions")}
              <div style={{ height: '100%', overflowY: 'auto' }}>
                <Table
                  columns={getColumns(selectedDeductions, handleDeductionsRowSelect, "deductions")}
                  dataSource={newDeductionsEntries}
                  pagination={false}
                  scroll={{ y: 'calc(100vh - 450px)' }}
                />
              </div>
            </div>
          ),
        },
      ];

  // Reset active tab when selecting a template
  useEffect(() => {
    if (selectedTemplate) {
      setActiveTab("1");
      // Here you would typically fetch the template data from your API
      // For now, we'll just reset the states
      setSelectedEarnings([]);
      setSelectedDeductions([]);
    } else {
      // Reset new template states when no template is selected
      setNewEarningsEntries([]);
      setNewDeductionsEntries([]);
      setSelectedEarnings([]);
      setSelectedDeductions([]);
    }
  }, [selectedTemplate]);

  return (
    <>
      <div className={styles.split}>
        <div>
          <p className={styles.headingtext}>
            {selectedTemplate?.["Template Name"].toUpperCase() ||
              "Add Payroll Template"}
          </p>
          {selectedTemplate && (
            <div className={styles.details}>
              <p className={styles.dateText}>
                {t("description")} :
                <span className={styles.fadedText}>
                  {selectedTemplate.Description || "N/A"}
                </span>
              </p>
              <p className={styles.dateText}>
                {t("createdOn")} :
                <span className={styles.fadedText}>
                  {selectedTemplate.CreatedOn || "N/A"}
                </span>
              </p>
              <p className={styles.dateText}>
                {t("modifiedOn")} :
                <span className={styles.fadedText}>
                  {selectedTemplate.ModifiedOn || "N/A"}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          {isFullScreen ? (
            <Tooltip title={t("exitFullScreen")}>
              <Button
                onClick={handleCloseChange}
                className={styles.actionButton}
              >
                <CloseFullscreenIcon sx={{ color: "rgb(24, 116, 206)" }} />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title={t("enterFullScreen")}>
              <Button
                onClick={handleOpenChange}
                className={styles.actionButton}
              >
                <OpenInFullIcon sx={{ color: "rgb(24, 116, 206)" }} />
              </Button>
            </Tooltip>
          )}
          {selectedTemplate && (
            <>
              <Tooltip title={t("copy")}>
                <Button className={styles.actionButton}>
                  <CopyIcon sx={{ color: "rgb(24, 116, 206)" }} />
                </Button>
              </Tooltip>
              <Tooltip title={t("delete")}>
                <Button className={styles.actionButton}>
                  <DeleteIcon sx={{ color: "rgb(24, 116, 206)" }} />
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title={t("close")}>
            <Button onClick={onClose} className={styles.actionButton}>
              <CloseIcon sx={{ color: "rgb(24, 116, 206)" }} />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className={styles.sideWindowContent}>
        <Tabs
          activeKey={activeTab}
          items={items}
          onChange={onChange}
          size="middle"
        />
      </div>
      {(!selectedTemplate || (selectedTemplate && activeTab !== "1")) && (
        <footer className={styles.footer}>
          <div className={styles.floatingButtonContainer}>
            {selectedTemplate ? (
              <button
                className={`${styles.floatingButton} ${styles.saveButton}`}
              >
                {t("update")}
              </button>
            ) : (
              <button
                className={`${styles.floatingButton} ${styles.saveButton}`}
              >
                {t("create")}
              </button>
            )}
            <button
              className={`${styles.floatingButton} ${styles.cancelButton}`}
            >
              {t("cancel")}
            </button>
          </div>
        </footer>
      )}
    </>
  );
}

export default PayrollTemplateBody;
