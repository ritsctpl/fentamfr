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
import { UserContext } from '../hooks/userContext';
import { DecodedToken, MainData, defaultShopOrder, ShopOrder } from '../types/shopTypes';
import FilterCommonBar from './FilterCommonBar';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { deleteShop, fetchShopTop50, fetchShopAll, addShop } from '@services/shopOrderService';
import dayjs from 'dayjs';





const ShopOrderMaintenance = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShopOrder>(defaultShopOrder);
  const [formDatashow, setFormDatashow] = useState<ShopOrder>(defaultShopOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState<[]>([]);
  const [valueChange, setValueChange] = useState(false);
  const [erpShift, setErpShift] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isModalVisibleCopy, setIsModalVisibleCopy] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copyShop, setCopyShop] = useState('');
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
      setSite(site);

      try {
        const shopData = await fetchShopTop50(site);
        console.log(shopData, "shopData");


        // Set the state with the extracted data
        // setShifts(shopData);
        setData(shopData || []);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }

    };

    fetchShiftData();
  }, [call, isAuthenticated, token, site]);


  const handleRowClick = (record) => {
    setSelectedRowKey(record?.shopOrder);

    if (valueChange) {
      // Open the modal to confirm the action
      setIsModalVisible(true);
    } else {
      // If erpShift is true, perform the API call directly
      fetchShopData(record?.shopOrder);
    }
  };

  const handleConfirm = async () => {
    setIsModalVisible(false); // Close the modal
    try {
      await fetchShopData(selectedRowKey);
    } catch (error) {
      console.error('Error fetching shift details:', error);
    }
  };

  const fetchShopData = async (shopOrder) => {
    try {
      const shopData = await fetchShopAll(site, shopOrder); // Call the fetchShiftAll API with the site and shiftName as parameters
      console.log(shopData, "shopData");
      // Update the form data with the data returned from the API
      setFormData(shopData);
      setFormDatashow(shopData)
      setCopyShop(`${shopData.shopOrder}_COPY`)
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
      setFormData(defaultShopOrder);
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
          setFormData(defaultShopOrder);
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


  const handleFilter = async () => {
    const response = await fetchShopTop50(site)
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
    setFormData(defaultShopOrder);
    setIsEditing(true);
    setErpShift(false);
    setValueChange(false);
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
          const shop = formData?.shopOrder
          try {
            const response = await deleteShop(site, userId, shop);
            const ResponseMessage = response?.message_details?.msg
            if (response?.errorCode) {
              message.error(response?.message);
              return;
            }
            message.success(ResponseMessage);
            handleCancel();
            setCall(call + 1);
          } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Error deleting user.');
          }
        },
      });
    }
  };
  const handleCancelCopy = () => {
    setIsModalVisibleCopy(false);
    setCopyShop('')
  };

  const handleCopyAll = async () => {
    setIsModalVisibleCopy(false);

    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;

    const payload = {
      ...formData,
      shopOrder: copyShop,


      localDateTime: new Date().toISOString(),
    };

    try {
      const response = await addShop(site, userId, payload);
      const ResponseMessage = response?.message_details?.msg;
      message.success(ResponseMessage);
      setCall(call + 1);
    } catch (error) {
      console.error('Error copying Shop Order:', error);
      message.error('Error copying Shop Order.');
    }
  };

  const handleTableChange = (pagination: any) => setCurrentPage(pagination?.current);

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


    if (data.length === 0) {
      return [];
    }

    const keys = Object.keys(data[0]);

    return keys.map(key => ({
      title: t(columnTitleMap[key] || key), // Use the mapping for column titles
      dataIndex: key,
      key: key,
      ellipsis: true,
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
  const handleSetData = (data: []) => {
    setData(data);
  };
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

  console.log(formData, "hh");

  return (<div style={{ height: "100vh" }}>
    <UserContext.Provider value={{ setValueChange, valueChange, erpShift, isEditing, setErpShift, setIsEditing, formData, setFormData, call, setCall }}>
      <CommonAppBar
        allActivities={allActivities}
        username={username}
        site={site}
        appTitle={`${t("shopOrder")} ${t("maintenance")}`}
        onSiteChange={handleSiteChange} // Pass the handler
        onSearchChange={function (): void { }} />

      <div className={styles.container} >
        <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>

          <FilterCommonBar onSearch={handleFilter} setData={handleSetData} />
          <div className={styles.dataFieldBodyContentsTop}>
            <Typography className={styles.dataLength}>
              {t("shopOrder")} ({data ? data.length : 0})
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
                  <div><h4>{formDatashow.shopOrder}</h4><p>{t('status')}: <span>{formDatashow.status}</span></p> </div>
                  <div>
                    <p>{t('createdOn')}: <span>{formData.createdDateTime ? dayjs(formData.createdDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                    <p>{t('modifiedOn')}: <span>{formData.modifiedDateTime ? dayjs(formData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                  </div>
                </div>
              ) : (
                <h3 className={styles.createShiftTitle}>{`${t('create')} ${t('shopOrder')}`}</h3>
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
          title={<div style={{ textAlign: 'center' }}>{`${t('copy')} ${t('shopOrder')}`}</div>}
          visible={isModalVisibleCopy}
          onOk={handleCopyAll}
          onCancel={handleCancelCopy}
          okText={t('confirm')}
          cancelText={t('cancel')}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: "20px" }}>
            <label style={{ marginRight: '10px' }}>
              {` ${t('shopOrder')}`}
            </label>
            <Input
              value={copyShop}
              onChange={(e) => {
                const processedValue = e.target.value
                  .replace(/\s+/g, '')  // Remove whitespace
                  .toUpperCase()        // Convert to uppercase
                  .replace(/[^A-Z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores

                setCopyShop(processedValue);
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

export default ShopOrderMaintenance;
