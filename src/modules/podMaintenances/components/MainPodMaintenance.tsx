'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/podMaintenances/styles/podMainStyles.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import CommonTable from '@components/CommonTable';
import { Modal, message } from 'antd';
import { PodRequest, RButton, defaultPodRequest, defaultRButton } from '@modules/podMaintenances/types/podMaintenanceTypes';
import DynamicForm from '@modules/podMaintenances/components/DynamicForm';
import PodBar from '@modules/podMaintenances/components/PodBar';
import PodRowBody from '@modules/podMaintenances/components/PodRowBody';
import { CreatePodMaintenance, fetchPodMaintenanceTop50, retrieveAllPodMaintenance, RetrivePodSelectedRow } from '@services/podMaintenanceService';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';

export interface DecodedToken {
  preferred_username: string;
}

const MainPodMaintenance: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [mainForm, setMainForm] = useState<PodRequest>(defaultPodRequest);
  const [buttonForm, setButtonForm] = useState<RButton>(defaultRButton);
  const [formChange, setFormChange] = useState(false);
  const [buttonFormChange, setButtonFormChange] = useState(false);
  const [sequence, setSequence] = useState(10);
  const [activitySequence, setActivitySequence] = useState(10);
  const [componentCall, setComponentCall] = useState(0);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const [bomData, setBomData] = useState<[]>([]);
  const [filteredData, setFilteredData] = useState<[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const { t } = useTranslation()
  const [retriveRow, setRetriveRow] = useState<any>('');
  const [mainActiveTab, setMainActiveTab] = useState<number>(0);
  const [subPodActiveTab, setSubPodActiveTab] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [buttonActiveTab, setButtonActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchUserGroupData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      try {
        const response = await fetchPodMaintenanceTop50(site);
        setFilteredData(response);
        setBomData(response);
        setCall(0)
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchUserGroupData();
  }, [isAuthenticated, username, call]);

  const handleTop50 = async () => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const response = await fetchPodMaintenanceTop50(site);
      setFilteredData(response);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site

    try {
      const AllBom = await retrieveAllPodMaintenance(site);
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = AllBom.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = bomData;
      }

      setFilteredData(filtered);

    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleAddClick = () => {
    setVisible(true);
    setMainForm(defaultPodRequest)
  };

  const handleRowSelect = (row) => {
    setIsAdding(true);
    SelectRow(row)
    setMainActiveTab(0)
    setSubPodActiveTab(0)
  };

  const SelectRow = async (payload) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const rowData = await RetrivePodSelectedRow(site, payload);
      setMainForm(rowData)
      setRetriveRow(rowData)

    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };


  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  const fieldsMainForm = [
    'type',
    'podName',
    'podCategory',
    'description',
    'status',
    'panelLayout',
    'kafkaIntegration',
    'kafkaId',
    'resourceType',
    'defaultOperation',
    'defaultResource',
    'defaultPhaseId',
    'showResource',
    'showOperation',
    'showPhase',
    'phaseCanBeChanged',
    'operationCanBeChanged',
    'resourceCanBeChanged',
    'showQuantity',
    'documentName',
    'sessionTimeout',
    'refreshRate',
    'subPod',
  ];

  const handleValuesChange = (changedValues: any) => {
    setMainForm(prevData => ({
      ...prevData,
      ...changedValues
    }));
  };

  const handleSubmit = async () => {

    const errors = [];
    if (!mainForm?.type) {
      errors.push('Type');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (!mainForm?.podName) {
      errors.push('Pod Name');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (!mainForm?.status) {
      errors.push('status');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (!mainForm?.panelLayout) {
      errors.push('Panel Layout');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (mainForm.kafkaIntegration && !mainForm?.kafkaId) {
      errors.push('Kafka Id');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (!mainForm?.defaultOperation) {
      errors.push('Default Operation');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (!mainForm?.defaultResource) {
      errors.push('Default Resource');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (mainForm?.podCategory === 'Process' && !mainForm?.defaultPhaseId) {
      errors.push('Default Phase Id');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (mainForm.type === 'WorkCenter' && !mainForm?.defaultWorkCenter) {
      errors.push('Default Work Center');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id

    try {
      const payload = {
        ...mainForm,
        bomComponentList: [],
        site: site,
        userId: userId
      }

      const response = await CreatePodMaintenance(site, userId, payload,);

      if (response.message) {
        message.error(response.message)
      }
      else {
        message.success(response.message_details.msg)
        setCall(1)
        setVisible(false)

      }
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

  console.log(mainForm, 'mainForm');

  return (
    <PodMaintenanceContext.Provider value={{ buttonActiveTab, setButtonActiveTab, activeTab, setActiveTab, activitySequence, setActivitySequence, setComponentCall, componentCall, mainForm, setMainForm, buttonForm, setButtonForm, sequence, setSequence, formChange, setFormChange, mainActiveTab, setMainActiveTab, subPodActiveTab, setSubPodActiveTab, setRetriveRow, retriveRow, buttonFormChange, setButtonFormChange }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("podMaintenance")} onSiteChange={handleSiteChange} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <PodBar
                handleSearchClicks={handleSearchClick}
                handleTop50={handleTop50}
                button={
                  <InstructionModal title="Pod Maintenance">
                    <UserInstructions />
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("pod")}({filteredData ? filteredData.length : 0})
                </Typography>
                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
            </div>
            <div className={`${styles.formContainer} ${isAdding ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}` : ''}`}>
              <PodRowBody
                // retriveRow={retriveRow}
                fullScreen={fullScreen}
                onClose={handleClose}
                isAdding={isAdding}
                setIsAdding={setIsAdding}
                setFullScreen={setFullScreen}
                setCall={setCall}
                call={call}
                SelectRow={SelectRow}
              />
            </div>
            <Modal
              title={t("createNewPod")}
              width={900}
              open={visible}
              onOk={handleSubmit}
              onCancel={() => setVisible(false)}
              cancelText={t("cancel")}
              okText={t("create")}
              style={{ marginTop: '-45px' }}
            >
              <DynamicForm
                data={mainForm}
                fields={fieldsMainForm}
                onValuesChange={handleValuesChange}
                style={{ width: '100%', height: '70vh', overflow: 'scroll' }}
              />
            </Modal>
          </div>
        </div>
      </div>
    </PodMaintenanceContext.Provider>
  );
};

export default MainPodMaintenance;

