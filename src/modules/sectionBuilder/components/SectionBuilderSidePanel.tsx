/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "../styles/SidePannel.module.css";
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
  DatePicker,
} from "antd";
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, Tabs, Tab, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import SectionBuilderTab from "./SectionBuilderTab";
import { MdCloseFullscreen } from "react-icons/md";
import { useSectionBuilderContext } from "../hooks/sectionBuilderContex";
import { defaulSectionBuilderform } from "../types/SectionBuilderTypes";
import { fetchSectionBuilderData } from "../../../services/sectionBuilderService";

interface SidePannelProps {
  isAdding: boolean;
  selected: any;
  drag: boolean;
  fullScreen: boolean;
  call: number;
  onClose: () => void;
  setCall: (val: number) => void;
  setIsAdding: (val: boolean) => void;
  setFullScreen: (val: boolean) => void;
  onRefreshData?: () => void;
  username?: string;
}

const formatDateTime = (dateTime?: dayjs.Dayjs): string =>
  dateTime ? dateTime.format("DD-MM-YYYY HH:mm:ss") : "";

const SectionService = {
  async saveSection(formValues: any, isUpdate: boolean, username: string) {
    const cookies = parseCookies();
  if(formValues?.sectionLabel==="")
  {
    message.error("Please fill Section Label");
    return;
  }
    const saveData = {
      ...formValues,
      site: cookies.site,
      effectiveDateTime: formValues.effectiveDateTime
        ? dayjs(formValues.effectiveDateTime).format("YYYY-MM-DDTHH:mm:ss")
        : "",
      userId: username,
    };

    try {
      const operation = isUpdate ? "updateSection" : "createSection";

      const response = await fetchSectionBuilderData(
        saveData,
        "sectionbuilder-service",
        operation
      );

      if (response?.message_details) {
        const { msg, msg_type } = response.message_details;

        if (msg_type === "S") {
          return {
            success: true,
            message:
              msg ||
              (isUpdate
                ? "Section updated successfully"
                : "Section created successfully"),
            data: response.sectionBuilder,
          };
        } else {
          return {
            success: false,
            message: msg || "An error occurred while saving the section",
          };
        }
      }

      return {
        success: false,
        message: "Unexpected response from server",
      };
    } catch (error) {
      console.error("Save section error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while saving the section",
      };
    }
  },

  async deleteSection(sectionLabel: string) {
    const cookies = parseCookies();

    if (!sectionLabel || !cookies.site) {
      return {
        success: false,
        message: "Missing required information for deletion.",
      };
    }

    try {
      const deletePayload = {
        site: cookies.site,
        sectionLabel: sectionLabel,
      };

      const response = await fetchSectionBuilderData(
        deletePayload,
        "sectionbuilder-service",
        "deleteSection"
      );

      if (
        response &&
        response.message_details &&
        response.message_details.msg_type === "S"
      ) {
        return {
          success: true,
          message:
            response.message_details.msg ||
            `${sectionLabel} deleted successfully`,
        };
      } else {
        return {
          success: false,
          message:
            (response &&
              response.message_details &&
              response.message_details.msg) ||
            `Failed to delete ${sectionLabel}`,
        };
      }
    } catch (error) {
      console.error("Delete section error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the section",
      };
    }
  },

  async copySection(formValues: any, newSectionLabel: string) {
    try {
      const copiedSection = {
        ...formValues,
        sectionLabel: newSectionLabel,
      };

      return await this.saveSection(copiedSection, false);
    } catch (error) {
      console.error("Copy section error:", error);
      return {
        success: false,
        message: "Failed to copy section",
      };
    }
  },
};

