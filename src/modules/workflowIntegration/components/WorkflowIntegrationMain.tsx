'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/workflowIntegration/styles/WorkflowIntegration.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { message, Modal } from 'antd';
import { WorkflowIntegrationUseContext } from '@modules/workflowIntegration/hooks/WorkflowIntegrationUseContext';
import WorkflowIntegrationBar from '@modules/workflowIntegration/components/WorkflowIntegrationBar';
import WorkflowIntegrationBody from '@modules/workflowIntegration/components/WorkflowIntegrationBody';
import { defaultWorkflowIntegrationRequest, WorkflowIntegrationRequest } from '@modules/workflowIntegration/types/workflowIntegrationTypes';
import { decryptToken } from '@utils/encryption';
import jwtDecode from 'jwt-decode';
import { fetchAllWorkflowIntegration, fetchWorkflowIntegration, RetriveWorkflowIntegrationSelectedRow } from '@services/workflowIntegrationService';
import CommonTable from '@components/CommonTable';
import { parseCookies } from 'nookies';

interface DecodedToken {
  preferred_username: string;
}

const WorkflowIntegrationMain: React.FC = () => {
  const [formData, setFormData] = useState<WorkflowIntegrationRequest>(defaultWorkflowIntegrationRequest);
  const [selected, setSelected] = useState<object>({});
  const { isAuthenticated, token } = useAuth();
  const [itemData, setItemData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [resetValueCall, setResetValueCall] = useState<number>(0);
  const { t } = useTranslation()
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [rowClick, setRowClick] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorkflowIntegrations = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      const cookies = parseCookies();
      const site = cookies.site;
      const payload = {
        site: site
      }
      try {
        const fetchData = await fetchWorkflowIntegration(payload);
        setItemData(fetchData);
        setFilteredData(fetchData);
        setCall(0)
      } catch (error) {
        console.error('Error fetching Workflow Integration:', error);
      }
    };

    fetchWorkflowIntegrations();
  }, [isAuthenticated, username, call]);

  console.log(filteredData, 'filteredData');
  

  const handleAddClick = () => {
    setRowClick(false);
    setResetValue(true);
    setFormData(defaultWorkflowIntegrationRequest);
    setIsAdding(true);
    setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setSelected({})
  };

  const handleSearchClick = async (searchTerm: string) => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      // const response = await fetchAllWorkflowIntegration(searchTerm);
      const response = await fetchAllWorkflowIntegration({ identifier: searchTerm, site });
      const AllWorkflowIntegration = response;

      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = AllWorkflowIntegration?.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = itemData;
      }
      setFilteredData(filtered);
    } catch (error) {
      console.error('Error fetching Workflow Integration:', error);
    }
  };


  const handleRowSelect = (row) => {
    if (formChange) {
      console.log('call');
      setIsModalVisible(true);
      setSelectRowData(row);
      setFormChange(false)
    } else {
      console.log('call2');
      SelectRow(row);
      setSelected(row)
    }
  };

  const SelectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const payload = {
      site: site,
      identifier: row?.identifier ? row?.identifier : ''
    }
    try {
      const rowData = await RetriveWorkflowIntegrationSelectedRow(payload);
 
      if (rowData == null) {
        message.error('Error fetching Workflow Integration');
      } else {
        setRowClick(true);
        setFormData(rowData);
        setIsAdding(true);
        setResetValue(false);
        setFullScreen(false);
        setSelected(rowData)
      }
    } 
    catch (error) {
      message.error('Error fetching Workflow Integration');
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  const handleModalOk = async () => {
    if (selectRowData) {
      await SelectRow(selectRowData);
      setIsModalVisible(false);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setFormChange(true)
  };

  return (
    <WorkflowIntegrationUseContext.Provider value={{ formData, setFormData, setFormChange, formChange, rowClick, setRowClick }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("workflowIntegrationMaintenance")} onSiteChange={function (): void { setCall(call + 1) }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <WorkflowIntegrationBar handleSearchClicks={handleSearchClick} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("workflowIntegration")}({filteredData ? filteredData.length : 0})
                </Typography>
                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
              <Modal
                title={t('confirmation')}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={t('confirm')}
                cancelText={t('cancel')}
              >
                <p>{t('alertRow')}</p>
              </Modal>
            </div>
            <div className={`${styles.formContainer} ${isAdding ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}` : ''}`}>
              <WorkflowIntegrationBody selected={selected} isAdding={isAdding} resetValue={resetValue} fullScreen={fullScreen}
                call={call} setCall={setCall} onClose={handleClose} setIsAdding={setIsAdding} setFullScreen={setFullScreen} />
            </div>
          </div>
        </div>
      </div>
    </WorkflowIntegrationUseContext.Provider>
  );
};

export default WorkflowIntegrationMain;