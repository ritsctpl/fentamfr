"use client";

import React, { useContext, useState, useEffect } from "react";
import { parseCookies } from "nookies";
import styles from "@modules/podApp/styles/FilterCommonBar.module.css";
import { useTranslation } from "react-i18next";
import { retrieveResourceStatus } from "@services/podServices";
import DynamicForm from "./DynamicForm";
import { PodContext } from "@modules/podApp/hooks/userContext";
import { Button, message } from "antd";
import { ClearOutlined } from "@mui/icons-material";

const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const DataFieldCommonBar = () => {
  const {
    setSelectedRowData,
    setFilterFormData,
    filterFormData,
    setData,
    setCall,
    call,
    setError,
    phaseByDefault,
    setPhaseByDefault,
    activityId,
    setActivityId,
  } = useContext(PodContext);
  const [qty, setQty] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [site, setSite] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(true); // New state for filter visibility

  const handleItemFetch = async () => {
    const cookies = parseCookies();
    const site = cookies?.site;

    try {
      const resourceStatus = await retrieveResourceStatus({
        site,
        resource: filterFormData?.defaultResource,
      });

      console.log(resourceStatus, "resourceStatus");

      // Update resource status in the filter form data
      setFilterFormData((prev) => ({
        ...prev,
        resourceStatus: resourceStatus?.status,
      }));
    } catch (error) {
      console.error("Error fetching resource status:", error);
      setError("Failed to retrieve resource status");
    }
  };

  const { t } = useTranslation();
  const fieldsToInclude = (() => {
    // debugger
    if (filterFormData) {
      const isOperation =
        filterFormData?.type?.toLowerCase().replaceAll(" ", "") === "operation";
      const isWorkCenterOrPcu =
        filterFormData?.type?.toLowerCase().replaceAll(" ", "") ===
          "workcenter" ||
        filterFormData?.type?.toLowerCase().replaceAll(" ", "") === "pcu";
      const isDiscrete =
        filterFormData?.podCategory?.toLowerCase().replaceAll(" ", "") ==
        "discrete";
      const isProcess =
        filterFormData?.podCategory?.toLowerCase().replaceAll(" ", "") ===
          "process" ||
        filterFormData?.podCategory?.toLowerCase().replaceAll(" ", "") ===
          "processorder";

      if (isOperation) {
        return isDiscrete
          ? [
              "pcu",
              "operation",
              "resource",
              ...(filterFormData.showQuantity ? ["qty"] : []),
            ]
          : [
              filterFormData.phaseCanBeChanged ? "phase" : null,
              filterFormData.operationCanBeChanged ? "operation" : null,
              filterFormData.resourceCanBeChanged ? "resource" : null,
              "batchNo",
              ...(filterFormData.showQuantity ? ["qty"] : []),
            ];
      } else if (isWorkCenterOrPcu) {
        return isDiscrete
          ? [
              "pcu",
              "workCenter",
              "resource",
              ...(filterFormData.showQuantity ? ["qty"] : []),
            ]
          : [
              "batchNo",
              "workCenter",
              "resource",
              ...(filterFormData.showQuantity ? ["qty"] : []),
            ];
      }
      return []; // Default case if none match
    }
  })();

  const handleValuesChange = (changedValues: any) => {
    setQty(changedValues.qty);
  };

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        {isFilterVisible ? (
          <>
            <DynamicForm
              data={{
                pcu: null,
                batchNo: null,
                operation: "",
                workCenter: "",
                resource: "",
                qty: null,
                phase: "",
              }}
              fields={fieldsToInclude}
              onValuesChange={handleValuesChange}
              qty={qty}
            />

            <div className={styles.goButton} style={{ marginTop: "-2px" }}>
              <Button
                style={{
                  color: "#ffffff",
                  background: "#006568",
                  border: "none",
                  height: "32px",
                  padding: "4px 15px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                }}
                onClick={handleItemFetch}
                className={styles.blueButton}
                type="primary"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                {t("go")}
              </Button>

              <Button
                onClick={() => {
                  setSelectedRowData([]);
                  setFilterFormData((prev) => ({
                    ...prev,
                    defaultOperation: "",
                    defaultResource: "",
                    qtty: "",
                    defaultPhaseId: "",
                    defaultPhaseSequence: "",
                  }));
                  setPhaseByDefault("");
                  sessionStorage.removeItem("quantity");
                }}
                style={{
                  color: "#006568",
                  borderColor: "#006568",
                  marginLeft: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {t("clear")}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DataFieldCommonBar;
