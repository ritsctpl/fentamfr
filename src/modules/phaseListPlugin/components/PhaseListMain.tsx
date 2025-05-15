import React, { useEffect, useState, useCallback } from 'react';
import { Button, Flex, Switch, Typography, Splitter } from 'antd';
import { Modal, Table } from 'antd';
import styles from '@modules/phaseListPlugin/styles/PhaseListPlugin.module.css';
import { PodConfig } from '@modules/podApp/types/userTypes';
import { parseCookies } from 'nookies';
import { retrievePOD, } from '@services/wiPluginService';
import { useTranslation } from 'react-i18next';
import MyTabs from './TabList';
import MyTable from './PhaseList';
import { retrieveActivity, retrieveListOfPhases } from '@services/phaseListPluginService';
import isEqual from 'lodash.isequal'; // Install via npm: npm install lodash.isequal
import { debounce } from 'lodash';   // Install via npm: npm install lodash
import api from '@services/api';
import { isArray } from 'util';

const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
    <Flex justify="center" align="center" style={{ height: '100%' }}>
        <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
            {props.text}
        </Typography.Title>
    </Flex>
);

interface ProcessOrderProps {
    filterFormData: any;
    selectedRowData: any;
    call2: number;
    setCall2: (value: number) => void;
    phaseByDefault: string;
}

// const PhaseListMain: React.FC<ProcessOrderProps> = ({ filterFormData, selectedRowData, call2, setCall2 }) => {
//     const [sizes, setSizes] = useState<(number | string)[]>(['50%', '50%']);
//     const [isResizing, setIsResizing] = useState(false);
//     const [oPhaseList, setOphaseList] = useState<any>([]);

//     const { t } = useTranslation();

//     const fetchPhaseList = async () => {
//         const cookies = parseCookies();
//         const site = cookies.site;
//         const bacthNo = selectedRowData?.[0]?.pcu;
//         const shopOrder = selectedRowData?.[0]?.shopOrder;
//         const recipeName = selectedRowData?.[0]?.recipeName;
//         const url = window.location.href;
//         const urlParams = new URL(url).searchParams;
//         const podName = urlParams.get('WorkStation');
//         if (site && (bacthNo || recipeName || shopOrder)) {
//             const request = {
//                 site: site,
//                 batchNo: bacthNo,
//                 recipeName: recipeName,
//                 shopOrder: shopOrder,
//             }
//             console.log("Request for list of phase: ", request);
//             try {
//                 // debugger
//                 const response = await retrieveListOfPhases({ ...request });
//                 console.log("Response for list of phase: ", response);
//                 setOphaseList(response);
//             } catch (error) {
//                 console.error("Error retrieveing list of phase: ", error);
//             }
//         } else {
//             // console.error("Site and at least one of the remaining fields are required for the API call.");
//         }
//     };

//     useEffect(() => {
//         fetchPhaseList();
//         // Add a cleanup function to avoid setting state on unmounted component
//         return () => {
//             setOphaseList([]); // Reset or handle state appropriately
//         };
//     }, [filterFormData, selectedRowData, call2]);



//     const handleResize = useCallback((newSizes) => {
//         if (JSON.stringify(newSizes) !== JSON.stringify(sizes)) {
//             setSizes(newSizes);
//             setIsResizing(true);
//         }
//     }, [sizes]);





//     return (
//         <Flex vertical gap="middle">
//             <Splitter
//                 onResize={handleResize}
//                 onResizeEnd={() => setIsResizing(false)}
//                 style={{ height: '100%', overflow: 'hidden' }}
//             >
//                 <Splitter.Panel size={sizes[0]} resizable={!isResizing}  style={{ overflow: 'auto' }}>
//                     <div style={{ maxHeight: 'calc(100vh - 400px)', }}    >
//                         <MyTable oPhaseList={oPhaseList} selectedRowData={selectedRowData} filterFormData={filterFormData} />
//                     </div>
//                 </Splitter.Panel>
//                 <Splitter.Panel size={sizes[1]} resizable={!isResizing}  style={{ overflow: 'auto', height: '100%', }}>
//                     <div style={{ marginLeft: '10px', }}>
//                         <MyTabs filterFormData={filterFormData} selectedRowData={selectedRowData} call2={call2} setCall2={setCall2} />
//                     </div>
//                 </Splitter.Panel>
//             </Splitter>

