'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { BomComponent, BomRequestProps, defaultBomRequestProps } from '@modules/bom/types/bomTypes';
import { BomContext } from '@modules/bom/hooks/useContext';
import CommonTable from '@components/CommonTable';
import BomBar from '@modules/bom/components/BomBar';
import BomRowBody from '@modules/bom/components/BomRowBody';
import { Modal, message } from 'antd';
import DynamicForm from '@modules/bom/components/DynamicForm';
import { RetriveBomSelectedRow, createBom, fetchBomTop50, retrieveAllBom } from '@services/BomService';

export interface DecodedToken {
  preferred_username: string;
}

const MainBom: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const { isAuthenticated, token } = useAuth();
  const [mainForm, setMainForm] = useState<BomRequestProps>(defaultBomRequestProps);
  const [componentForm, setComponentForm] = useState<BomComponent[]>(defaultBomRequestProps.bomComponentList);
  const [formChange, setFormChange] = useState(false);
  const [sequence, setSequence] = useState(10);
  const [componentCall, setComponentCall] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [visible, setVisible] = useState(false);
  const [bomData, setBomData] = useState<[]>([]);
  const [filteredData, setFilteredData] = useState<[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [retriveRow, setRetriveRow] = useState<any>('');
  const { t } = useTranslation()

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
        const response = await fetchBomTop50(site);
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
      const response = await fetchBomTop50(site);
      setFilteredData(response);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  const handleSearchClick = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const AllBom = await retrieveAllBom(site);
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
    setMainForm(defaultBomRequestProps)
  };

  const handleRowSelect = (row) => {
    setIsAdding(true);
    SelectRow(row)
  };

  const SelectRow = async (row) => {
    const cookies = parseCookies();
    const site = cookies.site;

    try {
      const rowData = await RetriveBomSelectedRow(site, row);
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

  const fieldsToInclude = [
    'bom', 'revision', 'description', 'bomType', 'shopOrder', 'validFrom', 'validTo', 'status', 'designCost', 'currentVersion', 'bomTemplate'
  ];

  const handleValuesChange = (changedValues: any) => {
    setMainForm(prevData => ({
      ...prevData,
      ...changedValues
    }));
  };

  const handleSubmit = async () => {

    const errors = [];

    if (!mainForm?.bom) {
      errors.push('Bom');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    if (!mainForm?.revision) {
      errors.push('Revision');
      message.error(`Revision cannot be empty`);
      return;
    }

    if (mainForm?.designCost < 0) {
      errors.push('Max Usage must be a non-negative number');
      message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
      return;
    }

    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    try {
      const payload = {
        ...mainForm,
        bomComponentList: [],
        bomCustomDataList: [],
        site: site,
        userId: userId
      }
      const response = await createBom(site, payload,);
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
    // Optionally, handle any additional logic required when the site changes
  };

  return (
    <BomContext.Provider value={{ activeTab, setActiveTab, setComponentCall, componentCall, mainForm, setMainForm, componentForm, setComponentForm, sequence, setSequence, formChange, setFormChange }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("bomMaintenance")} onSiteChange={handleSiteChange} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ''}`}>
              <BomBar handleSearchClicks={handleSearchClick} handleTop50={handleTop50} />

              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("bom")}({filteredData ? filteredData.length : 0})
                </Typography>
                <IconButton onClick={handleAddClick} className={styles.circleButton}>
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
            </div>
            <div className={`${styles.formContainer} ${isAdding ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}` : ''}`}>
              <BomRowBody
                fullScreen={fullScreen}
                onClose={handleClose}
                isAdding={isAdding}
                setIsAdding={setIsAdding}
                setFullScreen={setFullScreen}
                setCall={setCall}
                call={call}
                retriveRow={retriveRow}
              />
            </div>
            <Modal
              title={t("createNewBom")}
              open={visible}
              onOk={handleSubmit}
              onCancel={() => setVisible(false)}
              cancelText={t("cancel")}
              okText={t("create")}
              style={{ marginTop: '-45px' }}
            >
              <DynamicForm
                data={mainForm}
                fields={fieldsToInclude}
                onValuesChange={handleValuesChange}
              />
            </Modal>
          </div>
        </div>
      </div>
    </BomContext.Provider>
  );
};

export default MainBom;

