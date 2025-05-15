import React, { useContext, useEffect, useState } from 'react';
import { Table, Input, Button, Space, Modal, Select, Form, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styles from '../styles/DataCollectionMaintenance.module.css';
import { DataCollectionContext } from '../hooks/DataCollectionContext';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { SearchOutlined } from '@mui/icons-material';
import { updateDataCollection } from '@services/dataCollectionServices';
import TextArea from 'antd/es/input/TextArea';
const { Option } = Select;




interface DynamicTableProps {
  attachmentColumns: any;
  data: Record<string, string>[];
}

const DCAttachment: React.FC<DynamicTableProps> = ({ attachmentColumns, data }) => {
  const { t } = useTranslation();

  const {  setIsRowSelected, setTableData,
    selectedRowKeys,
   setIsStepModalVisible,  setIsNextPage, payloadData, setPayloadData,
    setShowAlert, setAttachmentRowSelectedData,
    selectedAttachmnetRowKeys, setSelectedAttachmnetRowKeys, setIsAttachmentVisible, setIsMainPageVisible, setInsertClickBooleanForAttachment,
    insertClickForAttachment, setInsertClickForAttachment } = useContext<any>(DataCollectionContext);
  const [isModalVisible, setIsModalVisible] = useState(false);


  const handleInputChange = (value: string, rowIndex: number, dataIndex: string) => {
    // Create a copy of the existing attachmentList
    // debugger
    if(dataIndex == "parameterName"){
      value = value.toUpperCase().replace(/[^A-Z0-9_]/g, '').replace(/\s+/g, '');
    }
    const newParameterList = [...payloadData?.attachmentList];

    // Update the specific field with the new value
    newParameterList[rowIndex][dataIndex] = value;
    // newParameterList[rowIndex].key = rowIndex + 1; 
    newParameterList[rowIndex].key = rowIndex;

    // Update the payloadData state to persist the changes
    setPayloadData((prevPayloadData) => ({
      ...prevPayloadData,
      attachmentList: newParameterList,
    }));

    // Update the tableData to reflect the changes
    setTableData(newParameterList);
    setShowAlert(true);
  };

  const handleModalSave = (oEvent) => {
    let flagToSave = true;

    

    const oCreateDC = async () => { // Rename the inner function to avoid recursion
      const cookies = parseCookies();
      const site = cookies.site;
    
    

      try {
        if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "सहेजें" ||  oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "சேமிக்க") {
          setTimeout(async function () {
            console.log("Update request: ", payloadData);
            const updateResponse = await updateDataCollection(payloadData);
            console.log("Updated dc response: ", updateResponse);
            if (updateResponse) {
              if (updateResponse.errorCode) {
                message.error(updateResponse.message);
              }
              else {
                message.success(updateResponse.message_details.msg);
                const formattedCustomData = updateResponse.response.customDataList.map((item, index) => ({
                  ...item,
                  id: index,
                  key: index
                }));

                setShowAlert(false);
              }
            }
          }, 0);

        }


      } catch (error) {
        console.error('Error updating dc:', error);
      }
    };
    if (flagToSave == true)
      oCreateDC();

    // setIsModalVisible(false);

  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const adjustStepIds = (rows: Record<string, string>[]) => {
    return rows.map((row, index, array) => {
      const stepId = (index + 1) * 10;
      return {
        ...row,
        stepId,
      };
    });
  };

  const handleDetailsClick = (recordData: any, rowIndex: number) => {
    
    recordData = payloadData.attachmentList[rowIndex];
    setAttachmentRowSelectedData(recordData);
    setIsRowSelected(true);
    console.log("recordData: ", recordData);
    setIsModalVisible(true);
    setIsNextPage(true);
    setIsStepModalVisible(false);
    setIsAttachmentVisible(true);
    setIsMainPageVisible(false);
    setSelectedAttachmnetRowKeys([rowIndex])
    rowIndex = +recordData.stepId;
    rowIndex = (rowIndex / 10) - 1;
   
  };

  const handleInsert = () => {
    let newRow;
    // debugger
    setIsRowSelected(false);
    // setInsertClickBoolean(true);
    setIsStepModalVisible(false);
    setIsMainPageVisible(false);
    setIsAttachmentVisible(true);
    // debugger
    if (payloadData?.attachmentList.length > 0) {
      const newStepId: any = ((payloadData?.attachmentList.length + 1) * 10).toString();
      setShowAlert(true);
      // Define the new row with the dynamically generated stepId
      newRow = {
        key: +((newStepId / (10)) - 1),
        id: +((newStepId / (10)) - 1),

        "sequence": newStepId,
        "itemGroup": "",
        "item": "",
        "itemVersion": "",
        "routing": "",
        "routingVersion": "",
        "operation": "",
        "operationVersion": "",
        "workCenter": "",
        "resource": "",
        "shopOrder": "",
        "pcu": ""
      };

      // Add the new row to the existing table data
      const newData = [...payloadData?.attachmentList, newRow];
      setTableData(adjustStepIds(newData));

    }
    else {
      newRow = {
        key: 0,
        id: 0,

       "sequence": 10,
       "itemGroup": "",
       "item": "",
       "itemVersion": "",
       "routing": "",
       "routingVersion": "",
       "operation": "",
       "operationVersion": "",
       "workCenter": "",
       "resource": "",
       "shopOrder": "",
       "pcu": ""
      };
      
    }
    // Update the payloadData with the new row
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      attachmentList: [...prevPayloadData?.attachmentList, newRow]
    }));
    setIsNextPage(true);
    setIsStepModalVisible(false);
    setIsMainPageVisible(false);
    setIsAttachmentVisible(true);
    setInsertClickForAttachment(insertClickForAttachment + 1);
    // debugger
    const length = +payloadData?.attachmentList.length;
    setSelectedAttachmnetRowKeys([length]);
    setInsertClickBooleanForAttachment(true)
    // form.setFieldsValue(newRow);
  };

  const handleRemoveSelected = () => {
    if (selectedAttachmnetRowKeys.length > 0) {
      // Convert selected row keys into array of indices
      setShowAlert(true);
      // Filter out the rows that have indices matching any in indicesToRemove
      const newParameterTableList = payloadData?.attachmentTableList
        .filter((_, index) => !selectedAttachmnetRowKeys.includes(index)) // Remove rows with matching indices
        .map((row, index) => ({
          ...row,
          sequence: (index + 1) * 10, // Adjust stepId to match the new order
          key: (index + 1), // Adjust key to match the new order
          id: (index + 1)  // Adjust key to match the new order
        }));
        
        const newParameterList = payloadData?.attachmentList
        .filter((_, index) => !selectedAttachmnetRowKeys.includes(index)) // Remove rows with matching indices
        .map((row, index) => ({
          ...row,
          sequence: (index + 1) * 10, // Adjust stepId to match the new order
          key: (index + 1), // Adjust key to match the new order
          id: (index + 1)  // Adjust key to match the new order
        }));

      // Update table data and payloadData with the adjusted step IDs
      // setTableData(newParameterList);
      setPayloadData(prevPayloadData => ({
        ...prevPayloadData,
        attachmentList: newParameterList,
        attachmentTableList: newParameterTableList
      }));

      // Clear selected row keys
      setSelectedAttachmnetRowKeys([]);
    }
  };

  const handleRemoveAll = () => {
    // Clear table data
    setTableData([]);
    setShowAlert(true);
    // Clear routingStepList in payloadData
    setPayloadData(prevPayloadData => ({
      ...prevPayloadData,
      attachmentList: [],
      attachmentTableList: []
    }));

    setSelectedAttachmnetRowKeys([]);
  };






  const renderColumns = (): any => {
    return attachmentColumns.map((col) => {
      let title: any = t(col.title); // Default title translation

      // Custom title for nextStepId and previousStepId with a red asterisk
      if (col.dataIndex === 'parameterName' || col.dataIndex === 'previousStepId') {
        title = (
          <span>
            <span style={{ color: 'red' }}>*</span> {t(col.title)}
          </span>
        );
      }

      if (col.dataIndex === 'sequence') { // Decrease width for 'sequence' column
        return {
          ...col,
          title,
          width: "20", // Set a smaller width
          align: 'center',
          // ... other properties
        };
      }

      if (col.dataIndex === 'attachment') { // Change to TextArea for 'attachment' column
        return {
          ...col,
          title,
          width: "70%",
          align: 'center',
          render: (text: string, record: any, rowIndex: number) => (
            <TextArea
              value={text}
              onChange={(e) => handleInputChange(e.target.value, rowIndex, col.dataIndex)}
              rows={1} // Set number of rows for TextArea
            />
          ),
        };
      }

      if (col.type === 'input') {
        return {
          ...col,
          title, // Apply the title with or without the red asterisk
          filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
              <Input
                value={selectedKeys[0]}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={confirm}
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Button
                type="primary"
                onClick={confirm}
                size="small"
                style={{ width: 90, marginRight: 8 }}
              >
                {t('search')}
              </Button>
              <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                {t('reset')}
              </Button>
            </div>
          ),
          onFilter: (value, record) =>
            record[col.dataIndex]
              .toString()
              .toLowerCase()
              .includes((value as string).toLowerCase()),
          render: (text: string, record: any, rowIndex: number) => (
            <Input
              value={text}
              readOnly={true}
              onChange={(e) => handleInputChange(e.target.value, rowIndex, col.dataIndex)}
            />
          ),
        };
      }

      if (col.type === 'button') {
        return {
          ...col,
          align: 'center',
          title, // Apply the title with or without the red asterisk
          render: (_: any, recordData: any, rowIndex: number) => (
            <Button onClick={() => handleDetailsClick(recordData, rowIndex)}>{t("details")}</Button>
          ),
        };
      }

      
      return col;
    });
  };

  const modalColumns: ColumnsType<any> = [
    { title: t('sequence'), dataIndex: 'sequence', key: 'sequence' },
    { title: t('parameterName'), dataIndex: 'parameterName', key: 'parameterName' },
    { title: t('description'), dataIndex: 'description', key: 'description' },
    { title: t('status'), dataIndex: 'status', key: 'status' },
    { title: t('details'), dataIndex: 'details', key: 'details' },
  ];

 
  

  // // console.log("stepSchema: ", stepSchema);
  // setRoutingStepsLength(payloadData.routingStepList * 10);
  // console.log("Routing Step List Data from payload: ", payloadData.routingStepList);
  return (
    <div>
      <Space style={{ marginBottom: '10px', float: 'right', marginTop: '2%' }}>
        <Button className={styles.cancelButton} onClick={handleInsert}>
          {t("insert")}
        </Button>

        {/* <Button
          onClick={handleInsertBefore}
          className={styles.cancelButton}
          disabled={selectedRowKeys.length == 0}
        >
          {t("insertBefore")}
        </Button>
        <Button
          onClick={handleInsertAfter}
          className={styles.cancelButton}
          disabled={selectedRowKeys.length == 0}
        >
          {t("insertAfter")}
        </Button> */}
        <Button
          onClick={handleRemoveSelected}
          className={styles.cancelButton}
          disabled={selectedAttachmnetRowKeys.length == 0}
        >
          {t("removeSelected")}
        </Button>
        <Button className={styles.cancelButton} onClick={handleRemoveAll}>
          {t("removeAll")}
        </Button>
      </Space>
      <Table
        columns={renderColumns()}
        bordered
        dataSource={payloadData?.attachmentTableList}
        rowSelection={{
          selectedRowKeys: selectedAttachmnetRowKeys, // Use your state for selected row keys
          onChange: (newSelectedRowKeys) => { // Changed parameter name for clarity
            setSelectedAttachmnetRowKeys(newSelectedRowKeys); // Update the selected row keys state
            // Optionally, you can also store the selected rows data if needed
            // const selectedRows = payloadData?.attachmentList.filter((_, index) => newSelectedRowKeys.includes(index));
            // setoRowSelectedData(selectedRows); // Store the selected row data
          },
        }}
        pagination={false}
        scroll={{ y: 'calc(100vh - 450px)' }}
      />

      <Modal
        title={t("routingStepDetails")}
        open={isModalVisible}
        onOk={handleModalSave}
        onCancel={handleModalCancel}
        style={{ top: 20 }}
        width={1500} // Increase width
        // height={"60vh"} // Increase width
        bodyStyle={{ height: '70vh' }} // Increase height

        footer={[
          <Button key="cancel" style={{width: 'auto'}} onClick={handleModalCancel}>
            {t("cancel")}
          </Button>,
          <Button key="save" style={{width: 'auto'}} type="primary" onClick={handleModalSave}>
            {t("save")}
          </Button>,
        ]}
      >


        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* <div style={{ marginBottom: '10px', marginRight: '41%' }}>
            <Button type='primary'
              // className={`${styles.floatingButton} ${styles.saveButton}`}
              onClick={handleAdd}
              style={{ alignSelf: 'flex-end', float: 'right' }}
            >
              {t("add")}
            </Button>
          </div> */}

          <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>


            <Table
              bordered
              columns={modalColumns}
              dataSource={payloadData?.attachmentList}
              pagination={false}
        scroll={{ y: 'calc(100vh - 450px)' }}
              style={{ flex: 1, marginRight: '20px' }}
              rowSelection={{
               
                type: 'radio', // Single row selection
                selectedRowKeys: selectedRowKeys, // Controlled selection state
                onChange: (selectedRowKeys, selectedRows) => {
                  selectedAttachmnetRowKeys(selectedRowKeys); // Update selected row keys
                  setAttachmentRowSelectedData(selectedRows[0]); // Update form data with selected row
                },
              }}
              onRow={(record) => ({
                onClick: () => {
                  selectedAttachmnetRowKeys([record.key]); // Manually trigger row selection
                  setAttachmentRowSelectedData(record); // Update form data with selected row

                  const rowId = record.stepId;
                  const getStepTypeById = (stepId: string | number): string | undefined => {
                    const step = payloadData?.attachmentList.find(step => step.stepId === stepId);
                    return step ? step.stepType : undefined;
                  };
                },
              })}
            />


            <div style={{ width: '50%', maxHeight: "50vh", }}>
              {/* <RoutingStepForm  rowSelectedData={rowSelectedData} /> */}
            </div>
          </div>
        </div>






      </Modal>
    </div>
  );
};

export default DCAttachment;
