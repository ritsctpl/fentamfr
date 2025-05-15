import React, { useState } from "react";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import { GrChapterAdd } from "react-icons/gr";
import { t } from "i18next";
import {
  Button,
  Steps,
  Form,
  Input,
  Select,
  Tooltip,
  Modal,
} from "antd";
import ReuseTable from "../ReuseTable";
import styles from "../../styles/payrollsystem.module.css";
import { PayrollSystemBodyProps } from "../../types/payrollTypes";


const { Option } = Select;

function PayrollSystemBody({
  isOpen,
  onClose,
  onFullScreenClose,
  isFullScreen,
  setIsFullScreen,
}: PayrollSystemBodyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      key: 'templateName',
      searchable: true,
      sortable: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      searchable: true,
      sortable: true,
    },
  ];

  const data: any[] = [];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOpenChange = () => {
    setIsFullScreen(true);
  };

  const handleCloseChange = () => {
    onFullScreenClose();
  };

  const steps = [
    {
      title: 'Basic Details',
      content: (
        <Form
          form={form}
          layout="horizontal"
          className={styles.centerForm}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter username" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: 'email', message: "Please enter valid email" }
            ]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Select placeholder="Select role">
              <Option value="software_engineer">Software Engineer</Option>
              <Option value="trainee_engineer">Trainee Engineer</Option>
              <Option value="sap_developer">SAP Developer</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Please select department" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Select placeholder="Select department">
              <Option value="fenta_mes">Fenta MES</Option>
              <Option value="sap">TEST Role</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Employment Status"
            name="employmentStatus"
            rules={[{ required: true, message: "Please select employment status" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Select placeholder="Select status">
              <Option value="full_time">Full Time</Option>
              <Option value="intern">Intern</Option>
            </Select>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Bank Details',
      content: (
        <Form
          form={form}
          layout="horizontal"
          className={styles.centerForm}
        >
          <Form.Item
            label="Account Holder Name"
            name="accountHolderName"
            rules={[{ required: true, message: "Please enter account holder name" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter account holder name" />
          </Form.Item>
          <Form.Item
            label="Bank Name"
            name="bankName"
            rules={[{ required: true, message: "Please enter bank name" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter bank name" />
          </Form.Item>
          <Form.Item
            label="Account Number"
            name="accountNumber"
            rules={[{ required: true, message: "Please enter account number" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter account number" />
          </Form.Item>
          <Form.Item
            label="IFSC Code"
            name="ifscCode"
            rules={[{ required: true, message: "Please enter IFSC code" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter IFSC code" />
          </Form.Item>
          <Form.Item
            label="PAN Number"
            name="panNumber"
            rules={[{ required: true, message: "Please enter PAN number" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter PAN number" />
          </Form.Item>
          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: "Please enter city" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Payroll Template',
      content: (
        <Form
          form={form}
          layout="horizontal"
          className={styles.centerForm}
        >
          <Form.Item
            label="CTC"
            name="ctc"
            rules={[{ required: true, message: "Please enter CTC" }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input placeholder="Enter CTC" />
          </Form.Item>
          <Form.Item
            label="Search Template"
            name="templateSearch"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Input
              placeholder="Search template"
              suffix={
                <GrChapterAdd
                onClick={() => showModal()}
              />
              }
            />
          </Form.Item>

          <Modal
            title="Select Template"
            open={isModalOpen}
            onCancel={handleCancel}
            width={800}
            centered
            footer={null}
          >
            <div className={styles.tableContainer}>
              <ReuseTable 
                columns={columns}
                dataSource={data}
                pagination={{ 
                  pageSize: 7,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} items`,
                  pageSizeOptions: ['10', '20', '50']
                }}
              />
            </div>
          </Modal>
        </Form>
      ),
    },
  ];

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <>
      <div className={styles.split}>
        <div>
          <p className={styles.headingtext}>Add Employee</p>
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
          <Tooltip title={t("close")}>
            <Button onClick={onClose} className={styles.actionButton}>
              <CloseIcon sx={{ color: "rgb(24, 116, 206)" }} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className={styles.sideWindowContent}>
        <Steps current={currentStep} items={steps} />
        <div className={styles.stepsContent}>{steps[currentStep].content}</div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.floatingButtonContainer}>
          {currentStep < steps.length - 1 && (
            <button
              className={`${styles.floatingButton} ${styles.saveButton}`}
              onClick={next}
            >
              {t("Next")}
            </button>
          )}
          {currentStep === steps.length - 1 && (
            <button
              className={`${styles.floatingButton} ${styles.saveButton}`}
              onClick={onClose}
            >
              {t("Create")}
            </button>
          )}
          {currentStep > 0 && (
            <button
              className={`${styles.floatingButton} ${styles.cancelButton}`}
              onClick={prev}
            >
              {t("Previous")}
            </button>
          )}
          <button
            className={`${styles.floatingButton} ${styles.cancelButton}`}
            onClick={onClose}
          >
            {t("Cancel")}
          </button>
        </div>
      </footer>
    </>
  );
}

export default PayrollSystemBody;
