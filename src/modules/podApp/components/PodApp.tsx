/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/PodMain.module.css';
import { parseCookies } from 'nookies';
import { useAuth } from '@/context/AuthContext';
import jwtDecode from 'jwt-decode';
import { Button, message, Tooltip, Modal, Select, Splitter, Switch, notification, Popconfirm, } from 'antd';
import { decryptToken } from '@/utils/encryption';
import { DecodedToken, PodConfig, defaultPodConfig, defaultData } from '../types/userTypes';
import FilterCommonBar from './FilterCommonBar';
import { PodContext } from '../hooks/userContext';
import { fetchPodTop50, fetchPcuTop50, fetchStart, fetchBatchTop50, retrieveResourceStatus, retrieveBreakStatus } from '@services/podServices';
import ContainerComponent from './PodScreen'; // Adjust import if needed
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import CommonAppBar from '@components/CommonAppBar';
import { ReloadOutlined, ClearOutlined } from '@ant-design/icons';
import { retrieveList } from '@services/listServices';
import start from '../../../images/pod_image/start.png';
import complete from '../../../images/pod_image/complete.png';
import dcCollect from '../../../images/pod_image/dc_collect.png';
import hold from '../../../images/pod_image/hold.png';
import unhold from '../../../images/pod_image/unhold.png';
import lineClearance from '../../../images/pod_image/line_clearance.png';
import machineStatusChange from '../../../images/pod_image/machine_status_change.png';
import scrap from '../../../images/pod_image/scrap.png';
import signOff from '../../../images/pod_image/sign_off.png';
import workInstruction from '../../../images/pod_image/work_instruction.png';
import pcoTile from '../../../images/pod_image/pcoTile.png';
import pcoGraph from '../../../images/pod_image/pcoGraph.png';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineMenuFold, AiOutlineMenuUnfold } from 'react-icons/ai';
import { IoMdClose } from 'react-icons/io';
import NoWorkStation from './NoWorkStation';
import { fetchEndpointsData } from '@services/oeeServicesGraph';
import { updateResourceStatuOee, updateResourceStatus } from '@services/equResourceService';
import InstructionModal from '@components/InstructionModal';
import PodManual from './PodManual';

