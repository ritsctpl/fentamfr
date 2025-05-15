import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/ShiftForm.module.css';
import { parseCookies } from 'nookies';
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@/context/AuthContext';
import ShiftForm from './TabNavigation';
import jwtDecode from 'jwt-decode';
import { Input, Button, Modal, message, Form, Radio } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import AddIcon from '@mui/icons-material/Add';
import DynamicTable from './DynamicTable';
import { decryptToken } from '@/utils/encryption';
import { InventoryContext } from '../hooks/InventoryContext';
import FilterCommonBar from './FilterCommonBar';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { fetchUserTop50 } from '@services/userService';
import { copyAllSite, deleteSite, initializeSite } from '@services/siteServices';
import dayjs from 'dayjs';
import { fetchInventoryData, fetchInventoryTop50 } from '@services/inventoryServices';
import { GrChapterAdd } from 'react-icons/gr';
import { fetchAllMaterial, fetchTop50Material } from '@services/cycleTimeService';
import { DefaultInventoryData, InventoryRequest } from '../types/InventoryTypes';

const InventoryMaintenance = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation()
  const { isAuthenticated, token } = useAuth();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<InventoryRequest>(DefaultInventoryData);
  const [formDatashow, setFormDatashow] = useState<InventoryRequest>(DefaultInventoryData);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState<InventoryRequest[]>([]);
  const [shifts, setShifts] = useState<InventoryRequest[]>([]);
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
  const [isModalVisibleCreate, setIsModalVisibleCreate] = useState(false);

  const [materialVisible, setMaterialVisible] = useState(false);
  const [materialData, setMaterialData] = useState([]);

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  useEffect(() => {
    const fetchShiftData = async () => {
      {
        isEditing && !erpShift ?
          handleCancel() : null
      }
      const cookies = parseCookies();
      const site = cookies.site;
      setSite(site);
      try {
        const userData = await fetchInventoryTop50(site);
        console.log(userData, "userData");
        setShifts(userData);
        setData((userData || []).map(item => ({
          inventoryId: item.inventoryId,
          item: item.item,
          qty: item.qty,
          receiveQty: item.receiveQty,
          version: item.version
        })));
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }

    };

    fetchShiftData();
  }, [call, isAuthenticated, token, site]);


  const handleRowClick = (record) => {
    setSelectedRowKey(record.inventoryId);

    if (!erpShift && isEditing) {
      // Open the modal to confirm the action
      setIsModalVisible(true);
    } else {
      // If erpShift is true, perform the API call directly
      fetchShiftData(record.inventoryId);
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

  const fetchShiftData = async (inventoryId) => {
    try {
      const userData = await fetchInventoryData(inventoryId); // Call the fetchShiftAll API with the site and shiftName as parameters
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
      setFormData(DefaultInventoryData);
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
          setFormData(DefaultInventoryData);
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
    setFormData(DefaultInventoryData);
    // setIsEditing(true);
    setErpShift(false);
    setIsModalVisibleCreate(true);
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
          const site = formData.inventoryId
          try {
            const response = await deleteSite(userId, site);
            const ResponseMessage = await response.message_details.msg
            message.success(ResponseMessage);
            handleCancel();
            setCall(call + 1);
          } catch (error) {
            console.error('Error deleting inventory:', error);
            message.error('Error deleting inventory.');
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
  const createDynamicColumns = (data: InventoryRequest[]): ColumnsType<InventoryRequest> => {


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
  const handleSetData = (data: InventoryRequest[]) => {
    setData(data);
  };

  const handleReloadSite = async () => {
    // setLoading(true);
    try {
      const response = await initializeSite();
      // setCall(call + 1);
      message.success(response);
    } catch (error) {
      message.error('Error initializing site.');
    } finally {
      // setLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setIsModalVisibleCreate(false);
  };


  const handleCreate = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    try {
        const values = await form.validateFields();
        const updatedRowData = {
            ...formData,
            item: values?.material,
            revision: values?.version,
            receiveQty: values?.receiveQty,
            description: values?.description,
            site: site,
            userId: userId
        };

        // const response = await createCopyBom(site, userId, updatedRowData);

        // if (response.message) {
        //     message.error(response.message)
        // }
        // else {
        //     message.success(response.message_details.msg)
        //     setCall(call + 1);
        // }
    } catch (error) {
        console.error('Validation failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");

    const patterns: { [key: string]: RegExp } = {
      material: /^[A-Z0-9_]*$/,
    };

    if (key === 'material') {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
      // Clear version field if material is empty
      if (!newValue) {
        form.setFieldsValue({ version: '' });
      }
    }

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
    }
  };

  const handleMaterialClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('material');

    const newValue = {
      item: typedValue,
    }

    try {
      let response;
      if (typedValue) {
        response = await fetchAllMaterial(site, newValue);

      } else {
        response = await fetchTop50Material(site);
      }

      if (response && !response.errorCode) {
        const formattedData = response.itemList.map((item: any, index: number) => ({
          id: index,
          ...item,
        }));
        setMaterialData(formattedData);
      } else {
        setMaterialData([]);
      }
    } catch (error) {
      console.error('Error', error);
    }
    setMaterialVisible(true);
  };

  const handleMaterialOk = (record: any) => {
    form.setFieldsValue({
      material: record.item,
      version: record.revision,
    });
    setMaterialVisible(false);
  };

  const materialColumn: ColumnsType<any> = [
    {
      title: "Material",
      dataIndex: "item",
      key: "item",
    },
    {
      title: "Revision",
      dataIndex: "revision",
      key: "revision",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    }
  ]

  const handleMaterialCancel = () => {
    setMaterialVisible(false);
  };

  return (
    <InventoryContext.Provider value={{ isFullScreen, setIsFullScreen, erpShift, isEditing, setErpShift, setIsEditing, formData, setFormData, call, setCall }}>
      <CommonAppBar
        allActivities={allActivities}
        username={username}
        site={site}
        appTitle={`${t("Inventory Maintenance")}`}
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
          <FilterCommonBar onSearch={handleFilter} setData={handleSetData} />
          <div className={styles.dataFieldBodyContentsTop}>
            <Typography className={styles.dataLength}>
              {t("inventory")} ({data ? data.length : 0})
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
                  <div><h4>{formDatashow.inventoryId}</h4> </div>
                  <div>
                    <p>{t('createdOn')}: <span>{formData.createdDateTime ? dayjs(formData.createdDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                    <p>{t('modifiedOn')}: <span>{formData.modifiedDateTime ? dayjs(formData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') : 'N/A'}</span></p>
                  </div>
                </div>
              ) : (
                <h3 className={styles.createShiftTitle}>{`${t('create')} ${t('inventory')}`}</h3>
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
          title={<div style={{ textAlign: 'center' }}>{`${t('copy')} ${t('inventory')}`}</div>}
          open={isModalVisibleCopy}
          onOk={handleCopyAll}
          onCancel={handleCancelCopy}
          okText={t('confirm')}
          cancelText={t('cancel')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>
              {`${t('enter')} ${t('inventory')}`}
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
              placeholder={`${t('enter')} ${t('inventory')}`}
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

        <Modal
          title={<div style={{ textAlign: 'center' }}>{`${t('create')} ${t('inventory')}`}</div>}
          open={isModalVisibleCreate}
          okText={t('create')}
          width={700}
          cancelText={t('cancel')}
          onOk={handleCreate}
          onCancel={handleCancelCreate}
        >
          <Form
            layout="horizontal"
            form={form}
            style={{ width: '100%' }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >

            <Form.Item
              key="material"
              name="material"
              label={t(`material`)}
              rules={[{ required: true, message: 'Please input material!' }]}
            >
              <Input
                suffix={
                  <GrChapterAdd
                    onClick={() =>
                      handleMaterialClick()
                    }
                  />
                }
                onChange={(e) => handleInputChange(e, 'material')}
              />

            </Form.Item>

            <Form.Item
              key="version"
              name="version"
              label={t(`version`)}
              rules={[{ required: true, message: 'Please input version!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              key="receiveQty"
              name="receiveQty"
              label={t(`receiveQty`)}
              rules={[{ required: true, message: 'Please input receive quantity!' }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              key="type"
              name="type"
              label={t(`type`)}
              rules={[{ required: true, message: 'Please select type!' }]}
            >
              <Radio.Group>
                <Radio value="lotSize">Lot Size</Radio>
                <Radio value="custom">Custom</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
        title={t("selectMaterial")}
        open={materialVisible}
        onCancel={handleMaterialCancel}
        width={700}
        footer={null}
      >
        <Table
          style={{ overflow: 'auto' }}
          onRow={(record: any) => ({
            onDoubleClick: () => handleMaterialOk(record),
          })}
          columns={materialColumn}
          dataSource={materialData}
          rowKey="assyOpeartion"
          pagination = {false}
          scroll={{ y: 'calc(100vh - 400px)' }}
        />
      </Modal>

      </div>
    </InventoryContext.Provider>
  );
};

export default InventoryMaintenance;
