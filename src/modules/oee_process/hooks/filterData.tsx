import { getOverallOEE, getQualityOEE, getPerformanceOEE, getAvailabilityOEE } from '@services/oeeServices';
import { message } from 'antd';
import { useSearchParams } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

interface FilterProps {
  availability: any;
  overallfilter: any;
  setFilter: (state: any) => void;
  liveOeeData: any;
  setLiveOeeData: (state: any) => void;
  theme: boolean;
  setTheme: (state: any) => void;
  overallOeeData: any;
  qualityOeeData: any;
  performanceOeeData: any;
  availabilityOeeData: any;
  threshold: any;
  color: any;
  value: any;
  setThreshold: (state: any) => void;
  setValue: (state: any) => void;
  handleApply: () => void;
  selectedWorkCenter: any;
  setSelectedWorkCenter: (state: any) => void;
  selectedWorkCenterForMachine: any;
  setSelectedWorkCenterForMachine: (state: any) => void;
  currentItem: any;
  setCurrentItem: (state: any) => void; 
  refreshCount: any;
  setRefreshCount: (state: any) => void;
  completeSrcList: any;
  setCompleteSrcList: (state: any) => void;
  completeSrcListForMachine: any;
  setCompleteSrcListForMachine: (state: any) => void;
  trackApiCall: (callback: () => Promise<any>) => Promise<any>;
  apiCallInProgress: boolean;
  machineToggle: boolean;
  setMachineToggle: (state: boolean) => void;
  refreshCountRef: any; 
  setRefreshCountRef: (state: any) => void;
  showToggle: boolean;
  setShowToggle: (state: boolean) => void;
  completeSrcListRef: React.MutableRefObject<any>;
  completeSrcListForMachineRef: React.MutableRefObject<any>;
}

const MyContext = createContext<FilterProps | undefined>(undefined);

