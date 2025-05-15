'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/modules/toolNumber/styles/toolNumber.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import CommonTable from '@components/CommonTable';
import { useTranslation } from 'react-i18next';
import { Modal } from 'antd';
import { ToolNumberContext } from '@modules/toolNumber/hooks/ToolNumberUseContext';
import ToolNumberBar from '@modules/toolNumber/components/ToolNumberBar';
import { fetchToolNumberTop50, retrieveAllToolNumber, RetriveToolNumberRow } from '@services/toolNumberService';
import ToolNumberBody from '@modules/toolNumber/components/ToolNumberBody';
import { defaultToolNumberRequest, ToolNumberRequest } from '@modules/toolNumber/types/ToolNumberTypes';


interface DataRow {
  [key: string]: string | number;
}

interface DecodedToken {
  preferred_username: string;
}

const ToolNumberMaintenance: React.FC = () => {
  const [formData, setFormData] = useState<ToolNumberRequest>(defaultToolNumberRequest);
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
    const fetchToolNumberData = async () => {
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

      try {
        const item = await fetchToolNumberTop50(site);
        console.log(item,'item');
        setItemData(item);
        setFilteredData(item);
        setCall(0)
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchToolNumberData();
  }, [isAuthenticated, username, call]);

  const handleTop50 = async () => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const response = await fetchToolNumberTop50(site);
      setFilteredData(response);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const AllToolNumber = await retrieveAllToolNumber(site);
      const lowercasedTerm = searchTerm.toLowerCase();
      let filtered;

      if (lowercasedTerm) {
        filtered = AllToolNumber.filter(row =>
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

  const handleAddClick = () => {
    setActiveTab(0);
    setResetValue(true);
    setFormData(defaultToolNumberRequest);
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
    } else {
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
      // const payload = {
      //   site: site,
      //   userId: userId,
      //   ncCode: row?.ncCode,
      //   currentSite: site
      // }
      const rowData = await RetriveToolNumberRow(site, row?.toolNumber);
      setRowClickCall(rowClickCall + 1);
      setFormData(rowData);
      setIsAdding(true);
      setResetValue(false);
      setFullScreen(false);
      setSelected(rowData)
      setActiveTab(0)
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };
console.log(formData,'formData');

  return (
    <ToolNumberContext.Provider value={{ formData, setFormData, setFormChange, formChange, activeTab, setActiveTab, resetValue, setResetValue }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("toolNumberMaintenance")} onSiteChange={function (): void { setCall(call + 1) }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <ToolNumberBar handleSearchClicks={handleSearchClick} handleTop50={handleTop50} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("toolNumber")}({filteredData ? filteredData.length : 0})
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
              <ToolNumberBody selected={selected} isAdding={isAdding} fullScreen={fullScreen}
                drag={drag} call={call} setCall={setCall} onClose={handleClose} setIsAdding={setIsAdding} setFullScreen={setFullScreen} />
            </div>
          </div>
        </div>
      </div></ToolNumberContext.Provider>
  );
};

export default ToolNumberMaintenance;

