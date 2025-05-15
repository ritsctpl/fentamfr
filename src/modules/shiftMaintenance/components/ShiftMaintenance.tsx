import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@modules/shiftMaintenance/styles/ShiftForm.module.css';
import { parseCookies } from 'nookies';
import { fetchShift, updateShift, deleteShift, addShift, fetchShiftAll, copyAllShifts } from '@services/shiftService';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import jwtDecode from 'jwt-decode';
import { Input, Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FileCopy';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import AddIcon from '@mui/icons-material/Add';
import DynamicTable from '@modules/shiftMaintenance/components/DynamicTable';
import { decryptToken } from '@/utils/encryption';
import { ShiftContext } from '@modules/shiftMaintenance/hooks/shiftContext';
import { Data, DecodedToken } from '../types/shiftTypes';
import FilterCommonBar from '@modules/shiftMaintenance/components/FilterCommonBar';
import { IconButton, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import ShiftForm from '@modules/shiftMaintenance/components/TabNavigation';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';

const ShiftMaintenance = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [workCenterId, setWorkCenterId] = useState<string | null>(null);
  const [shiftType, setShiftType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Data>({
    shiftId: '',
    description: '',
    shiftType: '',
    workCenterId: '',
    resourceId: '',
    shiftIntervals: [],
    calendarRules: [],
    calendarOverrides: [],
    customDataList: [],
    startTime: null,
    endTime: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState<Data[]>([]);
  const [shifts, setShifts] = useState<Data[]>([]);
  const [valueChange, setValueChange] = useState(false);
  const [erpShift, setErpShift] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleCopy, setIsModalVisibleCopy] = useState(false);
  const [copyShiftId, setShiftName] = useState('');
  const [description, setDescription] = useState('');

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  useEffect(() => {
    const handleResize = () => {
      setPageSize(getPageSize(window.innerWidth, window.innerHeight));
      setCurrentPage(1); // Reset to the first page on page size change
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      try {
        const shiftsData = await fetchShift(site);
        const shiftsWithIds = shiftsData.map((shift, index) => ({
          ...shift,
          id: index + 1
        }));

        setShifts(shiftsWithIds);
        setData(shiftsWithIds || []);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };

    fetchShiftData();
  }, [call, isAuthenticated, token, site]);
  const handleRowClick = (record) => {
    console.log(record);
    const hasUnsavedChanges = valueChange;

    if (hasUnsavedChanges && isEditing) {
      Modal.confirm({
        title: t('confirm'),
        content: t('unsavedChangesMessage'),
        okText: t('yes'),
        cancelText: t('no'),
        onOk: async () => {
          setSelectedRowKey(record.shiftId);
          setResourceId(record?.resourceId);
          setWorkCenterId(record?.workCenterId);
          setShiftType(record?.shiftType);
          fetchShiftData(record.shiftId, record?.resourceId, record?.workCenterId, record?.shiftType);
        }
      });
    } else {
      setSelectedRowKey(record.shiftId);
      setResourceId(record?.resourceId);
      setWorkCenterId(record?.workCenterId);
      setShiftType(record?.shiftType);
      fetchShiftData(record.shiftId, record?.resourceId, record?.workCenterId, record?.shiftType);
    }
  };
  const handleCancelCopy = () => {
    setIsModalVisibleCopy(false);
  };
  const handleConfirm = async () => {
    setValueChange(false);
    setIsModalVisible(false); // Close the modal
    try {
      await fetchShiftData(selectedRowKey, resourceId, workCenterId, shiftType); // Fetch shift data with the selected row key
    } catch (error) {
      console.error('Error fetching shift details:', error);
    }
  };

  const fetchShiftData = async (shiftId, resourceId, workCenterId, shiftType) => {
    try {
      const shiftData = await fetchShiftAll(site, shiftId, resourceId, workCenterId, shiftType);
      console.log('api call');

      // Update the form data with the data returned from the API
      setFormData(shiftData);
      setShiftName(`${shiftData.shiftId}_COPY`)

      // Set ERP shift and editing states to true
      setErpShift(true);
      setIsEditing(true);

      // Trigger the animation by setting the appropriate class
      setAnimationClass('showing');
    } catch (error) {
      message.destroy();
      message.error('Error fetching shift details');
      console.error('Error fetching shift details:', error);
    }
  };


  const handleCancel = () => {
    setTimeout(() => {
      setSelectedRowKey(null);
      setFormData({
        shiftId: '',
        description: '',
        shiftType: '',
        workCenterId: '',
        resourceId: '',
        shiftIntervals: [],
        customDataList: [],
        calendarRules: [],
        calendarOverrides: [],
        startTime: null,
        endTime: null,
      });
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
          setFormData({
            shiftId: '',
            description: '',
            shiftType: '',
            workCenterId: '',
            resourceId: '',
            shiftIntervals: [],
            customDataList: [],
            calendarRules: [],
            calendarOverrides: [],
            startTime: null,
            endTime: null,
          });
          setIsEditing(false);
          setErpShift(false);
          setAnimationClass('');
          setIsFullScreen(false);
        }, 1000);
      },
      onCancel() {
        // Handle the cancel action if needed
      },
    });
  };


  const handleFilter = async () => {
    const response = await fetchShift(site)
    const filteredData = response.filter(row =>
      row.shiftId.toLowerCase().includes(filter.toLowerCase()) ||
      row.description.toLowerCase().includes(filter.toLowerCase()) ||
      row.shiftType.toLowerCase().includes(filter.toLowerCase())
    );
    setData(filteredData);


    setCurrentPage(1);
  };

  const handleAdd = () => {
    setValueChange(false);
    setSelectedRowKey(null);
    setFormData({
      shiftId: null,
      description: '',
      shiftType: 'General',
      workCenterId: null,
      resourceId: null,
      shiftIntervals: [],
      calendarRules: [],
      calendarOverrides: [],
      customDataList: [],
      startTime: null,
      endTime: null,
    });
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
          try {
            const response = await deleteShift(site, userId, { shiftId: selectedRowKey, shiftType: shiftType, workCenterId: workCenterId, resourceId: resourceId });
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

  const handleCopyAll = async () => {


    if (!copyShiftId.trim()) {
      message.error('Shift Name fields cannot be empty.');
      return;
    }


    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    const { shiftId, description, ...formDataNew } = formData
    const payload = {
      site,
      userId,
      shiftId: copyShiftId,
      description: description,
      ...formDataNew,
      localDateTime: new Date().toISOString(),
    };
    console.log(copyShiftId, "copyShiftId1");

    console.log('Payload:', payload);

    try {
      const response = await addShift(payload);
      setShiftName('');
      setDescription('');
      const ResponseMessage = response.message_details.msg;
      message.success(ResponseMessage);
      setCall(call + 1);
      setIsModalVisibleCopy(false);
    } catch (error) {
      console.error('Error copying shifts:', error);
      message.error('Error copying shifts.');
    }
  };

  const handleTableChange = (pagination: any) => setCurrentPage(pagination.current);

  // const handleSelectChange = (value: string, name: string) => setFormData(prevFormData => ({ ...prevFormData, [name]: value }));

  const columns: ColumnsType<Data> = [
    {
      title: t('shiftName'),
      dataIndex: 'shiftId',
      ellipsis: true,
      key: 'shiftId',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      ellipsis: true,
      key: 'description',
    },
    {
      title: t('shiftType'),
      dataIndex: 'shiftType',
      ellipsis: true,
      key: 'shiftType',
    },
    {
      title: t('resourceId'),
      dataIndex: 'resourceId',
      ellipsis: true,
      key: 'resourceId',
    },
    {
      title: t('workCenterId'),
      dataIndex: 'workCenterId',
      ellipsis: true,
      key: 'workCenterId',
    },
  ];
  const handleSearchChange = (searchTerm: string) => {

  };

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
    // Optionally, handle any additional logic required when the site changes
  };
  const handleSetData = (data: Data[]) => {
    setData(data);
  };

  console.log(copyShiftId, "copyShiftId");

  return (
    <ShiftContext.Provider value={{ erpShift, isEditing, setErpShift, setIsEditing, formData, setFormData, call, setCall, setValueChange, valueChange }}>
      <CommonAppBar
        allActivities={allActivities}
        username={username}
        site={site}
        appTitle={t('headerTitle')}
        onSiteChange={handleSiteChange} // Pass the handler
        onSearchChange={function (): void {

        }} />

      <div className={styles.container}>
        <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>

          <FilterCommonBar onSearch={handleFilter} setData={handleSetData}
            button={
              <InstructionModal title="Shift Maintenance">
                <UserInstructions />
              </InstructionModal>
            }
          />
          <div className={styles.dataFieldBodyContentsTop}>
            <Typography className={styles.dataLength}>
              {t("shift")} ({data ? data.length : 0})
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
                  <div><h4>{formData.shiftId}</h4><p>{t('description')}: <span>{formData.description}</span></p> </div>
                  <div>
                    <p>{t('createdOn')}: <span>{formData.createdDateTime ? dayjs(formData.createdDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                    <p>{t('modifiedOn')}: <span>{formData.modifiedDateTime ? dayjs(formData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                  </div>
                </div>
              ) : (
                <h3 className={styles.createShiftTitle}>{t('createShift')}</h3>
              )}
              {isEditing && (
                <div className={styles.formHeader}>

                  <Tooltip title="Exit Ful Screen">
                    <Button onClick={toggleFullScreen} className={styles.actionButton}>
                      {isFullScreen ? <CloseFullscreenIcon sx={{ color: '#1874CE' }} /> : <OpenInFullIcon sx={{ color: '#1874CE' }} />}
                    </Button>
                  </Tooltip>
                  {erpShift ? (
                    <>

                      <Tooltip title="Copy">
                        <Button onClick={() => setIsModalVisibleCopy(true)} className={styles.actionButton}>
                          <CopyIcon sx={{ color: '#1874CE' }} />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button onClick={handleDelete} className={styles.actionButton}>
                          <DeleteIcon sx={{ color: '#1874CE' }} />
                        </Button>
                      </Tooltip>
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
          title={`${t('enter')} ${t('shiftName')}`}
          visible={isModalVisibleCopy}
          onOk={handleCopyAll}
          onCancel={handleCancelCopy}
          okText={t('confirm')}
          cancelText={t('cancel')}
        >
          <Input
            value={copyShiftId}
            onChange={(e) => {
              const processedValue = e.target.value
                .replace(/\s+/g, '')  // Remove whitespace
                .toUpperCase()        // Convert to uppercase
                .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores

              setShiftName(processedValue);
            }}
            placeholder={`${t('enter')} ${t('shiftName')}`}
          />

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`${t('enter')} ${t('description')}`}
            style={{ marginTop: 16 }} // Add margin for spacing
          />
        </Modal>


      </div>
    </ShiftContext.Provider>
  );
};

export default ShiftMaintenance;