const SectionBuilderSidePanel: React.FC<SidePannelProps> = ({
  selected,
  fullScreen,
  setIsAdding,
  drag,
  call,
  setCall,
  isAdding,
  onClose,
  setFullScreen,
  onRefreshData,
  username,
}) => {
  const cookies = parseCookies();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { formValues, setFormValues } = useSectionBuilderContext();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
  const [copyForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState(0);

  const initialFormValues = useMemo(() => {
    if (selected) {
      return {
        ...defaulSectionBuilderform,
        ...selected,
        effectiveDateTime: selected.effectiveDateTime
          ? dayjs(selected.effectiveDateTime)
          : undefined,
      };
    }
    return defaulSectionBuilderform;
  }, [selected]);

  useEffect(() => {
    setFormValues(initialFormValues);
    form.setFieldsValue(initialFormValues);
  }, [selected, initialFormValues]);

  const handleSave = useCallback(async () => {
    try {
      await form.validateFields();

      const result = await SectionService.saveSection(
        formValues,
        !!selected?.sectionLabel,
        username
      );

      if (result.success) {
        message.success(result.message);
        onClose();
        setActiveTab(0);

        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        setActiveTab(0);
        // message.error(result.message);
      }
    } catch (error) {
      // message.error(
      //   error instanceof Error
      //     ? error.message
      //     : "Please fill in all required fields"
      // );
    }
  }, [formValues, selected, onClose, onRefreshData]);

  const handleDelete = useCallback(async () => {
    if (!selected?.sectionLabel) return;

    const result = await SectionService.deleteSection(selected.sectionLabel);

    if (result.success) {
      message.success(result.message);
      setIsModalVisible(false);
      onClose();

      if (onRefreshData) {
        onRefreshData();
      }
    } else {
      message.error(result.message);
    }
  }, [selected, onClose, onRefreshData]);

  const handleCopy = useCallback(async () => {
    try {
      await copyForm.validateFields();

      const copyValues = copyForm.getFieldsValue();

      const result = await SectionService.copySection(
        formValues,
        copyValues.sectionLabel
      );

      if (result.success) {
        message.success(result.message);
        setIsCopyModalVisible(false);

        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        message.error(result.message);
      }
    } catch (errorInfo) {
      message.error("Please fill in all required fields");
    }
  }, [formValues, copyForm, onRefreshData]);

  const handleFullScreenToggle = useCallback(
    (isOpen: boolean) => {
      setFullScreen(isOpen);
      if (isOpen && activeTab !== 1) {
        // setActiveTab(1);
      } else if (!isOpen && activeTab === 1) {
        // setActiveTab(0);
      }
    },
    [activeTab]
  );

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      if (newValue === 1) {
        setFullScreen(true);
      } else if (newValue === 0) {
        setFullScreen(false);
      }
      setActiveTab(newValue);
    },
    []
  );

  const handleCancel = useCallback(() => {
    setFormValues(initialFormValues);
    onClose();
    setActiveTab(0);
  }, [initialFormValues, onClose]);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleOpenCopyModal = () => {
    setIsCopyModalVisible(true);
  };

  const handleCloseCopyModal = () => {
    setIsCopyModalVisible(false);
  };

  const renderMainForm = () => (
    <Form
      layout="horizontal"
      style={{ width: "100%", paddingTop: "16px" }}
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onValuesChange={(changedValues) => {
        setFormValues({
          ...formValues,
          ...changedValues,
        });
      }}
      initialValues={initialFormValues}
    >
      <Form.Item
        label="Section Label"
        name="sectionLabel"
        rules={[{ required: true, message: "Please fill Section Label" }]}
      >
        <Input
          placeholder="Enter Section Label"
          style={{ width: "40%" }}
          onChange={(e) => {
            const value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, "");
            form.setFieldsValue({ sectionLabel: value });
            setFormValues({
              ...formValues,
              sectionLabel: value,
            });
          }}
          value={formValues.sectionLabel}
        />
      </Form.Item>
      <Form.Item
        label="Instructions"
        name="instructions"
        rules={[{ required: false }]}
      >
        <Input.TextArea
          placeholder="Enter Instructions"
          style={{ width: "40%", height: 100, resize: "none" }}
          autoSize={false}
        />
      </Form.Item>
      <Form.Item
        label={t("effectiveDateTime")}
        name="effectiveDateTime"
        rules={[{ required: true }]}
      >
        <DatePicker
          style={{ width: "40%" }}
          placeholder={t("selectDate")}
          format="DD-MM-YYYY HH:mm:ss"
          showTime
        />
      </Form.Item>
    </Form>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderMainForm();
      case 1:
        return <SectionBuilderTab />;
      default:
        return null;
    }
  };

  const renderActionButtons = () => (
    <div className={styles.actionButtons}>
      {fullScreen ? (
        <Tooltip title={t("exitFullScreen")}>
          <Button
            onClick={() => handleFullScreenToggle(false)}
            className={styles.actionButton}
            disabled={activeTab === 1}
          >
            <MdCloseFullscreen
              style={{
                color: activeTab === 1 ? "grey" : "var(--button-color)",
              }}
              size={22}
            />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title={t("enterFullScreen")}>
          <Button
            onClick={() => handleFullScreenToggle(true)}
            className={styles.actionButton}
            disabled={activeTab === 1}
          >
            <OpenInFullIcon />
          </Button>
        </Tooltip>
      )}

      {selected?.sectionLabel && (
        <>
          <Tooltip title={t("copy")}>
            <Button
              onClick={() => setIsCopyModalVisible(true)}
              className={styles.actionButton}
            >
              <CopyIcon />
            </Button>
          </Tooltip>
          <Tooltip title={t("delete")}>
            <Button
              onClick={() => setIsModalVisible(true)}
              className={styles.actionButton}
            >
              <DeleteIcon />
            </Button>
          </Tooltip>
        </>
      )}

      <Tooltip title={t("close")}>
        <Button onClick={handleCancel} className={styles.actionButton}>
          <CloseIcon />
        </Button>
      </Tooltip>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.dataFieldBodyContents}>
          <div className={isAdding ? styles.heading : styles.headings}>
            <div className={styles.split}>
              <div>
                <p className={styles.headingtext}>
                  {selected?.sectionLabel
                    ? selected?.sectionLabel
                    : t("Create Section Builder")}
                </p>
                {selected?.sectionLabel && (
                  <>
                    <p className={styles.dateText}>
                      {t("createdOn")}:&nbsp;
                      <span className={styles.fadedText}>
                        {formatDateTime(dayjs(selected.createdDateTime))}
                      </span>
                    </p>
                    <p className={styles.dateText}>
                      {t("modifiedOn")}:&nbsp;
                      <span className={styles.fadedText}>
                        {formatDateTime(dayjs(selected.modifiedDateTime))}
                      </span>
                    </p>
                  </>
                )}
              </div>

              {renderActionButtons()}
            </div>
          </div>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Activity Group Tabs"
            >
              <Tab label={t("main")} />
              <Tab label={t("Section Builder")} />
            </Tabs>
          </Box>
          <Box sx={{ padding: 0 }}>{renderTabContent()}</Box>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.floatingButtonContainer}>
          <Btn type="primary" onClick={handleSave}>
            {selected?.sectionLabel ? t("save") : t("create")}
          </Btn>
          <Btn onClick={handleCancel}>{t("cancel")}</Btn>
        </div>
      </footer>
      <Modal
        title={t("confirmDelete")}
        open={isModalVisible}
        onOk={handleDelete}
        onCancel={handleCloseModal}
        okText={t("delete")}
        cancelText={t("cancel")}
        centered
      >
        <p>
          {t("areYouSure")} <strong>{selected?.sectionLabel}</strong>?
        </p>
      </Modal>
      <Modal
        title={t("copyTemplate")}
        open={isCopyModalVisible}
        onOk={handleCopy}
        onCancel={handleCloseCopyModal}
        okText={t("copy")}
        cancelText={t("cancel")}
        centered
      >
        <Form form={copyForm} layout="vertical">
          <Form.Item
            label={t("sectionLabel")}
            name="sectionLabel"
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
                copyForm.setFieldsValue({ sectionLabel: value });
              }}
            />
          </Form.Item>
          {/* <Form.Item label={t("description")} name="description">
            <Input placeholder="Enter Description" />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default SectionBuilderSidePanel;
