/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import styles from "@modules/certificationMaintenance/styles/certificationMaintenance.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { parseCookies } from "nookies";
import {
  Form,
  Input,
  message,
  Modal,
  Tooltip,
  Button as Btn,
  Select,
  InputNumber,
} from "antd";
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, Tabs, Tab, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { certificationMaintenanceContext } from "@modules/certificationMaintenance/hooks/certificationMaintenanceContext";
import CertificationMaintenanceTransfer from "./certificationMaintenanceTransfer";
import CertificationCustomData from "./certificationcustomData";
import {
  createCertificationMaintenance,
  deleteCertificationMaintenance,
  updateCertificationMaintenance,
} from "@services/certificationMaintenanceService";
import { defaultCertificationMaintenanceRequest } from "../types/certificationMaintenanceTypes";

interface CertificationMaintenanceBodyProps {
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

const CertificationMaintenanceBody: React.FC<
  CertificationMaintenanceBodyProps
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
  } = useContext<any>(certificationMaintenanceContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
  const [copyForm] = Form.useForm();

  useEffect(() => {
    if (formData) {
      const updatedFormData = { ...formData };
      
      // Handle duration
      if (updatedFormData.duration) {
        const [durationValue, durationUnit] =
          updatedFormData.duration.split(" ");
        updatedFormData.duration = durationValue || "";
        updatedFormData.durationUnit = durationUnit || "Days";
      } else {
        updatedFormData.duration = "";
        updatedFormData.durationUnit = "Days";
      }

      // Handle maxExtensionDuration
      if (updatedFormData.maxExtensionDuration) {
        const [extensionValue, extensionUnit] =
          updatedFormData.maxExtensionDuration.split(" ");
        updatedFormData.maxExtensionDuration = extensionValue || "";
        updatedFormData.maxExtensionUnit = extensionUnit || "Days";
      } else {
        updatedFormData.maxExtensionDuration = "";
        updatedFormData.maxExtensionUnit = "Days";
      }
      form.setFieldsValue(updatedFormData);
    }
  }, [formData]);

  // useEffect(() => {
  //   if (formData) {
  //     const updatedFormData = { ...formData };

  //     // Handle duration
  //     if (updatedFormData.duration) {
  //       const [durationValue, durationUnit] =
  //         updatedFormData.duration.split(" ");
  //       updatedFormData.duration = durationValue || "";
  //       updatedFormData.durationUnit = durationUnit || "Days";
  //     } else {
  //       updatedFormData.duration = "";
  //       updatedFormData.durationUnit = "Days";
  //     }

  //     // Handle maxExtensionDuration
  //     if (updatedFormData.maxExtensionDuration) {
  //       const [extensionValue, extensionUnit] =
  //         updatedFormData.maxExtensionDuration.split(" ");
  //       updatedFormData.maxExtensionDuration = extensionValue || "";
  //       updatedFormData.maxExtensionUnit = extensionUnit || "Days";
  //     } else {
  //       updatedFormData.maxExtensionDuration = "";
  //       updatedFormData.maxExtensionUnit = "Days";
  //     }

  //     form.setFieldsValue(updatedFormData);
  //   }
  // }, [form, formData]);

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
    const errors = [];

    // Check all required fields
    if (!formData?.certification) {
      errors.push("Certification");
    }
    if (!formData?.duration) {
      errors.push("Duration");
    }
    if (!formData?.durationType) {
      errors.push("Duration Type");
    }

    // If there are any errors, show them and return
    if (errors.length > 0) {
      message.error(
        `Please fill in the following required fields: ${errors.join(", ")}`
      );
      return;
    }

    try {
      if (selected?.createdDateTime) {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        const payload = {
          ...formData,
          site: site,
          userId: userId,
        };
        const response = await updateCertificationMaintenance(
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
        const response = await createCertificationMaintenance(
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
          setFormData(defaultCertificationMaintenanceRequest);
          setActiveTab(0);
          setIsAdding(false);
        }
      }
    } catch (error) {
      message.error(
        "An error occurred while saving the certification maintenance."
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
    const deleteCertificationData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      try {
        const payload = formData;
        const response = await deleteCertificationMaintenance(
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

    deleteCertificationData();
  };

  const handleOpenCopyModal = () => {
    setIsCopyModalVisible(true);
    copyForm.resetFields();
    copyForm.setFieldsValue({
      certification: formData?.certification
        ? `${formData?.certification}_COPY`
        : "",
      description: formData?.description || "",
    });
  };

  const handleCloseCopyModal = () => {
    setIsCopyModalVisible(false);
  };

  const handleCertificationChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    form.setFieldsValue({ certification: value });
    setFormData((prevData) => ({
      ...prevData,
      certification: value,
    }));
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const { value } = e.target;
    const formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    form.setFieldsValue({ [fieldName]: formattedValue });
  };

  const handleConfirmCopy = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    try {
      const values = await copyForm.validateFields();
      const updatedRowData = {
        ...formData,
        certification: values?.certification,
        description: values?.description,
      };
      const response = await createCertificationMaintenance(
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
      message.error("Failed to copy certification");
    }
  };

  const handleChange = (changedValues) => {
    const newValues = { ...changedValues };

    // Combine duration values if either duration or durationUnit changed
    if (changedValues.duration || changedValues.durationUnit) {
      const duration = form.getFieldValue("duration");
      const unit = form.getFieldValue("durationUnit");
      if (duration && unit) {
        newValues.duration = `${duration} ${unit}`;
      }
    }

    // Combine maxExtensionDuration values if either value changed
    if (changedValues.maxExtensionDuration || changedValues.maxExtensionUnit) {
      const duration = form.getFieldValue("maxExtensionDuration");
      const unit = form.getFieldValue("maxExtensionUnit");
      if (duration && unit) {
        newValues.maxExtensionDuration = `${duration} ${unit}`;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      ...newValues,
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
              label={t("certification")}
              name="certification"
              rules={[
                { required: true, message: "Please enter the Certification" },
              ]}
            >
              <Input
                placeholder="Enter Certification"
                onChange={handleCertificationChange}
                style={{ width: "40%" }}
              />
            </Form.Item>

            <Form.Item label={t("description")} name="description">
              <Input placeholder="Description" style={{ width: "40%" }} />
            </Form.Item>

            <Form.Item label={t("durationType")} name="durationType">
              <Select defaultValue="Temporary" style={{ width: "40%" }}>
                <Select.Option value="Temporary">Temporary</Select.Option>
                <Select.Option value="Permanent">Permanent</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label={t("duration")} required>
              <Input.Group compact>
                <Form.Item
                  name="duration"
                  noStyle
                  rules={[{ required: true, message: "Required" }]}
                  initialValue={String(formData?.duration || "")?.split(" ")[0]}
                >
                  <InputNumber
                    style={{ width: "40%" }}
                    min={0}
                    placeholder="Duration"
                  />
                </Form.Item>
                <Form.Item
                  name="durationUnit"
                  noStyle
                  initialValue={
                    String(formData?.duration || "")?.split(" ")[1] || "Days"
                  }
                >
                  <Select style={{ width: "40%" }}>
                    <Select.Option value="Days">Days</Select.Option>
                    <Select.Option value="Weeks">Weeks</Select.Option>
                    <Select.Option value="Months">Months</Select.Option>
                    <Select.Option value="Years">Years</Select.Option>
                  </Select>
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item label={t("status")} name="status">
              <Select defaultValue="Cert Enabled" style={{ width: "40%" }}>
                <Select.Option value="Cert Enabled">Cert Enabled</Select.Option>
                <Select.Option value="Cert Hold">Cert Hold</Select.Option>
                <Select.Option value="Cert Obsolete">
                  Cert Obsolete
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={t("maxNumberOfExtensions")}
              name="maxNumberOfExtensions"
            >
              <InputNumber
                style={{ width: "40%" }}
                min={0}
                placeholder="Max Number of Extensions"
              />
            </Form.Item>

            <Form.Item
              label={t("maxExtensionDuration")}
              style={{ marginBottom: 0 }}
            >
              <Input.Group compact>
                <Form.Item
                  name="maxExtensionDuration"
                  noStyle
                  initialValue={
                    String(formData?.maxExtensionDuration || "")?.split(" ")[0]
                  }
                >
                  <InputNumber
                    style={{ width: "40%" }}
                    min={0}
                    placeholder="Duration"
                  />
                </Form.Item>
                <Form.Item
                  name="maxExtensionUnit"
                  noStyle
                  initialValue={
                    String(formData?.maxExtensionDuration || "")?.split(
                      " "
                    )[1] || "Days"
                  }
                >
                  <Select style={{ width: "40%" }}>
                    <Select.Option value="Days">Days</Select.Option>
                    <Select.Option value="Weeks">Weeks</Select.Option>
                    <Select.Option value="Months">Months</Select.Option>
                    <Select.Option value="Years">Years</Select.Option>
                  </Select>
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Form>
        );
      case 1:
        return <CertificationMaintenanceTransfer drag={drag} />;
      case 2:
        return <CertificationCustomData />;
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
                  {selected?.certification
                    ? selected?.certification
                    : t("createCertification")}
                </p>
                {selected?.certification && (
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

                {selected?.certification && (
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
              <Tab label={t("assignment")} />
              <Tab label={t("customData")} />
            </Tabs>
          </Box>
          <Box sx={{ padding: 2 }}>{renderTabContent()}</Box>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.floatingButtonContainer}>
          <Btn type="primary" onClick={handleSave}>
            {selected?.certification ? t("save") : t("create")}
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
          {t("areYouSure")} <strong>{formData?.certification}</strong>?
        </p>
      </Modal>
      <Modal
        title={t("copyCertification")}
        open={isCopyModalVisible}
        onOk={handleConfirmCopy}
        onCancel={handleCloseCopyModal}
        okText={t("copy")}
        cancelText={t("cancel")}
        centered
      >
        <Form form={copyForm} layout="vertical">
          <Form.Item
            label={t("certification")}
            name="certification"
            rules={[
              { required: true, message: "Please enter the Certification" },
            ]}
          >
            <Input
              placeholder="Enter Certification"
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9_]/g, "");
                copyForm.setFieldsValue({ certification: value });
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

export default CertificationMaintenanceBody;
