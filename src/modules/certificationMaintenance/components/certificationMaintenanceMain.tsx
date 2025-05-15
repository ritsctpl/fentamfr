"use client";

import React, { useEffect, useState } from "react";
import styles from "@modules/certificationMaintenance/styles/certificationMaintenance.module.css";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import CommonAppBar from "@components/CommonAppBar";
import { useTranslation } from "react-i18next";
import CommonTable from "@components/CommonTable";
import { Modal } from "antd";
import { certificationMaintenanceContext } from "@modules/certificationMaintenance/hooks/certificationMaintenanceContext";
import CertificationMaintenanceBar from "./certificationMaintenanceBar";
import {
  fetchCertificationMaintenanceTop50,
  RetriveCertificationMaintenanceSelectedRow,
  fetchCertificationMaintenanceAll,
} from "@services/certificationMaintenanceService";
import CertificationMaintenanceBody from "@modules/certificationMaintenance/components/certificationMaintenanceBody";
import {
  CertificationMaintenanceRequest,
  defaultCertificationMaintenanceRequest,
} from "../types/certificationMaintenanceTypes";

interface DataRow {
  [key: string]: string | number;
}

interface DecodedToken {
  preferred_username: string;
}

const CertificationMaintenanceMain: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<CertificationMaintenanceRequest>(
    defaultCertificationMaintenanceRequest
  );
  const [selected, setSelected] = useState<object>({});
  const { isAuthenticated, token } = useAuth();
  const [itemData, setItemData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [drag, setDrag] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [resetValueCall, setResetValueCall] = useState<number>(0);
  const [rowClickCall, setRowClickCall] = useState<number>(0);
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<DataRow | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchResourceData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      try {
        const item = await fetchCertificationMaintenanceTop50(site);
        setItemData(item.certificationList);
        setFilteredData(item.certificationList);
        setCall(0);
      } catch (error) {
        console.error("Error fetching data fields:", error);
      }
    };

    fetchResourceData();
  }, [isAuthenticated, username, call, token, site]);

  const handleTop50 = async () => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const response = await fetchCertificationMaintenanceTop50(site);
      setFilteredData(response.certificationList);
    } catch (error) {
      console.error("Error fetching data fields:", error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    try {
      const certificationMaintenanceAll =
        await fetchCertificationMaintenanceAll(site);
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = certificationMaintenanceAll?.certificationList?.filter(
          (row) =>
            Object.values(row).some((value) =>
              String(value).toLowerCase().includes(lowercasedTerm)
            )
        );
      } else {
        filtered = itemData;
      }
      setFilteredData(filtered);
    } catch (error) {
      console.error("Error fetching data fields:", error);
    }
  };

  const handleAddClick = () => {
    setResetValue(true);
    setFormData(defaultCertificationMaintenanceRequest);
    setIsAdding(true);
    setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setDrag(true);
    setSelected({});
  };

  const handleRowSelect = (row) => {
    if (isAdding && formChange) {
      setSelectRowData(row);
      setIsModalVisible(true);
    } else {
      setDrag(false);
      SelectRow(row);
      setSelected(row);
      setActiveTab(0);
      setFormChange(false);
    }
  };

  const handleModalOk = () => {
    if (selectRowData) {
      setFormChange(false);
      SelectRow(selectRowData);
      setActiveTab(0);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const SelectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const rowData = await RetriveCertificationMaintenanceSelectedRow(
        site,
        row
      );
      setRowClickCall(rowClickCall + 1);
      setFormData(rowData);
      setIsAdding(true);
      setResetValue(false);
      setFullScreen(false);
      setSelected(rowData);
      setDrag(false);
    } catch (error) {
      console.error("Error fetching data fields:", error);
    }
  };

  const handleClose = () => {
    if (formChange) {
      Modal.confirm({
        title: t("confirm"),
        content: t("closePageMsg"),
        okText: t("ok"),
        cancelText: t("cancel"),
        onOk: () => {
          setIsAdding(false);
          setFullScreen(false);
          setFormChange(false);
          setActiveTab(0);
          setDrag(false);
        },
        onCancel() {
          // Do nothing, keep the panel open
        },
      });
    } else {
      setIsAdding(false);
      setFullScreen(false);
      setActiveTab(0);
      setDrag(false);
    }
  };

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

  return (
    <certificationMaintenanceContext.Provider
      value={{
        formData,
        setFormData,
        setFormChange,
        formChange,
        activeTab,
        setActiveTab,
      }}
    >
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => {}}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("certificationmaintenance")}
            onSiteChange={handleSiteChange}
          />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${
                isAdding ? styles.shrink : ""
              }`}
            >
              <CertificationMaintenanceBar
                handleSearchClicks={handleSearchClick}
                handleTop50={handleTop50}
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("certifications")}({filteredData ? filteredData.length : 0}
                  )
                </Typography>

                <IconButton
                  onClick={handleAddClick}
                  className={styles.circleButton}
                >
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
              <Modal
                title={t("confirmation")}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={t("confirm")}
                cancelText={t("cancel")}
              >
                <p>{t("alertRow")}</p>
              </Modal>
            </div>
            <div
              className={`${styles.formContainer} ${
                isAdding
                  ? `${styles.show} ${
                      fullScreen ? styles.showFullScreen : styles.show
                    }`
                  : ""
              }`}
            >
              <CertificationMaintenanceBody
                selected={selected}
                isAdding={isAdding}
                fullScreen={fullScreen}
                drag={drag}
                call={call}
                setCall={setCall}
                onClose={handleClose}
                setIsAdding={setIsAdding}
                setFullScreen={setFullScreen}
              />
            </div>
          </div>
        </div>
      </div>
    </certificationMaintenanceContext.Provider>
  );
};

export default CertificationMaintenanceMain;