const PodApp = () => {
  const cookies = parseCookies();
  const [site, setSite] = useState<string | null>(cookies.site);
  const { t } = useTranslation();
  const { isAuthenticated, token, logout } = useAuth();
  const [selectedRowData, setSelectedRowData] = useState<any[]>([]); // Changed to an array for multiple selection
  const [formData, setFormData] = useState<PodConfig>(defaultPodConfig);
  const [isEditing, setIsEditing] = useState(false);
  const [call, setCall] = useState(0);
  const [call1, setCall1] = useState(0);
  const [call2, setCall2] = useState(0);
  const [data, setData] = useState<any[]>(defaultData);
  const [filterFormData, setFilterFormData] = useState<PodConfig>(defaultPodConfig);
  const [podCategoryType, setPodCategoryType] = useState<string>('processOrder');
  const [erpShift, setErpShift] = useState(false);
  const [list, setList] = useState<any | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [showError, setShowError] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [containers, setContainers] = useState<{ content: string; buttonLabel: string; pluginLocation: number; buttonId: string; url: string; }[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<{ content: string; buttonLabel: string; url: string; } | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabOut, setTabOut] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null); // New state for session timeout
  const [selectedRowDataCurrent, setSelectedRowCurrent] = useState(null);
  const [phaseIdd, setPhaseId] = useState<string | null>(null);
  const [operationIdd, setOperationIdd] = useState<string | null>(null);
  const [buttonId, setButtonId] = useState<string | null>(null);
  const [phaseByDefault, setPhaseByDefault] = useState<any>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuPosition = filterFormData?.settings?.buttonLocation || 'left'; // 'left' or 'right'
  const [batchNoTabOut, setBatchNoTabOut] = useState<number>(0);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [workStation, setWorkStation] = useState('');
  const [resourceStatus, setResourceStatus] = useState('');
  const [resourceStatusBoolean, setResourceStatusBoolean] = useState(null);
  const [isBreak, setIsBreak] = useState(false);

  const messageStyle = errorStatus === 'fail'
    ? { color: 'red', border: '1px solid red' }
    : { color: 'green', border: '1px solid green' };

  const icon = errorStatus === 'fail'
    ? <CloseCircleOutlined style={{ fontSize: '20px', color: 'red', marginRight: '10px' }} />
    : <CheckCircleOutlined style={{ fontSize: '20px', color: 'green', marginRight: '10px' }} />;

    useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const workStationParam = searchParams.get('WorkStation');
      setWorkStation(workStationParam);
      setActivityId(workStationParam);
      
    }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // sessionStorage.removeItem('PhaseIdd');
      sessionStorage.setItem('PhaseIdd', phaseByDefault);
      sessionStorage.removeItem('ResourceId');
      sessionStorage.removeItem('OperationId');
      sessionStorage.removeItem('batchTop50Data');
    }
  }, [phaseByDefault]);

  const handleRefresh = async () => {
    setTimeout(() => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }, 500);

    try {

      const getPcu = {
        site: site,
        list: filterFormData.listOptions[0].podWorkList,
        category: "POD Work List",
        resource: filterFormData.defaultResource,
        operation: `${filterFormData.defaultOperation}`,
        podName: activityId
      }

      if (filterFormData?.podCategory?.toLowerCase() === 'process') {
        (getPcu as any).phase = phaseByDefault || filterFormData?.defaultPhaseId || "";
        (getPcu as any).phaseSequence = filterFormData?.defaultPhaseSequence || "";
      }

      const PcuData = await fetchPcuTop50(site, getPcu);
      // const PcuData = await fetchBatchTop50(site, getPcu);
      // console.log(PcuData, "PcuDatad");
      const batchTop50Data = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('batchTop50Data') || '{}') : { data: [] };
      setData(PcuData);
    } catch (error) {
      console.error('Error refreshing data:', error);
      message.destroy();
      message.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const addContainer = async (buttonType, buttonLabel: string, content: string, pluginLocation: string, buttonId: string, url: string) => {
    setCall2(call2 + 1)


    setButtonId(buttonId)
    console.log(url, "urlcc");
    if (selectedRowData.length === 0 && (buttonType.toLowerCase() !== "hooks") && (buttonId !== "CHGRSRSTATUS")) {
      message.destroy();
      message.error((filterFormData?.podCategory?.toLowerCase() === 'process') ? 'Please select Batch No!' : 'Please select PCU!');
      return;
    }

    async function processRowData(rowData, newOperation?) {

      const params = {
        "pcu": rowData.pcu,
        "site": site,
        "operation": newOperation || filterFormData.defaultOperation,
        // "operationVersion": "A",
        // "operationVersion": "00",
        "accessToken": token
      };
      // console.log(params, "params");
      console.log("FIlter form data", filterFormData);
      console.log("url123", url);
      try {

        // await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(true);
        // debugger
        const res = await fetchStart(match[1], params, buttonId, filterFormData, phaseByDefault);
        console.log(res, match[1], "match");
        if (match[1] === "batchnohold-service/hold") {
          console.log(res, "rescfc");
          setErrorStatus('success')
          setError(res?.message_details?.msg);
          return;
        }
        if (match[1] === "batchnohold-service/unhold") {
          console.log(res, "rescfc");
          setErrorStatus('success')
          setError(res?.message_details?.msg);
          return;
        }

        if (filterFormData.podCategory.toLowerCase() === "process") {
          if (res?.errorCode || res?.message_details?.msg_type === 'E') {
            setError(res?.message);
            setErrorStatus('fail');
            return;
          }

          if (res?.status?.toLowerCase() != 'success') {
            setErrorStatus('fail')
          }
          else {
            setErrorStatus('success')
          }
          // Find the first array in the response object
          const responseArray = Object?.values(res)?.find(value => Array.isArray(value));

          if (responseArray && responseArray?.length > 0) {
            // Get messages from all items in the array
            // const messages = responseArray.map(item => item.message).filter(Boolean);
            const messages = responseArray?.[0]?.message;
            setError(messages); // Join multiple messages with line breaks


             // check for clearPCU
             if(res?.status == "success"){
                const currentButton = filterFormData?.buttonList?.find(button => 
                  button.activityList?.some(activity => activity.url?.includes(url)
                )
                );
                console.log("currentButton", currentButton);
                const shouldClearPCU = currentButton?.activityList?.[0]?.clearsPcu;
                console.log("shouldClearPCU", shouldClearPCU);
                if (shouldClearPCU) {
                  setSelectedRowData([]);
                }
              }

          } else {
            setError(res?.message); // Fallback to main message if no array found
          }

        }

        else {
          if (res?.errorCode) {
            setError(res?.message);
            setErrorStatus('fail')
            return;
          }
          else {
            setErrorStatus('success')
            setError(res?.message_details?.msg);

            // check for clearPCU
          const currentButton = filterFormData?.buttonList?.find(button => 
            button.activityList?.some(activity => activity.url?.includes(url)
          )
          );
          console.log("currentButton", currentButton);
          const shouldClearPCU = currentButton?.activityList?.[0]?.clearsPcu;
          console.log("shouldClearPCU", shouldClearPCU);
          if (shouldClearPCU) {
            setSelectedRowData([]);
          }
            // console.log(buttonId, "buttonId");
          }
        }



      } catch (error) {
        console.error('Error:', error);
        setErrorStatus('fail')
        setError('An error occurred while processing the request.');
        // message.error('An error occurred while processing the request.');
      } finally {
        setLoading(false);
      }
    }


    async function initiateProcess() {
      // Ensure selectedRowData is an array and has at least one item
      if (Array.isArray(selectedRowData) && selectedRowData.length > 0) {
        // for (const rowData of selectedRowData) {
          await processRowData(selectedRowData);
        // }

        if (buttonId === "CompleteIdd") {

          Modal.info({
            title: 'Select Next Operation',
            content: (
              <div>
                <Select
                  style={{ width: '100%', marginBottom: '10px' }}
                  onChange={(value) => {
                    setSelectedOperation(value);
                  }}
                  placeholder="Select Operation"
                >
                  <Select.Option value="op1">Operation 1</Select.Option>
                  <Select.Option value="op2">Operation 2</Select.Option>
                  <Select.Option value="op3">Operation 3</Select.Option>
                </Select>
                <Button
                  type="primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setCall1(call1 + 1);
                    Modal.destroyAll();
                    processRowData(selectedRowData[0], selectedOperation);
                  }}
                >
                  Complete
                </Button>
              </div>
            ),
            icon: null,
            okButtonProps: { style: { display: 'none' } }
          });
        }
        if (buttonId === "CompleteId") {
          setSelectedRowData([])
        }
      } else {
        console.warn('No data to process');
        message.destroy();
        message.warning('No data available to process.');
      }

    }
    // debugger
    // Extract the token and match from the URL
    const regex = /\/app\/v1\/(.*)/;
    console.log(url, "urddl");
    const match = url?.match(regex);
    const cookies = parseCookies();
    const token = cookies.token;
    // console.log(buttonType, "buttonType");
    console.log(match, "buttonType");

    if (buttonType !== "UI5" && buttonType !== "UI" && buttonType.toLowerCase() !== "hooks") {
      console.log(buttonType, "buttonType");
      if (match && match[1]) {
        await initiateProcess();
      } else {
        console.error('URL does not match expected pattern.');
        message.destroy();
        message.error('Invalid URL or endpoint.');
        return;
      }
    }

    const getPanelLocation = () => {
      if (!filterFormData?.layout) return NaN;
      // debugger
      // Get the activity for the current button
      const currentButton = filterFormData?.buttonList?.find(btn => btn.buttonId === buttonId);
      const currentActivity = currentButton?.activityList[0]?.activity;

      if (!currentActivity) return parseInt(pluginLocation, 10) || NaN;

      // Find the layout entry where either defaultPlugin matches the activity
      // or otherPlugin array contains the matching activity
      const layoutEntry = filterFormData?.layout?.find(layout => {
        // First check defaultPlugin for a match
        // if (layout?.defaultPlugin === currentActivity) {
        //   return true;
        // }

        // Then check otherPlugin array until first match
        return layout?.otherPlugin?.some(plugin => {
          if (plugin?.activity === currentActivity) {
            return true;
          }
          return false;
        });
      });

      if (layoutEntry?.panel || layoutEntry?.type?.toLowerCase()?.replaceAll(" ", "") === "popup") {
        if (layoutEntry?.type?.toLowerCase()?.replaceAll(" ", "") === "popup") {
          return 99;
        }
        else {
          return parseInt(layoutEntry?.panel, 10) || NaN;
        }
      }

      // Fallback to pluginLocation from the button's activityList
      // return parseInt(currentButton?.activityList[0]?.pluginLocation || pluginLocation, 10) || NaN;
      return NaN;
    };

    const location = getPanelLocation();


    // const location = pluginLocation ? parseInt(pluginLocation, 10) : NaN;

    setShowError(true);
    // if (isNaN(location)) {
    //   console.warn('Invalid pluginLocation:', pluginLocation);
    //   return;
    // }

    if (location === 99) {
      setSelectedContainer({ content, buttonLabel, url });
    } else {
      const newContainer = { content, buttonLabel, buttonId, pluginLocation: location, url };
      const updatedContainers = [...containers, newContainer]
        .filter((c, index, self) =>
          index === self.findIndex((t) => t.content === c.content)
        )
        .filter(c => !isNaN(c.pluginLocation))
        .sort((a, b) => a.pluginLocation - b.pluginLocation);

      if (updatedContainers.length <= 7) {
        setContainers(updatedContainers);
      }
    }
    setCall1(call1 + 1);
  };

  const removeContainer = (content: string) => {
    // console.log('Removing container with content:', content); // Debugging line
    setContainers(containers.filter(item => item.content !== content));
  };

  //   const workStation ='OPR_POD'
  useEffect(() => {
    const fetchData = async () => {
if(workStation==="") return
      try {
        const podData = await fetchPodTop50(site, workStation);
        // setPodCategoryType(podData?.podCategory)
        if (podData.errorCode) {
          console.error(`Error: ${podData.message}`);
          setData([]); // Handle the error case
        } else {
          setFormData(podData || []);
          setFilterFormData(podData);
          document.title = podData.description;
        }
        const list = await retrieveList(site, {
          list: podData.listOptions[0].podWorkList,
          //  list:"ProcessWorkList",
          category: "POD Work List"
        })
        // console.log(podData, 'podData');

        setList(list);
        // Only call retrieveResourceStatus if defaultResource has a value
        if (podData?.defaultResource) {
          const resourceStatus = await retrieveResourceStatus({
            site,
            resource: podData.defaultResource,
          });

          const breakStatus = await retrieveBreakStatus({
            site,
            resourceId: podData.defaultResource,
          });
          console.log(breakStatus, "breakStatus");
          setResourceStatus(resourceStatus?.status);
          setResourceStatusBoolean(breakStatus);
          setIsBreak(breakStatus);
        }
      } catch (error) {
        console.error(`Fetch error: ${error}`);
        setData([]); // Handle any fetch errors
      }
    };

    fetchData();
  }, [site, workStation,call1]); // Added dependencies to make sure effect runs on change
  useEffect(() => {
    const updateResourceStatus = async () => {
      if (filterFormData?.defaultResource) {
        try {
          const resourceStatus = await retrieveResourceStatus({
            site,
            resource: filterFormData.defaultResource,
          });
          console.log(resourceStatus, "resourceStatusFromChange");
          setResourceStatus(resourceStatus?.status);
        } catch (error) {
          console.error('Error fetching resource status:', error);
          setResourceStatus('Not Available');
        }
      } else {
        setResourceStatus('Not Available');
      }
    };
  
    updateResourceStatus();
  }, [filterFormData?.defaultResource, site,call1]);
  useEffect(() => {
    if (phaseIdd) {
      setFilterFormData(prev => ({
        ...prev,
        defaultPhaseId: phaseIdd
      }));
    }
  }, [phaseIdd]);

  useEffect(() => {

    const fetchShiftData = async () => {
      if (filterFormData.status === 'Disabled') {
        message.destroy()
        message.warning('Please Enable the Pod');
        return;
      }
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      const cookies = parseCookies();
      const site = cookies?.site;
      setSite(site);
      try {
        // const getPcu = {
        //   site: site,
        //   list: filterFormData.listOptions[0].podWorkList,
        //   category: 'POD Work List',
        //   resource: filterFormData.defaultResource,
        //   operation: `${filterFormData.defaultOperation}`,
        //   operationVersion: "00"
        // };
        let getPcu =
          filterFormData.podCategory.toLowerCase() !== 'process' || filterFormData.podCategory.toLowerCase() !== 'processorder' ?
            {
              site: site,
              list: filterFormData.listOptions[0].podWorkList,
              category: 'POD Work List',
              phase: filterFormData.defaultPhaseId || phaseByDefault,
              resource: filterFormData.defaultResource,
              operation: `${filterFormData.defaultOperation}`,
              podName: activityId
            }
            : {
              site: site,
              list: filterFormData.listOptions[0].podWorkList,
              category: "POD Work List",
              phaseSequence: filterFormData.defaultPhaseSequence,
              phase: filterFormData.defaultPhaseId || phaseByDefault,
              resource: filterFormData.defaultResource === "" ? null : filterFormData.defaultResource,
              operation: filterFormData.defaultOperation === "" ? null : filterFormData.defaultOperation,
              podName: activityId
            }

        const PcuData = await fetchPcuTop50(site, getPcu);
        // const PcuData = await fetchBatchTop50(site, getPcu);
        const batchTop50Data = JSON.parse(sessionStorage.getItem('batchTop50Data') || '{}');
        // console.log(PcuData, "PcuDatssa")
        setData(PcuData);
        setCall(call + 1);
      } catch (error) {
        console.error('Error fetching data fields:', error);
        setData([]);
      }


    };

    fetchShiftData();
    // // Set up interval to fetch data based on refreshRate
    // const intervalId = setInterval(() => {
    //   fetchShiftData();
    // }, (filterFormData?.refreshRate || 60) * 1000); // Convert seconds to milliseconds

    // // New interval for 6 seconds refresh
    // const secondIntervalId = setInterval(() => {
    //   if (filterFormData?.refreshRate) { // Only refresh if refreshRate exists
    //     fetchShiftData();
    //   }
    // }, filterFormData?.refreshRate ? 6 * 1000 : 60000); // Use refreshRate if available, fallback to 60 seconds

    // return () => {
    //   clearInterval(intervalId); // Cleanup interval on unmount
    //   clearInterval(secondIntervalId); // Cleanup second interval on unmount
    // };

  }, [isAuthenticated, token, site, call1, filterFormData]);

  useEffect(() => {

    if (showError) {
      // Play sound if soundWithErrorMessage is true
      if (filterFormData.soundWithErrorMessage) {
        const audio = new Audio('../notification.mp3'); // Local audio file path
        audio.play().catch(error => console.error('Error playing sound:', error));
      }

      // Set up a timer to hide the error message after 10 seconds
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 5000); // 10000 milliseconds = 10 seconds

      // Cleanup the timer if the component unmounts or if showError changes
      return () => clearTimeout(timer);
    }
  }, [showError, filterFormData.soundWithErrorMessage]); // Added filterFormData.soundWithErrorMessage to dependencies

  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
    setCall(call + 1);
  };

  const handleClear = () => {
    setSelectedRowData([])
  }
  // console.log(selectedRowData, "selectedRowData");

  // useEffect(() => {
    
  //   if (filterFormData?.layout) {
  //     const fixedContainers = filterFormData.layout
  //       .filter(layout =>
  //         layout.panel &&
  //         layout.type === "fixed" &&
  //         layout.defaultPlugin && 
  //         layout.defaultUrl
  //       )
  //       .flatMap(layout => {
  //         const findUiValues = filterFormData.buttonList.filter(button => {
  //           // Check if button has activityList and first activity has type
  //           if (button?.activityList?.[0]?.type) {
  //             const activityType = button.activityList[0].type.toLowerCase();
  //             // Keep button only if type is NOT service/services
  //             return activityType !== 'service' && activityType !== 'services';
  //           }
  //           return true; // Keep buttons without activity type
  //         });

  //         console.log(findUiValues, "findUiValues");
          

  //         // Create a modified buttonList with defaultUrl added to activityList
  //         const modifiedButtonList = findUiValues.map(button => ({
  //           ...button,
  //           defaultUrl: layout?.defaultUrl
  //         }));
  //         console.log(modifiedButtonList, "modifiedButtonList");
          

  //         const matchingButton = modifiedButtonList.find(button => {
  //           if (button?.defaultUrl === '/rits/workListPanel' && layout.defaultPlugin) {
  //             console.log("call");
  //             return true;
  //           }
  //           else if (button?.activityList[0]?.activity === layout.defaultPlugin) {
  //             console.log("call2");
  //             return true;
  //           }
  //           return false;
  //         });
  //         console.log(matchingButton, "matchingButton");
          
  //         const {defaultUrl, ...rest} = matchingButton;


  //         console.log(rest, "rest");


  //         if (!rest) return [];

  //         return [{
  //           content: rest.buttonLabel,
  //           buttonLabel: rest.buttonLabel,
  //           buttonId: rest.buttonId,
  //           pluginLocation: parseInt(layout.panel, 10),
  //           url: rest?.activityList[0]?.url,
  //           defaultUrl: layout.defaultUrl  // Also add it to the container object
  //         }];
  //       });

  //     // Filter out invalid plugin locations and sort by location
  //     const validFixedContainers = fixedContainers
  //       .filter(c => !isNaN(c.pluginLocation))
  //       .sort((a, b) => a.pluginLocation - b.pluginLocation);

  //     setContainers(prevContainers => {
  //       // Combine existing containers with fixed ones, removing duplicates
  //       const combined = [...prevContainers, ...validFixedContainers];
  //       return combined.filter((c, index, self) =>
  //         index === self.findIndex((t) =>
  //           t.content === c.content && t.pluginLocation === c.pluginLocation
  //         )
  //       );
  //     });
  //   }
  // }, [filterFormData?.layout]);

  useEffect(() => {
    if (filterFormData?.layout) {
      // Get all default plugins from layout that have a valid panel and type "fixed"
      // debugger
      const fixedContainers = filterFormData.layout
        .filter(layout =>
          layout.panel &&
          layout.type === "fixed" &&
          layout.defaultPlugin
        )
        .flatMap(layout => {
          let matchingButton;
          
          // First check for activity match
          matchingButton = filterFormData?.buttonList?.find(button =>
            button?.activityList[0]?.activity === layout.defaultPlugin
          );

          // If no match found and layout has defaultUrl = '/rits/workListPanel'
          if (!matchingButton && layout.defaultUrl === '/rits/workListPanel') {
            // Filter buttons that have UI/UI5 type (not service/services)
            const uiButtons = filterFormData?.buttonList?.filter(button => {
              if (button?.activityList?.[0]?.type) {
                const activityType = button.activityList[0].type.toLowerCase();
                return activityType !== 'service' && activityType !== 'services';
              }
              return false;
            });

            // Find first matching UI button
            matchingButton = uiButtons?.[0];
          }

          if (!matchingButton) return [];
 
          return [{
            content: matchingButton.buttonLabel,
            buttonLabel: matchingButton.buttonLabel,
            buttonId: matchingButton.buttonId,
            pluginLocation: parseInt(layout.panel, 10),
            url: layout.defaultUrl === '/rits/workListPanel' 
              ? layout.defaultUrl 
              : matchingButton?.activityList[0]?.url
          }];
        });
 
      // Filter out invalid plugin locations and sort by location
      const validFixedContainers = fixedContainers
        .filter(c => !isNaN(c.pluginLocation))
        .sort((a, b) => a.pluginLocation - b.pluginLocation);
 
      setContainers(prevContainers => {
        // Combine existing containers with fixed ones, removing duplicates
        const combined = [...prevContainers, ...validFixedContainers];
        return combined.filter((c, index, self) =>
          index === self.findIndex((t) =>
            t.content === c.content && t.pluginLocation === c.pluginLocation
          )
        );
      });
    }
  }, [filterFormData?.layout]);


  useEffect(() => {
    if (filterFormData?.buttonList) {
      let activityToLoad;
      // debugger
      if (selectedRowData[0]?.status?.toLowerCase()?.replaceAll(" ", "") == 'inwork') {
        activityToLoad = filterFormData?.settings?.buttonActivityInWork?.map(activity =>
          activity.replace(/\\/g, '')
        );
      }
      else if (selectedRowData[0]?.status?.toLowerCase()?.replaceAll(" ", "") == 'inqueue') {
        activityToLoad = filterFormData?.settings?.buttonActivityInQueue?.map(activity =>
          activity.replace(/\\/g, '')
        );
      }
      const activityToLoadObjects = filterFormData?.buttonList?.filter(button =>
        // Check if button ID exists in the activityToLoad array
        Array.isArray(activityToLoad) &&
        activityToLoad.includes(button?.buttonId) &&
        button?.activityList[0]?.pluginLocation !== "99"
      );

      if (activityToLoadObjects) {
        const fixedContainers = activityToLoadObjects.map(button => {
          const activityType = button?.activityList[0]?.type;

          // If it's a Service type, trigger the service call
          if (activityType?.toLowerCase() === 'services' || activityType?.toLowerCase() === 'service') {
            // fetchStart(button?.activityList[0]?.url, {}, button?.buttonId, filterFormData, phaseByDefault)

            addContainer(
              'Services',
              button?.buttonLabel,
              button?.buttonLabel,
              button?.activityList[0]?.pluginLocation,
              button?.buttonId,
              button?.activityList[0]?.url
            );
            return null; // Don't create a container for Service type

          }

          // For UI5 type, create container as before
          return {
            content: button?.buttonLabel,
            buttonLabel: button?.buttonLabel,
            buttonId: button?.buttonId,
            pluginLocation: parseInt(button?.activityList[0]?.pluginLocation || '0', 10),
            url: button?.activityList[0]?.url
          };
        }).filter(Boolean); // Remove null values from Service types

        // Filter out invalid plugin locations and sort by location
        const validFixedContainers = fixedContainers
          .filter(c => !isNaN(c.pluginLocation))
          .sort((a, b) => a.pluginLocation - b.pluginLocation);

        setContainers(prevContainers => {
          // Combine existing containers with fixed ones, removing duplicates
          const combined = [...prevContainers, ...validFixedContainers];
          return combined.filter((c, index, self) =>
            index === self.findIndex((t) => t.content === c.content)
          );
        });
      }

    }
  }, [batchNoTabOut]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      filterFormData?.buttonList?.forEach(button => {
        if (!button?.hotKey) return;

        const hotKeyParts = button.hotKey.split('+').map(part => part.trim().toLowerCase());
        const isCtrlRequired = hotKeyParts.includes('ctrl');
        const keyToMatch = hotKeyParts[hotKeyParts.length - 1];

        const isHotkeyMatch =
          (!isCtrlRequired || e.ctrlKey) &&
          e.key.toLowerCase() === keyToMatch;

        if (isHotkeyMatch) {
          e.preventDefault(); // Prevent default browser shortcuts
          addContainer(
            button?.activityList[0]?.type,
            button?.buttonLabel,
            button?.buttonLabel,
            button?.activityList[0]?.pluginLocation,
            button?.buttonId,
            button?.activityList[0]?.url
          );
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [filterFormData.buttonList, addContainer]);

  useEffect(() => {
    if (filterFormData?.sessionTimeout) {
      setSessionTimeout(filterFormData?.sessionTimeout);
    }
  }, [filterFormData]);

  const getImageSource = (imageIcon: string) => {
    const imageMap = {
      'start.png': start.src,
      'complete.png': complete.src,
      'dc_collect.png': dcCollect.src,
      'hold.png': hold.src,
      'unhold.png': unhold.src,
      'line_clearance.png': lineClearance.src,
      'machine_status_change.png': machineStatusChange.src,
      'scrap.png': scrap.src,
      'sign_off.png': signOff.src,
      'work_instruction.png': workInstruction.src,
      'pcoTile.png': pcoTile.src,
      'pcoGraph.png': pcoGraph.src,
    };

    return imageMap[imageIcon] || imageIcon; 
  };

const breakStart = async () => {
  
  try {
    const currentDate = new Date();
    const indianTime = new Date(currentDate.getTime() + (5.5 * 60 * 60 * 1000)); 
    const payloadd = {
      
      "siteId": site,
      "shiftId":null,
      "shiftCreatedDateTime":  null,
      "shiftBreakCreatedDateTime": null,
      "workcenterId": null,
      "resourceId": filterFormData?.defaultResource,
      "itemId": "",
      "operationId": filterFormData?.defaultOperation,
      "logMessage": 'BREAK_START',
      "logEvent":"SCHEDULED_DOWN",
      "reason":'BREAK_START',
      "rootCause":'BREAK_START',
      "commentUsr":cookies?.rl_user_id,
      "createdDateTime": indianTime.toISOString().replace(/\.\d+Z$/, ''),
      "modifiedDateTime": indianTime.toISOString().replace(/\.\d+Z$/, ''),
      "active":  0,
    };
    const payload: any = {
      "site": site,
      "userId": cookies.rl_user_id,
      "resource": filterFormData?.defaultResource,
      "workCenter": null,
      "defaultOperation": filterFormData?.defaultOperation,
      "reasonCode": 'BREAK_START',
      "comments": "BREAK_START",
      "dateTime": indianTime.toISOString().replace(/\.\d+Z$/, ''),
      "setUpState": "Scheduled Down"
  }

    await updateResourceStatuOee(payloadd);
    const response = await updateResourceStatus(payload);
if (response?.message_details?.msg_type !== 'S') {
  message.error(response?.message_details?.msg || 'Failed to start break');
}
else {  
notification.success({
  message: response?.message_details?.msg || 'Break started successfully',
  placement: 'topLeft'
});
  setIsBreak(true);
    setCall(call + 1);
    setCall1(call1 + 1);
}

  } catch (error) {
    console.error('Error starting break:', error);
    message.error('Failed to start break');
  }
};

const breakEnd = async () => {
  try {
    const currentDate = new Date();
    const indianTime = new Date(currentDate.getTime() + (5.5 * 60 * 60 * 1000)); 
    const payloadd = {
      
      "siteId": site,
      "shiftId":null,
      "shiftCreatedDateTime":  null,
      "shiftBreakCreatedDateTime": null,
      "workcenterId": null,
      "resourceId": filterFormData?.defaultResource,
      "itemId": "",
      "operationId": filterFormData?.defaultOperation,
      "logMessage": 'BREAK_STOP',
      "logEvent":"RELEASABLE",
      "reason":'BREAK_STOP',
      "rootCause":'BREAK_STOP',
      "commentUsr":cookies?.rl_user_id,
      "createdDateTime": indianTime.toISOString().replace(/\.\d+Z$/, ''),
      "modifiedDateTime": indianTime.toISOString().replace(/\.\d+Z$/, ''),
      "active":  1,
    };
    const payload: any = {
      "site": site,
      "userId": cookies.rl_user_id,
      "resource": filterFormData?.defaultResource,
      "workCenter": "",
      "defaultOperation": filterFormData?.defaultOperation,
      "reasonCode": 'BREAK_STOP',
      "comments": 'BREAK_STOP',
      "dateTime": indianTime.toISOString().replace(/\.\d+Z$/, ''),
      "setUpState": "Enabled"
  }

    await updateResourceStatuOee(payloadd);
       const response = await updateResourceStatus(payload);
if (response?.message_details?.msg_type !== 'S') {
  message.error(response?.message_details?.msg || 'Failed to start break');
}
else {  
  notification.success({
    message: response?.message_details?.msg || 'Break ended successfully',
    placement: 'topLeft'
  });
  setIsBreak(false);
    setCall(call + 1);
    setCall1(call1 + 1);
}
  } catch (error) {
    console.error('Error ending break:', error);
    message.error('Failed to end break');
  }

};
  console.log(resourceStatusBoolean,'resourceStatusBoolean')
  return (
    <PodContext.Provider value={{
      loading, setLoading,
      buttonId, list, setList, setButtonId, operationIdd, setOperationIdd, phaseIdd, setPhaseId, selectedRowDataCurrent, setSelectedRowCurrent,
      podCategoryType, workStation, setSelectedRowData, data, setData, isFullScreen, setIsFullScreen, erpShift, isEditing, setErpShift, setIsEditing, formData,
      setFormData, selectedRowData, call, setCall, filterFormData, setFilterFormData, tabOut, setTabOut, error, setError, phaseByDefault, setPhaseByDefault, call1, setCall1,
      batchNoTabOut, setBatchNoTabOut, activityId, setActivityId
    }}>
      <CommonAppBar
        color="#006568"
        logoHeader={site}
        appTitle={filterFormData?.description || 'Pod App'}
        onSiteChange={handleSiteChange} onSearchChange={function (): void {
        }} />
{filterFormData?.description === '' ? (
  <NoWorkStation />
):
(
  
  <div className={styles.container}>
  <div className={`${styles.tableContainer} ${isFullScreen ? styles.fullScreenFirst : styles.halfScreen} ${isEditing ? styles.shrink : ''}`}>
    <FilterCommonBar />
    <div style={{ paddingLeft: '20px', marginBottom: '10px' }}>
      {showError && error && (
        <Tooltip
        // title={error}
        >
          <div style={{
            ...messageStyle,
            padding: '5px',
            marginTop: '5px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative' // Add this to position the button absolutely within this container
          }}>
            {icon}
            <span style={{ marginLeft: '10px' }}>{error}</span> {/* Added margin to separate icon from the text */}
            <Button
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: errorStatus === 'fail' ? 'red' : 'inherit'
              }}
              size="small"
              icon={<IoMdClose size={20} style={{ color: errorStatus === 'fail' ? 'red' : 'inherit' }} />}
              onClick={() => setShowError(false)}
            />
          </div>
        </Tooltip>
      )}
    </div>
    <div style={{
      padding: "0px 20px",
      display: 'flex',
      maxWidth: '100%',
      overflow: 'hidden',
      flexDirection: menuPosition.toLowerCase() === 'right' ? 'row-reverse' : 'row'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: isMenuOpen ? '200px' : '40px',
        flexShrink: 0,
        paddingRight: menuPosition.toLowerCase() === 'right' ? '0' : '10px',
        paddingLeft: menuPosition.toLowerCase() === 'right' ? '10px' : '0',
        transition: 'width 0.3s ease',
        height: '100%',
      }}>
        <Tooltip title={isMenuOpen ? "Close Menu" : "Open Menu"}
          placement={menuPosition.toLowerCase() === 'right' ? "left" : "right"}>
          <Button
            type="default"
            icon={isMenuOpen ? <AiOutlineMenuFold size={20} /> : <AiOutlineMenuUnfold size={20} />}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              marginBottom: '8px',
              marginLeft: '6px',
              color: 'white',
              width: '30px',
              height: '30px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '24px',
              background: 'linear-gradient(45deg, rgb(0,101,104), rgb(0,131,134))'
            }}
          />
        </Tooltip>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          height: 'calc(100vh - 100px)',
          position: 'relative',
        }}>
          <div style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            paddingRight: '10px',
            marginRight: '-15px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
            msOverflowStyle: '-ms-autohiding-scrollbar'
          }}>
            {filterFormData?.buttonList
              ?.filter(button => !button.activityList?.some(activity => activity.url === "/rits/workListPanel"))
              ?.map((button) => {
                const iconElement = !isMenuOpen ? (
                  button.imageIcon ? (
                    <img
                      src={getImageSource(button.imageIcon)}
                      alt={button.buttonLabel}
                      style={{
                        width: '35px',
                        height: '35px',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '35px',
                      height: '35px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#006568',
                      color: 'white',
                      borderRadius: '50%',
                      fontSize: '16px'
                    }}>
                      {button.buttonLabel.charAt(0) + button.buttonLabel.charAt(1)}
                    </div>
                  )
                ) : null;

                return (
                  <Tooltip
                    key={button.buttonId}
                    title={!isMenuOpen ? button.buttonLabel : ''}
                    placement={menuPosition.toLowerCase() === 'right' ? "left" : "right"}
                  >
                    <Button
                      type="default"
                      // disabled={isBreak}
                      onClick={() => addContainer(
                        button.activityList[0]?.type,
                        button.buttonLabel,
                        button.buttonLabel,
                        button.activityList[0]?.pluginLocation,
                        button.buttonId,
                        button.activityList[0]?.url
                      )}
                      style={{
                        marginBottom: '8px',
                        width: isMenuOpen ? '180px' : '40px',
                        height: '40px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMenuOpen ?
                          (menuPosition.toLowerCase() === 'right' ? 'flex-end' : 'flex-start') :
                          'center',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        backgroundColor: isMenuOpen ? '#e6f7ff' : 'transparent',
                        border: isMenuOpen ? (button.imageIcon ? '1px solid #91d5ff' : 'none') : (button.imageIcon ? '1px solid #d9d9d9' : 'none'),
                      }}
                      onMouseEnter={(e) => {
                        if (isMenuOpen && button.imageIcon) {
                          e.currentTarget.style.backgroundColor = '#bae7ff';
                          e.currentTarget.style.borderColor = '#69c0ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isMenuOpen && button.imageIcon) {
                          e.currentTarget.style.backgroundColor = '#e6f7ff';
                          e.currentTarget.style.borderColor = '#91d5ff';
                        }
                      }}
                    >
                      {menuPosition.toLowerCase() === 'right' && isMenuOpen && (
                        <span style={{
                          opacity: isMenuOpen ? 1 : 0,
                          width: isMenuOpen ? 'auto' : 0,
                          transition: 'all 0.3s ease',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          marginRight: '8px'
                        }}>
                          {button.buttonLabel}
                        </span>
                      )}
                      {iconElement && (
                        <span style={{
                          marginRight: isMenuOpen && menuPosition.toLowerCase() === 'left' ? '8px' : '0',
                          marginLeft: isMenuOpen && menuPosition.toLowerCase() === 'right' ? '8px' : '0',
                          flexShrink: 0
                        }}>
                          {iconElement}
                        </span>
                      )}
                      {menuPosition.toLowerCase() === 'left' && isMenuOpen && (
                        <span style={{
                          opacity: isMenuOpen ? 1 : 0,
                          width: isMenuOpen ? 'auto' : 0,
                          transition: 'all 0.3s ease',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden'
                        }}>
                          {button.buttonLabel}
                        </span>
                      )}
                    </Button>
                  </Tooltip>
                );
              })}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        minWidth: 0,
        overflow: 'auto'
      }}>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            // backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e8e8e8'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <h4 style={{ 
                margin: 0,
                fontSize: '14px',
                color: '#124561'
              }}>{t('workListPanel')}</h4>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <Tooltip title="Refresh">
                  <span 
                    onClick={handleRefresh}
                    style={{ 
                      cursor: 'pointer',
                      color: '#124561',
                      fontSize: '12px'
                    }}
                  >
                    <ReloadOutlined />
                  </span>
                </Tooltip>
                <Tooltip title="Clear">
                  <span
                    onClick={handleClear}
                    style={{
                      cursor: 'pointer', 
                      color: '#124561',
                      fontSize: '12px'
                    }}
                  >
                    <ClearOutlined />
                  </span>
                </Tooltip>
                <Tooltip title="Info">
                  <span
                    style={{
                      cursor: 'pointer', 
                      color: '#124561',
                      fontSize: '12px'
                    }}
                  >
                    <InstructionModal isButton={true} title='POD'>
                      <PodManual />
                    </InstructionModal>
                  </span>
                </Tooltip>
              </div>
              
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Popconfirm
                title={isBreak ? "Are you sure you want to stop break?" : "Are you sure you want to start break?"}
                onConfirm={() => {
                  if (!isBreak) {
                    breakStart();
                  } else {
                    breakEnd();
                  }
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  style={{
                    backgroundColor: isBreak ? '#ff4d4f' : '#389e0d',
                    color: '#ffffff',
                    minWidth: '120px',
                    height: '25px',
                    borderRadius: '14px',
                    border: 'none',
                    boxShadow: '0 2px 0 rgba(0,0,0,0.045)',
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  
                  }}
                >
                  {isBreak ? (
                    <>
                      <AiOutlineCloseCircle style={{verticalAlign: 'middle'}} />
                      <span style={{verticalAlign: 'middle', marginLeft: '4px'}}>Break Stop</span>
                    </>
                  ) : (
                    <>
                      <AiOutlineCheckCircle style={{verticalAlign: 'middle'}} />
                      <span style={{verticalAlign: 'middle', marginLeft: '4px'}}>Break Start</span>
                    </>
                  )}
                </Button>
              </Popconfirm>
              </div>
              <span style={{color: '#8c8c8c'}}>Resource Status:</span>
              <span style={{
                color: resourceStatus?.toLowerCase() === 'enabled' ? '#52c41a' : 'red', 
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {resourceStatus?.toLowerCase() === 'enabled' ? (
                  <AiOutlineCheckCircle style={{ color: '#52c41a' }} />
                ) : (
                  <AiOutlineCloseCircle style={{ color: 'red' }} />
                )}
                {resourceStatus || 'Not Available'}
              </span>
            </div>
          </div>
        </div>
        <ContainerComponent
          allBtn={filterFormData.buttonList}
          call2={call2}
          setCall2={setCall2}
          containers={containers}
          onRemoveContainer={removeContainer}
          selectedContainer={selectedContainer}
          setSelectedContainer={setSelectedContainer}
          onCloseModal={() => setSelectedContainer(null)}
        />
      </div>
    </div>
  </div>
</div>
)}
    </PodContext.Provider>
  );
};

export default PodApp;