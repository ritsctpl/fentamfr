import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@modules/processOrderMaintenance/styles/ShiftForm.module.css';
import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import ShiftForm from '@modules/processOrderMaintenance/components/TabNavigation';
import jwtDecode from 'jwt-decode';
import { Input, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FileCopy';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import AddIcon from '@mui/icons-material/Add';
import DynamicTable from '@modules/processOrderMaintenance/components/DynamicTable';
import { decryptToken } from '@/utils/encryption';
import { UserContext } from '@modules/processOrderMaintenance/hooks/userContext';
import { DecodedToken, MainData, defaultProcessOrder } from '@modules/processOrderMaintenance/types/processTypes';
import FilterCommonBar from '@modules/processOrderMaintenance/components/FilterCommonBar';
import { IconButton, Tooltip, Typography, Button } from '@mui/material';
import dayjs from 'dayjs';
import { addProcess, deleteProcess, fetchAllProcessOrderList, fetchProcessAll, fetchProcessAllData, fetchProcessOrderTop50, fetchProcessTop50 } from '@services/processOrderService';
import CommonTable from '@components/CommonTable';
import DataFieldCommonBar from '@modules/processOrderMaintenance/components/FilterCommonBar';
import ProcessOrderTable from '@modules/processOrderMaintenance/components/ProcessOrderTable';

const ProcessOrderMaintenance = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<number>(1);
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(defaultProcessOrder);
  const [formDatashow, setFormDatashow] = useState<any>(defaultProcessOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState<[]>([]);
  const [shifts, setShifts] = useState<[]>([]);
  const [erpShift, setErpShift] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isModalVisibleCopy, setIsModalVisibleCopy] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copyProcess, setCopyProcess] = useState('');
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
  const [formChange, setFormChange] = useState(false);
  const [isModalVisibles, setIsModalVisibles] = useState<boolean>(false);
  const [selectRowData, setSelectRowData] = useState<any>(null);

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
        const processData = await fetchProcessOrderTop50(site);
        // const processData = await fetchProcessTop50(site);
        setShifts(processData);
        setData(processData || []);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }

    };

    fetchShiftData();
  }, [call, isAuthenticated, token, site]);


  const handleRowClick = (record) => {
    console.log(record, 'record');

    setSelectedRowKey(record.orderNumber);

    // if (!erpShift && isEditing) {
    //   setIsModalVisible(true);
    // } else {
    //   fetchProcessData(record.processOrder);
    // }

    if (formChange) {
      setSelectRowData(record.orderNumber);
      setIsModalVisible(true);
      setFormChange(false)
    } else {
      fetchProcessData(record.orderNumber);
      // setSelected(record.processOrder)
    }
  };

  const handleModalOk = () => {
    if (selectRowData.orderNumber) {
      fetchProcessData(selectRowData.orderNumber);
    }
    setIsModalVisibles(false);
  };

  const handleModalCancel = () => {
    setIsModalVisibles(false);
  };

  const handleConfirm = async () => {
    setIsModalVisible(false);
    try {
      await fetchProcessData(selectedRowKey);
    } catch (error) {
      console.error('Error fetching shift details:', error);
    }
  };

  const fetchProcessData = async (orderNumber) => {
    try {
      const processData = await fetchProcessAll(site, orderNumber);
      setFormData(processData);
      setFormDatashow(processData)
      setCopyProcess(`${processData.orderNumber}_COPY`)
      setErpShift(true);
      setIsEditing(true);
      setAnimationClass('showing');
      setActiveTab(1)
    } catch (error) {
      console.error('Error fetching process order details:', error);
    }
  };

  const handleCancel = () => {
    // setTimeout(() => {
    // setSelectedRowKey(null);
    // setFormData(defaultProcessOrder);
    // setIsEditing(false);
    // setErpShift(false);
    // setAnimationClass('');
    // setIsFullScreen(false)
    // }, 1000);
    if (formChange) {
      Modal.confirm({
        title: t('confirm'),
        content: t('closePageMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk: () => {
          setSelectedRowKey(null);
          setFormData(defaultProcessOrder);
          setIsEditing(false);
          setErpShift(false);
          setAnimationClass('');
          setIsFullScreen(false)
          setFormChange(false)
        }
      })
    }
    else {
      setSelectedRowKey(null);
      setFormData(defaultProcessOrder);
      setIsEditing(false);
      setErpShift(false);
      setAnimationClass('');
      setIsFullScreen(false)
      setFormChange(false)
    }
  };

  const handleCancelClick = () => {
    if (formChange) {
      Modal.confirm({
        title: t('confirm'),
        content: t('closePageMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk() {
          setSelectedRowKey(null);
          setFormData(defaultProcessOrder);
          setIsEditing(false);
          setErpShift(false);
          setAnimationClass('');
          setIsFullScreen(false);
          setFormChange(false)
        },
        onCancel() { },
      });
    }
    else {
      setSelectedRowKey(null);
      setFormData(defaultProcessOrder);
      setIsEditing(false);
      setErpShift(false);
      setAnimationClass('');
      setIsFullScreen(false);
      setFormChange(false)
    }
  };


  const handleFilter = async () => {
    const response = await fetchProcessTop50(site)
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
    setFormData(defaultProcessOrder);
    setIsEditing(true);
    setErpShift(false);
    setActiveTab(1)
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
          const process = formData.orderNumber
          try {
            const response = await deleteProcess(site, userId, process);
            const ResponseMessage = await response.message_details.msg
            message.success(ResponseMessage);
            handleCancel();
            setCall(call + 1);
          } catch (error) {
            message.error('Error deleting user.');
          }
        },
      });
    }
  };
  const handleCancelCopy = () => {
    setIsModalVisibleCopy(false);
    setCopyProcess('')
  };

  const handleCopyAll = async () => {
    setIsModalVisibleCopy(false);

    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    const payload = {
      ...formData,
      orderNumber: copyProcess,


      localDateTime: new Date().toISOString(),
    };

    try {
      const response = await addProcess(site, userId, payload);
      const ResponseMessage = response.message_details.msg;
      message.success(ResponseMessage);
      setCall(call + 1);
    } catch (error) {
      message.error('Error copying Process Order.');
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
  const createDynamicColumns = (data: MainData[]): ColumnsType<MainData> => {
    if(!data){
      return [];
    }

    if (data?.length === 0) {
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
  };
  const handleSetData = (data: []) => {
    setData(data);
  };

  console.log(data, 'ddddata');

  const uiPlaner: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Planner Material',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'workcenter',
    tabledataApi: "item-service/retrieveTop50"
  };

  const handleSearchClick = async (orderNumber: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const lowercasedTerm = orderNumber.toLowerCase();
    console.log(lowercasedTerm, 'lowercasedTerm');

    let filtered;

    try {
      const AllProcessOrder = await fetchAllProcessOrderList(site, orderNumber);

      if (AllProcessOrder?.processOrderResponseList) {
        if (lowercasedTerm.length > 0) {
          console.log('call1');
          filtered = AllProcessOrder?.processOrderResponseList.filter(row =>
            Object.values(row).some(value =>
              String(value).toLowerCase().includes(lowercasedTerm)
            )
          );
          setData(filtered);
        }
        else {
          filtered = shifts;
          setData(filtered);
        }
      } else if (AllProcessOrder?.message) {
        message.success(AllProcessOrder.message);
        setData([]);
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
      const response = await fetchProcessOrderTop50(site);
      if(!response?.errCode)
        setData(response);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };

  return (<div style={{ height: "100vh" }}>
    <UserContext.Provider value={{ activeTab, setActiveTab, erpShift, isEditing, setErpShift, setIsEditing, formData, setFormData, call, setCall, formChange, setFormChange }}>
      <CommonAppBar
        onSearchChange={() => { }}
        allActivities={[]}
        username={username}
        site={null}
        appTitle={`${t("processOrder")} ${t("maintenance")}`} onSiteChange={handleSiteChange} />

      <div className={styles.container} >
        <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>

          {/* <FilterCommonBar onSearch={handleFilter} setData={handleSetData} /> */}
          <DataFieldCommonBar handleSearchClicks={handleSearchClick} handleTop50={handleTop50} />
          <div className={styles.dataFieldBodyContentsTop}>
            <Typography className={styles.dataLength}>
              {t("orderNumber")} ({data ? data.length : 0})
            </Typography>

            <IconButton onClick={handleAdd} className={styles.circleButton}>
              <AddIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </div>

          {/* <DynamicTable
            columns={columns}
            data={data}
            currentPage={currentPage}
            pageSize={pageSize}
            handleRowClick={(handleRowClick)}
            handleTableChange={handleTableChange}
            setCurrentPage={setCurrentPage}
            selectedRowKey={selectedRowKey}
          /> */}
          {/* <CommonTable data={data} onRowSelect={handleRowClick} /> */}
          <ProcessOrderTable data={data} onRowSelect={handleRowClick} />
        </div>
        {(selectedRowKey || isEditing) && (
          <div className={`${styles.detailsAndFormContainer} ${isFullScreen ? styles.fullScreen : styles.halfScreen} ${animationClass}`}>
            <div className={styles.topHeaderIcon}>
              {(selectedRowKey && isEditing) ? (
                <div className={`${styles.detailsContainers} ${styles.compactSpacing}`}>
                  <div><h4>{formDatashow.orderNumber}</h4><p>{t('status')}: <span>{formDatashow.status}</span></p> </div>
                  <div>
                    <p>{t('createdOn')}: <span>{formData?.createdDateTime ? dayjs(formData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                    <p>{t('modifiedOn')}: <span>{formData?.modifiedDateTime ? dayjs(formData?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                  </div>
                </div>
              ) : (
                <h3 className={styles.createShiftTitle}>{`${t('create')} ${t('orderNumber')}`}</h3>
              )}
              {isEditing && (
                <div className={styles.formHeader}>
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
          open={isModalVisible}
          onOk={handleConfirm}
          onCancel={() => {
            setIsModalVisible(false);
            setFormChange(true)
            // setSelectedRowKey(null); 
          }}
          okText={t('confirm')}
          cancelText={t('cancel')}
        >
          <p>{t('alertRow')}</p>
        </Modal>

        <Modal
          title={t('confirmation')}
          open={isModalVisibles}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={t('confirm')}
          cancelText={t('cancel')}
        >
          <p>{t('alertRow')}</p>
        </Modal>

        <Modal
          title={<div style={{ textAlign: 'center' }}>{`${t('copy')} ${t('orderNumber')}`}</div>}
          open={isModalVisibleCopy}
          onOk={handleCopyAll}
          onCancel={handleCancelCopy}
          okText={t('confirm')}
          cancelText={t('cancel')}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: "20px" }}>
            <label style={{ marginRight: '10px' }}>
              {`${t('orderNumber')}`}
            </label>
            <Input
              value={copyProcess}
              onChange={(e) => {
                const processedValue = e.target.value
                  .replace(/\s+/g, '')  // Remove whitespace
                  .toUpperCase()        // Convert to uppercase
                  .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores

                setCopyProcess(processedValue);
              }}
              style={{ flex: 1 }}
            />
          </div>
        </Modal>

      </div>
    </UserContext.Provider>
  </div>
  );
};

export default ProcessOrderMaintenance;
