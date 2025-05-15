import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "../calenderScreen/style/leavecalender.module.css";
import {
  CalendarOutlined,
  EditOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PaperClipOutlined,
  ArrowRightOutlined,
  UploadOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {
  Card,
  Empty,
  Tooltip,
  Tag,
  Divider,
  Button,
  Drawer,
  Form,
  Select,
  Input,
  Upload,
  message,
  DatePicker,
} from "antd";

// Enhanced leave data structure
const leaveData = [
  {
    startDate: "2024-11-13",
    endDate: "2024-11-15",
    leaveType: "Annual Leave",
    reason: "Family vacation",
    description: "Annual family trip to visit grandparents",
    status: "cancelled",
    duration: "2 days",
    appliedOn: "2024-11-01",
    documents: ["vacation_plan.pdf"],
    comments: "Planned leave for family gathering",
  },
  {
    startDate: "2024-11-18",
    endDate: "2024-11-19",
    leaveType: "Medical Leave",
    reason: "Doctor's appointment",
    description: "Regular health checkup and dental appointment",
    status: "approved",
    duration: "2 days",
    appliedOn: "2024-11-05",
    documents: ["medical_certificate.pdf"],
    comments: "Annual health checkup",
  },
  {
    startDate: "2024-11-22",
    endDate: "2024-11-29",
    leaveType: "Medical Leave",
    reason: "Doctor's appointment",
    description: "Regular health checkup and dental appointment",
    status: "pending",
    duration: "2 days",
    appliedOn: "2024-11-05",
    documents: ["medical_certificate.pdf"],
    comments: "Annual health checkup",
  },
];

const { Option } = Select;
const { TextArea } = Input;

const LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Personal Leave",
  "Work From Home",
  "Compensatory Off",
];

const RequiredLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {icon} <span style={{ marginLeft: '8px' }}>{label}</span>
    <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>
  </div>
);

const OptionalLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {icon} <span style={{ marginLeft: '8px' }}>{label}</span>
  </div>
);

