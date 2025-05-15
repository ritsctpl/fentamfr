import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Button, Form, Input, message, Select, Table, Modal, Row, Col, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';
import { parseCookies } from 'nookies';
import { createUom, deleteUom, retrieveAllItem, retrieveAllUnitConvertion, retrieveAllUom, retrieveBaseUnitConvertion, retrieveTop50BaseUnitConvertion, retrieveTop50Item, updateUom } from '@services/uomService';
import { UomContext } from '../hooks/UomContext';
import { GrChapterAdd } from "react-icons/gr";
import styles from '../styles/UomConversion.module.css';
import CommonAppBar from '@components/CommonAppBar';
import UomCommonBar from './UomCommonBar';
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import ConversionMaintenanceBody from './ConversionMaintenanceBody';



const UomConversion: React.FC = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { uomPayloadData, setUomPayloadData, username, uomConversionPayload, setUomConversionPayload, countConversionPayload,
    setCountConversionPayload, showAlertForConversion, setShowAlertForConversion } = useContext<any>(UomContext);
  const { t } = useTranslation();
  const [top50Data, setTop50Data] = useState<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [itemRowData, setItemRowData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null);
  const [resetValue, setResetValue] = useState<boolean>(false);
  const [call, setCall] = useState<number>(0);
  const [mainSchema, setMainSchema] = useState<any>();
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [addClick, setAddClick] = useState<boolean>(false);
  const [addClickCount, setAddClickCount] = useState<number>(0);
  const [payloadData, setPayloadData] = useState<any>();



  // Use useCallback for memoized functions
  useEffect(() => {
  const fetchTop50Data = async () => {
    try {
      const { site } = parseCookies();
      const response = await retrieveTop50BaseUnitConvertion({site: site});
      if (response && !response?.errorCode && response?.uomConvertions?.length > 0) {
        const formattedResponse = response?.uomConvertions?.map((item, index) => ({
          ...item,
          id: index,
          key: index
        }));
        setFilteredData(formattedResponse);
        console.log("Top 50 response: ", formattedResponse);
      }
    } catch (error) {
      console.error("Error fetching Top 50 data:", error);
    }
  }
  fetchTop50Data();
}, [call]);

  const handleSearch = async (searchTerm: string) => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = username;
    // // debugger
    try {
      // Fetch the item list and wait for it to complete
      const lowercasedTerm = searchTerm.toLowerCase();
      // debugger
      const oAllItem = await retrieveAllUnitConvertion({site: site, baseUnit: searchTerm});
      // console.log("reatrieve all", oAllItem)
      // Once the item list is fetched, filter the data
      let filtered;

      if (lowercasedTerm) {
        filtered = oAllItem?.uomConvertions?.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowercasedTerm)
          )
        );
      } else {
        filtered = top50Data; // If no search term, show all items
      }

      // Update the filtered data state
      setFilteredData(filtered);

      // console.log("Filtered items: ", filtered);
    } catch (error) {
      console.error('Error fetching item group on search:', error);
    }
  };


  const handleAddClick = () => {
    setAddClick(true);
    setResetValue(true);
    setSelectedRowData(null);
    setIsAdding(true);
    setFullScreen(false);
    setAddClickCount(addClickCount + 1)
    // // debugger
    setUomConversionPayload((prevData) => (
      {
        baseUnit: 'Kilogram (kg)',
        convertionItem: 'Multiply',
        baseAmt: '',
        conversionUnit: 'Gram (g)',
        count: 0,
        material: '',
        materialVersion: ''
      }));
    setShowAlertForConversion(false)
  };

  const handleRowSelect = (row: any) => {
    setIsAdding(true);
    setResetValue(false);
    setFullScreen(false);
    setAddClick(false);


    const fetchItemGroupData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      const request = {
        site: site,
        baseUnit: row.baseUnit,
        conversionUnit: row.conversionUnit,
        user: username
      };

      try {
        const response = await retrieveBaseUnitConvertion(request);
        // debugger
        console.log("Retrieved response: ", response);
        if (!response.errorCode) {

          setSelectedRowData(response?.uomConvertionResponse);
          setRowData(response?.uomConvertionResponse);
          setItemRowData(response?.uomConvertionResponse);
          setUomConversionPayload(response?.uomConvertionResponse);
        }
      } catch (error) {
        console.error("Error fetching :", error);
      }
    };
debugger
    if (showAlertForConversion == true && isAdding == true) {
      Modal.confirm({
        title: t('confirm'),
        content: t('rowSelectionMsg'),
        okText: t('ok'),
        cancelText: t('cancel'),
        onOk: async () => {
          // Proceed with the API call if confirmed
          await fetchItemGroupData();
          setShowAlertForConversion(false)
        },
        onCancel() {
          // console.log('Action canceled');
        },
      });
    } else {
      // If no data to confirm, proceed with the API call
      fetchItemGroupData();
    }
    setIsAdding(true);

  };

  const handleClose = () => {
    setIsAdding(false);
    setFullScreen(false);
  };

  return (
    <>
      <div className={styles.container} style={{
        marginTop: -20,
      }}>

        <div className={styles.dataFieldBody}>
          <div className={styles.dataFieldBodyContentsBottom}>
            <div
              className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""
                }`}
            >
              <UomCommonBar
                onSearch={handleSearch}
                setFilteredData={setFilteredData}
              />
              <div className={styles.dataFieldBodyContentsTop} style={{ marginTop: 1 }}>
                <Typography className={styles.dataLength}>
                  {t("uom")} ({filteredData ? filteredData.length : 0})
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
              className={`${styles.formContainer} ${isAdding
                ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show
                }`
                : ""
                }`}

            >
              <ConversionMaintenanceBody
                call={call}
                setCall={setCall}
                onClose={handleClose}
                selectedRowData={selectedRowData}
                rowSelectedData={selectedRowData}
                isAdding={isAdding}
                setFullScreen={setFullScreen}
                username={username}
                setAddClick={setAddClick}
                itemRowData={itemRowData}
                fullScreen={fullScreen}

              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UomConversion;
