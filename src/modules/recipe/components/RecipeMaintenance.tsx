import React, { useEffect, useState } from 'react';
import styles from '../styles/RecipeForm.module.css';
import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import TabNav from './TabNavigation';
import jwtDecode from 'jwt-decode';
import { Input, Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FileCopy';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import AddIcon from '@mui/icons-material/Add';
import DynamicTable from './DynamicTable';
import { decryptToken } from '@/utils/encryption';
import { OperationContext } from '../hooks/recipeContext';
import { DecodedToken, defaultRecipe, Recipe } from '../types/recipeTypes';
import FilterCommonBar from './FilterCommonBar';
import { IconButton,Tooltip,Typography } from '@mui/material';
import { copyAllOperation, deleteOperation, fetchOperation, fetchOperationAll } from '@services/operationService';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { createRecipe, deleteRecipe, fetchTop50Routing, retrieveRouting } from '@services/recipeServices';
import { version } from 'os';

const OperationMaintenance = () => {
  const cookies = parseCookies();
  const {t} =useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [selectedRevision, setSelectRevision] = useState<string | null>(null);
  const [formData, setFormData] = useState<Recipe>(defaultRecipe);
  const [formDatashow, setFormDatashow] = useState<Recipe>(defaultRecipe);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState<Recipe[]>([]);
  const [shifts, setShifts] = useState<Recipe[]>([]);
  const [erpShift, setErpShift] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(cookies.site);
  const [animationClass, setAnimationClass] = useState('');
  const [selectedRowData, setSelectedRowData] = useState<Recipe | null>(null);
  const [pageSize, setPageSize] = useState(getPageSize(window.innerWidth, window.innerHeight));
  const [currentPage, setCurrentPage] = useState(1);

  // Function to determine page size based on screen width and height
  function getPageSize(width, height) {
    if (width < 480 || height < 600) return 5;   // Extra small devices
    if (width < 768 || height < 800) return 7;  // Small devices (tablets)
    if (width < 1024 || height < 900) return 15; // Medium devices (small laptops)
    return 60;                                    // Large devices (desktops)
  }
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTableShow, setIsTableShow] = useState(false);
  const [isTableShowInActive, setIsTableShowInActive] = useState(false);
  const [isHeaderShow, setIsHeaderShow] = useState(false);
  const [isModalVisibleCopy, setIsModalVisibleCopy] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copyRepiceId, setCopyRecipe] = useState('');
  const [copyRevision, setCopyRevision] = useState('');
  const [copyRecipeName, setCopyRecipeName] = useState('');
  

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
  useEffect(() => {
    const handleResize = () => {
      setPageSize(getPageSize(window.innerWidth, window.innerHeight));
      setCurrentPage(1); // Reset to the first page on page size change
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);
  useEffect(() => {
    const fetchOperationData = async () => {
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
      // const cookies = parseCookies();
      // const site = cookies.site;
      // // setSite(site);
      try {
        const operationData = await fetchTop50Routing(site);
        setShifts(operationData);
        setData(operationData|| []);
        console.log(operationData,"operationData");
        
      } catch (error) {
        console.error('Error fetching operations:', error);
      }
    };

    fetchOperationData();
  }, [ call ,isAuthenticated, token, site,t]);


  const handleRowClick = (record) => {
    
    setSelectedRowKey(record.recipeId); 
    setSelectRevision(record.version)
    setSelectedRowData(record)
    
    toggleFullScreen();

    if (!erpShift && isEditing) {
      // Open the modal to confirm the action
      setIsModalVisible(true);
    } else {
      // If erpShift is true, perform the API call directly
      fetchShiftData(record.recipeId,record.version,record.recipeName);
    }
  };

  const handleConfirm = async () => {
    setIsModalVisible(false); // Close the modal
    try {
      await fetchShiftData(selectedRowKey,selectedRevision,selectedRowData.recipeName); 
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  const fetchShiftData = async (recipeId,version,recipeName) => {
    try {
      const recipeData = await retrieveRouting(site,recipeName, recipeId ,username,version); // Call the fetchShiftAll API with the site and shiftName as parameters
      if (recipeData.errorCode) {
        message.error(recipeData.message);
        return;
      }
      
      // Update the form data with the data returned from the API
      setFormData(recipeData);
      setFormDatashow(recipeData)
      setCopyRecipe(`REC_${Date.now()}`)
      // Set ERP recipe and editing states to true
      setErpShift(true);
      setIsEditing(true);
      
      // Trigger the animation by setting the appropriate class
      setAnimationClass('showing');
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };
 

  const handleCancel = () => {
    setTimeout(() => {
      setSelectedRowKey(null);
      setFormData(defaultRecipe);
      setIsEditing(false);
      setErpShift(false);
      setAnimationClass('');
      setIsFullScreen(false)
      setIsHeaderShow(false);
      setIsTableShow(false)
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
          setFormData(defaultRecipe);
          setIsEditing(false);
          setErpShift(false);
          setAnimationClass('');
          setIsFullScreen(false);
          setIsHeaderShow(false);
          setIsTableShow(false);
          setIsTableShowInActive(false);
        }, 1000);
      },
      onCancel() {
        // Optional: Handle if needed when the user clicks "No"
      },
    });
  };


  const handleFilter = async () => {
      const response = await fetchOperation(site)
    const filteredData = response.filter(row =>
      row.shiftName.toLowerCase().includes(filter.toLowerCase()) ||
      row.description.toLowerCase().includes(filter.toLowerCase()) ||
      row.shiftType.toLowerCase().includes(filter.toLowerCase())
    );
    setData(filteredData);
    
    
    setCurrentPage(1);
  };

  const handleAdd = () => {
    
    // const newRecipeId = `REC_${Date.now()}`;
    // const updatedRecipe = {
    //   ...defaultRecipe,
    //   recipeId: newRecipeId, // Update recipeId here
    // };
  
    setSelectedRowKey(null);
    setFormData(defaultRecipe); // Use the updated recipe
    setIsEditing(true);
    setErpShift(false);
  
  };

  const handleDelete = async () => {
    if (selectedRowKey) {
      Modal.confirm({
        title: `${t('areYouSure')} ${formData?.recipeName}?`,
        okText: t('delete'),
        okType: 'danger',
        cancelText: t('cancel'),
        onOk: async () => {
          const cookies = parseCookies();
          const site = cookies?.site;
          const userId = cookies?.rl_user_id;
          const version = formData?.version
          const recipeId = formData?.recipeId
          const recipeName = formData?.recipeName
          try {
            const response = await deleteRecipe( site,version, recipeId, userId,recipeName);
            const ResponseMessage = await response.message_details.msg
            message.success(ResponseMessage);
            handleCancel();
            setCall(call + 1);
          } catch (error) {
            console.error('Error deleting recipe:', error);
            message.error('Error deleting recipe.');
          }
        },
      });
    }
  };
  const handleCancelCopy = () => {
    setIsModalVisibleCopy(false);
    setCopyRecipe('')
    setCopyRevision('')
    setCopyRecipeName('')
  };

  const handleCopyAll = async () => {
    setIsModalVisibleCopy(false);

    const cookies = parseCookies();
    const site = cookies?.site;
    const userId = cookies?.rl_user_id;

    const payload = {
      ...formData,
      user:userId,
      recipeId: copyRepiceId,
      version:copyRevision,
     
      
      localDateTime: new Date().toISOString(),
    };
    try {
      const response = await createRecipe(payload,site);
      const ResponseMessage = response.message_details.msg;
      message.success(ResponseMessage);
      setCall(call + 1);
      setIsEditing(true);
      setErpShift(false);
    } catch (error) {
      console.error('Error copying shifts:', error);
      message.error('Error copying shifts.');
    }
  };

  const handleTableChange = (pagination: any) => setCurrentPage(pagination.current);

  // const handleSelectChange = (value: string, name: string) => setFormData(prevFormData => ({ ...prevFormData, [name]: value }));

  const columnTitleMap: { [key: string]: string } = {
    operation: t('operation'),
    revision: t('revision'),
    description: t('description'),
    status: t('status'),
    operationType: t('operationType'),
    currentVersion: t('currentVersion'),
  };
  
  // Create columns based on the data
  const createDynamicColumns = (data: Recipe[]): ColumnsType<Recipe> => {
    const filteredRecipes = data?.map(({ recipeName, version, recipeId, batchSize, batchUom }) => ({
      recipeName,
      recipeId,
      version,
      
      batchSize,
      batchUom,
    }));
 
  
    if (filteredRecipes?.length === 0) {
      return [];
    }
  
    const keys = filteredRecipes && filteredRecipes?.length > 0 ? Object.keys(filteredRecipes[0]) : [];

  
    return keys.map(key => ({
      title: t(columnTitleMap[key] || key), // Use the mapping for column titles
      dataIndex: key,
      ellipsis: true,
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
  const handleSetData = (data: Recipe[]) => {
    setData(data);
  };



  return (
    <OperationContext.Provider value={{isTableShowInActive, setIsTableShowInActive,isTableShow, setIsTableShow,isHeaderShow, setIsHeaderShow,isFullScreen, setIsFullScreen,erpShift,isEditing,setErpShift,setIsEditing,formData,setFormData,call,setCall}}>
      <CommonAppBar
        appTitle={`${t("recipe")} ${t("maintenance")}`}
        onSearchChange={function (): void {
        } }   
        onSiteChange={handleSiteChange}
           />

      <div className={styles.container}>
        <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>
         
            <FilterCommonBar onSearch={handleFilter} setData={handleSetData} />
            <div className={styles.dataFieldBodyContentsTop}>
              <Typography className={styles.dataLength}>
                {t("recipe")} ({data ? data.length : 0})
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
           {(!isHeaderShow) && ( <div className={styles.topHeaderIcon}>
              {(selectedRowKey && isEditing) ? (
                <div className={`${styles.detailsContainers} ${styles.compactSpacing}`}>
                  <div><h4>{formData?.recipeId}</h4>
                  {/* <p>{t('description')}: <span>{formData.recipeDescription}</span></p> */}
                   </div>
                  <div>
                  <p>{t('createdOn')}: <span>{formData?.createdDate ? dayjs(formData?.createdDate).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p> 
                  <p>{t('modifiedOn')}: <span>{formData?.modifiedDate ? dayjs(formData?.modifiedDate).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p> 
                  </div>
                </div>
              ) : (
                <h3 className={styles.createShiftTitle}>{`${t('create')} ${t('recipe')}`}</h3>
              )}
              {isEditing && (
                <div className={styles.formHeader}>
                  
                  {erpShift ? (
                    <>
              
                      <Tooltip title="Copy">
                                            <Button 
                                              onClick={() => {
                                                setIsModalVisibleCopy(true);
                                                setCopyRecipe(`${formData.recipeId}_COPY`);
                                                setCopyRevision(`${formData.version}`);
                                              }}
                                              className={styles.actionButton}
                                            >
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
            </div>)}
            {isEditing && (
              <TabNav onCancel={handleCancelClick} selectedRowKey={selectedRowKey}/>
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
  title={`${t('enter')} ${t('operation')}`}
  visible={isModalVisibleCopy}
  onOk={handleCopyAll}
  onCancel={handleCancelCopy}
  okText={t('confirm')}
  cancelText={t('cancel')}
>
  {/* <Input
    value={copyRepiceId}
    onChange={(e) => {
      const processedValue = e.target.value
        .replace(/\s+/g, '')  // Remove whitespace
        .toUpperCase()        // Convert to uppercase
        .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores
  
        setCopyRecipe(processedValue);
    }}
    placeholder={`${t('enter')} ${t('operation')}`}
    style={{ marginBottom: '20px' }}
  /> */}
  <Input
    value={copyRepiceId}
    onChange={(e) => {
      const processedValue = e.target.value
        .replace(/\s+/g, '')  // Remove whitespace
        .toUpperCase()        // Convert to uppercase
        .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores
        setCopyRecipe(processedValue);
    }}
    placeholder={`${t('enter')} ${t('recipe')}`}
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
    placeholder={`${t('enter')} ${t('version')}`}
    style={{ marginBottom: '20px' }}
  />
  
</Modal>

      </div>
    </OperationContext.Provider>
  );
};

export default OperationMaintenance;
