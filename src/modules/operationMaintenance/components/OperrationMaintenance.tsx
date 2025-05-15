import React, { useEffect, useState } from 'react';
import styles from '@modules/operationMaintenance/styles/OperationForm.module.css';
import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import TabNav from '@modules/operationMaintenance/components/TabNavigation';
import jwtDecode from 'jwt-decode';
import { Input, Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Delete as DeleteIcon, Close as CloseIcon, FileCopy as CopyIcon, OpenInFull as OpenInFullIcon, CloseFullscreen as CloseFullscreenIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DynamicTable from '@modules/operationMaintenance/components/DynamicTable';
import { decryptToken } from '@/utils/encryption';
import { OperationContext } from '@modules/operationMaintenance/hooks/operationContext';
import { OperationData, DecodedToken, defaultOperationData } from '@modules/operationMaintenance/types/operationTypes';
import FilterCommonBar from '@modules/operationMaintenance/components/FilterCommonBar';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { copyAllOperation, deleteOperation, fetchOperation, fetchOperationAll } from '@services/operationService';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const OperationMaintenance = () => {
  const cookies = parseCookies();
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [selectedRevision, setSelectRevision] = useState<string | null>(null);
  const [formData, setFormData] = useState<OperationData>(defaultOperationData);
  const [formDatashow, setFormDatashow] = useState<OperationData>(defaultOperationData);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  // const [filter, setFilter] = useState('');
  const [data, setData] = useState<OperationData[]>([]);
  const [erpShift, setErpShift] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(cookies.site);
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
  const [isModalVisibleCopy, setIsModalVisibleCopy] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copyOperation, setCopyOperation] = useState('');
  const [copyRevision, setCopyRevision] = useState('');
  const [copyDescription, setCopyDescription] = useState('');


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
    console.log(site, "callloop");
    const fetchOperationData = async () => {
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
      // const cookies = parseCookies();
      // const site = cookies.site;
      console.log(site, "sitecc");
      // setSite(site);
      try {
        const operationData = await fetchOperation(site);
        setData(operationData || []);
        console.log(operationData, "operationData");

      } catch (error) {
        console.error('Error fetching operations:', error);
      }
    };

    fetchOperationData();
  }, [call, isAuthenticated, token, site, t]);


  const handleRowClick = (record) => {
    const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(formDatashow);

    if (hasUnsavedChanges && isEditing) {
      Modal.confirm({
        title: t('confirm'),
        content: t('unsavedChangesMessage'),
        okText: t('yes'),
        cancelText: t('no'),
        onOk: async () => {
          setSelectedRowKey(record.operation);
          setSelectRevision(record.revision);
          fetchShiftData(record.operation, record.revision);
        }
      });
    } else {
      setSelectedRowKey(record.operation);
      setSelectRevision(record.revision);
      if (!erpShift && isEditing) {
        setIsModalVisible(true);
      } else {
        fetchShiftData(record.operation, record.revision);
      }
    }
  };

  const handleConfirm = async () => {
    setIsModalVisible(false); // Close the modal
    try {
      await fetchShiftData(selectedRowKey, selectedRevision);
    } catch (error) {
      console.error('Error fetching operation details:', error);
    }
  };

  const fetchShiftData = async (operation, revision) => {
    try {
      const operationData = await fetchOperationAll(site, operation, revision); // Call the fetchShiftAll API with the site and shiftName as parameters
      console.log('api call');

      // Update the form data with the data returned from the API
      setFormData(operationData);
      setFormDatashow(operationData)
      setCopyOperation(`${operationData.operation}_COPY`)
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
      setFormData(defaultOperationData);
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
          setFormData(defaultOperationData);
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


  // const handleFilter = async () => {
  //   const response = await fetchOperation(site)
  //   const filteredData = response.filter(row =>
  //     row.shiftName.toLowerCase().includes(filter.toLowerCase()) ||
  //     row.description.toLowerCase().includes(filter.toLowerCase()) ||
  //     row.shiftType.toLowerCase().includes(filter.toLowerCase())
  //   );
  //   setData(filteredData);


  //   setCurrentPage(1);
  // };

  const handleAdd = () => {
    setSelectedRowKey(null);
    setFormData(defaultOperationData);
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
          const operation = formData.operation
          const revision = formData.revision
          try {
            const response = await deleteOperation(site, userId, { operation, revision });
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
    setCopyOperation('')
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
      operation: copyOperation,
      revision: copyRevision,
      description: copyDescription,


      localDateTime: new Date().toISOString(),
    };
    console.log(payload + "payload")
    try {
      const response = await copyAllOperation(site, userId, payload);
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
    operation: t('operation'),
    revision: t('revision'),
    description: t('description'),
    status: t('status'),
    operationType: t('operationType'),
    currentVersion: t('currentVersion'),
  };

  // Create columns based on the data
  const createDynamicColumns = (data: OperationData[]): ColumnsType<OperationData> => {


    if (data.length === 0) {
      return [];
    }

    const keys = Object.keys(data[0]);

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
    console.log(newSite, "newSite");
    setCall(call + 1);
    // Optionally, handle any additional logic required when the site changes
  };
  const handleSetData = (data: OperationData[]) => {
    setData(data);
  };


  return (
    <OperationContext.Provider value={{ erpShift, isEditing, setErpShift, setIsEditing, formData, setFormData, call, setCall }}>
      <CommonAppBar
        username={username}
        site={site}
        appTitle={`${t("operation")} ${t("maintenance")}`}
        onSiteChange={handleSiteChange}
        onSearchChange={function (): void {
        }} />

      <div className={styles.container}>
        <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>

          <FilterCommonBar onSearch={()=>{}} setData={handleSetData} />
          <div className={styles.dataFieldBodyContentsTop}>
            <Typography className={styles.dataLength}>
              {t("operation")} ({data ? data.length : 0})
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
        {(selectedRowKey || isEditing ) && (
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
                <h3 className={styles.createShiftTitle}>{`${t('create')} ${t('operation')}`}</h3>
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
                        <Button
                          onClick={handleDelete}
                          className={styles.actionButton}
                        >
                          <DeleteIcon sx={{ color: "#1874CE" }} />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Close">
                        <Button
                          onClick={handleCancel}
                          className={styles.actionButton}
                        >
                          <CloseIcon sx={{ color: "#1874CE" }} />
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="Close">
                      <Button
                        onClick={handleCancel}
                        className={styles.actionButton}
                      >
                        <CloseIcon sx={{ color: "#1874CE" }} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
            {isEditing && <TabNav onCancel={handleCancelClick} />}
          </div>
        )}
        <Modal
          title={t("rowSelectionMsg")}
          visible={isModalVisible}
          onOk={handleConfirm}
          onCancel={() => {
            setIsModalVisible(false);
            setSelectedRowKey(null); // Clear the selected row key
          }}
          okText={t("confirm")}
          cancelText={t("cancel")}
        >
          <p>{t("alertRow")}</p>
        </Modal>

        <Modal
          title={`${t("enter")} ${t("operation")}`}
          visible={isModalVisibleCopy}
          onOk={handleCopyAll}
          onCancel={handleCancelCopy}
          okText={t("confirm")}
          cancelText={t("cancel")}
        >
          <Input
            value={copyOperation}
            onChange={(e) => {
              const processedValue = e.target.value
                .replace(/\s+/g, "") // Remove whitespace
                .toUpperCase() // Convert to uppercase
                .replace(/[^A-Z0-9_]/g, ""); // Remove non-alphanumeric characters except underscores

              setCopyOperation(processedValue);
            }}
            placeholder={`${t("enter")} ${t("operation")}`}
            style={{ marginBottom: "20px" }}
          />
          <Input
            value={copyRevision}
            onChange={(e) => {
              const processedValue = e.target.value
                .replace(/\s+/g, "") // Remove whitespace
                .toUpperCase() // Convert to uppercase
                .replace(/[^A-Z0-9_]/g, ""); // Remove non-alphanumeric characters except underscores

              setCopyRevision(processedValue);
            }}
            placeholder={`${t("enter")} ${t("revision")}`}
            style={{ marginBottom: "20px" }}
          />
          <Input
            value={copyDescription}
            onChange={(e) => setCopyDescription(e.target.value)}
            placeholder={`${t("enter")} ${t("description")}`}
          />
        </Modal>
      </div>
    </OperationContext.Provider>
  );
};

export default OperationMaintenance;
