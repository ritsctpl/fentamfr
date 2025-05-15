import React, { useState, useRef, useEffect, useCallback } from "react";
import { Col, Row, Pagination, Button, Card, Dropdown, Menu, Spin } from "antd";
import { Content } from "antd/es/layout/layout";
import GaugeChart from "../oee/GaugeChart";
import { Box } from "@mui/material";
import styles from "./tileOee.module.css";
import { useFilterContext } from "@modules/oee_process/hooks/filterData";
import TileOee from "./TileOee";
import LiveOee from "./LiveOee1";
import { getOeeDetailByShift, getOeeDetailsByBatchNo, getOeeDetailsByMachineDataResourceId, getOeeDetailsByOperation, getOeeDetailsByPlant, getOeeDetailsByResourceId, getOeeDetailsByWorkCenterId, oeeTileData, retrieveActivity, retrieveWorkCenter } from "@services/oeeServices";
import { parseCookies } from "nookies";
import NotFound from "./NotFound";
import TimeByPeriod from "../reuse/TimeByPeriod";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import { useSearchParams } from "next/navigation";
import api from "@services/api";
const ITEMS_PER_PAGE = 12;

const LiveOeeWorkcenter: React.FC = () => {
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(Number(searchParams.get('seconds'))*1000 || 2000000000);
  const { 
    liveOeeData, 
    overallfilter, 
    selectedWorkCenter, 
    value, 
    setRefreshCount,
    currentItem, 
    setCurrentItem, 
    refreshCount, 
    setCompleteSrcList, 
    selectedWorkCenterForMachine, 
    setCompleteSrcListForMachine,
    trackApiCall,
    apiCallInProgress,
    machineToggle,
    setMachineToggle,
    refreshCountRef,
    setRefreshCountRef,
    showToggle,
    setShowToggle,
    completeSrcListRef,
    completeSrcListForMachineRef,
    completeSrcList
  } = useFilterContext();
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState<number>(5);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [historicalDataOpen, setHistoricalDataOpen] = useState<boolean>(false);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [tabName, setTabName] = useState<any>(sessionStorage.getItem('activeTabIndex'));
  const fetchedRef = useRef(false);
  const previousRefreshCount = useRef(refreshCount);
  const isMounted = useRef(true);

  // Add cache check for the current tab
  const currentTabRequest = useRef<{tabName: string, inProgress: boolean}>({
    tabName: '',
    inProgress: false
  });

  const handleClose = useCallback(() => {
    setHistoricalDataOpen(false);
  }, []);

  useEffect(() => {
     const fetchActitivty = async () => {
      
        try {
           const cookies = parseCookies();
           const site = cookies?.site;
           const activityIDFromUrl = searchParams.get('activityId');
          //  const activityId = "R_LIVE_DASH_APP";
          //  debugger
           const response = await retrieveActivity(site, activityIDFromUrl);
           if (!response?.errorCode) {
              let activityRule = response?.activityRules;
              activityRule = activityRule.filter(rule => rule?.ruleName?.toLowerCase()?.replaceAll(" ","").includes('machinedata'));
              let rule = activityRule?.[0]?.setting;
              rule = rule?.toLowerCase()?.replaceAll(" ","") == "true";
              setShowToggle(rule);
           }
        } catch (error) {
          console.error('Error retrieveing activity:', error);
        }
     };
    //  fetchActitivty();
    
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchOeeData = useCallback(async () => {
    // debugger
    if (loading || apiCallInProgress) return;
    // console.log("fetchOeeData fn called")
    // if(machineToggle){
    const cookies = parseCookies();
    const site = cookies.site;
    const activeTabIndex = sessionStorage.getItem('activeTabIndex');
    
    // Skip if we already have a request in progress for this tab
    if (currentTabRequest.current.tabName === activeTabIndex && 
        currentTabRequest.current.inProgress) {
      return;
    }
    
    // Mark this tab request as in progress
    currentTabRequest.current = {
      tabName: activeTabIndex || '',
      inProgress: true
    };
    
    setLoading(true);
    
    const isShift = activeTabIndex?.includes('shift') ? true : false;
    const isBatch = activeTabIndex?.includes('batch') ? true : false;
    const isWorkcenter = activeTabIndex?.includes('workcenter') ? true : false;
    const isResource = activeTabIndex?.includes('resource') ? true : false;
    const isPlant = activeTabIndex?.includes('plant') ? true : false;
    const isOperation = activeTabIndex?.includes('operation') ? true : false;
    const isMachine = activeTabIndex?.includes('machine') ? true : false;

    return trackApiCall(async () => {
      try {
        const request = { site: site, eventSource: machineToggle == true ? "MACHINE" : "MANUAL" };
        let response;
        
        if (isShift) {
          response = await getOeeDetailByShift(request);
        } else if (isBatch) {
          response = await getOeeDetailsByBatchNo(request);
        } else if (isPlant) {
          response = await getOeeDetailsByPlant(request);
        } else if (isWorkcenter) {
          response = await getOeeDetailsByWorkCenterId(request);
        } else if (isResource) {
          response = await getOeeDetailsByResourceId(request);
        } else if (isOperation) {
          response = await getOeeDetailsByOperation(request);
        } else if (isMachine) {
          response = await getOeeDetailsByMachineDataResourceId(request);
        } else {
          response = await oeeTileData(request);
        }
        
        // if(machineToggle == false){
          if (isMounted.current) {
            if (isResource && !response?.errorCode) {
              if (!selectedWorkCenter?.length) {
                setCurrentItem(response);
                await setCompleteSrcList(response);
                completeSrcListRef.current = response;
              } else {
                await setCompleteSrcList(response);
                completeSrcListRef.current = response;
              }

              try {
                const responses = await Promise.all(
                    selectedWorkCenter.map(async (item) => {
                        return await retrieveWorkCenter(site, item);
                    })
                );
        
                console.log("Complete SRC list: ", completeSrcListRef.current)
                if (Array.isArray(responses) && responses.length > 0) {
                    const allAssociationLists = responses.map(response => response?.associationList).flat();
                    const associateIds = allAssociationLists.map(item => item?.associateId);
                    
                    if (associateIds?.length && completeSrcListRef.current?.length) {
                        const filteredItems = completeSrcListRef.current.filter(item => 
                            associateIds?.some(id => id === item?.resource)
                        );
                        setCurrentItem(filteredItems);
                    }
                }
                // setRefreshCount(prev => prev + 1);
            } catch (error) {
                console.error("Error retrieving work centers:", error);
            }


            } else if (isMachine && !response?.errorCode) {
              if (!selectedWorkCenterForMachine?.length) {
                setCurrentItem(response);
                await setCompleteSrcListForMachine(response);
                completeSrcListForMachineRef.current = response;
              } else {
                await setCompleteSrcListForMachine(response);
                completeSrcListForMachineRef.current = response;
              }

              try {
                const responses = await Promise.all(
                    selectedWorkCenterForMachine.map(async (item) => {
                        return await retrieveWorkCenter(site, item);
                    })
                );
        
                if (Array.isArray(responses) && responses.length > 0) {
                    const allAssociationLists = responses.map(response => response?.associationList).flat();
                    const associateIds = allAssociationLists.map(item => item?.associateId);
                    
                    if (associateIds?.length && completeSrcListForMachineRef.current?.length) {
                        const filteredItems = completeSrcListForMachineRef.current.filter(item => 
                            associateIds?.some(id => id === item?.resource)
                        );
                        setCurrentItem(filteredItems);
                    }
                }
                // setRefreshCount(prev => prev + 1);
            } catch (error) {
                console.error("Error retrieving work centers:", error);
            }


            } 
            else {
              // console.log("others");
              if (isBatch) {
                try {
                  if (response?.data?.data != null && response?.data?.data != undefined && Array.isArray(response?.data?.data)) {
                    setCurrentItem(response?.data?.data);
                  }
                  else{
                    setCurrentItem([]);
                  }
                }
                catch (e) {
                  console.log("Error in setting current item", e);
                }
              }
              else {
                try {
                  setCurrentItem(Array.isArray(response) ? response : []);
                }
                catch (e) {
                  console.log("Error in setting current item", e);
                }
              }
            }
          }
        // } 
        // else {
        //   setCurrentItem([]);
        //   await setCompleteSrcList([]);
        //   await setCompleteSrcListForMachine([]);
        //   completeSrcListRef.current = [];
        //   completeSrcListForMachineRef.current = [];
        // }

      } catch (error) {
        console.error("Error fetching OEE data:", error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
          // Mark request as complete
          currentTabRequest.current.inProgress = false;
        }
      }
    });
  // }

  }, [refreshCountRef, loading, apiCallInProgress, selectedWorkCenter, selectedWorkCenterForMachine, setCompleteSrcList, setCompleteSrcListForMachine, setCurrentItem, trackApiCall]);

  useEffect(() => {
    const storedTabName = sessionStorage.getItem('activeTabIndex');
    if (storedTabName !== tabName) {
      setTabName(storedTabName);
    }
  }, [tabName]);

  const initialRenderComplete = useRef(false);
  
  useEffect(() => {
    // debugger
    if (!initialRenderComplete.current) {
      initialRenderComplete.current = true;
      return;
    }
    
    if (refreshCount !== previousRefreshCount.current || !fetchedRef.current) {
      fetchedRef.current = true;
      previousRefreshCount.current = refreshCount;
      fetchOeeData();
    }
  }, [refreshCount, fetchOeeData]);

  useEffect(() => {
    fetchOeeData();
  }, []);

  useEffect(() => {
    // debugger
    const urlSeconds = searchParams.get('seconds');
    
    // Only set up interval if seconds parameter exists in URL
    if (urlSeconds) {
      const intervalTime = Number(urlSeconds) * 1000; // Convert to milliseconds

      const intervalId = setInterval(() => {
        if (!loading && !apiCallInProgress) {
          fetchOeeData();
        }
      }, intervalTime);

      // Cleanup interval on component unmount
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [fetchOeeData, loading, apiCallInProgress, searchParams]);


  // write the code here

  const totalItems = liveOeeData.length;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <Content ref={contentRef} style={{ padding:"10px" }}>
      {historicalDataOpen && (
       <TimeByPeriod 
          workcenter={selectedItem?.workcenter} 
          historicalData={[historicalData]}
          onClose={handleClose}
     />
      )}
      <div className="site-layout-content">
        <div className={styles.tileWrapper}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width:'100%',
                height: "100vh",
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
           currentItem.length!==0? <Box className={styles.tileWrapper}>
              {currentItem?.map((item, index) => (
                <div key={index}>
                  <div
                    onClick={async () => {
                      const activeTabIndex = sessionStorage.getItem("activeTabIndex");
                      if (activeTabIndex?.includes("workcenter")) {
                        try{
                        const cookies = parseCookies();
                        const site = cookies.site;
                        const requestTimePeriodOee = {
                          site: site,
                          workcenterId: [item.workcenter],
                        };
                        const responseTimeByPeriod = await fetchEndpointsData(requestTimePeriodOee, 'oee-service', 'getOverallHistory');
                        setSelectedItem(item);
                        setHistoricalDataOpen(true);
                        setHistoricalData(responseTimeByPeriod?.metricData[0]);
                        }catch(error){
                          console.error("Error: ", error);
                        }
                      }
                    }}
                  >
                    {historicalDataOpen!==true&&<TileOee item={item} currentItem={currentItem} />}
                  </div>
                  {selectedItem && selectedItem.id === index && (
                    <LiveOee selectedItem={selectedItem} />
                  )}
                </div>
              ))}
            </Box>:<NotFound/>
          )}
        </div>

        {totalItems > ITEMS_PER_PAGE && !loading && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <Pagination
              current={currentPage}
              pageSize={ITEMS_PER_PAGE}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Content>
  );
};

export default React.memo(LiveOeeWorkcenter, (prevProps, nextProps) => {
  return true;
});