const LeaveCalender = () => {
  const [date, setDate] = useState(new Date());
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form] = Form.useForm();

  // Updated function to check leave status for a date
  const getLeaveStatus = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    const leave = leaveData.find((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      
      // Reset time components to ensure accurate date comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= start && date <= end;
    });
    return leave?.status || null;
  };

  // Function to check if date is weekend
  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6; // 0 is Sunday, 6 is Saturday
  };

  // Updated tile class function
  const getTileClassName = ({ date }: { date: Date }) => {
    const status = getLeaveStatus(date);
    let classes = styles.calendarTile;

    if (isWeekend(date)) {
      classes += ` ${styles.weekend}`;
    }

    if (status) {
      classes += ` ${styles[status]}`;
    }

    return classes;
  };

  // Only disable weekends, not entire years
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    // Only apply weekend disable rule for month view
    if (view === "month") {
      return isWeekend(date);
    }
    return false; // Don't disable anything in year or decade view
  };

  // Function to get selected leave details
  const getSelectedLeaveDetails = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return leaveData.find((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      
      // Reset time components for accurate comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= start && date <= end;
    });
  };

  // Add this helper function for date formatting
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Update the getCardTitle function
  const getCardTitle = (selectedLeave: any) => {
    function handleEdit(selectedLeave: any): void {
      throw new Error("Function not implemented.");
    }

    function handleCancel(selectedLeave: any): void {
      throw new Error("Function not implemented.");
    }

    return (
      <div className={styles.cardHeader}>
        <div className={styles.dateHeader}>
          <CalendarOutlined className={styles.calendarIcon} />
          <span>Leave Details ({formatDate(date)})</span>
        </div>
        {selectedLeave && (
          <div className={styles.actionIcons}>
            <Tooltip title={selectedLeave.status === "approved" || selectedLeave.status === "cancelled" ? 
              "Cannot edit approved or cancelled leaves" : "Edit Leave"}>
              <EditOutlined
                className={`${styles.editIcon} ${
                  selectedLeave.status === "approved" || selectedLeave.status === "cancelled" ? styles.disabled : ""
                }`}
                onClick={() =>
                  selectedLeave.status !== "approved" || selectedLeave.status !== "cancelled" && handleEdit(selectedLeave)
                }
              />
            </Tooltip>
            <Tooltip title={selectedLeave.status === "approved" || selectedLeave.status === "cancelled" ? 
              "Cannot cancel approved or cancelled leaves" : "Cancel Leave"}>
              <CloseOutlined
                className={`${styles.cancelIcon} ${
                  selectedLeave.status === "approved" || selectedLeave.status === "cancelled" ? styles.disabled : ""
                }`}
                onClick={() =>
                  selectedLeave.status !== "approved" || selectedLeave.status !== "cancelled" && handleCancel(selectedLeave)
                }
              />
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: "gold", icon: <ClockCircleOutlined /> },
      approved: { color: "success", icon: <CheckCircleOutlined /> },
      cancelled: { color: "error", icon: <CloseCircleOutlined /> },
    };

    return (
      <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  // Add this helper function to calculate working days (excluding weekends)
  const calculateWorkingDays = (startDate: Date, endDate: Date) => {
    let count = 0;
    const curDate = new Date(startDate);
    
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends (0 = Sunday, 6 = Saturday)
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  // Update the date display in renderLeaveDetails
  const renderLeaveDetails = (leave: any) => {
    if (!leave) return null;

    // Calculate the actual duration
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const workingDays = calculateWorkingDays(startDate, endDate);
    const durationText = `${workingDays} ${workingDays === 1 ? 'day' : 'days'}`;

    return (
      <div className={styles.leaveDetails}>
        {/* Status Section */}
        <div className={styles.statusSection}>
          {getStatusTag(leave.status)}
          <span className={styles.appliedDate}>
            Applied on: {leave.appliedOn}
          </span>
        </div>

        {/* Date Range Section - Updated alignment */}
        <div className={styles.dateRangeSection}>
          <div className={styles.dateRange}>
            <div className={styles.dateBlock}>
              <p className={styles.dateLabel}>From</p>
              <p className={styles.date}>
                {formatDate(new Date(leave.startDate))}
              </p>
            </div>
            <ArrowRightOutlined
              className={styles.arrowIcon}
              style={{ fontSize: "24px", width: "24px" }}
            />
            <div className={styles.dateBlock}>
              <p className={styles.dateLabel}>To</p>
              <p className={styles.date}>
                {formatDate(new Date(leave.endDate))}
              </p>
            </div>
            <Tag className={styles.durationTag}>{durationText}</Tag>
          </div>
        </div>

        <Divider />

        {/* Leave Details Section - Updated structure */}
        <div className={styles.leaveInfoSection}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>
              <FileTextOutlined /> Leave Type
            </div>
            <div className={styles.infoContent}>
              <Tag color="blue">{leave.leaveType}</Tag>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>
              <MessageOutlined /> Reason
            </div>
            <div className={styles.infoContent}>{leave.reason}</div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>
              <FileTextOutlined /> Description
            </div>
            <div className={styles.infoContent}>{leave.description}</div>
          </div>

          {leave.documents && leave.documents.length > 0 && (
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <PaperClipOutlined /> Attachments
              </div>
              <div className={styles.infoContent}>
                {leave.documents.map((doc: string, index: number) => (
                  <Tag
                    key={index}
                    icon={<PaperClipOutlined />}
                    className={styles.documentTag}
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    {doc}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {leave.comments && (
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <MessageOutlined /> Comments
              </div>
              <div className={styles.infoContent}>{leave.comments}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add this helper function to check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleLeaveRequest = () => {
    setShowDrawer(true);
  };

  const onClose = () => {
    form.resetFields();
    setShowDrawer(false);
  };

  const onSubmit = async (values: any) => {
    try {
      // Show loading message
      message.open({
        type: 'loading',
        content: 'Submitting leave request...',
        key: 'leaveSubmit',
        duration: 0, // Duration 0 means it won't auto-close
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success message
      message.open({
        type: 'success',
        content: 'Leave request submitted successfully!',
        key: 'leaveSubmit',
        duration: 3,
      });

      // Close drawer and reset form
      onClose();
    } catch (error) {
      // Error message
      message.open({
        type: 'error',
        content: 'Failed to submit leave request. Please try again.',
        key: 'leaveSubmit',
        duration: 3,
      });
      console.error('Leave submission error:', error);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isLessThan2MB = file.size / 1024 / 1024 < 2;
      if (!isLessThan2MB) {
        message.error("File must be smaller than 2MB!");
        return Upload.LIST_IGNORE;
      }
      return false;
    },
  };

  return (
    <div className={styles.leaveCalendarContainer}>
      <div className={styles.calendarSection}>
        <Card className={styles.calendarCard}>
          <Calendar
            onChange={(value: Date) => setDate(value as Date)}
            value={date}
            className={styles.calendar}
            tileClassName={getTileClassName}
            tileDisabled={tileDisabled}
            minDate={new Date(1900, 0, 1)}
            maxDate={new Date(2100, 11, 31)}
            calendarType="gregory"
          />
        </Card>
      </div>

      <div className={styles.detailsSection}>
        <Card
          className={styles.leaveCard}
          title={getCardTitle(getSelectedLeaveDetails(date))}
        >
          {getSelectedLeaveDetails(date) ? (
            renderLeaveDetails(getSelectedLeaveDetails(date))
          ) : (
            <div className={styles.leaveStatus}>
              <Empty
                description="No leaves applied for this date"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              {isPastDate(date) ? (
                <div className={styles.pastDateMessage}>
                  Cannot apply leave for past dates
                </div>
              ) : (
                <Button
                  type="primary"
                  className={styles.requestLeaveButton}
                  icon={<CalendarOutlined />}
                  onClick={handleLeaveRequest}
                >
                  Request Leave
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      <Drawer
        title={
          <div className={styles.drawerHeader}>
            <span className={styles.drawerTitle}>Request Leave</span>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={showDrawer}
        width={480}
        className={styles.leaveDrawer}
        bodyStyle={{ padding: "24px", backgroundColor: styles.drawerBackgroundColor }}
        headerStyle={{
          padding: "20px 24px",
          borderBottom: `1px solid ${styles.drawerBorderColor}`,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          className={styles.leaveForm}
          requiredMark={false}
        >
          <Form.Item
            name="leaveType"
            label={<RequiredLabel icon={<UserOutlined />} label="Leave Type" />}
            rules={[{ required: true, message: "Please select leave type" }]}
          >
            <Select placeholder="Select leave type" className={styles.selectInput}>
              {LEAVE_TYPES.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label={<RequiredLabel icon={<CalendarOutlined />} label="Start Date" />}
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker 
              className={styles.datePicker}
              disabledDate={(current) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return current && current.valueOf() < today.valueOf();
              }}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label={<RequiredLabel icon={<CalendarOutlined />} label="End Date" />}
            rules={[{ required: true, message: "Please select end date" }]}
            dependencies={['startDate']}
          >
            <DatePicker 
              className={styles.datePicker}
              disabledDate={(current) => {
                const startDate = form.getFieldValue('startDate');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return (
                  (current && current.valueOf() < today.valueOf()) ||
                  (startDate && current && current.valueOf() < startDate.valueOf())
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label={<RequiredLabel icon={<FileTextOutlined />} label="Reason" />}
            rules={[
              { required: true, message: "Please enter reason" },
              { max: 100, message: "Maximum 100 characters allowed" },
            ]}
          >
            <Input placeholder="Enter reason for leave" className={styles.textInput} />
          </Form.Item>

          <Form.Item
            name="description"
            label={<OptionalLabel icon={<MessageOutlined />} label="Description" />}
            rules={[{ max: 500, message: "Maximum 500 characters allowed" }]}
          >
            <TextArea
              placeholder="Enter detailed description"
              rows={4}
              showCount
              maxLength={500}
              className={styles.textArea}
              autoSize={false}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            name="attachments"
            label={<OptionalLabel icon={<PaperClipOutlined />} label="Attachments" />}
            extra="Max file size: 2MB. Allowed file types: .pdf, .docx"
          >
            <Upload 
              {...uploadProps}
              className={styles.uploadSection}
              accept=".pdf,.docx"
              maxCount={1}
              multiple={false}
            >
              <Button icon={<UploadOutlined />} className={styles.uploadButton}>
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="comments"
            label={<OptionalLabel icon={<CommentOutlined />} label="Comments" />}
            rules={[{ max: 200, message: "Maximum 200 characters allowed" }]}
          >
            <TextArea
              placeholder="Add any additional comments"
              rows={3}
              showCount
              maxLength={200}
              className={styles.textArea}
              autoSize={false}
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item className={styles.submitSection}>
            <div className={styles.buttonGroup}>
              <Button onClick={onClose} className={styles.cancelButton}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.submitButton}
              >
                Submit Request
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default LeaveCalender;
