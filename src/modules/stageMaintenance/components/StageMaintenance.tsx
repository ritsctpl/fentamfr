import React, { useEffect, useState } from 'react';
import styles from '../styles/StageForm.module.css';
import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import TabNav from './TabNavigation';
import jwtDecode from 'jwt-decode';
import { Input, Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon, FileCopy as CopyIcon, OpenInFull as OpenInFullIcon, CloseFullscreen as CloseFullscreenIcon } from '@mui/icons-material';
import DynamicTable from './DynamicTable';
import { decryptToken } from '@/utils/encryption';
import { StageContext } from '../hooks/stageContext';
import { StageData, DecodedToken, defaultStageData } from '../types/stageTypes';
import FilterCommonBar from './FilterCommonBar';
import { IconButton,Tooltip,Typography } from '@mui/material';
import { copyAllStage, deleteStage, fetchStage, fetchStageAll } from '@services/stageService';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const StageMaintenance = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const {t} =useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [selectedRevision, setSelectRevision] = useState<string | null>(null);
  const [formData, setFormData] = useState<StageData>(defaultStageData);
  const [formDatashow, setFormDatashow] = useState<StageData>(defaultStageData);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState<StageData[]>([]);
  const [shifts, setShifts] = useState<StageData[]>([]);
  const [erpShift, setErpShift] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isModalVisibleCopy, setIsModalVisibleCopy] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copyStage, setCopyStage] = useState('');
  const [copyRevision, setCopyRevision] = useState('');
  const [copyDescription, setCopyDescription] = useState('');
  

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  useEffect(() => {
    const fetchStageData = async () => {
      {isEditing && !erpShift ? 
      handleCancel():null}
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
        const stageData = await fetchStage(site);
        setShifts(stageData);
        setData(stageData|| []);
        
      } catch (error) {
        console.error('Error fetching stage:', error);
      }
    };

    fetchStageData();
  }, [ call ,isAuthenticated, token, site,t]);


  const handleRowClick = (record) => {
    console.log("vale");
    setSelectedRowKey(record.operation); 
    setSelectRevision(record.revision)
    
    if (!erpShift && isEditing) {
      // Open the modal to confirm the action
      setIsModalVisible(true);
    } else {
      // If erpShift is true, perform the API call directly
      fetchStageData(record.operation,record.revision);
    }
  };

  const handleConfirm = async () => {
    setIsModalVisible(false); // Close the modal
    try {
      await fetchStageData(selectedRowKey,selectedRevision); 
    } catch (error) {
      console.error('Error fetching stage details:', error);
    }
  };

  const fetchStageData = async (stage,revision) => {
    try {
      const stageData = await fetchStageAll(site, stage,revision); 
      console.log('api call');
      
      // Update the form data with the data returned from the API
      setFormData(stageData);
      setFormDatashow(stageData)
      setCopyStage(`${stageData.operation}_COPY`)
      setErpShift(true);
      setIsEditing(true);
      
      // Trigger the animation by setting the appropriate class
      setAnimationClass('showing');
    } catch (error) {
      console.error('Error fetching stage details:', error);
    }
  };
 

  const handleCancel = () => {
    setTimeout(() => {
      setSelectedRowKey(null);
      setFormData(defaultStageData);
      setIsEditing(false);
      setErpShift(false);
      setAnimationClass('');
      setIsFullScreen(false)
    }, 1000);
  };
  const handleCancelClick = () => {
    Modal.confirm({
      title: t('closePageMsg'),
      okText: t('yes'),
      cancelText: t('no'),
      onOk() {
        setTimeout(() => {
          setSelectedRowKey(null);
          setFormData(defaultStageData);
          setIsEditing(false);
          setErpShift(false);
          setAnimationClass('');
          setIsFullScreen(false);
        }, 1000);
      },
      onCancel() {
        // Optional: Handle if needed when the user clicks "No"
      },
    });
  };



  const handleAdd = () => {
    setSelectedRowKey(null);
    setFormData(defaultStageData);
    setIsEditing(true);
    setErpShift(false);
  };

  const handleDelete = async () => {
    if (selectedRowKey) {
      Modal.confirm({
        title: `${t('areYouSure')} ${selectedRowKey}?`,
        okText: t('delete'),
        okType: 'danger',
        cancelText: t('cancel'),
        onOk: async () => {
          const cookies = parseCookies();
          const site = cookies.site;
          const userId = cookies.rl_user_id;
          const stage = formData.operation
          const revision = formData.revision
          try {
            const response = await deleteStage( site, userId, { stage, revision });
            const ResponseMessage = await response.message_details.msg
            message.success(ResponseMessage);
            handleCancel();
            setCall(call + 1);
          } catch (error) {
            console.error('Error deleting shift:', error);
            message.error('Error deleting shift.');
          }
        },
      });
    }
  };
  const handleCancelCopy = () => {
    setIsModalVisibleCopy(false);
    setCopyStage('')
    setCopyRevision('')
    setCopyDescription('')
  };

  const handleCopyAll = async () => {
    setIsModalVisibleCopy(false);

    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    const payload = {
      ...formData,
      stage: copyStage,
      revision:copyRevision,
      description:copyDescription,
     
      
      localDateTime: new Date().toISOString(),
    };
console.log(payload + "payload")
    try {
      const response = await copyAllStage(  site,userId,payload);
      const ResponseMessage = response.message_details.msg;
      message.success(ResponseMessage);
      setCall(call + 1);
    } catch (error) {
      console.error('Error copying shifts:', error);
      message.error('Error copying shifts.');
    }
  };

  const handleTableChange = (pagination: any) => setCurrentPage(pagination.current);

  // const handleSelectChange = (value: string, name: string) => setFormData(prevFormData => ({ ...prevFormData, [name]: value }));

  const columnTitleMap: { [key: string]: string } = {
    operation: t('stage'),
    revision: t('revision'),
    description: t('description'),
    status: t('status'),
    operationType: t('stageType'),
    currentVersion: t('currentVersion'),
  };
  
  // Create columns based on the data
  const createDynamicColumns = (data: StageData[]): ColumnsType<StageData> => {
 
  
    if (data.length === 0) {
      return [];
    }
  
    const keys = Object.keys(data[0]);
  
    return keys.map(key => ({
      title: t(columnTitleMap[key] || key), // Use the mapping for column titles
      dataIndex: key,
      key: key,
      render: (text: any) => {
        // Handle rendering boolean values
        if (typeof text === 'boolean') {
          return text ? t('yes') : t('no');
        }
        return text;
      },
    }));
  };
  
  const columns = createDynamicColumns(data);

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
    // Optionally, handle any additional logic required when the site changes
  };
  const handleSetData = (data: StageData[]) => {
    setData(data);
  };



  return (
    <StageContext.Provider value={{erpShift,isEditing,setErpShift,setIsEditing,formData,setFormData,call,setCall}}>
      <CommonAppBar
        allActivities={allActivities}
        username={username}
        site={site}
        appTitle={`${t("stage")} ${t("maintenance")}`}
        onSiteChange={handleSiteChange} // Pass the handler
        onSearchChange={function (): void {}}      />

      <div className={styles.container}>
        <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>
         
            <FilterCommonBar  setData={handleSetData} />
            <div className={styles.dataFieldBodyContentsTop}>
              <Typography className={styles.dataLength}>
                {t("stage")} ({data ? data.length : 0})
              </Typography>

              <IconButton onClick={handleAdd} className={styles.circleButton}>
                <AddIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </div>
             
          <DynamicTable
            columns={columns}
            data={data}
            currentPage={currentPage}
            pageSize={pageSize}
            handleRowClick={(handleRowClick)}
            handleTableChange={handleTableChange}
            setCurrentPage={setCurrentPage}
            selectedRowKey={selectedRowKey}
          />
        </div>
        {(selectedRowKey || isEditing) && (
          <div className={`${styles.detailsAndFormContainer} ${isFullScreen ? styles.fullScreen : styles.halfScreen} ${animationClass}`}>
            <div className={styles.topHeaderIcon}>
              {(selectedRowKey && isEditing) ? (
                <div className={`${styles.detailsContainers} ${styles.compactSpacing}`}>
                  <div><h4>{formDatashow.operation}</h4><p>{t('description')}: <span>{formDatashow.description}</span></p> </div>
                  <div>
                  <p>{t('createdOn')}: <span>{formData.createdDateTime ? dayjs(formData.createdDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p> 
                  <p>{t('modifiedOn')}: <span>{formData.modifiedDateTime ? dayjs(formData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p> 
                  </div>
                </div>
              ) : (
                <h3 className={styles.createShiftTitle}>{`${t('create')} ${t('stage')}`}</h3>
              )}
              {isEditing && (
                <div className={styles.formHeader}>
                  
                  <Tooltip title="Exit Ful Screen">
                                    <Button onClick={toggleFullScreen} className={styles.actionButton}>
                                    {isFullScreen ? <CloseFullscreenIcon sx={{ color: '#1874CE' }}/> : <OpenInFullIcon  sx={{ color: '#1874CE' }}/>}
                                    </Button>
                                </Tooltip>
                  {erpShift ? (
                    <>
              
                      <Tooltip title="Copy">
                                            <Button onClick={() => setIsModalVisibleCopy(true)}  className={styles.actionButton}>
                                                <CopyIcon sx={{ color: '#1874CE' }} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <Button onClick={handleDelete} className={styles.actionButton}>
                                                <DeleteIcon sx={{ color: '#1874CE' }}/>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Close">
                                    <Button onClick={handleCancel} className={styles.actionButton}>
                                        <CloseIcon sx={{ color: '#1874CE' }}/>
                                    </Button>
                        </Tooltip>
                    </>
                  ) : (
            
                    <Tooltip title="Close">
                                    <Button onClick={handleCancel} className={styles.actionButton}>
                                        <CloseIcon sx={{ color: '#1874CE' }}/>
                                    </Button>
                        </Tooltip>
                  )}
                </div>
              )}
            </div>
            {isEditing && (
              <TabNav onCancel={handleCancelClick}/>
            )}
          </div>
        )}
        <Modal
        title={t('rowSelectionMsg')}
        visible={isModalVisible}
        onOk={handleConfirm}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedRowKey(null); // Clear the selected row key
        }}
        okText={t('confirm')}
        cancelText={t('cancel')}
      >
        <p>{t('alertRow')}</p>
      </Modal>

      <Modal
  title={`${t('enter')} ${t('stage')}`}
  visible={isModalVisibleCopy}
  onOk={handleCopyAll}
  onCancel={handleCancelCopy}
  okText={t('confirm')}
  cancelText={t('cancel')}
>
  <Input
    value={copyStage}
    onChange={(e) => {
      const processedValue = e.target.value
        .replace(/\s+/g, '')  // Remove whitespace
        .toUpperCase()        // Convert to uppercase
        .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores
  
        setCopyStage(processedValue);
    }}
    placeholder={`${t('enter')} ${t('stage')}`}
    style={{ marginBottom: '20px' }}
  />
  <Input
    value={copyRevision}
    onChange={(e) => {
      const processedValue = e.target.value
        .replace(/\s+/g, '')  // Remove whitespace
        .toUpperCase()        // Convert to uppercase
        .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores
  
        setCopyRevision(processedValue);
    }}
    placeholder={`${t('enter')} ${t('revision')}`}
    style={{ marginBottom: '20px' }}
  />
  <Input
    value={copyDescription}
    onChange={(e) => setCopyDescription(e.target.value)}
    placeholder={`${t('enter')} ${t('description')}`}
  />
</Modal>

      </div>
    </StageContext.Provider>
  );
};

export default StageMaintenance;
