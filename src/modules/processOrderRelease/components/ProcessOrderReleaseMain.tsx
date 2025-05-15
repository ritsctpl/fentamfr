'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/processOrderRelease/styles/ProcessOrderRelease.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import CommonTable from '@components/CommonTable';
import { useTranslation } from 'react-i18next';
import { Modal } from 'antd';
import { fetchProcessAll, fetchProcessReleaseAllData, fetchProcessTop50 } from '@services/processOrderService';
import { defaultProcessOrderReleaseTypesRequest } from '../types/ProcessOrderReleaseTypes';
import { ProcessOrderReleaseContext } from '@modules/processOrderRelease/hooks/ProcessOrderReleaseUseContext';
import ProcessOrderReleaseBar from '@modules/processOrderRelease/components/ProcessOrderReleaseBar';
import ProcessOrderReleaseBody from '@modules/processOrderRelease/components//ProcessOrderReleaseBody';

interface DataRow {
  [key: string]: string | number;
}

interface DecodedToken {
  preferred_username: string;
}

const ProcessOrderReleaseMain: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<any>(defaultProcessOrderReleaseTypesRequest);
  const [selected, setSelected] = useState<object>({});
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [itemData, setItemData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [drag, setDrag] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [rowClickCall, setRowClickCall] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<DataRow | null>(null);

  useEffect(() => {
    const fetchProcessOrderRelease = async () => {
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
        const item = await fetchProcessTop50(site);
        setItemData(item);
        setFilteredData(item);
        setCall(0)
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchProcessOrderRelease();
  }, [isAuthenticated, username, call]);

  const handleTop50 = async () => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const response = await fetchProcessTop50(site);
      setFilteredData(response);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const AllProcessOrder = await fetchProcessReleaseAllData(site);
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = AllProcessOrder.filter(row =>
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
      setDrag(false)
      setFormChange(false)
    } else {
      setFormChange(false)
      setDrag(false)
      SelectRow(row);
      setSelected(row)
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
    setFormChange(true)
  };

  const SelectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    try {
      const payload = {
        ...row,
        site: site,
        userId: userId
      }
      console.log(payload,'rowdata');
      const rowData = await fetchProcessAll(site, row.orderNumber);
      console.log(rowData,'rowdata');
      
      setRowClickCall(rowClickCall + 1);
      // setFormData(rowData);
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...rowData, 
    }));
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

  return (
    <ProcessOrderReleaseContext.Provider value={{ formData, setFormData, setFormChange, formChange }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t('processOrderRelease')}
            onSiteChange={handleSiteChange} onSearchChange={function (): void { } } />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <ProcessOrderReleaseBar handleSearchClicks={handleSearchClick} handleTop50={handleTop50} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("processOrder")}({filteredData ? filteredData.length : 0})
                </Typography>
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
              <ProcessOrderReleaseBody SelectRow={SelectRow} selected={selected} isAdding={isAdding} resetValue={resetValue} fullScreen={fullScreen} 
                drag={drag} call={call} setCall={setCall} onClose={handleClose} setIsAdding={setIsAdding} setFullScreen={setFullScreen} />
            </div>
          </div>
        </div>
      </div></ProcessOrderReleaseContext.Provider>
  );
};

export default ProcessOrderReleaseMain;

