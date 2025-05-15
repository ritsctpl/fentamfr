/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import styles from "@modules/lineClearance/styles/lineClearance.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { parseCookies } from "nookies";
import {
  Form,
  Input,
  message,
  Modal,
  Tooltip,
  Button as Btn,
  Switch,
} from "antd";
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, Tabs, Tab, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { lineClearanceContext } from "@modules/lineClearance/hooks/lineClearanceContext";
import {
  createLineClearance,
  deleteLineClearance,
  updateLineClearance,
} from "@services/lineClearanceService";
import { defaultLineClearanceTemplate} from "../types/lineClearanceTypes";
import LineClearanceTasksDataTable from "./LineClearanceTaskDataTable";
import LineClearanceUserRolesDataTable from "./LineClearanceuserRolesDataTable";
import LineClearanceAssociatedDataTable from "./LineClearanceassociatedDataTable";

interface LineClearanceBodyProps {
  isAdding: boolean;
  selected: any;
  drag: boolean;
  fullScreen: boolean;
  call: number;
  onClose: () => void;
  setCall: (val: number) => void;
  setIsAdding: (val: boolean) => void;
  setFullScreen: (val: boolean) => void;
}

const LineClearanceBody: React.FC<
  LineClearanceBodyProps
> = ({
  selected,
  fullScreen,
  setIsAdding,
  drag,
  call,
  setCall,
  isAdding,
  onClose,
  setFullScreen,
}) => {
  const {
    formData,
    setFormData,
    setFormChange,
    formChange,
    activeTab,
    setActiveTab,
  } = useContext<any>(lineClearanceContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
  const [copyForm] = Form.useForm();

  useEffect(() => {
    if (formData) {
      form.setFieldsValue(formData);
    }
  }, [formData]);

  const handleOpenChange = () => {
    setFullScreen(true);
  };

  const handleCloseChange = () => {
    setFullScreen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClose = () => {
    onClose();
  };

  const handleCancel = () => {
    if (formChange && !isAdding) {
      Modal.confirm({
        title: t("confirm"),
        content: t("closePageMsg"),
        okText: t("ok"),
        cancelText: t("cancel"),
        onOk: async () => {
          onClose();
        },
        onCancel() {},
      });
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    const requiredFields = [];
    if (!formData.templateName) requiredFields.push("Template Name");
    if (!formData.tasks.length) requiredFields.push("At least one task is required");
    // if (!formData.userRoles.length) requiredFields.push("User Roles");
    // if (!formData.associatedTo.length) requiredFields.push("Associated To");
    // if (!formData.clearanceTimeLimit)
    //   requiredFields.push("Clearance Time Limit");
    // if (!formData.maxPendingTasks) requiredFields.push("Max Pending Tasks");
    // if (!formData.clearanceReminderInterval)
    //   requiredFields.push("Clearance Reminder Interval");

    if (requiredFields.length > 0) {
      message.error(
        `Please fill in the following required fields: ${requiredFields.join(
          ", "
        )}`
      );
      return;
    }

    // Validate associated items
    if (formData.associatedTo?.length > 0) {
      const missingFields = [];
      formData.associatedTo.forEach((item: { workcenterId: any; resourceId: any; }, index: number) => {
        if (!item.workcenterId && !item.resourceId) {
          missingFields.push(`Either Workcenter ID or Resource ID for item ${index + 1}`);
        }
      });

      if (missingFields.length > 0) {
        message.error(`Please fill in: ${missingFields.join(", ")}`);
        return;
      }

      // Check for duplicates in associatedTo
      const associatedKeys = formData.associatedTo.map(
        (item) => `${item.workcenterId}-${item.resourceId}`
      );
      const hasDuplicateAssociated =
        associatedKeys.length !== new Set(associatedKeys).size;
      if (hasDuplicateAssociated) {
        message.error(
          "Duplicate Workcenter ID and Resource ID combinations are not allowed"
        );
        return;
      }
    }

    // Validate tasks
    if (formData.tasks?.length > 0) {
      const missingTaskNames = formData.tasks
        .map((task: { taskName: any; }, index: number) =>
          !task.taskName ? `Task Name for task ${index + 1}` : null
        )
        .filter(Boolean);

      if (missingTaskNames.length > 0) {
        message.error(`Please fill in: ${missingTaskNames.join(", ")}`);
        return;
      }

      // Check for duplicates in tasks
      const taskNames = formData.tasks.map((task: { taskName: any; }) => task.taskName);
      const hasDuplicateTasks = taskNames.length !== new Set(taskNames).size;
      if (hasDuplicateTasks) {
        message.error("Duplicate task names are not allowed");
        return;
      }
    }

    // Validate user roles
    if (formData.userRoles?.length > 0) {
      const missingFields = [];
      formData.userRoles.forEach((role: { roleId: any; roleName: any; permissions: string | any[]; }, index: number) => {
        if (!role.roleId) missingFields.push(`User ID for role ${index + 1}`);
        if (!role.roleName)
          missingFields.push(`User Name for role ${index + 1}`);
        if (!role.permissions?.length)
          missingFields.push(`Permissions for role ${index + 1}`);
      });

      if (missingFields.length > 0) {
        message.error(`Please fill in: ${missingFields.join(", ")}`);
        return;
      }

      // Check for duplicates in userRoles
      const userRoleKeys = formData.userRoles.map(
        (role: { roleId: any; roleName: any; }) => `${role.roleId}-${role.roleName}`
      );
      const hasDuplicateRoles =
        userRoleKeys.length !== new Set(userRoleKeys).size;
      if (hasDuplicateRoles) {
        message.error(
          "Duplicate User ID and User Name combinations are not allowed"
        );
        return;
      }
    }

    // Remove keys from nested arrays
    const cleanedFormData = {
      ...formData,
      associatedTo:
        formData.associatedTo?.map(({ key, ...rest }) => rest) || [],
      tasks: formData.tasks?.map(({ key, ...rest }) => rest) || [],
      userRoles: formData.userRoles?.map(({ key, ...rest }) => rest) || [],
    };
    console.log(cleanedFormData);
    try {
      if (selected?.createdDateTime) {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        const payload = {
          ...cleanedFormData,
          site: site,
          userId: userId,
        };
        const response = await updateLineClearance(
          site,
          userId,
          payload
        );
        if (response.message) {
          message.error(response.message);
        } else {
          message.success(response.message_details.msg);
          setCall(call + 1);
          setFormChange(false);
          setActiveTab(0);
        }
      } else {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        const payload = {
          ...formData,
          site: site,
          userId: userId,
        };
        const response = await createLineClearance(
          site,
          userId,
          payload
        );
        if (response.message) {
          message.error(response.message);
        } else {
          message.success(response.message_details.msg);
          setCall(call + 1);
          setFormChange(false);
          setFormData(defaultLineClearanceTemplate);
          setActiveTab(0);
          setIsAdding(false);
        }
      }
    } catch (error) {
      message.error(
        "An error occurred while saving the line clearance maintenance."
      );
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleConfirmDelete = async () => {
    const deleteLineClearanceData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;
      try {
        const payload = formData;
        const response = await deleteLineClearance(
          site,
          userId,
          payload
        );
        if (!response.errorCode) {
          message.success(response.message_details.msg);
          setCall(call + 1);
          onClose();
          setIsModalVisible(false);
          setIsAdding(false);
        } else {
          setCall(call + 1);
          setIsAdding(false);
        }
      } catch (error) {
        console.error("Error fetching data fields:", error);
      }
    };
    deleteLineClearanceData();
  };

  const handleOpenCopyModal = () => {
    setIsCopyModalVisible(true);
    copyForm.resetFields();
    copyForm.setFieldsValue({
      templateName: formData?.templateName
        ? `${formData?.templateName}_COPY`
        : "",
      description: formData?.description || "",
    });
  };

  const handleCloseCopyModal = () => {
    setIsCopyModalVisible(false);
  };

  const handlecapsChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    form.setFieldsValue({ templateName: value });
    setFormData((prevData: any) => ({
      ...prevData,
      templateName: value,
    }));
  };

  const handleConfirmCopy = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    try {
      const values = await copyForm.validateFields();
      const updatedRowData = {
        ...formData,
        templateName: values?.templateName,
        description: values?.description,
      };
      const response = await createLineClearance(
        site,
        userId,
        updatedRowData
      );
      if (response.message) {
        message.error(response.message);
      } else {
        message.success(response.message_details.msg);
        setCall(call + 1);
        onClose();
        handleCloseCopyModal();
        setActiveTab(0);
      }
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Failed to copy line clearance template");
    }
  };

  const handleChange = (changedValues: { [x: string]: any }) => {
    setFormData((prevData: any) => ({
      ...prevData,
      ...changedValues,
    }));
    setFormChange(true);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Form
            layout="horizontal"
            style={{ width: "100%" }}
            form={form}
            onValuesChange={handleChange}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 24 }}
          >
            <Form.Item
              label={t("templateName")}
              name="templateName"
              rules={[
                { required: true, message: "Please enter template name" },
              ]}
            >
              <Input
                placeholder="Enter template name"
                style={{ width: "40%" }}
                onChange={handlecapsChange}
              />
            </Form.Item>

            <Form.Item label={t("description")} name="description">
              <Input placeholder="Enter description" style={{ width: "40%" }} />
            </Form.Item>

            <Form.Item
              label={t("clearanceTimeLimit")}
              name="clearanceTimeLimit"
            >
              <Input
                style={{ width: "40%" }}
                placeholder="Enter clearance time limit"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  form.setFieldsValue({ clearanceTimeLimit: value });
                  setFormData((prevData) => ({
                    ...prevData,
                    clearanceTimeLimit: value,
                  }));
                }}
              />
            </Form.Item>

            <Form.Item label={t("maxPendingTasks")} name="maxPendingTasks">
              <Input
                style={{ width: "40%" }}
                placeholder="Enter max pending tasks"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  form.setFieldsValue({ maxPendingTasks: value });
                  setFormData((prevData) => ({
                    ...prevData,
                    maxPendingTasks: value,
                  }));
                }}
              />
            </Form.Item>

            <Form.Item
              label={t("clearanceReminderInterval")}
              name="clearanceReminderInterval"
            >
              <Input
                style={{ width: "40%" }}
                placeholder="Enter reminder interval"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  form.setFieldsValue({ clearanceReminderInterval: value });
                  setFormData((prevData) => ({
                    ...prevData,
                    clearanceReminderInterval: value,
                  }));
                }}
              />
            </Form.Item>

            <Form.Item
              label={t("notifyOnCompletion")}
              name="notifyOnCompletion"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label={t("enablePhotoEvidence")}
              name="enablePhotoEvidence"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        );
      case 1:
        return <LineClearanceAssociatedDataTable />;
      case 2:
        return <LineClearanceTasksDataTable />;
      case 3:
        return <LineClearanceUserRolesDataTable />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.dataFieldBodyContents}>
          <div className={isAdding ? styles.heading : styles.headings}>
            <div className={styles.split}>
              <div>
                <p className={styles.headingtext}>
                  {selected?.templateName
                    ? selected?.templateName
                    : t("createLineClearance")}
                </p>
                {selected?.templateName && (
                  <>
                    <p className={styles.dateText}>
                      {t("description")}:&nbsp;
                      <span className={styles.fadedText}>
                        {selected.description}
                      </span>
                    </p>
                    <p className={styles.dateText}>
                      {t("createdOn")}:&nbsp;
                      <span className={styles.fadedText}>
                        {dayjs(selected.createdDateTime).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )}
                      </span>
                    </p>
                    <p className={styles.dateText}>
                      {t("modifiedOn")}:&nbsp;
                      <span className={styles.fadedText}>
                        {dayjs(selected.modifiedDateTime).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )}
                      </span>
                    </p>
                  </>
                )}
              </div>

              <div className={styles.actionButtons}>
                {fullScreen ? (
                  <Tooltip title={t("exitFullScreen")}>
                    <Button
                      onClick={handleCloseChange}
                      className={styles.actionButton}
                    >
                      <CloseFullscreenIcon />
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip title={t("enterFullScreen")}>
                    <Button
                      onClick={handleOpenChange}
                      className={styles.actionButton}
                    >
                      <OpenInFullIcon />
                    </Button>
                  </Tooltip>
                )}

                {selected?.templateName && (
                  <>
                    <Tooltip title={t("copy")}>
                      <Button
                        onClick={handleOpenCopyModal}
                        className={styles.actionButton}
                      >
                        <CopyIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={t("delete")}>
                      <Button
                        onClick={handleOpenModal}
                        className={styles.actionButton}
                      >
                        <DeleteIcon />
                      </Button>
                    </Tooltip>
                  </>
                )}

                <Tooltip title={t("close")}>
                  <Button onClick={handleClose} className={styles.actionButton}>
                    <CloseIcon />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Activity Group Tabs"
            >
              <Tab label={t("main")} />
              <Tab label={t("associated")} />
              <Tab label={t("tasks")} />
              <Tab label={t("userRoles")} />
            </Tabs>
          </Box>
          <Box sx={{ padding: 2 }}>{renderTabContent()}</Box>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.floatingButtonContainer}>
          <Btn type="primary" onClick={handleSave}>
            {selected?.templateName ? t("save") : t("create")}
          </Btn>
          <Btn onClick={handleCancel}>{t("cancel")}</Btn>
        </div>
      </footer>
      <Modal
        title={t("confirmDelete")}
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCloseModal}
        okText={t("delete")}
        cancelText={t("cancel")}
        centered
      >
        <p>
          {t("areYouSure")} <strong>{formData?.templateName}</strong>?
        </p>
      </Modal>
      <Modal
        title={t("copyTemplate")}
        open={isCopyModalVisible}
        onOk={handleConfirmCopy}
        onCancel={handleCloseCopyModal}
        okText={t("copy")}
        cancelText={t("cancel")}
        centered
      >
        <Form form={copyForm} layout="vertical">
          <Form.Item
            label={t("templateName")}
            name="templateName"
            rules={[
              { required: true, message: "Please enter the Template Name" },
            ]}
          >
            <Input
              placeholder="Enter Template Name"
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9_]/g, "");
                copyForm.setFieldsValue({ templateName: value });
              }}
            />
          </Form.Item>
          <Form.Item label={t("description")} name="description">
            <Input placeholder="Enter Description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LineClearanceBody;
