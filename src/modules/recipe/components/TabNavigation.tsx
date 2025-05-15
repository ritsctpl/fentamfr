// pages/index.tsx
import React, { useContext, useEffect, useState } from "react";
import { Form, Button, message } from "antd";
import { Box, CircularProgress, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { parseCookies } from "nookies";
import { addOperation, updateOperation } from "@services/operationService";
import { OperationContext } from "../hooks/recipeContext";
import DynamicForm from "./DynamicForm";
import styles from "../styles/Tab.module.css";
import { useTranslation } from "react-i18next";
import { createRecipe, updateRecipe } from "@services/recipeServices";
import IngredientTable from "./IngredientActive";
import IngredientInactive from "./IngredientInactive";
import PhasesTab from "./Phases";
import WorkCenter from "./WorkCenter";
import PackagingLabeling from "./PackagingAndLabeling";
import TriggerPointTable from "./TriggerPnt";
import YieldTracking from "./YieldTracking";
import SafetyProcedureTable from "./Safety";
import ComplianceScreen from "./ComplianceScreen";

const TabNav = ({ onCancel, selectedRowKey }) => {
  const {
    isEditing,
    setIsHeaderShow,
    setIsTableShowInActive,
    setIsFullScreen,
    setIsTableShow,
    erpShift,
    isTableShow,
    isTableShowInActive,
    setErpShift,
    setFormData,
    formData,
    call,
    setCall,
  } = useContext(OperationContext);
  const [mainForm] = Form.useForm();
  const [certificationForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    // setIsFullScreen(false);
    setIsHeaderShow(false);
    setIsTableShow(false);
    setIsTableShowInActive(false);
    setIsTableShow(false);
  };

  // Update form values when formData or mainForm changes
  useEffect(() => {
    if (mainForm && formData) {
      mainForm.setFieldsValue(formData);
    }
  }, [formData, mainForm]);

  const handleSave = async () => {
    setLoading(true);
    // Check if any certification field is empty
    message.destroy();
    try {
      // Validate main form fields
      await mainForm.validateFields();

      // Retrieve cookies
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      // Prepare payload for API call
      const payload = {
        site: site,
        ...formData,
        user: userId,
        localDateTime: new Date().toISOString(),
      };

      // Perform the API call
      const res = await updateRecipe(payload);

      // Check for API response errors
      if (res.errorCode) {
        message.error(res.message);
        return;
      }

      // Show success message and update state
      message.success(res.message_details.msg);
      setCall(call + 1);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while saving the data.");
      setLoading(false);
    }
    setIsHeaderShow(false);
    setIsTableShow(false);
    setIsTableShowInActive(false);
  };

  const handleAdd = async () => {
    setLoading(true);
    message.destroy();
    try {
      // Validate the main form fields
      await mainForm.validateFields();

      // Extract cookies for API call
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      // Check if essential fields are provided
      if (!formData.recipeId) {
        throw new Error("Recipe Name fields cannot be empty.");
      }
      if (!formData.version) {
        throw new Error("Version fields cannot be empty.");
      }
      if (!formData.batchSize) {
        throw new Error("Batch Size is required.");
      }
      if (isNaN(Number(formData.batchSize))) {
        throw new Error("Batch Size must be a number.");
      }
      if (!formData.batchUom) {
        throw new Error("Batch UOM is required.");
      }

      // Prepare the payload for the API call
      const payload = {
        ...formData,
        user: userId,
        localDateTime: new Date().toISOString(),
      };

      // Perform the API call to add the operation
      const res = await createRecipe(payload, site);

      // Check the response for errors
      if (res.errorCode) {
        throw new Error(res.message || "Failed to add operation.");
      }

      // Notify the user of success
      message.success(res.message_details.msg);
      setCall(call + 1);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      message.error(
        error.message ||
          "An error occurred while adding the operation. Please check your input."
      );
      setLoading(false);
    }
  };

  const fieldsToInclude = [
    "recipeId",
    "version",
    "recipeDescription",
    "status",
    "batchSize",
    "batchUom",
    "totalExpectedCycleTime",
    "totalActualCycleTime",
    "workCenter",
    "addAsErpOperation",
    "currentVersion",
  ];

  const handleValuesChange = (changedValues: any) => {
    if ("batchSize" in changedValues) {
      const numericValue = changedValues.batchSize.replace(/[^0-9.]/g, "");
      changedValues.batchSize = numericValue;
    }

    setFormData((prevData) => ({
      ...prevData,
      ...changedValues,
    }));
  };

  return (
    <div style={{ padding: "0px 0px" }}>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              display: "flex",
              flexWrap: "nowrap",
            }}
          >
            {/* Conditionally render tabs based on isEditing and erpShift */}
            {isEditing && erpShift ? (
              <TabList
                scrollButtons="auto"
                onChange={handleChange}
                aria-label="scrollable tabs"
                sx={{ minWidth: "max-content" }}
              >
                <Tab label={t("main")} value="1" />
                <Tab label={t("ingredients")} value="2" />
                <Tab label={t("phases")} value="3" />
                <Tab label={t("packagingLabeling")} value="4" />
                <Tab label={t("workCenter")} value="5" />
                <Tab label={t("triggerPoints")} value="6" />
                <Tab label={t("yieldWasteTracking")} value="7" />
                <Tab label={t("safetyProcedures")} value="8" />
                <Tab label={t("Compliance")} value="9" />
              </TabList>
            ) : (
              <TabList
                scrollButtons="auto"
                onChange={handleChange}
                aria-label="scrollable tabs"
                sx={{ minWidth: "max-content" }}
              >
                {/* Only the first tab is shown */}
                <Tab label={t("main")} value="1" />
              </TabList>
            )}
          </Box>
        </Box>

        {/* Conditionally render TabPanels based on isEditing and erpShift */}
        {isEditing && erpShift ? (
          <>
            <TabPanel value="1">
              <DynamicForm
                data={formData}
                fields={fieldsToInclude}
                onValuesChange={handleValuesChange}
              />
            </TabPanel>
            <TabPanel value="2">
              {!isTableShowInActive ? (
                <IngredientTable tabName="active" />
              ) : null}
              <br />
              {!isTableShow ? <IngredientInactive tabName="inactive" /> : null}
            </TabPanel>
            <TabPanel value="3">
              <PhasesTab />
            </TabPanel>
            <TabPanel value="4">
              <PackagingLabeling />
            </TabPanel>
            <TabPanel value="5">
              <WorkCenter />
            </TabPanel>
            <TabPanel value="6">
              <TriggerPointTable />
            </TabPanel>
            <TabPanel value="7">
              <YieldTracking tabName={""} />
            </TabPanel>
            <TabPanel value="8">
              <SafetyProcedureTable />
            </TabPanel>
            <TabPanel value="9">
              <ComplianceScreen />
            </TabPanel>
          </>
        ) : (
          <TabPanel value="1">
            <DynamicForm
              data={formData}
              fields={fieldsToInclude}
              onValuesChange={handleValuesChange}
            />
          </TabPanel>
        )}
      </TabContext>

      {activeTab !== "2" && activeTab !== "3" && (
        <div
          className={styles.submitButton}
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          {isEditing && erpShift ? (
            <Button type="primary" onClick={handleSave}>
              {t("save")}
            </Button>
          ) : (
            <Button type="primary" onClick={handleAdd}>
              {t("create")}
            </Button>
          )}
          <Button style={{ marginLeft: 8 }} onClick={onCancel}>
            {t("cancel")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TabNav;