//         </Flex>
//     );
// };





const PhaseListMain: React.FC<ProcessOrderProps> = ({ filterFormData, selectedRowData, call2, setCall2, phaseByDefault }) => {
    const [sizes, setSizes] = useState<(number | string)[]>(['50%', '50%']);
    const [isResizing, setIsResizing] = useState(false);
    const [oPhaseList, setOphaseList] = useState<any>([]);
    const [oSubPod, setSubPod] = useState<any>([]);
    const [podType, setPodType] = useState<any>();
    let activityURL = null;
    const { t } = useTranslation();
    useEffect(() => {


        const fetchPod = async () => {
            try {
                // debugger
                const cookies = parseCookies();
                const site = cookies.site;
                const url = window.location.href;
                const urlParams = new URL(url).searchParams;
                const podName = urlParams.get('WorkStation');

                const podRequest = {
                    site: site,
                    podName: podName
                }

                const podResponse = await retrievePOD(podRequest);
                console.log("Retrieved pod response: ", podResponse);

                if (!podResponse.errorCode) {
                    setPodType(podResponse?.type);
                    if (podResponse?.type.toLowerCase().replaceAll(" ", "") == "workcenter") {
                        handleRetrieveSubPodForWorkCenter(podResponse);
                    }

                    else {
                        handleRetrieveSubPodForOperation(podResponse);
                    }

                    // const subPodRequest = {
                    //     site: site,
                    //     podName: podResponse.subPod
                    // }

                    // const subPodResponse = await retrievePOD(subPodRequest);
                    // setSubPod(subPodResponse);
                    // console.log("Retrieved sub pod response: ", subPodResponse);

                    // if (!subPodResponse.errorCode) {
                    //     const activityToRetrieve = subPodResponse.tabConfiguration.activity;
                    //     const fetchActivity = async () => {
                    //         const req = {
                    //             site: site,
                    //             currentSite: site,
                    //             activityId: activityToRetrieve,
                    //         };
                    //         try {
                    //             const response = await retrieveActivity(req);
                    //             console.log("Retrieved activity reponse: ", response);
                    //             if (!response.errorCode) {
                    //                 if (response?.url) {
                    //                     activityURL = response?.url.split("v1")[1];
                    //                     const bacthNo = selectedRowData?.[0]?.pcu;
                    //                     const shopOrder = selectedRowData?.[0]?.shopOrder;
                    //                     const recipeName = selectedRowData?.[0]?.recipeName;
                    //                     if (site && (bacthNo || recipeName || shopOrder)) {
                    //                         const request = {
                    //                             site: site,
                    //                             batchNo: bacthNo,
                    //                             recipeName: recipeName,
                    //                             shopOrder: shopOrder,
                    //                         };
                    //                         try {
                    //                             const activityResponse = await api.post(activityURL, { ...request });
                    //                             if (!response.errorCode) {
                    //                                 let activityData = activityResponse?.data?.phaseList;
                    //                                 // debugger
                    //                                 activityData = activityData.map((item: any, index: number) => ({
                    //                                     ...item,
                    //                                     id: index
                    //                                 }));
                    //                                 console.log('Response for list of phase: ', activityData);
                    //                                 setOphaseList(activityData);
                    //                             }

                    //                         } catch (error) {
                    //                             console.error('Error retrieving phase list: ', error);
                    //                         }
                    //                     }
                    //                     // console.log("Activity data retrieved: ", activityData);
                    //                 }
                    //             }
                    //         } catch (error) {
                    //             console.error("Error retrieving activity: ", error);
                    //         }
                    //     };

                    //     fetchActivity();
                    // }

                }

            }
            catch (error) {
                console.error("Error retrieving pod: ", error);
            }
        };
        fetchPod();


    }, [filterFormData, selectedRowData, call2]);

    const handleRetrieveSubPodForWorkCenter = async (podResponse: any) => {

        const cookies = parseCookies();
        const site = cookies.site;
        const url = window.location.href;
        const urlParams = new URL(url).searchParams;
        const podName = urlParams.get('WorkStation');

        if (!podResponse.errorCode) {
            const subPodRequest = {
                site: site,
                podName: podResponse.subPod
            }

            const subPodResponse = await retrievePOD(subPodRequest);
            setSubPod(subPodResponse);
            console.log("Retrieved sub pod response: ", subPodResponse);

            if (!subPodResponse.errorCode) {
                const activityToRetrieve = subPodResponse.tabConfiguration.activity;
                const fetchActivity = async () => {
                    const req = {
                        site: site,
                        currentSite: site,
                        activityId: activityToRetrieve,
                    };
                    try {
                        const response = await retrieveActivity(req);
                        console.log("Retrieved activity reponse: ", response);
                        if (!response.errorCode) {
                            if (response?.url) {
                                activityURL = response?.url.split("v1")[1];
                                const bacthNo = selectedRowData?.[0]?.pcu;
                                const shopOrder = selectedRowData?.[0]?.shopOrder;
                                const recipeName = selectedRowData?.[0]?.recipeName;
                                if (site && (bacthNo || recipeName || shopOrder)) {
                                    const request = {
                                        site: site,
                                        batchNo: bacthNo,
                                        recipeName: recipeName,
                                        shopOrder: shopOrder,
                                    };
                                    try {
                                        console.log("Request for list of phase: ", request);
                                        const activityResponse = await api.post(activityURL, { ...request });
                                        console.log('Response for list of phase: ', activityResponse.data);
                                        if (!activityResponse?.data?.errorCode) {
                                            let activityData = activityResponse?.data?.phaseList;
                                            // debugger
                                            console.log('Response for list of phase: ', activityData);
                                            activityData = activityData.map((item: any, index: number) => ({
                                                ...item,
                                                id: index
                                            }));
                                            setOphaseList(activityData);
                                        }

                                    } catch (error) {
                                        console.error('Error retrieving phase list: ', error);
                                    }
                                }
                                // console.log("Activity data retrieved: ", activityData);
                            }
                        }
                    } catch (error) {
                        console.error("Error retrieving activity: ", error);
                    }
                };

                fetchActivity();
            }

        }

    }


    const handleRetrieveSubPodForOperation = async (podResponse: any) => {

        const cookies = parseCookies();
        const site = cookies.site;
        const url = window.location.href;
        const urlParams = new URL(url).searchParams;
        const podName = urlParams.get('WorkStation');

        if (!podResponse.errorCode) {
            const subPodRequest = {
                site: site,
                podName: podResponse.subPod
            }

            const subPodResponse = await retrievePOD(subPodRequest);
            setSubPod(subPodResponse);
            console.log("Retrieved sub pod response: ", subPodResponse);

            if (!subPodResponse.errorCode) {
                const activityToRetrieve = subPodResponse.tabConfiguration.activity;
                const fetchActivity = async () => {
                    const req = {
                        site: site,
                        currentSite: site,
                        activityId: activityToRetrieve,
                    };
                    try {
                        const response = await retrieveActivity(req);
                        console.log("Retrieved activity reponse: ", response);
                        if (!response.errorCode) {
                            if (response?.url) {
                                activityURL = response?.url.split("v1")[1];
                                const bacthNo = selectedRowData?.[0]?.pcu;
                                const shopOrder = selectedRowData?.[0]?.shopOrder;
                                const recipeName = selectedRowData?.[0]?.recipeName;
                                const recipeVersion = selectedRowData?.[0]?.recipeVersion;
                                const material = selectedRowData?.[0]?.item.split("/")[0];
                                // const materialVersion = selectedRowData?.[0]?.itemVersion;

                                let materialVersion ;
                                if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
                                    materialVersion = selectedRowData?.[0]?.itemVersion;
                                }
                                else{
                                    materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
                                }

                                if (site && (bacthNo || material || shopOrder)) {
                                    const request = {
                                        site: site,
                                        batchNo: bacthNo,
                                        material: material,
                                        materialVersion: materialVersion,
                                        orderNo: shopOrder,
                                        phaseId: filterFormData?.defaultPhaseId || phaseByDefault,
                                        phaseSequence: filterFormData?.defaultPhaseSequence,
                                    };

                                    // debugger
                                    try {
                                        console.log("Request for list of operations: ", request);
                                        const activityResponse = await api.post(activityURL, { ...request });
                                        console.log('Response for list of operations: ', activityResponse.data);
                                        if (!activityResponse.data.errorCode) {
                                            let activityData = activityResponse?.data;
                                            // debugger
                                            console.log('Response for list of phase: ', activityData);
                                            if (Array.isArray(activityData)) {
                                                activityData = activityData?.map((item: any, index: number) => ({
                                                    ...item,
                                                    id: index
                                                }));
                                            }
                                            setOphaseList(activityData);
                                        }

                                    } catch (error) {
                                        console.error('Error retrieving phase list: ', error);
                                    }
                                }
                                // console.log("Activity data retrieved: ", activityData);
                            }
                        }
                    } catch (error) {
                        console.error("Error retrieving activity: ", error);
                    }
                };

                fetchActivity();
            }

        }

    }

    // const fetchPhaseList = async () => {
    //     const cookies = parseCookies();
    //     const site = cookies.site;
    //     const bacthNo = selectedRowData?.[0]?.pcu;
    //     const shopOrder = selectedRowData?.[0]?.shopOrder;
    //     const recipeName = selectedRowData?.[0]?.recipeName;
    //     const url = window.location.href;
    //     const urlParams = new URL(url).searchParams;
    //     const podName = urlParams.get('WorkStation');
    //     if (site && (bacthNo || recipeName || shopOrder)) {
    //         const request = {
    //             site: site,
    //             batchNo: bacthNo,
    //             recipeName: recipeName,
    //             shopOrder: shopOrder,
    //         };
    //         console.log('Request for list of phase: ', request);
    //         try {
    //             const response = await retrieveListOfPhases({ ...request });
    //             console.log('Response for list of phase: ', response);
    //             setOphaseList(response);
    //         } catch (error) {
    //             console.error('Error retrieving list of phase: ', error);
    //         }
    //     }
    // };

    // useEffect(() => {
    //     fetchPhaseList();
    //     return () => {
    //         setOphaseList([]); // Reset state on cleanup
    //     };
    // }, [filterFormData, selectedRowData, call2]);

    const handleResize = useCallback(
        debounce((newSizes) => {
            if (!isEqual(newSizes, sizes)) {
                setSizes(newSizes);
            }
        }, 10),
        [sizes]
    );

    const handleResizeEnd = () => {
        setIsResizing(false);
    };

    return (
        <Flex vertical gap="middle">
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                <div style={{ width: '25%', overflow: 'auto' }}>
                    <div style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        <MyTable oPhaseList={oPhaseList} selectedRowData={selectedRowData} filterFormData={filterFormData} oSubPod={oSubPod} podType={podType} />
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', height: '100%' }}>
                    <div style={{ marginLeft: '10px' }}>
                        <MyTabs filterFormData={filterFormData} selectedRowData={selectedRowData} call2={call2} setCall2={setCall2} oSubPod={oSubPod} phaseByDefault={phaseByDefault}/>
                    </div>
                </div>
            </div>
        </Flex>
    );
};

export default PhaseListMain;