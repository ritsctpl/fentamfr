import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/ShiftForm.module.css';
import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import ShiftForm from './TabNavigation';
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
import { SiteContext } from '../hooks/siteContext';
import { DecodedToken, SiteRequest, DefaultSiteData } from '../types/siteTypes';
import FilterCommonBar from './FilterCommonBar';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { deleteUser, fetchUserTop50 } from '@services/userService';
import { copyAllSite, deleteSite, fetchSiteAll, fetchSiteTop50, initializeSite } from '@services/siteServices';
import dayjs from 'dayjs';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';

const SiteMaintenance = () => {
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<SiteRequest>(DefaultSiteData);
  const [formDatashow, setFormDatashow] = useState<SiteRequest>(DefaultSiteData);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState<SiteRequest[]>([]);
  const [shifts, setShifts] = useState<SiteRequest[]>([]);
  const [erpShift, setErpShift] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isModalVisibleCopy, setIsModalVisibleCopy] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copySite, setCopySite] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  useEffect(() => {
    const fetchShiftData = async () => {
      {
        isEditing && !erpShift ?
          handleCancel() : null
      }
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
      setSite(site);
      try {
        const userData = await fetchSiteTop50(site);
        console.log(userData, "userData");
        setShifts(userData);
        setData(userData || []);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }

    };

    fetchShiftData();
  }, [call, isAuthenticated, token, site]);


  const handleRowClick = (record) => {
    const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(formDatashow);

    if (hasUnsavedChanges && isEditing) {
      Modal.confirm({
        title: t('confirm'),
        content: t('unsavedChangesMessage'),
        okText: t('yes'),
        cancelText: t('no'),
        onOk: async () => {
          if (!erpShift && isEditing) {
            setIsModalVisible(true);
          } else {
            fetchShiftData(record.site);
          }
        }
      });
    } else {
      setSelectedRowKey(record.site);
      if (!erpShift && isEditing) {
        setIsModalVisible(true);
      } else {
        fetchShiftData(record.site);
      }
    }
  };

  const handleConfirm = async () => {
    setIsModalVisible(false); // Close the modal
    try {
      await fetchShiftData(selectedRowKey);
    } catch (error) {
      console.error('Error fetching shift details:', error);
    }
  };

  const fetchShiftData = async (site) => {
    try {
      const userData = await fetchSiteAll(site); // Call the fetchShiftAll API with the site and shiftName as parameters
      console.log(userData, 'api call');
      console.log(userData)
      // Update the form data with the data returned from the API
      const setData = { ...userData, timeZone: userData?.timeZone?.[0]?.timeZone, }
      setFormData(setData);
      setFormDatashow(setData)

      // Set ERP shift and editing states to true
      setErpShift(true);
      setIsEditing(true);

      // Trigger the animation by setting the appropriate class
      setAnimationClass('showing');
    } catch (error) {
      console.error('Error fetching shift details:', error);
    }
  };


  const handleCancel = () => {
    setTimeout(() => {
      setSelectedRowKey(null);
      setFormData(DefaultSiteData);
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
          setFormData(DefaultSiteData);
          setIsEditing(false);
          setErpShift(false);
          setAnimationClass('');
          setIsFullScreen(false);
        }, 1000);
      },
      onCancel() {
        // Optional: You can handle any actions here when the site clicks "No"
      },
    });
  };


  const handleFilter = async () => {
    const response = await fetchUserTop50()
    const filteredData = response.filter(row =>
      row.shiftName.toLowerCase().includes(filter.toLowerCase()) ||
      row.description.toLowerCase().includes(filter.toLowerCase()) ||
      row.shiftType.toLowerCase().includes(filter.toLowerCase())
    );
    setData(filteredData);


    setCurrentPage(1);
  };

  const handleAdd = () => {
    setSelectedRowKey(null);
    setFormData(DefaultSiteData);
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
          const userId = cookies.rl_user_id;
          const site = formData.site
          try {
            const response = await deleteSite(userId, site);
            const ResponseMessage = await response.message_details.msg
            message.success(ResponseMessage);
            handleCancel();
            setCall(call + 1);
          } catch (error) {
            console.error('Error deleting site:', error);
            message.error('Error deleting site.');
          }
        },
      });
    }
  };
  const handleCancelCopy = () => {
    setIsModalVisibleCopy(false);
    setCopySite('')
    setDescription('')
  };

  const handleCopyAll = async () => {
    setIsModalVisibleCopy(false);

    const cookies = parseCookies();
    const userId = cookies.rl_user_id;

    const payload = {
      ...formData,
      site: copySite,
      description: description,


      localDateTime: new Date().toISOString(),
    };

    try {
      const response = await copyAllSite(userId, payload);
      const ResponseMessage = response.message_details.msg;
      message.success(ResponseMessage);
      setCall(call + 1);
    } catch (error) {
      console.error('Error copying sites:', error);
      message.error('Error copying sites.');
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
  const createDynamicColumns = (data: SiteRequest[]): ColumnsType<SiteRequest> => {


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
    // Optionally, handle any additional logic required when the site changes
  };
  const handleSetData = (data: SiteRequest[]) => {
    setData(data);
  };

  const handleReloadSite = async () => {
    Modal.confirm({
      title: t('confirmation'),
      content: t('reloadSiteConfirmation'),
      okText: t('yes'),
      cancelText: t('no'),
      onOk: async () => {
        setLoading(true);
        try {
          console.log('reload site');
          const response = await initializeSite();
          setCall(call + 1);
          message.success(response);
        } catch (error) {
          console.log(error, 'error');
          message.error('Error initializing site.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <SiteContext.Provider value={{ isFullScreen, setIsFullScreen, erpShift, isEditing, setErpShift, setIsEditing, formData, setFormData, call, setCall }}>
      <CommonAppBar
        allActivities={allActivities}
        username={username}
        site={site}
        appTitle={`${t("siteMaintenance")}`}
        onSiteChange={handleSiteChange} // Pass the handler
        onSearchChange={function (): void {
        }} />

      <div className={styles.container}>
        <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>

          {/* <Input.Search
              placeholder="Search..."
              className={`${styles.filterInput} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen}`}
              // value={filter}
              onChange={handleFilterChange}
              style={{ marginLeft: '5px'}}
              onSearch={handleFilter}
            /> */}
          <FilterCommonBar
            onSearch={handleFilter}
            setData={handleSetData}
            button={
              <InstructionModal title="Site Maintenance">
                <UserInstructions />
              </InstructionModal>
            }
          />
          <div className={styles.dataFieldBodyContentsTop}>
            <Typography className={styles.dataLength}>
              {t("site")} ({data ? data.length : 0})
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
                  <div><h4>{formDatashow.site}</h4> </div>
                  <div>
                    <p>{t('createdOn')}: <span>{formData.createdDateTime ? dayjs(formData.createdDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                    <p>{t('modifiedOn')}: <span>{formData.updatedDateTime ? dayjs(formData.updatedDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                  </div>
                </div>
              ) : (
                <h3 className={styles.createShiftTitle}>{`${t('create')} ${t('site')}`}</h3>
              )}
              {isEditing && (
                <div className={styles.formHeader}>
                  <Button loading={loading} type='primary' onClick={handleReloadSite}>Reload Site</Button>
                  <Button
                    onClick={toggleFullScreen}
                    className={styles.actionButton}
                    aria-label={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                  >
                    <Tooltip title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}>
                      {isFullScreen ? (
                        <CloseFullscreenIcon sx={{ color: '#1874CE' }} />
                      ) : (
                        <OpenInFullIcon sx={{ color: '#1874CE' }} />
                      )}
                    </Tooltip></Button>

                  {erpShift ? (
                    <>
                      <Tooltip title="Close">
                        <Button onClick={handleCancel} className={styles.actionButton}>
                          <CloseIcon sx={{ color: '#1874CE' }} />
                        </Button>
                      </Tooltip>
                    </>
                  ) : (

                    <Tooltip title="Close">
                      <Button onClick={handleCancel} className={styles.actionButton}>
                        <CloseIcon sx={{ color: '#1874CE' }} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
            {isEditing && (
              <ShiftForm onCancel={handleCancelClick} />
            )}
          </div>
        )}
        <Modal
          title={t('confirmation')}
          open={isModalVisible}
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
          title={<div style={{ textAlign: 'center' }}>{`${t('copy')} ${t('site')}`}</div>}
          visible={isModalVisibleCopy}
          onOk={handleCopyAll}
          onCancel={handleCancelCopy}
          okText={t('confirm')}
          cancelText={t('cancel')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>
              {`${t('enter')} ${t('site')}`}
            </label>
            <Input
              value={copySite}
              onChange={(e) => {
                const processedValue = e.target.value
                  .replace(/\s+/g, '')  // Remove whitespace
                  .toUpperCase()        // Convert to uppercase
                  .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores

                setCopySite(processedValue);
              }}
              placeholder={`${t('enter')} ${t('site')}`}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>

            <label style={{ marginRight: '10px' }}>
              {`${t('description')}`}
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${t('enter')} ${t('description')}`}
              style={{ flex: 1 }}
            />
          </div>
        </Modal>
      </div>
    </SiteContext.Provider>
  );
};

export default SiteMaintenance;