export const MyProvider = ({ children }) => {
  const [overallfilter, setFilter] = useState<any>([]);
  const [theme, setTheme] = useState(false);
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(Number(searchParams.get('seconds'))*1000 || 20000);
  const [color, setColor] = useState({color:'#006568'});
  const [liveOeeData, setLiveOeeData] = useState([]);
  const [availability, setAvalibality] = useState();
  const [overallOeeData, setOverallOeeData] = useState<any[]>([]);
  const [qualityOeeData, setQualityOeeData] = useState<any[]>([]);
  const [performanceOeeData, setPerformanceOeeData] = useState<any[]>([])
  const [availabilityOeeData, setAvailabilityOeeData] = useState<any[]>([])
  const [threshold, setThreshold] = useState({ color: '#399918', value: 84 });
  const [value, setValue] = React.useState(0);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<any>();
  const [selectedWorkCenterForMachine, setSelectedWorkCenterForMachine] = useState<any>();
  const [currentItem, setCurrentItem] = useState<any>([]);
  const [refreshCount, setRefreshCount] = useState<any>(0);
  const [completeSrcList, setCompleteSrcList] = useState<any>();
  const [completeSrcListForMachine, setCompleteSrcListForMachine] = useState<any>();
  const [apiCallInProgress, setApiCallInProgress] = useState(false);
  const apiCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [machineToggle, setMachineToggle] = useState<boolean>(false);
  const [refreshCountRef, setRefreshCountRef] = useState<any>(0);
  const [showToggle, setShowToggle] = useState<boolean>(false);

  const completeSrcListRef = useRef<any>();
  const completeSrcListForMachineRef = useRef<any>();

  // Update refs when states change
  useEffect(() => {
    completeSrcListRef.current = completeSrcList;
  }, [completeSrcList]);

  useEffect(() => {
    completeSrcListForMachineRef.current = completeSrcListForMachine;
  }, [completeSrcListForMachine]);

  // Create a debounced version of setRefreshCount
  const debouncedSetRefreshCount = useCallback(
    debounce((newCount: number) => {
      setRefreshCount(newCount);
    }, 300),
    []
  );
  
  // Add this method to track API calls
  const trackApiCall = useCallback((callback: () => Promise<any>) => {
    if (apiCallInProgress) return Promise.resolve(null);
    
    setApiCallInProgress(true);
    
    // Clear any existing timeout
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }
    
    return callback()
      .finally(() => {
        // Set a timeout to prevent rapid subsequent calls
        apiCallTimeoutRef.current = setTimeout(() => {
          setApiCallInProgress(false);
        }, 500);
      });
  }, [apiCallInProgress]);

  const [request, setRequest] = useState<any | undefined>(() => {
    const requestObj: any = {
      site: parseCookies().site
    };

    // Add parameters only if they exist in searchParams
    const params = {
      startTime: searchParams.get('startTime'),
      endTime: searchParams.get('endTime'),
      resourceId: searchParams.get('resourceId'),
      shiftId: searchParams.get('shiftId'),
      batchNumber: searchParams.get('batchNumber'),
      workcenterId: searchParams.get('workcenterId')
    };

    // Add non-null parameters to requestObj as arrays
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null) {
        requestObj[key] = [value];
      }
    });

    // Handle item separately
    const item = searchParams.get('item');
    const itemVersion = searchParams.get('itemVersion');
    if (item !== null || itemVersion !== null) {
      requestObj.item = [{
        ...(item !== null && { item }),
        ...(itemVersion !== null && { itemVersion })
      }];
    }

    return requestObj;
  });

  useEffect(() => {
    setRequest({
      site: parseCookies().site,
      startTime: overallfilter?.TimePeriod?.[0],
      endTime: overallfilter?.TimePeriod?.[1],
      resourceId: overallfilter?.Resource,
      batchNumber: overallfilter?.BatchNumber,
      // shiftId: ['Shift1', 'Shift2'],
      // workcenterId: overallfilter?.Workcenter,
      // item: [{ item: 'Item1', itemVersion: 'A' }, { item: 'Item2', itemVersion: 'B' }],
    });
  }, [overallfilter]);

  // Update localStorage when color or colors state changes

  // useEffect(() => {
  //   handleApply();
  //   // const intervalId = setInterval(handleApply, Number(seconds)); 

  //   // return () => clearInterval(intervalId);
  // }, []); 

  const handleApply = async () => {
    const Oeeendpoints = [
      'getOverallOEE',
      'getOEEOverTime',
      'getOEEByMachine',
      'getOEEByShift',
      'getOEEBreakdown',
      'getOEEByProductionLine',
      'getOEEByComponent',
    ];
    const Qualityendpoints = [
      'overallQuality',
      'qualityByTime',
      'qualityByShift',
      'qualityByMachine',
      'qualityByProduct',
      'defectsByReason',
      'qualityLossByProductionLine',
      'defectDistributionByProduct',
      'defectTrendByTime',
      'getGoodVsBadQtyForResource', 
      'getScrapAndReworkTrend'
    ];
    const Availabilityendpoints = [
      'overallAvailability',
      'availabilityByTime',
      'availabilityByShift',
      'availabilityByMachine',
    ];
    const Performanceendpoints = ["overall", "performanceByTime", "performanceByShift", "performanceByMachine", "performanceByProductionLine"];
    // try {
    //   for (const endpoint of Oeeendpoints) {
    //     const response = await getOverallOEE(request, endpoint);
    //     if (!response.errorCode) {
    //       setOverallOeeData((prevData) => ({ ...prevData, [endpoint]: response }));
    //     } else if (response?.message) {
    //       throw new Error(response.errorCode);
    //     } else {
    //       throw new Error('There is no data for this filter');
    //     }
    //   }
    //   // message.success(`OEE data fetched successfully`);
    // } catch (error) {
    //   // message.error(`Failed to fetch OEE data: ${error}`);
    // }

    // try {
    //   for (const endpoint of Performanceendpoints) {
    //     const response = await getPerformanceOEE(request, endpoint);
    //     if (!response.errorCode) {
    //       setPerformanceOeeData((prevData) => ({ ...prevData, [endpoint]: response }));
    //     } else if (response?.message) {
    //       throw new Error(response.errorCode);
    //     } else {
    //       throw new Error('There is no data for this filter');
    //     }
    //   }
    //   message.success(`Performance data fetched successfully`);
    // } catch (error) {
    //   message.error(`Failed to fetch Performance data: ${error}`); 
    // }

    // try {
    //   for (const endpoint of Qualityendpoints) {
    //     const response = await getQualityOEE(request, endpoint);
    //     if (!response.errorCode) {
    //       setQualityOeeData((prevData) => ({ ...prevData, [endpoint]: response }));
    //     } else if (response?.message) {
    //       throw new Error(response.errorCode);
    //     } else {
    //       throw new Error('There is no data for this filter');
    //     }
    //   }
    //   message.success(`Quality data fetched successfully`);
    // } catch (error) {
    //   message.error(`Failed to fetch Quality data: ${error}`);
    // }

    // try {
    //   for (const endpoint of Availabilityendpoints) {
    //     const response = await getAvailabilityOEE(request, endpoint);
    //     if (!response.errorCode) {
    //       setAvailabilityOeeData((prevData) => ({ ...prevData, [endpoint]: response }));
    //     } else if (response?.message) {
    //       throw new Error(response.errorCode);
    //     } else {
    //       throw new Error('There is no data for this filter');
    //     } 
    //   }
    //   message.success(`Availability data fetched successfully`);
    // } catch (error) {
    //   message.error(`Failed to fetch Availability data: ${error}`);
    // }

  };

  return (
    <MyContext.Provider
      value={{
        overallfilter,
        color,
        setFilter,
        availability,
        theme,
        setTheme,
        liveOeeData,
        setLiveOeeData,
        handleApply,
        overallOeeData,
        qualityOeeData,
        performanceOeeData,
        availabilityOeeData,
        threshold,
        setThreshold,
        setValue,
        value,
        selectedWorkCenter,
        setSelectedWorkCenter,
        selectedWorkCenterForMachine,
        setSelectedWorkCenterForMachine,
        currentItem,
        setCurrentItem,
        refreshCount,
        setRefreshCount: debouncedSetRefreshCount,
        trackApiCall,
        apiCallInProgress,
        completeSrcList,
        setCompleteSrcList,
        completeSrcListForMachine,
        setCompleteSrcListForMachine,
        machineToggle,
        setMachineToggle,
        refreshCountRef,
        setRefreshCountRef,
        showToggle,
        setShowToggle,
        completeSrcListRef,
        completeSrcListForMachineRef,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useFilterContext = () => {
  return useContext(MyContext);
};
