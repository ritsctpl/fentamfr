"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/ComponentBuilder.module.css";
import CommonAppBar from "@components/CommonAppBar";
import { useAuth } from "@/context/AuthContext";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { Button, Form, Input, message, Modal, Switch, Tooltip, Table } from "antd";

import ApiConfigurationCommonBar from "./ComponentBuilderCommonBar";

import { parseCookies } from "nookies";
import { MyProvider, useMyContext } from "../hooks/componentBuilderContext";
import ComponentBuilderBody from "./ComponentBuilderBody";
import { defaultFormData } from "../types/componentBuilderTypes";
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "./userInstructions";
import { createComponent, deleteComponent, retrieveAllComponents, retrieveComponent, retrieveTop50Components, updateComponent } from "@services/componentBuilderService";
import dayjs from "dayjs";
import ComponentBuilderForm from "./ComponentBuilderForm";
import { IoCreateOutline } from "react-icons/io5";
import BorderColorIcon from '@mui/icons-material/BorderColor';


interface DataRow {
  [key: string]: string | number;

}

interface DecodedToken {
  preferred_username: string;
}

// Update the TablePreview component interface
const TablePreview: React.FC<{
  columns: number,
  columnNames: string[],
  onColumnNameChange: (index: number, value: string) => void,
  dataType: string,
  referenceTableConfig?: {
    rows: string,
    columns: string
  },
  payloadData: any,
  setPayloadData: (data: any) => void
}> = ({ columns, columnNames, onColumnNameChange, dataType, referenceTableConfig, payloadData, setPayloadData }) => {
  const [rowValues, setRowValues] = useState<{ [key: string]: string }>(() => {
    // Initialize row values from existing referenceTableConfig if available
    const existingRowData = payloadData?.referenceTableConfig?.rowData || {};
    return existingRowData;
  });

  const isReferenceTable = dataType === 'Reference Table';

  const handleRowChange = (rowKey: string, columnIndex: number, value: string) => {
    // Create a new rowValues object
    const newRowValues = {
      ...rowValues,
      [`row${rowKey}-col${columnIndex}`]: value
    };

    // Update local state
    setRowValues(newRowValues);

    // Update payload with row data
    if (isReferenceTable) {
      setPayloadData({
        ...payloadData,
        referenceTableConfig: {
          ...payloadData?.referenceTableConfig,
          rowData: newRowValues
        }
      });
    }
  };

  // Get the correct number of columns for reference table
  const refTableColumns = Number(referenceTableConfig?.columns || 1);

  const tableColumns = isReferenceTable ?
    // For Reference Table - create columns based on referenceTableConfig.columns
    Array.from({ length: refTableColumns }).map((_, index) => ({
      title: (
        <Input
          value={payloadData?.referenceTableConfig?.columnNames?.[index] || ''}
          onChange={(e) => onColumnNameChange(index, e.target.value)}
          placeholder={`Column ${index + 1}`}
          style={{ width: '100%' }}
        />
      ),
      dataIndex: `col${index}`,
      key: `col${index}`,
      width: 200,
      render: (_: any, record: any) => (
        <Input
          value={rowValues[`row${record.key}-col${index}`] || ''}
          onChange={(e) => handleRowChange(record.key, index, e.target.value)}
          // placeholder="Enter value"
          style={{ width: '100%' }}
        />
      )
    })) :
    // Regular Table columns (unchanged)
    Array.from({ length: columns }).map((_, index) => ({
      title: (
        <Input
          value={columnNames[index] || ''}
          onChange={(e) => onColumnNameChange(index, e.target.value)}
          placeholder={`Column ${index + 1}`}
          style={{ width: '100%' }}
        />
      ),
      dataIndex: `col${index}`,
      key: `col${index}`,
      width: 150,
    }));

  // Create empty data for preview
  const previewData = isReferenceTable ?
    // For Reference Table - create rows based on referenceTableConfig.rows
    Array.from({ length: Number(referenceTableConfig?.rows || 1) }).map((_, rowIndex) => ({
      key: String(rowIndex + 1),
      ...Object.fromEntries(Array.from({ length: refTableColumns }).map((_, colIndex) =>
        [`col${colIndex}`, '']
      ))
    })) :
    // Regular Table data (unchanged)
    [{
      key: '1',
      ...Object.fromEntries(Array.from({ length: columns }).map((_, i) => [`col${i}`, '']))
    }];

  return (
    <div>
      <div style={{ width: '100%', overflowX: 'auto', marginTop: '-0.5%' }}>
        {payloadData?.dataType == "Table" && <Table
          columns={tableColumns}
          dataSource={previewData}
          pagination={false}
          bordered
          size="small"
          // style={{ marginBottom: 24 }}
          locale={{ emptyText: 'No data' }} // Custom empty text
          scroll={{ x: true }}
        />
        }
        {payloadData?.dataType == "Reference Table" && <Table
          columns={tableColumns}
          dataSource={previewData}
          pagination={false}
          bordered
          scroll={{ x: isReferenceTable ? refTableColumns * 200 : columns * 100, y: 140 }}
          style={{ minWidth: '99%', width: '99%', margin: '0 auto' }}
          size="small"
          locale={{ emptyText: 'No data' }}
        />
        }
      </div>
    </div>
  );
};

