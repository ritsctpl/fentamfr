'use client'
import CommonAppBar from '@components/CommonAppBar'
import { Select, Spin } from 'antd'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from '@modules/machineMonitor/style/MachineMonitoring.module.css'
import { MachineMonitorUseContext } from '../hooks/MachineMonitorUseContext'
import { useTranslation } from 'react-i18next'
import { parseCookies } from 'nookies'
import { fetchAllWorkCenter, retrieveWorkCenter } from '@services/oeeServices'
import { retrieveActivity } from '@services/activityService'
import AreaChart from './AreaChart'
import { TbActivityHeartbeat, TbAlertTriangle } from 'react-icons/tb'
import { FaArrowRight } from 'react-icons/fa'

const MAX_HISTORY = 5;

const generateRandomValue = (min: number, max: number) => {
  return (Math.random() * (max - min) + min).toFixed(1);
};

const MachineMonitorMain = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({})
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [workCenterOptions, setWorkCenterOptions] = useState<any[]>([]);
  const { Option } = Select;

  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [hasSetDefault, setHasSetDefault] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const [filteredCards, setFilterCards] = useState<any[]>([]);
  // const [filteredCards, setFilterCards] = useState<any[]>([
  //   {
  //     id: 1,
  //     resource: 'MULTI_CHANNEL_COUNTING_L2_PRET_0036',
  //     tags: [
  //       { name: 'temperature', value: '28.5°C' },
  //       { name: 'pressure', value: '3.2 bar' },
  //       { name: 'machine_status', value: '1' },
  //       { name: 'count', value: '52' },
  //       { name: 'humidity', value: '45%' },
  //       { name: 'vibration', value: '0.02 g' },
  //       { name: 'temperature', value: '28.5°C' },
  //       { name: 'pressure', value: '3.2 bar' },
  //       { name: 'machine_status', value: '1' },
  //       { name: 'count', value: '52' },
  //     ]
  //   },
  //   {
  //     id: 2,
  //     resource: 'CAPPING_L2_PRET_0044',
  //     tags: [
  //       { name: 'temperature', value: '26.7°C' },
  //       { name: 'pressure', value: '2.8 bar' },
  //       { name: 'machine_status', value: '0' },
  //       { name: 'count', value: '32' },
  //       { name: 'humidity', value: '50%' },
  //       { name: 'vibration', value: '0.03 g' }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     resource: 'INDUCTION_SEALING_L2_PRET_0048',
  //     tags: [
  //       { name: 'temperature', value: '24.3°C' },
  //       { name: 'pressure', value: '2.1 bar' },
  //       { name: 'machine_status', value: '1' },
  //       { name: 'count', value: '45' },
  //       { name: 'humidity', value: '48%' },
  //       { name: 'vibration', value: '0.01 g' }
  //     ]
  //   },
  //   {
  //     id: 4,
  //     resource: 'CAP_RETORQUE_L2_PRET_0050',
  //     tags: [
  //       { name: 'temperature', value: '27.9°C' },
  //       { name: 'pressure', value: '2.9 bar' },
  //       { name: 'machine_status', value: '1' },
  //       { name: 'count', value: '84' },
  //       { name: 'humidity', value: '47%' },
  //       { name: 'vibration', value: '0.04 g' }
  //     ]
  //   },
  //   {
  //     id: 5,
  //     resource: 'BOTTLE_UNSCRAMBLER_L1_PRET_0034',
  //     tags: [
  //       { name: 'temperature', value: '23.1°C' },
  //       { name: 'pressure', value: '1.8 bar' },
  //       { name: 'machine_status', value: '0' },
  //       { name: 'count', value: '65' },
  //       { name: 'humidity', value: '49%' },
  //       { name: 'vibration', value: '0.05 g' }
  //     ]
  //   },
  //   // {
  //   //   id: 6,
  //   //   resource: 'TABLET_LABELLING_L2_PRET_0052',
  //   //   tags: [
  //   //     { name: 'temperature', value: '29.4°C' },
  //   //     { name: 'pressure', value: '3.5 bar' },
  //   //     { name: 'machine_status', value: '1' },
  //   //     { name: 'count', value: '24' },
  //   //     { name: 'humidity', value: '46%' },
  //   //     { name: 'vibration', value: '0.02 g' }
  //   //   ]
  //   // },
  //   // {
  //   //   id: 7,
  //   //   resource: 'CASE_PACKER_L2_PRET_0054',
  //   //   tags: [
  //   //     { name: 'temperature', value: '25.8°C' },
  //   //     { name: 'pressure', value: '2.4 bar' },
  //   //     { name: 'machine_status', value: '0' },
  //   //     { name: 'count', value: '68' },
  //   //     { name: 'humidity', value: '51%' },
  //   //     { name: 'vibration', value: '0.03 g' }
  //   //   ]
  //   // },
  //   // {
  //   //   id: 8,
  //   //   resource: 'CASE_PACKER_L2_PRET_0058',
  //   //   tags: [
  //   //     { name: 'temperature', value: '25.8°C' },
  //   //     { name: 'pressure', value: '2.4 bar' },
  //   //     { name: 'machine_status', value: '0' },
  //   //     { name: 'count', value: '68' },
  //   //     { name: 'humidity', value: '51%' },
  //   //     { name: 'vibration', value: '0.03 g' }
  //   //   ]
  //   // },
  //   // {
  //   //   id: 9,
  //   //   resource: 'CASE_PACKER_L2_PRET_0059',
  //   //   tags: [
  //   //     { name: 'temperature', value: '25.8°C' },
  //   //     { name: 'pressure', value: '2.4 bar' },
  //   //     { name: 'machine_status', value: '0' },
  //   //     { name: 'count', value: '68' },
  //   //     { name: 'humidity', value: '51%' },
  //   //     { name: 'vibration', value: '0.03 g' }
  //   //   ]
  //   // },
  //   // {
  //   //   id: 10,
  //   //   resource: 'CASE_PACKER_L2_PRET_0054',
  //   //   tags: [
  //   //     { name: 'temperature', value: '25.8°C' },
  //   //     { name: 'pressure', value: '2.4 bar' },
  //   //     { name: 'machine_status', value: '0' },
  //   //     { name: 'count', value: '68' },
  //   //     { name: 'humidity', value: '51%' },
  //   //     { name: 'vibration', value: '0.03 g' }
  //   //   ]
  //   // },
  // ]);

  const [username, setUsername] = useState<string | null>(null);

  const parseValue = (value: any): number => {
    // Remove quotes if present
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    // Handle boolean values
    if (value === 'true' || value === true) return 1;
    if (value === 'false' || value === false) return 0;

    // Handle numeric values
    const numValue = Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };

  const getCurrentValue = (stationId: string, resourceName: string, data: any): number => {
    const station = data.find(s => s.station === stationId);
    if (!station) return 0;

    const resource = station.resources.find(r => r.name === resourceName);
    if (!resource) return 0;

    return parseValue(resource.value);
  };

  const updateChartData = useCallback((newValues: Record<string, number>) => {
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 500) return;
    lastUpdateTimeRef.current = now;

    // Validate newValues
    if (!newValues || Object.keys(newValues).length === 0) {
      console.log('No valid values to update chart');
      return;
    }

    const currentTime = new Date().toLocaleTimeString();

    setChartData(prevData => {
      // Ensure we have valid previous data
      const validPrevData = Array.isArray(prevData) ? prevData : [];

      // Create new point with all selected resources
      const newPoint = {
        date: currentTime,
        ...Object.fromEntries(
          Object.entries(newValues).map(([key, value]) => [
            key,
            typeof value === 'number' && !isNaN(value) ? Number(value.toFixed(2)) : 0
          ])
        )
      };

      // If no previous data, start with new point
      if (validPrevData.length === 0) return [newPoint];

      // Add new point and maintain history limit
      const newData = [...validPrevData, newPoint].slice(-MAX_HISTORY);

      // Ensure all points have all selected resources
      return newData.map(point => ({
        ...point,
        ...Object.fromEntries(
          selectedResources.map(resource => [
            resource,
            point[resource] !== undefined && !isNaN(point[resource]) ? point[resource] : 0
          ])
        )
      }));
    });
  }, [selectedResources]); // Add selectedResources as dependency

  // Modify the initial useEffect to handle first load better
  useEffect(() => {
    const getWorkCenter = async () => {
      try {
        const cookies = parseCookies();
        const site = cookies?.site || '';
        let getAllWorkCenter = await fetchAllWorkCenter(site, "");

        if (!getAllWorkCenter || getAllWorkCenter?.errorCode) {
          console.error("Error fetching work centers", getAllWorkCenter?.errorCode);
          return;
        }

        // Filter work centers where workCenterCategory is 'Line'
        const lineWorkCenters = getAllWorkCenter?.filter(item => item?.workCenterCategory === 'Line') || [];
        // Map filtered work centers to required format
        const mappedWorkCenters = lineWorkCenters?.map(item => ({
          label: item?.workCenter,
          value: item?.workCenter
        })) || [];

        setWorkCenterOptions(mappedWorkCenters);

        // Set first work center as default if available
        if (mappedWorkCenters && mappedWorkCenters.length > 0 && !hasSetDefault) {
          const firstWorkCenter = mappedWorkCenters[0].value;
          setSelectedWorkCenter([firstWorkCenter]);
          setHasSetDefault(true);

          // Call handleSelectChange with proper error handling
          await handleSelectChange(firstWorkCenter);
        }

        // Setup WebSocket connection if available
        try {
          const activityId = "MACHINE_MONITOR";
          const activities = await retrieveActivity(site, activityId, site);

          if (!activities?.activityRules?.[0]?.setting) {
            console.error("No WebSocket URL found in activity rules");
            return;
          }

          const activityRuleUrl = activities.activityRules[0].setting;

          // Close existing connection if it exists
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }

          // Create new WebSocket connection
          const ws = new WebSocket(activityRuleUrl);
          wsRef.current = ws;

          // Connection event handlers
          ws.onopen = () => {
            console.log('WebSocket connection established');
          };

          ws.onmessage = (event) => {
            try {
              const message = event?.data;
              if (!message) return;

              const parsedData = JSON.parse(message);
              console.log(parsedData, 'parsedData');
              setFilterCards(parsedData || []);

              // If no resources are selected yet, select count by default
              if (selectedResources.length === 0 && selectedCard) {
                const associateId = currentItem?.associationList?.find(
                  item => item?.sequence === selectedCard
                )?.associateId;

                const selectedCardData = associateId ? parsedData?.find(
                  card => card?.resource === associateId
                ) : null;

                if (selectedCardData?.tags) {
                  const countTag = selectedCardData.tags.find(tag => tag?.name === 'count');
                  if (countTag) {
                    console.log('Setting count as default resource'); // Debug log
                    setSelectedResources(['count']);

                    // Initialize chart data with count value
                    const initialValues: Record<string, number> = {};
                    let value = countTag.value;
                    if (typeof value === 'string') {
                      value = value.replace(/[^0-9.-]+/g, '');
                    }
                    const numericValue = parseFloat(value) || 0;
                    initialValues['count'] = numericValue;

                    if (Object.keys(initialValues).length > 0) {
                      updateChartData(initialValues);
                    }
                  }
                }
              }

              // Update chart data if we have a selected card and resources
              if (selectedCard && selectedResources?.length > 0 && currentItem) {
                const associateId = currentItem?.associationList?.find(
                  item => item?.sequence === selectedCard
                )?.associateId;

                const selectedCardData = associateId ? parsedData?.find(
                  card => card?.resource === associateId
                ) : null;

                if (selectedCardData?.tags) {
                  const newValues: Record<string, number> = {};

                  // Update all selected resources
                  selectedResources.forEach(resourceName => {
                    const resourceData = selectedCardData.tags.find(
                      (tag) => tag?.name === resourceName
                    );

                    if (resourceData?.value !== undefined) {
                      let value = resourceData.value;
                      // Clean numeric value
                      if (typeof value === 'string') {
                        value = value.replace(/[^0-9.-]+/g, '');
                      }
                      const numericValue = parseFloat(value);
                      if (!isNaN(numericValue)) {
                        newValues[resourceName] = numericValue;
                      }
                    }
                  });

                  // Only update if we have valid values for any selected resource
                  if (Object.keys(newValues).length > 0) {
                    updateChartData(newValues);
                  }
                }
              }
            } catch (error) {
              console.error('Error processing WebSocket message:', error);
            }
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
          };

          ws.onclose = (event) => {
            console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          };

        } catch (error) {
          console.error("Error setting up WebSocket:", error);
        }
      } catch (error) {
        console.error("Error in getWorkCenter:", error);
      }
    };

    getWorkCenter();

    // Cleanup WebSocket connection when component unmounts or dependencies change
    return () => {
      if (wsRef.current) {
        console.log('Closing WebSocket connection due to dependency change');
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [updateChartData]);

  // Update the interval effect to handle live data updates

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setFilterCards(prevCards => (prevCards || []).map(card => ({
  //       ...card,
  //       tags: (card?.tags || []).map(tag => {
  //         if (tag?.name === 'count') {
  //           return { ...tag, value: Math.floor(Math.random() * 80 + 20).toString() };
  //         }
  //         if (tag?.name === 'machine_status') {
  //           return {
  //             ...tag,
  //             value: Math.random() > 0.7 ?
  //               (tag?.value === '1' ? '0' : '1') :
  //               tag?.value
  //           };
  //         }
  //         if (tag?.name === 'temperature') {
  //           return { ...tag, value: `${generateRandomValue(20, 35)}°C` };
  //         }
  //         if (tag?.name === 'pressure') {
  //           return { ...tag, value: `${generateRandomValue(1.5, 4.0)} bar` };
  //         }
  //         return tag;
  //       })
  //     })));

  //     // Update chart data for all selected resources with null checks
  //     if (selectedCard && selectedResources?.length > 0) {
  //       const associateId = currentItem?.associationList?.find(
  //         item => item?.sequence === selectedCard
  //       )?.associateId;

  //       const selectedCardData = associateId ? filteredCards?.find(
  //         card => card?.resource === associateId
  //       ) : null;

  //       if (selectedCardData?.tags) {
  //         const newValues: Record<string, number> = {};

  //         selectedResources.forEach(resourceName => {
  //           const resourceData = selectedCardData.tags.find(
  //             (tag: any) => tag?.name === resourceName
  //           );

  //           if (resourceData?.value !== undefined) {
  //             // Extract numeric value from the string (e.g., "26.7°C" -> 26.7)
  //             let value = resourceData.value;
  //             // Remove any non-numeric characters except for decimal points and negative signs
  //             if (typeof value === 'string') {
  //               value = value.replace(/[^0-9.-]+/g, '');
  //             }
  //             const numericValue = parseFloat(value) || 0;
  //             newValues[resourceName] = numericValue;
  //           }
  //         });

  //         if (Object.keys(newValues).length > 0) {
  //           updateChartData(newValues);
  //         }
  //       }
  //     } else if (selectedResources?.length === 0 && chartData.length > 0) {
  //       // If no resources are selected but chart data exists, clear it
  //       setChartData([]);
  //     }
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [selectedCard, selectedResources, currentItem, filteredCards, updateChartData, chartData]);

  // Add this useEffect to ensure the default load screen is shown
  useEffect(() => {
    if (currentItem?.associationList && currentItem.associationList.length > 0 && !selectedCard) {
      const firstCard = currentItem.associationList[0];
      setSelectedCard(firstCard?.sequence || null);
      setIsExpanded(true);

      // Get matching card from filteredCards to set initial resources
      const matchingCard = filteredCards?.find(
        (filtered) => filtered?.resource === firstCard?.associateId
      );

      if (matchingCard?.tags && matchingCard.tags.length > 0) {
        // Find first available resource that isn't machine_status
        const firstResource = matchingCard.tags.find(tag =>
          tag?.name !== 'machine_status' && isNumericValue(tag?.value || '')
        );

        if (firstResource) {
          setSelectedResources([firstResource.name]);

          // Initialize chart data with the selected resource value
          const initialValues: Record<string, number> = {};
          let value = firstResource.value;
          if (typeof value === 'string') {
            value = value.replace(/[^0-9.-]+/g, '');
          }
          const numericValue = parseFloat(value) || 0;
          initialValues[firstResource.name] = numericValue;

          if (Object.keys(initialValues).length > 0) {
            const currentTime = new Date().toLocaleTimeString();
            updateChartData(initialValues);
          }
        }
      }
    }
  }, [currentItem, filteredCards, selectedCard, updateChartData]);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    if (selectedCard && filteredCards.length > 0 && selectedResources.length === 0) {
      const associateId = currentItem?.associationList?.find(
        item => item?.sequence === selectedCard
      )?.associateId;

      const selectedCardData = associateId ? filteredCards?.find(
        card => card?.resource === associateId
      ) : null;

      if (selectedCardData?.tags) {
        const countTag = selectedCardData.tags.find(tag => tag?.name === 'count');
        if (countTag) {
          console.log('Setting count as default resource from useEffect'); // Debug log
          setSelectedResources(['count']);

          // Initialize chart data with count value
          const initialValues: Record<string, number> = {};
          let value = countTag.value;
          if (typeof value === 'string') {
            value = value.replace(/[^0-9.-]+/g, '');
          }
          const numericValue = parseFloat(value) || 0;
          initialValues['count'] = numericValue;

          if (Object.keys(initialValues).length > 0) {
            updateChartData(initialValues);
          }
        }
      }
    }
  }, [selectedCard, filteredCards, currentItem, selectedResources, updateChartData]);

  const handleSiteChange = (newSite: string) => {
    // console.log(newSite, 'new site')
  };

  const defaultResources = [
    { name: 'count', value: '-' },
    { name: 'machine_status', value: '-' },
  ];

  const isMachineRunning = (value: any): boolean => {
    if (value === undefined || value === null) return false;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return Math.abs(numValue - 1) < 0.001; // Compare with small epsilon for floating point
  };

  const isBooleanValue = (value: any): boolean => {
    if (typeof value === 'boolean') return true;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      return lowerValue === 'true' || lowerValue === 'false';
    }
    return false;
  };

  const getBooleanValue = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false;
  };

  const renderResourcesList = (resources: any[]) => {
    if (!resources || resources.length === 0) {
      return (
        <div className={styles.resourcesList}>
          {defaultResources.map((defaultResource, index) => (
            <div key={index} className={styles.resourceItem}>
              <span className={styles.resourceName}><TbAlertTriangle style={{ position: 'relative', top: '2px' }} /> {defaultResource?.name || ''}: </span>
              <span className={`${styles.resourceValue} ${styles.statusOff}`}><TbAlertTriangle style={{ position: 'relative', top: '2px' }} /> OFF</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={styles.resourcesList}>
        {defaultResources.map((defaultResource, index) => {
          const matchingResource = resources.find(r => r?.name === defaultResource?.name);
          const value = matchingResource?.value !== undefined ? matchingResource.value : '-';
          const isBoolean = isBooleanValue(value);
          const boolValue = isBoolean ? getBooleanValue(value) : null;

          if (defaultResource?.name === 'machine_status') {
            const isRunning = isMachineRunning(value);
            const statusValue = isRunning ? 'RUNNING' : 'OFF';
            const statusIcon = isRunning ?
              <TbActivityHeartbeat style={{ position: 'relative', top: '2px', paddingRight: '5px' }} /> :
              <TbAlertTriangle style={{ position: 'relative', top: '2px', paddingRight: '5px' }} />;
            const statusClass = isRunning ? styles.statusRunning : styles.statusOff;
            return (
              <div key={index} className={styles.resourceItem}>
                <span className={styles.resourceName}>{defaultResource?.name || ''}: </span>
                <span className={`${styles.resourceValue} ${statusClass}`}>{statusIcon} {statusValue}</span>
              </div>
            );
          }

          return (
            <div key={index} className={styles.resourceItem}>
              <span className={styles.resourceName}>{defaultResource?.name || ''}: </span>
              {isBoolean ? (
                <span className={`${styles.resourceValue} ${boolValue ? styles.statusRunning : styles.statusOff}`}>
                  {boolValue ?
                    <>TRUE</> :
                    <>FALSE</>
                  }
                </span>
              ) : (
                <span className={styles.resourceValue}>{value}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Add this helper function near your other functions
  const isNumericValue = (value: string): boolean => {
    if (!value) return false;
    // Remove common units and special characters
    const cleanValue = value.replace(/°C|bar|%|A|V|mm\/s|RPM|\s+/g, '');
    return !isNaN(parseFloat(cleanValue));
  };

  const getCleanNumericValue = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/°C|bar|%|A|V|mm\/s|RPM|\s+/g, '');
    return parseFloat(cleanValue) || 0;
  };

  const handleChartTypeChange = (value: 'line' | 'bar' | 'area') => {
    setChartType(value);
  };

  // const getChartOptions = (data: any, resource: string) => {
  //   const baseOptions = {
  //     title: {
  //       text: `${resource.charAt(0).toUpperCase() + resource.slice(1)} Monitoring`,
  //       textStyle: {
  //         color: '#ffffff'
  //       },
  //       left: 'center',
  //       color: 'white'
  //     },
  //     tooltip: {
  //       trigger: 'axis'
  //     },
  //     xAxis: {
  //       type: 'category',
  //       data: ['Current']
  //     },
  //     yAxis: {
  //       type: 'value'
  //     },
  //     series: [
  //       {
  //         data: [parseFloat(data?.value || 0)],
  //         type: chartType,
  //         smooth: true
  //       }
  //     ]
  //   };
  //   return baseOptions;
  // };

  const renderAllResourcesList = (resources: any[]) => {
    console.log('Current selected resources:', selectedResources); // Debug log
    return (
      <div className={styles.checkboxList}>
        {(resources || []).map((resource, index) => {
          const isBoolean = isBooleanValue(resource?.value);
          const boolValue = isBoolean ? getBooleanValue(resource?.value) : null;
          const isCount = resource?.name === 'count';

          return (
            <div
              key={index}
              className={`${styles.checkboxItem} ${(!isBoolean || isCount) && isNumericValue(resource?.value || '') ? styles.clickable : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedResources?.includes(resource?.name)}
                onChange={() => (!isBoolean || isCount) && isNumericValue(resource?.value || '') && handleResourceChange(resource?.name || '')}
                disabled={isBoolean && !isCount}
              />
              <div className={styles.checkboxLabel}>
                <span>{resource?.name || ''}</span>
                <span className={styles.checkboxValue}>
                  {resource?.name === 'machine_status' ? (
                    isMachineRunning(resource?.value) ?
                      <span className={styles.statusRunning}><TbActivityHeartbeat style={{ position: 'relative', top: '2px', color: '#08C792', paddingRight: '5px' }} /> RUNNING</span> :
                      <span className={styles.statusOff}><TbAlertTriangle style={{ position: 'relative', top: '2px', color: '#ff4d4f', paddingRight: '5px' }} /> OFF</span>
                  ) : isBoolean && !isCount ? (
                    <span className={boolValue ? styles.statusRunning : styles.statusOff}>
                      {boolValue ?
                        <>TRUE</> :
                        <>FALSE</>
                      }
                    </span>
                  ) : resource?.value == '"Unscheduled Down"' ? 'No Active Alarm' : resource?.value || ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleCardClick = (cardId: number) => {
    setSelectedCard(cardId);
    setIsExpanded(false);
    setChartData([]); // Reset chart data when selecting a new card
    setSelectedResources([]); // Reset selected resources

    // Auto-select the first available resource that isn't machine_status
    const associateId = currentItem?.associationList?.find(
      item => item?.sequence === cardId
    )?.associateId;

    const selectedCardData = associateId ? filteredCards?.find(
      card => card?.resource === associateId
    ) : null;

    if (selectedCardData?.tags && selectedCardData.tags.length > 0) {
      // Find first available resource that isn't machine_status
      const firstResource = selectedCardData.tags.find(tag =>
        tag?.name !== 'machine_status' && isNumericValue(tag?.value || '')
      );

      if (firstResource) {
        setSelectedResources([firstResource.name]);

        // Initialize chart data with the selected resource value
        const initialValues: Record<string, number> = {};
        let value = firstResource.value;
        if (typeof value === 'string') {
          value = value.replace(/[^0-9.-]+/g, '');
        }
        const numericValue = parseFloat(value) || 0;
        initialValues[firstResource.name] = numericValue;

        if (Object.keys(initialValues).length > 0) {
          const currentTime = new Date().toLocaleTimeString();
          updateChartData(initialValues);
        }
      }
    }

    setTimeout(() => setIsExpanded(true), 100);
  };

  const handleResourceChange = (resourceName: string) => {
    console.log('Resource change triggered:', resourceName); // Debug log
    setSelectedResources(prevResources => {
      let newResources;
      if (prevResources.includes(resourceName)) {
        // Remove resource if already selected
        newResources = prevResources.filter(r => r !== resourceName);
      } else {
        // Add new resource
        newResources = [...prevResources, resourceName];
      }
      console.log('New selected resources:', newResources); // Debug log

      // If we have a selected card, update chart data for the new selection
      if (selectedCard && newResources.length > 0) {
        const associateId = currentItem?.associationList?.find(
          item => item?.sequence === selectedCard
        )?.associateId;

        const selectedCardData = associateId ? filteredCards?.find(
          card => card?.resource === associateId
        ) : null;

        if (selectedCardData?.tags) {
          const newValues: Record<string, number> = {};
          newResources.forEach(resource => {
            const resourceData = selectedCardData.tags.find(
              tag => tag?.name === resource
            );
            if (resourceData?.value !== undefined) {
              let value = resourceData.value;
              if (typeof value === 'string') {
                value = value.replace(/[^0-9.-]+/g, '');
              }
              newValues[resource] = parseFloat(value) || 0;
            }
          });

          if (Object.keys(newValues).length > 0) {
            // Update chart with current values for all selected resources
            updateChartData(newValues);
          }
        }
      } else if (newResources.length === 0) {
        // Clear chart data if no resources selected
        setChartData([]);
      }

      return newResources;
    });
  };

  console.log(chartData, 'chartData');


  // useEffect(() => {
  //   if (selectedWorkCenter.length > 0) {
  //     handleSelectChange(selectedWorkCenter)
  //   }
  // }, [selectedWorkCenter])

  const handleSelectChange = async (selectedItems: string | string[]) => {
    setIsLoading(true);
    const itemsArray = Array.isArray(selectedItems) ? selectedItems : selectedItems;

    const cookies = parseCookies();
    const site = cookies?.site || '';

    // Reset all states if selection is cleared
    if (!itemsArray || itemsArray.length === 0) {
      setSelectedWorkCenter([]);
      setCurrentItem(null);
      setFilterCards([]);
      setSelectedCard(null);
      setSelectedResources([]);
      setChartData([]);
      setIsLoading(false);
      return;
    }

    // Reset states when changing work center
    setSelectedWorkCenter(Array.isArray(itemsArray) ? itemsArray : [itemsArray]);
    setSelectedCard(null);
    setSelectedResources([]);
    try {
      const responses = await retrieveWorkCenter(site, itemsArray);
      setCurrentItem(responses || null);

      // If no work center data is returned or associationList is empty, keep the UI in a "no data" state
      if (!responses || !responses.associationList || responses.associationList.length === 0) {
        console.log("No work center data available");
        setIsLoading(false);
        return;
      }

      // Auto-select first card when work center changes
      const firstCard = responses.associationList[0];
      if (firstCard) {
        setSelectedCard(firstCard?.sequence || null);
        setIsExpanded(true);
        // Get matching card from filteredCards to select resources automatically
        const matchingCard = filteredCards?.find(
          filtered => filtered?.resource === firstCard?.associateId
        );

        if (matchingCard?.tags && matchingCard.tags.length > 0) {
          // Find first available resource that isn't machine_status
          const firstResource = matchingCard.tags.find(tag =>
            tag?.name !== 'machine_status' && isNumericValue(tag?.value || '')
          );

          if (firstResource) {
            setSelectedResources([firstResource.name]);

            // Initialize chart data with the selected resource value
            const initialValues: Record<string, number> = {};
            let value = firstResource.value;
            if (typeof value === 'string') {
              value = value.replace(/[^0-9.-]+/g, '');
            }
            const numericValue = parseFloat(value) || 0;
            initialValues[firstResource.name] = numericValue;

            if (Object.keys(initialValues).length > 0) {
              const currentTime = new Date().toLocaleTimeString();
              updateChartData(initialValues);
            }
          }
        }
        else {
          setChartData([]);
        }
      }
    } catch (error) {
      console.error("Error retrieving work centers:", error);
      // Keep UI in a "no data" state on error
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  };

  // Add this useEffect to initialize chart data when selectedResources changes
  useEffect(() => {
    if (selectedCard && selectedResources?.length > 0) {
      console.log('call');

      const associateId = currentItem?.associationList?.find(
        item => item?.sequence === selectedCard
      )?.associateId;

      const selectedCardData = associateId ? filteredCards?.find(
        card => card?.resource === associateId
      ) : null;

      if (selectedCardData?.tags) {
        const initialValues: Record<string, number> = {};

        selectedResources.forEach(resourceName => {
          const resourceData = selectedCardData.tags.find(tag => tag?.name === resourceName);
          if (resourceData?.value !== undefined) {
            let value = resourceData.value;
            if (typeof value === 'string') {
              value = value.replace(/[^0-9.-]+/g, '');
            }
            const numericValue = parseFloat(value) || 0;
            initialValues[resourceName] = numericValue;
          }
        });

        if (Object.keys(initialValues).length > 0 && (!chartData || chartData.length === 0)) {
          const currentTime = new Date().toLocaleTimeString();
          updateChartData(initialValues);
        }
      }
    }
  }, [selectedCard, selectedResources, filteredCards, currentItem, chartData, updateChartData]);

  return (
    <MachineMonitorUseContext.Provider value={{ formData, setFormData }}>
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            onSearchChange={() => { }}
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("Machine Monitor")}
            onSiteChange={handleSiteChange}
          />
        </div>

        <div style={{ display: 'flex', height: '100%px', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#ffff', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Production Dashboard</span>
            <span style={{ backgroundColor: '#7cf877', color: '#000', padding: '4px 10px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: '600' }}>Live</span>
          </div>
          <Select
            style={{ width: 200 }}
            placeholder="Select Work Center"
            value={selectedWorkCenter}
            onChange={handleSelectChange}
            maxTagCount={1}
            allowClear
          >
            {workCenterOptions?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <Spin spinning={isLoading} tip="Loading...">
          {/* Check if we have work center data to show */}
          {(!currentItem?.associationList || currentItem.associationList.length === 0) ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>No machine data available</div>
              <div style={{ fontSize: '14px', color: '#999' }}>Please select a work center or check your connection</div>
            </div>
          ) : (
            <>
              {/* Always show the cards grid at the top */}
              {(() => {
                const cards = currentItem?.associationList || [];
                const chunkedCards = [];

                // Create chunks with max 8 cards per row
                for (let i = 0; i < cards.length; i += 8) {
                  chunkedCards.push(cards.slice(i, i + 8));
                }

                return (
                  <div className={styles.opcGrid}>
                    {chunkedCards.map((chunk, rowIndex) => (
                      <div key={`row-${rowIndex}`} style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-around',
                        marginBottom: '10px',
                        alignItems: 'center',
                        flexShrink: 0
                      }}>
                        {chunk.map((card: any, index: number) => {
                          const matchingCard = filteredCards.find(
                            (filtered) => filtered.resource === card.associateId
                          );
                          const machineStatusTag = matchingCard?.tags?.find(tag => tag.name === 'machine_status');
                          const isRunning = isMachineRunning(machineStatusTag?.value);
                          const count = matchingCard?.tags?.find(tag => tag.name === 'count')?.value || '0';

                          // Responsive width calculation
                          const minCardWidth = 120;
                          const cardContainerWidth = `${100 / Math.min(8, chunk.length)}%`;

                          return (
                            <React.Fragment key={card.sequence}>
                              <div style={{
                                width: cardContainerWidth,
                                minWidth: `${minCardWidth}px`,
                                maxWidth: '160px',
                                padding: '0 5px'
                              }}>
                                <div
                                  className={`${styles.statusCard} ${card.sequence === selectedCard ? styles.selected : ''}`}
                                  onClick={() => handleCardClick(card.sequence)}
                                  data-status={isRunning ? '1' : '0'}
                                  style={{ width: '100%' }}
                                >
                                  <div className={styles.cardHeader}>
                                    <span className={styles.title} style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card?.associateId}</span>
                                  </div>
                                  <div className={styles.cardContent} style={{ padding: '4px' }}>
                                    <div className={styles.statusValue} style={{ fontSize: '16px' }}>{count}</div>
                                    <div className={styles.machineStatus} data-status={isRunning ? '1' : '0'} style={{ fontSize: '12px' }}>
                                      {isRunning ? (
                                        <>
                                          <TbActivityHeartbeat style={{ position: 'relative', top: '2px', color: '#08C792', paddingRight: "5px" }} />
                                          <span className={styles.statusRunning}>RUNNING</span>
                                        </>
                                      ) : (
                                        <>
                                          <TbAlertTriangle style={{ position: 'relative', top: '2px', color: '#ff4d4f', paddingRight: "5px" }} />
                                          <span className={styles.statusOff}>OFF</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {index < chunk.length - 1 && (
                                <div className={styles.arrowContainer} style={{ width: '15px', padding: '0' }}>
                                  <span className={styles.arrow}><FaArrowRight size={8} /></span>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Always show the details section if there's a selected card */}
              {selectedCard && (
                <div className={styles.detailContainer}>
                  <div className={styles.detailContent}>
                    <div className={styles.detailLeft}>
                      <h3>
                        {currentItem?.associationList.find(card => card.sequence === selectedCard)?.associateId || 'Unknown Machine'}
                      </h3>
                      {currentItem?.associationList.map((card) => {
                        if (card.sequence === selectedCard) {
                          const matchingCard = filteredCards.find(
                            (filtered) => filtered.resource === card.associateId
                          );
                          return (
                            <div key={card.sequence}>
                              {renderAllResourcesList(matchingCard?.tags || [])}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <div className={styles.detailRight}>
                      {selectedResources.length > 0 && chartData && chartData.length > 0 ? (
                        <AreaChart
                          data={chartData}
                          title={`Machine Monitoring`}
                          color={{
                            threshold: [50, 85],
                            itemcolor: ['#ff4d4f', '#faad14', '#52c41a'],
                            linecolor: ['#1890ff', '#52c41a', '#ff4d4f', '#faad14', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']
                          }}
                          description={`Real-time monitoring of selected resources`}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          flexDirection: 'column',
                          color: '#666'
                        }}>
                          <div style={{ marginBottom: '10px' }}>No data to display</div>
                          <div style={{ fontSize: '14px', color: '#999' }}>Please select a resource to monitor</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Spin>
      </div>
    </MachineMonitorUseContext.Provider>
  );
}

export default MachineMonitorMain
