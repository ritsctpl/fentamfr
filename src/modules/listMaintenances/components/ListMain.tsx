'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/listMaintenances/styles/list.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { ListContext } from '../hooks/ListContext';
import CommonTable from '@components/CommonTable';
import { Modal } from 'antd';
import ListBody from './ListBody';
import { fetchListAll, fetchListTop50, retrieveList } from '@services/listServices';
import { defaultListRequest, ListMaintenanceRequest } from '../types/ListTypes';
import ListBar from './ListBar';


interface DataRow {
  [key: string]: string | number;
}

interface DecodedToken {
  preferred_username: string;
}

const ListMaintenance: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<ListMaintenanceRequest>(defaultListRequest);
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
    const fetchListData = async () => {
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
        console.log('called');
        
        const item = await fetchListTop50(site);
        console.log('calleds');
        
        setItemData(item);
        setFilteredData(item);
        setCall(0)
      } catch (error) {
        console.error('Error fetching list data:', error);
      }
    };

    fetchListData();
  }, [isAuthenticated, username, call]);

  const handleTop50 = async () => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const response = await fetchListTop50(site);
      setFilteredData(response);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const AllBom = await fetchListAll(site);
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

  const handleAddClick = () => {
    setResetValue(true);
    setActiveTab(0);
    setFormData(defaultListRequest);
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
      setActiveTab(0);
      setDrag(false)
      setFormChange(false)
    } else {
      setDrag(false)
      selectRow(row);
      setSelected(row)
    }
  };

  const handleModalOk = () => {
    if (selectRowData) {
      selectRow(selectRowData);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const selectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const rowData = await retrieveList(site, row);
      console.log(rowData, 'rowdata');
      setRowClickCall(rowClickCall + 1);
      setFormData(rowData);
      setIsAdding(true);
      setResetValue(false);
      setFullScreen(false);
      setSelected(rowData)
    } catch (error) {
      console.error('Error fetching list data:', error);
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };
  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
    // Optionally, handle any additional logic required when the site changes
  };

  return (
    <ListContext.Provider value={{ formData, setFormData, setFormChange, formChange, activeTab, setActiveTab }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("ListMaintenance")} 
            onSiteChange={handleSiteChange} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <ListBar handleSearchClicks={handleSearchClick} handleTop50={handleTop50} />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("list")}({filteredData ? filteredData.length : 0})
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
              <ListBody selected={selected} isAdding={isAdding} resetValue={resetValue} fullScreen={fullScreen}
                drag={drag} call={call} setCall={setCall} onClose={handleClose} setIsAdding={setIsAdding} setFullScreen={setFullScreen} />
            </div>
          </div>
        </div>
      </div></ListContext.Provider>
  );
};

export default ListMaintenance;

