'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/modules/topicConfiguration/styles/topicConfig.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import CommonTable from '@components/CommonTable';
import { Modal } from 'antd';
import { TopicConfigurationContext } from '@modules/topicConfiguration/hooks/TopicConfigContext';
import { defaultTopicConfigurationRequest, TopicConfigurationRequest } from '@modules/topicConfiguration/types/TopicConfigTypes';
import TopicBar from '@modules/topicConfiguration/components/TopicConfigBar';
import TopicConfigurationBody from '@modules/topicConfiguration/components/TopicConfigBody';
import { fetchTopicConfiguration, RetriveTopicConfigurationRow } from '@services/topicConfigService';
import TopicConfiqTable from '@modules/topicConfiguration/components/TopicConfigTable';

interface DataRow {
  [key: string]: string | number;
}

interface DecodedToken {
  preferred_username: string;
}

const TopicConfigMain: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<TopicConfigurationRequest>(defaultTopicConfigurationRequest);
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
  const { t } = useTranslation()
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<DataRow | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchTopicConfigurationData = async () => {
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
        const item = await fetchTopicConfiguration();
        console.log(item,'item');
        
        setItemData(item);
        setFilteredData(item);
        setCall(0)
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchTopicConfigurationData();
  }, [isAuthenticated, username, call]);

  const handleTop50 = async () => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const response = await fetchTopicConfiguration();
      setFilteredData(response);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const filtered = itemData.filter((item) =>
      typeof item.topicName === 'string' && item.topicName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleAddClick = () => {
    setResetValue(true);
    setFormData(defaultTopicConfigurationRequest);
    setIsAdding(true);
    setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setDrag(true)
    setSelected({})
  };

  const handleRowSelect = (row) => {
    if (formChange) {
      setSelectRowData(row);
      setIsModalVisible(true);
      setDrag(false)
      setFormChange(false)
      setActiveTab(0)
    } else {
      setDrag(false)
      SelectRow(row);
      setSelected(row)
      setActiveTab(0)
    }
  };

  const handleModalOk = () => {
    if (selectRowData) {
      SelectRow(selectRowData);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setFormChange(true);
  };

  const SelectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const rowData = await RetriveTopicConfigurationRow(row?.id);
      setRowClickCall(rowClickCall + 1);
      setFormData(rowData);
      setIsAdding(true);
      setResetValue(false);
      setFullScreen(false);
      setSelected(rowData)
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

  console.log(filteredData,'filteredData');
  

  return (
    <TopicConfigurationContext.Provider value={{ formData, setFormData, setFormChange, formChange, activeTab, setActiveTab }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("topicConfiguration")} onSiteChange={handleSiteChange} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <TopicBar handleSearchClicks={handleSearchClick} handleTop50={handleTop50} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("topicConfiguration")}({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <TopicConfiqTable data={filteredData} onRowSelect={handleRowSelect} />
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
              <TopicConfigurationBody selected={selected} isAdding={isAdding} resetValue={resetValue} fullScreen={fullScreen}
                drag={drag} call={call} setCall={setCall} onClose={handleClose} setIsAdding={setIsAdding} setFullScreen={setFullScreen} />
            </div>
          </div>
        </div>
      </div>
      </TopicConfigurationContext.Provider>
  );
};

export default TopicConfigMain;

