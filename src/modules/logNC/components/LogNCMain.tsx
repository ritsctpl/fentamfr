import React, { useEffect, useState } from 'react';
import { Button, message, Modal, Switch, Table } from 'antd';
import styles from '@modules/logNC/styles/LogNC.module.css';
import { PodConfig } from '@modules/podApp/types/userTypes';

import { parseCookies } from 'nookies';
import { done, getAllNcByPCU, logNC, productionlog, retrieveDispositionRouting, retrieveNcGroup, retrieveNcGroupListByOperation, retrieveOperationVersion, } from '@services/logNCService';
import { useTranslation } from 'react-i18next';
import NCGroupTable from './NCGroupTable';
import NCCodeTable from './NCCodeTable';
import NCTreeTable from './NCTreeTable';
import DataFields from './DataFields';
import { LogNCContext } from '../hooks/logNCContext';

interface LogNCProps {
    filterFormData: PodConfig;
    selectedRowData: any;
    call2: number;
    setCall2: (value: number) => void;
}


const LogNCMain: React.FC<LogNCProps> = ({ filterFormData, selectedRowData, call2, setCall2 }) => {
    // Combine related state declarations
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    // Use optional chaining for better readability
    const shopOrder = selectedRowData?.[0]?.shopOrder;
    const pcu = selectedRowData?.[0]?.pcu;
    const [activeRowKeys, setActiveRowKeys] = useState<any>([]); // Add state to manage selected row keys


    const [ncGroupList, setNcGroupList] = useState<any>();
    const [ncCodeList, setNcCodeList] = useState<any>();
    const [dataType, setDataType] = useState<any>();
    const [datafieldList, setDatafieldList] = useState<any>();
    const [showDataFields, setShowDataFields] = useState<boolean>(false);
    const [ncCodeValue, setNcCodeValue] = useState<any>();
    const [ncDataTypeValue, setNcDataTypeValue] = useState<any>();
    const [dataFieldsValue, setDataFieldsValue] = useState<any>();
    const [selectedNcRow, setSelectedNcRow] = useState<any>();
    const [selectedNcGroupRowKey, setSelectedNcGroupRowKey] = React.useState<React.Key | null>(null);
    const [selectedNcCodeRowKey, setSelectedNcCodeRowKey] = React.useState<React.Key | null>(null);
    const [selectedNcTreeRowKey, setSelectedNcTreeRowKey] = useState<any>([]);
    const [isNcTreeSelected, setIsNcTreeSelected] = useState<boolean>(false);
    const [oGetAllNcByPCUResponse, setOGetAllNcByPCUResponse] = useState<any>();
    const [childOrParent, setChildOrParent] = useState<any>();
    const [parentNC, setParentNC] = useState<any>();
    const [childNC, setChildNC] = useState<any>();
    const [count, setCount] = useState<any>(1);
    const [tranformDataFields, setTranformDataFields] = useState<any>();
    const [dispositionRouting, setDispositionRouting] = useState<any>();
    const [showDispositionRouting, setShowDispositionRouting] = useState<boolean>(false);


    let oParentNC = null, oChildNC = null, dispositionRoutingList = null;

    useEffect(() => {
        const fetchData = async () => {
            if (call2 || filterFormData || selectedRowData) { // Add condition to check for changes
                // awaitfetchNCTreeList();
                setActiveRowKeys([]);
                await fetchNCGroupList();
            }
        }
        setShowDataFields(false);
        setSelectedNcRow(null);
        setSelectedNcTreeRowKey([]);
        fetchData();
        fetchNCTreeList();
    }, [call2, filterFormData, selectedRowData, call2]);

    useEffect(() => {
        if (!isNcTreeSelected) {
            handleNcGroupFirstRowClick(ncGroupList);
        }
    }, [isNcTreeSelected]);

    const fetchNCTreeList = async () => {
        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const operation = filterFormData?.defaultOperation;
            const pcuBO = "PcuBO:" + site + "," + selectedRowData?.[0]?.pcu;
            const shopOrder = "ShopOrderBO:" + site + "," + selectedRowData?.[0]?.shopOrder;
            const request = { site, pcuBO, shopOrder };
            const response = await getAllNcByPCU(request);
            setOGetAllNcByPCUResponse(response);
        } catch (error) {
            console.error('Error fetching NC tree list:', error);
        }
    }

    const fetchNCGroupList = async () => {
        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const operation = filterFormData?.defaultOperation;
            const request = { site, operation };
            const response = await retrieveNcGroupListByOperation(request);
            if (!response.errorCode) {
                setNcGroupList(response);
                handleNcGroupFirstRowClick(response);
                // try {
                //     if (response.length > 0) {
                //         const ncGroup = response[0]?.ncGroup;
                //         const request = { site, ncGroup };
                //         const ncGroupResponse = await retrieveNcGroup(request);
                //         if (!ncGroupResponse.errorCode) {
                //             setNcCodeList(ncGroupResponse?.ncCodeDPMOCategoryList);
                //         }
                //     }
                // } catch (error) {
                //     console.error('Error fetching NC code list:', error);
                // }

            }
        } catch (error) {
            console.error('Error fetching NC group list:', error);
        }
    }

    const handleNcGroupFirstRowClick = async (response: any) => {
        try {
            const cookies = parseCookies();
            const site = cookies.site;
            // debugger
            if (Array.isArray(response)) {
                if (response.length > 0) {
                    const ncGroup = response[0]?.ncGroup;
                    const request = { site, ncGroup };
                    const ncGroupResponse = await retrieveNcGroup(request);
                    if (!ncGroupResponse.errorCode) {
                        setNcCodeList(ncGroupResponse?.ncCodeDPMOCategoryList);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching NC code list:', error);
        }
    }





    const handleDone = async () => {
        message.destroy();
        setShowDispositionRouting(true);

        if (!selectedNcRow) {
            message.error("Please select NC");
            return;
        }

        const columns = [
            {
                title: t('router'),
                dataIndex: 'routingBO',
                key: 'routingBO',
                align: 'center' as const,
            }
        ];
        const cookies = parseCookies();
        const site = cookies.site;
        const ncCodeValue = selectedNcRow?.ncCodeBo.split(",")[1];

        const request = {
            "site": site,
            "ncCodeList": [ncCodeValue],
            "shoporderBO": "ShopOrderBO:" + site + "," + selectedRowData[0]?.shopOrder,
        }
        console.log("Disposition Request: ", request);
        try {
            let response = await retrieveDispositionRouting(request);
            console.log("Disposition Response: ", response);
            if (!response.errorCode) {
                response =  response.map((item, index) => ({
                    ...item,
                    key: index
                }));
                setDispositionRouting(response);
                dispositionRoutingList = response;
            }

        }
        catch (error) {
            console.error('Error fetching Disposition routing list:', error);
        }

        const handleDispositionRoutingSelection = async (record: any) => {
            console.log("Disposition Routing Selection: ", record);
            const routerBo = "RoutingBO:" + site + "," + selectedRowData[0]?.router.split('/')[0] + "," + selectedRowData[0]?.router.split('/')[1];
            const orderBO = "ShopOrderBO:" + site + "," + selectedRowData[0]?.shopOrder;
            const itemBO = "ItemBO:" + site + "," + selectedRowData[0]?.item.split('/')[0] + "," + selectedRowData[0]?.item.split('/')[1];

            const request = {
                "site": site,   
                "dispositionRoutingBo": record.routingBO,
                "pcuBO": "PcuBO:" + site + "," + selectedRowData[0]?.pcu,
                "userBo": "UserBO:" + site + "," + cookies?.rl_user_id,
                "dateTime": "",
                "qty": 1,
                "resourceBo": "ResourceBO:" + site + "," + filterFormData?.defaultResource,
                "operationBO": "OperationBO:" + site + "," + filterFormData?.defaultOperation + ",00",
                "stepID": "",
                "routerBo": routerBo,
                "shoporderBO" : orderBO,
                "workCenterBo": "",
                "itemBo": itemBO
             }

             console.log("Done Request: ", request);

             try{
                const response = await done(request);
                console.log("Done Response: ", response);
                if(!response.errorCode){
                    message.success(response?.message_details?.msg);
                    setShowDispositionRouting(false);
                    Modal.destroyAll();
                }
             }
             catch(error){
                console.error('Error while Done:', error);
             }

        }
        
        Modal.info({
            title: t('selectRoute'),
            open: showDispositionRouting,
            width: 400,
            icon: null,
            content: (
                <Table
                    columns={columns}
                    dataSource={dispositionRoutingList || []}
                    pagination={false}
                    scroll={{ y: 400 }}
                    bordered
                    size="small"
                    style={{ fontSize: '12px' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleDispositionRoutingSelection(record),
                    })}
                />
            ),
            onOk() { setShowDispositionRouting(false);  },
            okText: t('close')
        });
    }

    const checkIfParentOrChild = () => {
        let oResult, oSelectedNC = selectedNcRow?.ncCodeBo.split(",")[1];
        function findParentOrChild(jsonData, searchNcCode) {
            function recursiveSearch(data) {
                for (const record of data) {
                    var oNCCode = record.ncCodeBo.split(",")[1];
                    if (oNCCode === searchNcCode) {
                        return "Parent";
                    }

                    const secondaryNCDataList = record.secondaryNCDataList || [];
                    for (const secondaryData of secondaryNCDataList) {
                        var oNCCode = secondaryData.ncCodeBo.split(",")[1];
                        if (oNCCode === searchNcCode) {
                            return "Child";
                        }

                        // Recursive call to check for child's child
                        const result = recursiveSearch([secondaryData]);
                        if (result !== "Not Found") {
                            return result;
                        }
                    }
                }
                return "Not Found";
            }

            // Initial call to start the search
            return recursiveSearch(jsonData);
        }

        // Example usage
        const jsonData = oGetAllNcByPCUResponse;
        const searchNcCode = oSelectedNC; // Replace with the desired NC Code
        oResult = findParentOrChild(jsonData, searchNcCode);

        console.log("Parent or Child: ", oResult);
        // setParentNC(oSelectedNC);
        // oParentNC = oSelectedNC;
        if (oResult == "Child") {
            oChildNC = oSelectedNC;
        }
        else {
            oChildNC = null;
        }
        return oResult;
    }

    const findChild = (oResult: any) => {
        if (oResult == 'Parent') {
            const findLastChild = (jsonData: any, searchNcCode: string) => {  // Define as inner function
                let ncCodeBo = null;
                for (const record of jsonData) {
                    const secondaryNCDataList = record.secondaryNCDataList || [];
                    for (let i = secondaryNCDataList.length - 1; i >= 0; i--) {
                        const secondaryData = secondaryNCDataList[i];
                        const aNCCode = record.ncCodeBo.split(",")[1];
                        if (aNCCode === searchNcCode) {
                            ncCodeBo = secondaryData.ncCodeBo.split(",")[1]; // Last Child
                            break;
                        }
                    }
                    if (ncCodeBo) {
                        break;
                    }
                }
                return ncCodeBo;
            };

            const searchNcCodeChild = selectedNcRow?.ncCodeBo.split(",")[1];
            const foundNcCodeBoChild = findLastChild(oGetAllNcByPCUResponse, searchNcCodeChild);
            setParentNC(searchNcCodeChild);
            oParentNC = searchNcCodeChild;
            console.log("Found Nc Code Child: ", foundNcCodeBoChild);
            // setChildNC(foundNcCodeBoChild);
            // oChildNC = foundNcCodeBoChild;
        }
    };

    const findParent = (oResult: any) => {
        if (oResult === 'Child') {
            // const findTopLevelParent = (jsonData: any, searchNcCode: string) => {
            //     let ncCodeBo = null;

            //     const traverse = (data: any[]) => {
            //         for (const record of data) {
            //             const aNCCode = record.ncCodeBo.split(",")[1];
            //             const secondaryNCDataList = record.secondaryNCDataList || [];

            //             if (aNCCode === searchNcCode) {
            //                 ncCodeBo = record.ncCodeBo.split(",")[1];
            //             }

            //             if (secondaryNCDataList.length > 0) {
            //                 traverse(secondaryNCDataList);

            //                 // Update top-level parent if we found the code in children
            //                 if (ncCodeBo) {
            //                     ncCodeBo = record.ncCodeBo.split(",")[1];
            //                 }
            //             }
            //         }
            //     };

            //     traverse(jsonData);
            //     return ncCodeBo;
            // };

            const findImmediateParent = (jsonData: any, searchNcCode: string) => {
                let immediateParent = null;

                const traverse = (data: any[], currentParent: string | null = null) => {
                    for (const record of data) {
                        const currentNcCode = record.ncCodeBo.split(",")[1];
                        const secondaryNCDataList = record.secondaryNCDataList || [];

                        // Check if the search code is in the immediate children
                        for (const child of secondaryNCDataList) {
                            if (child.ncCodeBo.split(",")[1] === searchNcCode) {
                                immediateParent = currentNcCode;
                                return; // Exit once found
                            }
                        }

                        // If not found in immediate children, search deeper
                        if (secondaryNCDataList.length > 0) {
                            traverse(secondaryNCDataList, currentNcCode);
                        }
                    }
                };

                traverse(jsonData);
                return immediateParent;
            };

            const searchNcCode = selectedNcRow?.ncCodeBo.split(",")[1];
            const topLevelParent = findImmediateParent(oGetAllNcByPCUResponse, searchNcCode);
            console.log("Immediate Parent: ", topLevelParent);
            // Use setState instead of direct assignment
            setParentNC(topLevelParent);
            oParentNC = topLevelParent;
            setCount(prev => prev + 1);


            console.log("Top-level parent:", topLevelParent);
            if (topLevelParent) {
                console.log(`Parent of ${searchNcCode} is: ${topLevelParent}`);
            } else {
                console.log(`No parent found for the given NC Code: ${searchNcCode}`);
            }

        }
    };

    const handleLogNC = async () => {
        message.destroy();
        const cookies = parseCookies();
        const site = cookies.site;
        const username = cookies?.rl_user_id;

        if (!selectedNcCodeRowKey) {
            message.error('Please select  NC Code');
            return;
        }

        // debugger

        if (selectedNcTreeRowKey) {
            const oResult = await checkIfParentOrChild();
            if (oResult == "Parent") {
                findChild(oResult);
            }
            else if (oResult == "Child") {
                const aNcCodeValue = selectedNcRow?.ncCodeBo.split(",")[1];
                const formattedNcCodeValue = "NcCodeBO:" + site + "," + aNcCodeValue;
                // setChildNC(formattedNcCodeValue);
                // oChildNC = formattedNcCodeValue;
                findParent(oResult);
            }
        }

        // console.log("DataFieldsValue: ", dataFieldsValue);

        const formattedDataFields = Object.entries(dataFieldsValue || {}).map(([field, value]) => ({
            dataField: field,
            value: value as string,
            required: datafieldList?.find(item => item.dataField === field)?.required
        }));

        console.log("FormattedDataFields: ", formattedDataFields);
        // debugger
        let currentCount;
        if (selectedNcRow) {
            // setCount(prevCount => {
            currentCount = selectedNcRow?.count + 1;
            //     return currentCount;
            // });
        } else {
            setCount(1);
            currentCount = 1;
        }

        console.log("Parent NC: ", oParentNC);
        console.log("Child NC: ", oChildNC);

        const oParentNcCodeBo = oParentNC ? "NcCodeBO:" + site + "," + oParentNC : "";
        const oChildParentNcCodeBo = oChildNC ? "NcCodeBO:" + site + "," + oChildNC : "";

        const request = {
            "site": site,
            "pcuBO": "PcuBO:" + site + "," + selectedRowData[0]?.pcu,
            "ncCodeBo": "NcCodeBO:" + site + "," + ncCodeValue,
            "ncDataTypeBo": "NcDataTypeBo:" + site + "," + dataType,
            "userBo": "UserBO:" + site + "," + username,
            "qty": 1,
            "defectCount": 0,
            "componentBo": "",
            "compContextGbo": "",
            "refDes": "",
            "comments": "",
            "resourceBo": "ResourceBO:" + site + "," + filterFormData?.defaultResource,
            "operationBO": "OperationBO:" + site + "," + filterFormData?.defaultOperation + ",00",
            "stepID": "10",
            "routerBo": "RoutingBO:" + site + "," + selectedRowData[0]?.router.split('/')[0] + "," + selectedRowData[0]?.router.split('/')[1],
            "workCenterBo": "",
            "itemBo": "ItemBO:" + site + "," + selectedRowData[0]?.item.split('/')[0] + "," + selectedRowData[0]?.item.split('/')[1],
            "parentNcCodeBo": oParentNcCodeBo,
            "childParentNcCodeBo": oChildParentNcCodeBo,
            "shoporderBO": "ShopOrderBO:" + site + "," + selectedRowData[0]?.shopOrder,
            "dataFieldsList": formattedDataFields,
            "count": currentCount
        }
        debugger
        const invalidFields = formattedDataFields
            .filter((item: any) => item.required && (!item.value || item.value === ""))
            .map((item: any) => item.dataField);

        // debugger

        if (invalidFields.length > 0) {
            // message.error(`The following fields are required: ${invalidFields.join(', ')}`);
            message.error(invalidFields[0] + " cannot be empty");
            return; // Exit the function if validation failed
        }

        console.log("Log NC Request: ", request);
        const response = await logNC(request);
        console.log("Log NC Response: ", response);
        if (!response.errorCode) {
            message.success(response?.message_details?.msg);
            setCall2(call2 + 1);
        }
    }

    const handleClose = () => {
        setShowDataFields(false);
    }

    const setDisplayClosedNC = (checked: boolean) => {
        if (checked == false) {
            fetchNCTreeList();
        }
        else {
            const closedNCs = oGetAllNcByPCUResponse.filter((item: any) => item.ncState == "C");
            setOGetAllNcByPCUResponse(closedNCs);
            console.log("Closed NCs: ", closedNCs);
        }
    };

    return (
        <LogNCContext.Provider value={{
            showDataFields, setShowDataFields, ncCodeValue, setNcCodeValue, ncDataTypeValue,
            setNcDataTypeValue, dataFieldsValue, setDataFieldsValue, selectedNcRow, setSelectedNcRow, ncCodeList, setNcCodeList,
            selectedNcGroupRowKey, setSelectedNcGroupRowKey, selectedNcCodeRowKey, setSelectedNcCodeRowKey, selectedNcTreeRowKey, setSelectedNcTreeRowKey,
            isNcTreeSelected, setIsNcTreeSelected, oGetAllNcByPCUResponse, setOGetAllNcByPCUResponse, childNC, setChildNC, parentNC, setParentNC,
            count, setCount, oParentNC, oChildNC, tranformDataFields, setTranformDataFields
        }}>
            <div className={styles.container}>
                <div className={`${styles.firstChild} ${open ? styles.shifted : ''}`}>
                    <div className={styles.subTitle} style={{
                        position: 'sticky',
                        top: -20,
                        backgroundColor: 'white',
                        zIndex: 1000,
                        padding: '10px 0',
                        marginTop: '-3%'
                    }}>
                        <p><span className={styles.subTitleText}>{t('pcu')}: </span> {selectedRowData[0]?.pcu}</p>
                        <p><span className={styles.subTitleText}>{t('operation')}: </span> {filterFormData?.defaultOperation}</p>
                        <p><span className={styles.subTitleText}>{t('resource')}: </span> {filterFormData?.defaultResource}</p>
                        <p><span className={styles.subTitleText}>{t('pcu')} {t('qty')}: </span> {selectedRowData[0]?.qty}</p>
                        <p><span className={styles.subTitleText}>{t('order')}: </span> {selectedRowData[0]?.shopOrder}</p>
                        {/* <p>
                            <span className={styles.subTitleText}>{t('displayClosedNc')}: </span>
                            <Switch size="small" onChange={(checked) => setDisplayClosedNC(checked)} />
                        </p> */}
                    </div> <br />


                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        width: '100%'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '20px',
                            width: '100%',
                            minWidth: 0
                        }}>
                            <div style={{ flex: 7, minWidth: 0 }}>
                                <NCTreeTable call2={call2} />
                            </div>
                            <div style={{
                                flex: 3,
                                minWidth: 0,
                                maxHeight: 'calc(100vh - 500px)', // Set a fixed height
                                overflowY: 'auto'   // Enable vertical scrolling
                            }}>
                                {showDataFields && <DataFields fields={tranformDataFields} />}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '20px',
                            width: '100%',
                            minWidth: 0
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <NCGroupTable ncGroupList={ncGroupList} setNcGroupList={setNcGroupList} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <NCCodeTable ncCodeList={ncCodeList} setNcCodeList={setNcCodeList} dataType={dataType} setDataType={setDataType}
                                    datafieldList={datafieldList} setDatafieldList={setDatafieldList} />
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '15px',
                        backgroundColor: 'white',
                        marginTop: '20px',  // Add spacing above buttons
                        borderTop: '1px solid #f0f0f0',  // Optional: adds a subtle separator
                        width: '100%'
                    }}>
                        <Button onClick={() => handleDone()}>{t('done')}</Button>
                        <Button type="primary" onClick={() => handleLogNC()}>{t('logNc')}</Button>
                        <Button onClick={() => handleClose()}>{t('close')}</Button>
                    </div>


                </div>






            </div>
        </LogNCContext.Provider>
    );
};

export default LogNCMain;
