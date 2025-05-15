'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/cycleTimeMaintenance/styles/CycleTime.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { fetchCycleTimes, retriveCycleTimeRow } from '@services/cycleTimeService';
import { Modal } from 'antd';
import CommonTable from './CommonTable';
import { CycleTimeRequest, defaultCycleTimeRequest } from '../types/cycleTimeTypes';
import { CycleTimeUseContext } from '../hooks/CycleTimeUseContext';
import CycleTimeBar from './CycleTimeBar';
import CycleTimeBody from './CycleTimeBody';

interface DecodedToken {
  preferred_username: string;
}

const CycleTimeMain: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<CycleTimeRequest>(defaultCycleTimeRequest);
  const [selected, setSelected] = useState<object>({});
  const [activeTab, setActiveTab] = useState<number>(0);
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
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchCycleTime = async () => {
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
        const item = await fetchCycleTimes(site);
        const itemWithoutId = item.map(({ itemId,material,materialVersion, ...rest }) => rest);
        setItemData(itemWithoutId);
        setFilteredData(itemWithoutId);
        setCall(0)
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchCycleTime();
  }, [isAuthenticated, username, call]);

  const handleGoClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const response = await fetchCycleTimes(site);
    setFilteredData(response);
  }

  const handleAddClick = () => {
    setResetValue(true);
    setFormData(defaultCycleTimeRequest);
    setIsAdding(true);
    setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setSelected(null)
    setIsFormDisabled(true);
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const AllBom = await fetchCycleTimes(site);
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = AllBom.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = itemData;
      }
      setFilteredData(filtered);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  }; 


  const handleRowSelect = (row) => {
    if (formChange) {
      setSelectRowData(row);
      setIsModalVisible(true);
      setFormChange(false)
      // setActiveTab(0);
    } else {
      SelectRow(row);
      setSelected(row)
      setActiveTab(0);
    }
  };

  const SelectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    try {

      const payload = {
        site: site,
        userId: userId,
        resourceType: row.records[0].resourceType,
        time: row.records[0].time,
        ...row  
      }
      
      const rowData = await retriveCycleTimeRow(site, payload);
      setFormData(rowData);
      setIsAdding(true);
      setResetValue(false);
      setFullScreen(false);
      setSelected(rowData)
      setIsFormDisabled(false);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  const handleModalOk = () => {
    if (selectRowData) {
      SelectRow(selectRowData);
      setActiveTab(0);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setFormChange(true);
  };

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

  return (
    <CycleTimeUseContext.Provider value={{ formData, setFormData, setFormChange, formChange, activeTab, setActiveTab, isFormDisabled, setIsFormDisabled, call, setCall }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => {}}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("cycleTimeMaintenance")} onSiteChange={handleSiteChange} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <CycleTimeBar handleSearchClicks={handleSearchClick} handleGoClick={handleGoClick} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("cycleTime")}({filteredData ? filteredData.length : 0})
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
              <CycleTimeBody selected={selected} isAdding={isAdding} resetValue={resetValue} fullScreen={fullScreen}
                call={call} setCall={setCall} onClose={handleClose} setIsAdding={setIsAdding} setFullScreen={setFullScreen} setSelected={setSelected} />
            </div>
          </div>
        </div>
      </div>
    </CycleTimeUseContext.Provider>
  );
};

export default CycleTimeMain;

