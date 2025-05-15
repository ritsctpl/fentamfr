'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from '@modules/batchStepStatus/styles/BatchStepStatus.module.css';
import { useAuth } from '@/context/AuthContext';
import { Typography } from '@mui/material';
import { parseCookies } from 'nookies';
import { decryptToken } from '@/utils/encryption';  
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
import jwtDecode from 'jwt-decode';
import { BatchStepStatusContext } from '@modules/batchStepStatus/hooks/BatchStepStatusUseContext';
import BatchStepStatusBar from './BatchStepStatusBar';
import { FcOk } from "react-icons/fc";
import { MdCancel } from 'react-icons/md';

interface DecodedToken {
  preferred_username: string;
}

const BatchStepStatusMain: React.FC = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const [formData, setFormData] = useState<any>();
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);
  const [formChange, setFormChange] = useState<boolean>(false);
  const [batchStepStatusData, setBatchStepStatusData] = useState<any[]>([]);

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };
  
  useEffect(() => {
    const fetchProcessOrderRelease = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode<DecodedToken>(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };
    fetchProcessOrderRelease();
  }, [isAuthenticated, username, call]);

  const columns = useMemo(() => {
    const hasMultipleOrders = batchStepStatusData.some((item, index, array) => 
      index > 0 && (item.orderNo !== array[0].orderNo || item.batchNo !== array[0].batchNo)
    );

    const baseColumns = [
      { title: t('PhaseId'), dataIndex: 'phaseId', key: 'phaseId', align: "center" as const,  },
      { title: t('operation'), dataIndex: 'operation', key: 'operation'  ,align: "center" as const },
      { title: t('InQueueQty'), dataIndex: 'qtyInQueue', key: 'qtyInQueue', align: "center" as const  },
      { title: t('batchStartedTime'), dataIndex: 'batchStartedTime', key: 'batchStartedTime', align: "center" as const  },
      { title: t('InWorkQty'), dataIndex: 'inWorkQty', key: 'inWorkQty', align: "center" as const  },
      { title: t('CompleteQty'), dataIndex: 'qtyToComplete', key: 'qtyToComplete', align: "center" as const  },
      { title: t('batchCompletedTime'), dataIndex: 'batchCompletedTime', key: 'batchCompletedTime', align: "center" as const  },
      { title: t('ScrapQty'), dataIndex: 'scrapQuantity', key: 'scrapQuantity', align: "center" as const  },
      { title: t('material'), dataIndex: 'material', key: 'material', align: "center" as const  },
      { title: `${t('materialDescription')}`, dataIndex: 'materialDescription', key: 'materialDescription', align: "center" as const  },
      { 
        title: t('approval'), 
        dataIndex: 'lineClearanceApproval', 
        key: 'lineClearanceApproval', 
        align: "center" as const,
        render: (value: boolean) => (
          value ? 
          <FcOk style={{ color: '#52c41a', fontSize: '24px' }} /> :
          <MdCancel style={{ color: '#ff4d4f', fontSize: '24px' }} />
        )
      },
      { title: t('batchStatus'), dataIndex: 'batchStatus', key: 'batchStatus', align: "center" as const  },
    ];

    if (hasMultipleOrders) {
      return [
        { title: t('orderNo'), dataIndex: 'orderNo', key: 'orderNo', align: "center" as const  },
        { title: t('batchNo'), dataIndex: 'batchNo', key: 'batchNo', align: "center" as const  },
        ...baseColumns
      ];
    }

    return baseColumns;
  }, [batchStepStatusData, t]);

console.log(batchStepStatusData,"batchStepStatusData");

  return (
    <BatchStepStatusContext.Provider value={{ formData, setFormData, setFormChange, formChange }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t('batchStepStatus')}
            onSiteChange={handleSiteChange} onSearchChange={function (): void { } } />
        </div>
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div className={styles.commonTableContainer}>
              <BatchStepStatusBar setBatchStepStatusData={setBatchStepStatusData}/>
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("batchStepStatus")}({batchStepStatusData ? batchStepStatusData.length : 0})
                </Typography>
              </div>
              <Table
                columns={columns}
                bordered
                dataSource={batchStepStatusData}
                pagination={false}
                scroll={{ y: 'calc(100vh - 370px)' }}
              />
            </div>
          </div>
        </div>
      </div>
      </BatchStepStatusContext.Provider>
  );
};

export default BatchStepStatusMain;

