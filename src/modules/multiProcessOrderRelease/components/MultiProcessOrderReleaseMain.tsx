'use client';

import React, { useEffect, useState } from 'react';
import styles from '@modules/multiProcessOrderRelease/styles/MultiProcessOrderRelease.module.css';
import { useAuth } from '@/context/AuthContext';
import { Typography } from '@mui/material';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';
import jwtDecode from 'jwt-decode';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { fetchProcessAllData, fetchProcessReleaseAllData, fetchProcessTop50, ProcessOrderReleaseData } from '@services/processOrderService';
import { MultiProcessOrderReleaseContext } from '@modules/multiProcessOrderRelease/hooks/MultiProcessOrderReleaseUseContext';
import MultiProcessOrderReleaseBar from '@modules/multiProcessOrderRelease/components/MultiProcessOrderReleaseBar';
import { defaultMultiProcessOrderReleaseTypesRequest } from '@modules/multiProcessOrderRelease/types/MultiProcessOrderReleaseTypes';
import MultiProcessOrderReleaseTable from '@modules/multiProcessOrderRelease/components/MultiProcessOrderReleaseTable';
import { Button } from 'antd';
import { message } from 'antd';
import MultiProcessOrderReleaseMainBar from './FilterCommonBar';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';

interface DataRow {
  [key: string]: string | number;
}

interface DecodedToken {
  preferred_username: string;
}

const MultiProcessOrderMaintenance: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<any>(defaultMultiProcessOrderReleaseTypesRequest);
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [itemData, setItemData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

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

  const handleValuesChange = (values: any) => {
    console.log(values, 'values');
  };

  const handleSelectedRowsChange = (rows: any) => {
    setSelectedRows(rows);
  };

  const handleRelease = async () => {
    if (selectedRows.length === 0) {
      message.warning('Please select at least one row to release');
      return;
    }
    console.log("Row: ", selectedRows);
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;

      const transformedOrders = selectedRows.map(row => ({
        processOrder: row.orderNumber,
        qtyToRelease: row.qtyToRelease,
        site: site,
        user: userId,
        plannedMaterial: row.material,
        materialVersion: row.materialVersion,
        batchNumber: row.batchNumber,
        orderType: row.orderType
      }));

      const payload = {
        orders: transformedOrders
      };

      const response = await ProcessOrderReleaseData(site, payload);

      let hasSuccess = false;
      if (response && response.length > 0) {
        response.forEach((result: any) => {
          if (result.status === 'FAILED') {
            message.error(`${result.processOrder}: ${result.message}`);
          } else {
            message.success(`${result.processOrder}: ${result.message}`);
            hasSuccess = true;
          }
        });
      }

      if (hasSuccess) {
        setSelectedRows([]);
        setCall(call + 1);
      }
    } catch (error) {
      message.error('Error processing release orders');
    }
  };

  const handleSearchClick = async (orderNumber: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const lowercasedTerm = orderNumber.toLowerCase();
    console.log(lowercasedTerm, 'lowercasedTerm');

    let filtered;

    try {
      const AllProcessOrder = await fetchProcessAllData(site, orderNumber);

      if (AllProcessOrder?.processOrderResponseList) {
        if (lowercasedTerm.length > 0) {
          console.log('call1');
          filtered = AllProcessOrder?.processOrderResponseList.filter(row =>
            Object.values(row).some(value =>
              String(value).toLowerCase().includes(lowercasedTerm)
            )
          );
          setFilteredData(filtered);
        }
        else {
          filtered = AllProcessOrder?.processOrderResponseList;
          setFilteredData(filtered);
        }
      } else if (AllProcessOrder?.message) {
        message.success(AllProcessOrder.message);
        setFilteredData([]);
      }

      // if (lowercasedTerm) {
      //   filtered = AllProcessOrder?.processOrderResponseList.filter(row =>
      //     Object.values(row).some(value =>
      //       String(value).toLowerCase().includes(lowercasedTerm)
      //     )
      //   );
      //   setData(filtered);
      //   console.log('call1');

      // } else {
      //   console.log('call2');
      //   if (AllProcessOrder?.message) {
      //     message.success(AllProcessOrder.message);
      //     setData([]);
      //   }
      //   else {
      //     filtered = data;
      //   }
      // }
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

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

  return (
    <MultiProcessOrderReleaseContext.Provider value={{ formData, setFormData, setFormChange, formChange }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t('multiProcessOrderRelease')}
            onSiteChange={handleSiteChange} onSearchChange={function (): void { }} />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={styles.commonTableContainer}>
              {/* <MultiProcessOrderReleaseBar onValuesChange={handleValuesChange} /> */}
              <MultiProcessOrderReleaseMainBar
                handleSearchClicks={handleSearchClick}
                handleTop50={handleTop50}
                button={
                  <InstructionModal title="Multi Process Order Release">
                    <UserInstructions />
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("multiProcessOrder")}({filteredData ? filteredData.length : 0})
                </Typography>
                <Button style={{ marginRight: '30px' }} type="primary" onClick={handleRelease}>{t('release')}</Button>
              </div>
              <MultiProcessOrderReleaseTable
                datas={filteredData}
                setCall={setCall}
                call={call}
                onSelectedRowsChange={handleSelectedRowsChange}
              />
            </div>
          </div>
        </div>
      </div></MultiProcessOrderReleaseContext.Provider>
  );
};

export default MultiProcessOrderMaintenance;