const ComponentBuilderMaintenance: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const { payloadData, setPayloadData, showAlert, setShowAlert, isAdding, setIsAdding, navigateToNewScreen,
    setNavigateToNewScreen, isRequired, setIsRequired, fieldType, seeFullScreen, setSeeFullScreen } = useMyContext();
  const [top50Data, setTop50Data] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<DataRow | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);

  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();


  const { t } = useTranslation();



  useEffect(() => {
    const fetchTop50Data = async () => {
      // debugger;
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
          console.log("user name: ", username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }

      setTimeout(async () => {
        try {
          // debugger;
          let top50ListData;
          const cookies = parseCookies();
          const site = cookies?.site;
          try {
            top50ListData = await retrieveTop50Components({ site });
            top50ListData = top50ListData.map((item: any) => ({
              componentLabel: item.componentLabel,
              dataType: item.dataType,
              defaultValue: item.defaultValue,
              required: item.required,
            }));
            if (!top50ListData?.errorCode) {
              setTop50Data(top50ListData);
              setFilteredData(top50ListData); // Initialize filtered data
            }
          }
          catch (e) {
            console.error("Error in retrieving top 50 components", e);
          }
        } catch (error) {
          console.error("Error fetching top 50 components:", error);
        }
      }, 1000);

    };

    fetchTop50Data();
  }, [isAuthenticated, username, call]);





  const handleSearch = async (searchTerm: string) => {
    try {
      // Fetch the item list and wait for it to complete
      const lowercasedTerm = searchTerm.toLowerCase();
      const cookies = parseCookies();
      const site = cookies?.site;
      const request = {
        site: site,
        componentLabel: searchTerm
      }
      try {
        let oAllItem = await retrieveAllComponents(request);

        // Once the item list is fetched, filter the data
        let filtered;
        if (lowercasedTerm) {
          if (!oAllItem?.errorCode)
            filtered = oAllItem;
        } else {
          filtered = top50Data; // If no search term, show all items
        }
        // Update the filtered data state
        setFilteredData(filtered);

      }
      catch (e) {
        console.log("Error in retrieving all configuration", e);
      }
    } catch (error) {
      console.error('Error fetching config on search:', error);
    }
  };

  const handleAddClick = () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsAdding(true);
    //setResetValueCall(resetValueCall + 1);
    setFullScreen(false);
    setAddClickCount(addClickCount + 1)
    setPayloadData(defaultFormData);
    setShowAlert(false);
    setNavigateToNewScreen(true);
    fieldType.current = defaultFormData?.dataType;
    setSeeFullScreen(false);
  };

  const handleRowSelect = (row: DataRow) => {

    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);

    const fetchConfig = async () => {
      try {
        let response;
        const cookies = parseCookies();
        const site = cookies?.site;
        const request = {
          site: site,
          componentLabel: row.componentLabel
        }
        try {
          response = await retrieveComponent(request);
          if (!response?.errorCode) {
            const dummyData =
            {
              "site": "1004",
              "handle": "ComponentBO:1004,Active Composition",
              "componentLabel": "Active Composition",
              "dataType": "Reference Table",
              "unit": "",
              "defaultValue": null,
              "required": false,
              "validation": "",
              "active": 1,
              "userId": "rits_admin",
              "createdDateTime": "2025-05-19T13:16:37.155",
              "modifiedDateTime": null,
              "tableConfig": {},
              "referenceTableConfig": {
                  "rows": "2",
                  "rowData": {
                      "row1-col0": "1",
                      "row2-col0": "2"
                  },
                  "columns": "2",
                  "columnNames": [
                      "hi",
                      "hello"
                  ]
              }
          }
            setPayloadData(response);
            setSelectedRowData(response);
            setNavigateToNewScreen(true);
            fieldType.current = response?.dataType;
            if(response?.dataType == "Table" || response?.dataType == "Reference Table"){
              setFullScreen(true);
            }
            else{
              setFullScreen(false);
            }
          }

        }
        catch (e) {
          console.error("Error in retrieveing the component", e);
        }
      } catch (error) {
        console.error("Error fetching component:", error);
      }
    };

    if (showAlert == true && isAdding == true) {
      Modal.confirm({
        title: t('confirm'),
        content: t('rowSelectionMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk: async () => {
          // Proceed with the API call if confirmed
          try {
            await fetchConfig();
          }
          catch (e) {
            console.error("Error in retrieveing the component: ", e);
          }
          setShowAlert(false)
        },
        onCancel() {
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchConfig();
    }
    setIsAdding(true);

  };

  


  const handleClose1 = () => {
    debugger
    setIsAdding(true);
    setResetValue(true);
    setFullScreen(true);
    setNavigateToNewScreen(false);
    // fieldType.current = "Input";
  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  const handleCloseForFullScreen = () => {
    debugger
    setIsAdding(true);
    setAddClick(true);
    setFullScreen(false);
    // handleSelectChange("dataType", "Input");
    // setNavigateToNewScreen(true);
    // fieldType.current = "Input";
    setSeeFullScreen(false);
  };

  const handleOpenCopyModal = () => {
    // debugger
    setIsCopyModalVisible(true);
    // Optionally reset form fields
    form.resetFields();
    form.setFieldsValue({
      componentLabel: selectedRowData?.componentLabel + "_COPY" || '',
      defaultValue: '',
      required: false,
      validation: ''
    });

  };

  const handleCloseCopyModal = () => {
    setIsCopyModalVisible(false);
  };

  const handleFieldChange = (value: any, fieldName: string) => {
    form.setFieldsValue({ [fieldName]: value });
  };


  const handleConfirmCopy = () => {
    form
      .validateFields()
      .then(async (values) => {

        let flagToSave = true;

        if (payloadData?.componentLabel == "" || payloadData?.componentLabel == null || payloadData?.componentLabel == undefined) {
          message.error("Component Label cannot be empty");
          return;
        }



        const oCopyComponent = async () => { // Rename the inner function to avoid recursion
          let updatedRequest;
          const cookies = parseCookies();
          const site = cookies?.site;
          const user = cookies?.rl_user_id
          try {
            updatedRequest = {
              site: site,
              componentLabel: form.getFieldValue('componentLabel'),
              dataType: payloadData?.dataType,
              unit: payloadData?.unit,
              defaultValue: form.getFieldValue('defaultValue'),
              required: form.getFieldValue('required'),
              validation: form.getFieldValue('validation'),
              userId: user
            }

            try {
              const copyResponse = await createComponent(updatedRequest);
              if (copyResponse?.errorCode) {
                message.error(copyResponse?.message);
              }
              else {
                setCall(call + 1);
                message.success(copyResponse?.message_details?.msg);
                setShowAlert(false);
                setNavigateToNewScreen(false);
              }
            }
            catch (e) {
              console.error("Error in copying the componenet", e);
            }

          } catch (error) {
            console.error('Error copying component:', error);
          }
        };


        if (flagToSave == true) {
          try {
            await oCopyComponent();
          }
          catch (e) {
            console.error("Error in copying the configuration", e);
          }

        }

        setIsCopyModalVisible(false);
      })
      .catch((errorInfo) => {
        console.log('Validation Failed:', errorInfo);
      });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: t('confirm'),
      content: t('closePageMsg'),
      okText: t('ok'),
      cancelText: t('cancel'),
      onOk: async () => {
        // Proceed with the API call if confirmed
        setNavigateToNewScreen(false);
      },
      onCancel() {
      },
    });
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleConfirmDelete = () => {
    const oDeleteConfig = async () => { // Rename the inner function to avoid recursion
      try {
        const cookies = parseCookies();
        const site = cookies?.site;
        debugger
        const componenetLabel = selectedRowData?.componentLabel;
        const user = cookies?.rl_user_id
        const request = {
          site: site,
          componentLabel: componenetLabel,
          userId: user
        }
        try {
          const response = await deleteComponent(request); // Assuming retrieveItem is an API call or a data fetch function
          if (!response.errorCode) {
            message.success(response?.message_details?.msg);
            setCall(call + 1);
            setNavigateToNewScreen(false);
            setShowAlert(false);
          }
          else {
            message.error(response?.message);
          }
        }
        catch (e) {
          console.error("Error in deleting the configuration", e);
        }
      } catch (error) {
        console.error('Error deleting configuration:', error);
      }
    };

    oDeleteConfig();
    setIsModalVisible(false);
  };

  const handleSave = async (oEvent) => {
    message.destroy();
    let flagToSave = true;
    let buttonLabel = oEvent.currentTarget.innerText;


    if (payloadData?.componentLabel == "" || payloadData?.componentLabel == null || payloadData?.componentLabel == undefined) {
      message.error("Component Label cannot be empty");
      return;
    }

    if (isRequired && (payloadData?.defaultValue == "" || payloadData?.defaultValue == null || payloadData?.defaultValue == undefined)) {
      message.error("Default Value cannot be empty");
      return;
    }


    const oCreateComponent = async () => { // Rename the inner function to avoid recursion

      try {
        const cookies = parseCookies();
        const site = cookies?.site;
        const user = cookies?.rl_user_id
        let updatedRequest;
        updatedRequest = {
          site: site,
          // componentLabel: payloadData?.componentLabel,
          // dataType: payloadData?.dataType,
          // unit: payloadData?.unit,
          // defaultValue: payloadData?.defaultValue,
          // required: payloadData?.required,
          // validation: payloadData?.validation,
          // dropdownOptions: payloadData?.dropdownOptions,
          ...payloadData,
          userId: user,
        }

        if (!selectedRowData) {
          try {
            const createResponse = await createComponent(updatedRequest);
            if (createResponse) {
              if (createResponse?.errorCode) {
                message.error(createResponse?.message);
              }
              else {
                setCall(call + 1);
                setShowAlert(false);
                message.success(createResponse?.message_details?.msg);
                setNavigateToNewScreen(false);
              }
            }
          }
          catch (error) {
            console.error('Error creating component:', error);
          }
        }

        else {

          if (flagToSave) {
            try {
              const updateResponse = await updateComponent(updatedRequest);
              if (updateResponse) {
                if (updateResponse?.errorCode) {
                  message.error(updateResponse?.message);
                }
                else {
                  setShowAlert(false);
                  message.success(updateResponse?.message_details?.msg);
                  setCall(call + 1);
                }
              }
            }
            catch (error) {
              console.error('Error updating component:', error);
            }
          }
        }

      } catch (error) {
        console.error('Error creating component:', error);
      }
    };

    if (flagToSave == true) {
      try {
        await oCreateComponent();
      }
      catch (e) {
        console.error("Error in creating component", e);
      }

    }

  };

  // Add this function to handle column name changes
  const handleColumnNameChange = (index: number, value: string) => {
    if (payloadData?.dataType === 'Reference Table') {
      // For Reference Table, update the column names in referenceTableConfig
      const newColumnNames = [...(payloadData?.referenceTableConfig?.columnNames || [])];
      newColumnNames[index] = value;

      setPayloadData({
        ...payloadData,
        referenceTableConfig: {
          ...payloadData?.referenceTableConfig,
          columnNames: newColumnNames
        }
      });
    } else {
      // For regular Table, update the column names in tableConfig
      const newColumnNames = [...(payloadData?.tableConfig?.columnNames || [])];
      newColumnNames[index] = value;

      setPayloadData({
        ...payloadData,
        tableConfig: {
          ...payloadData?.tableConfig,
          columnNames: newColumnNames
        }
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.dataFieldNav}>
        <CommonAppBar
          onSearchChange={() => { }}
          allActivities={[]}
          username={username}
          site={null}
          appTitle={t("componentBuilderMaintenance")} onSiteChange={function (newSite: string): void {
            setCall(call + 1);
          }} />
      </div>

      {/* {((fieldType.current != "Table" && fieldType.current != "Reference Table") || seeFullScreen == false) && */}
        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <ApiConfigurationCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
                button={
                  <InstructionModal title="API Configuration Maintenance">
                    <UserInstructions />
                  </InstructionModal>
                }
              />
              <div className={styles.dataFieldBodyContentsTop}>
                <Typography className={styles.dataLength}>
                  {t("component")} ({filteredData ? filteredData.length : 0})
                </Typography>

                <IconButton
                  onClick={handleAddClick}
                  className={styles.circleButton}
                >
                  <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </div>
              <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
            </div>
            <div
              className={`${styles.formContainer} ${isAdding ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}`: ""}`}
            >
              <ComponentBuilderBody
                call={call}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                setCall={setCall}
                isAdding={isAdding}
                setFullScreen={setFullScreen}
                addClickCount={addClickCount}
                setAddClick={setAddClick}
                // itemRowData={itemRowData}
                fullScreen={fullScreen}
              />
            </div>
          </div>
        </div>
      {/* } */}


      {navigateToNewScreen && (fieldType.current == 'Table1' || fieldType.current == 'Reference Table1') &&

        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >


              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ marginLeft: "10px" }}>
                  <p className={styles.headingtext}>
                    {selectedRowData ? selectedRowData?.componentLabel : t('createComponent')}
                  </p>
                  {selectedRowData && (
                    <>
                      <p className={styles.dateText}>
                        {t('createdDate')}
                        <span className={styles.fadedText}>
                          {selectedRowData?.createdDateTime
                            ? dayjs(selectedRowData?.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                            : 'N/A'}
                        </span>
                      </p>
                      <p className={styles.dateText}>
                        {t('modifiedTime')}
                        <span className={styles.fadedText}>
                          {payloadData?.modifiedDateTime
                            ? dayjs(payloadData?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
                            : 'N/A'}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                <div className={styles.actionButtons}>
                  {selectedRowData && (
                    <>
                      <Tooltip title="Save">
                        {/* <Button onClick={handleOpenCopyModal} className={styles.actionButton}> */}
                        <BorderColorIcon sx={{ color: '#1874CE' }} onClick={handleSave} className={styles.actionButton} />
                        {/* </Button> */}
                      </Tooltip>

                      <Tooltip title="Copy">
                        {/* <Button onClick={handleOpenCopyModal} className={styles.actionButton}> */}
                        <CopyIcon sx={{ color: '#1874CE' }} onClick={handleOpenCopyModal} className={styles.actionButton} />
                        {/* </Button> */}
                      </Tooltip>

                      <Tooltip title="Delete">
                        {/* <Button onClick={handleOpenModal} className={styles.actionButton}> */}
                        <DeleteIcon sx={{ color: '#1874CE' }} onClick={handleOpenModal} className={styles.actionButton} />
                        {/* </Button> */}
                      </Tooltip>
                    </>
                  )}


                  <Tooltip title="Create">
                    {/* <Button onClick={handleOpenCopyModal} className={styles.actionButton}> */}
                    <BorderColorIcon sx={{ color: '#1874CE' }} onClick={handleSave} className={styles.actionButton} />
                    {/* </Button> */}
                  </Tooltip>

                  {(fieldType.current != "Table" && fieldType.current != "Reference Table") &&
                    <Tooltip title="Close">
                      {/* <Button onClick={handleClose} className={styles.actionButton}> */}
                      <CloseIcon sx={{ color: '#1874CE' }} onClick={handleClose} className={styles.actionButton} />
                      {/* </Button> */}
                    </Tooltip>
                  }

                  {(fieldType.current == "Table" || fieldType.current == "Reference Table") &&
                    < Tooltip title="Close">
                      {/* <Button onClick={handleClose} className={styles.actionButton}> */}
                      <CloseIcon sx={{ color: '#1874CE' }} onClick={handleCloseForFullScreen} className={styles.actionButton} />
                      {/* </Button> */}
                    </Tooltip>
                  }

                </div>
              </div>

              {/* Add horizontal line after the header section */}
              <hr style={{
                margin: '20px 0',
                border: 'none',
                borderTop: '1px solid #e8e8e8'
              }} />

              {/* Two-column layout container */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                // gap: '20px',
                // marginTop: '20px'
              }}>
                {/* Form */}
                <div style={{
                  width: '100%'
                }}>
                  <ComponentBuilderForm setFullScreen={setFullScreen}/>
                </div>

                {/* Horizontal separator line */}
                <hr style={{
                  width: '100%',
                  border: 'none',
                  borderTop: '1px solid #e8e8e8'
                }} />

                {/* Preview */}
                <div style={{
                  width: '100%'
                }}>
                  <div style={{ margin: '0px' }}>
                    <h4 style={{ marginLeft: '15px', marginTop: '0%' }}>{t('preview')}</h4>
                    {(fieldType.current === 'Table' || fieldType.current === 'Reference Table') && (
                      <div>
                        <TablePreview
                          columns={Number(
                            fieldType.current === 'Reference Table'
                              ? payloadData?.referenceTableConfig?.columns
                              : payloadData?.tableConfig?.columns
                          ) || 0}
                          columnNames={
                            fieldType.current === 'Reference Table'
                              ? (payloadData?.referenceTableConfig?.columns ? Array(Number(payloadData?.referenceTableConfig?.columns)).fill('') : [])
                              : payloadData?.tableConfig?.columnNames || []
                          }
                          onColumnNameChange={handleColumnNameChange}
                          dataType={fieldType.current}
                          referenceTableConfig={payloadData?.referenceTableConfig}
                          payloadData={payloadData}
                          setPayloadData={setPayloadData}

                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      }

      <Modal
        title={t("confirmDelete")}
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCloseModal}
        okText={t("delete")}
        cancelText={t("cancel")}
        centered
      >
        <p>{t("deleteApiConfigMessage")}: <strong>{selectedRowData?.componentLabel}</strong>?</p>
      </Modal>
      <Modal
        title={t("confirmCopy")}
        open={isCopyModalVisible}
        onOk={handleConfirmCopy}
        onCancel={handleCloseCopyModal}
        okText={t("copy")}
        cancelText={t("cancel")}
        centered
      >
        <Form
          form={form}
          layout="horizontal"
          initialValues={{
            componentLabel: selectedRowData?.componentLabel_COPY || '',
            defaultValue: '',
            required: false,
            validation: ''
          }}
        >
          <Form.Item
            label={t("componentLabel")}
            name="componentLabel"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            style={{ marginBottom: '8px' }}
            required
          >
            <Input placeholder="" onChange={(e) => handleFieldChange(e.target.value, 'componentLabel')} />
          </Form.Item>

          <Form.Item
            label={t('defaultValue')}
            labelCol={{ span: 8 }}
            name="defaultValue"
            wrapperCol={{ span: 12 }}
            required={isRequired}
            style={{ marginBottom: '8px' }}
          >
            <Input
              onChange={(e) => handleFieldChange(e.target.value, 'defaultValue')}
            />
          </Form.Item>
          <Form.Item
            label={t('required')}
            name="required"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            style={{ marginBottom: '8px' }}
          >
            <Switch
              onChange={(checked) => handleFieldChange(checked, 'required')}
            />
          </Form.Item>
          <Form.Item
            label={t('validation')}
            labelCol={{ span: 8 }}
            name="validation"
            wrapperCol={{ span: 12 }}
            style={{ marginBottom: '8px' }}
          >
            <Input.TextArea
              onChange={(e) => handleFieldChange(e.target.value, 'validation')}
            />
          </Form.Item>

        </Form>
      </Modal>




    </div >
  );
};

export default ComponentBuilderMaintenance;


