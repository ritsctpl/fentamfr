'use client'
import { getOverallOEE, getQualityOEE, getPerformanceOEE, getAvailabilityOEE } from '@services/oeeServices';
import { message } from 'antd';
import { useSearchParams } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

interface FilterProps {
  completeSrcListRef: React.MutableRefObject<any>;
  completeSrcListForMachineRef: React.MutableRefObject<any>;
  triggerAvailaiblityChart: any;
  setTriggerAvailaiblityChart: (state: any) => void;
  triggerAvailabiltyAgainstShift: any;
  setTriggerAvailabiltyAgainstShift: (state: any) => void;
  selectedResource: any;
  setSelectedResource: (state: any) => void;
  selectedShift: any;
  setSelectedShift: (state: any) => void;
  selectedBarsRef: React.MutableRefObject<Set<string>>;
  availabilityData: any;
  setAvailabilityData: (state: any) => void;
  availabilityAgainstShiftData: any;
  setAvailabilityAgainstShiftData: (state: any) => void;
  machineTimeLine: any;
  setMachineTimeLine: (state: any) => void;
  selectedResources: any;
  formattedShiftsData: any;
  showLegend: any;
}

const MyContext = createContext<FilterProps | undefined>(undefined);

export const MyProvider = ({ children }) => {

  const completeSrcListRef = useRef<any>();
  const completeSrcListForMachineRef = useRef<any>();
  const [triggerAvailaiblityChart, setTriggerAvailaiblityChart] = useState<any>(0);
  const [triggerAvailabiltyAgainstShift, setTriggerAvailabiltyAgainstShift] = useState<any>(0);
  const [selectedResource, setSelectedResource] = useState<any>();
  const [selectedShift, setSelectedShift] = useState<any>();
  const selectedBarsRef = useRef<Set<string>>(new Set());
  const [availabilityData, setAvailabilityData] = useState<any>([]);
  const [availabilityAgainstShiftData, setAvailabilityAgainstShiftData] = useState<any>([]);
  const [machineTimeLine, setMachineTimeLine] = useState<any>([]);
  const selectedResources = useRef<any>();
  const formattedShiftsData = useRef<any>();
  const showLegend = useRef<any>(true);
  
  return (
    <MyContext.Provider
      value={{
        completeSrcListRef,
        completeSrcListForMachineRef,
        triggerAvailaiblityChart,
        setTriggerAvailaiblityChart,
        triggerAvailabiltyAgainstShift,
        setTriggerAvailabiltyAgainstShift,
        selectedResource,
        setSelectedResource,
        selectedShift,
        setSelectedShift,
        selectedBarsRef,
        availabilityData,   
        setAvailabilityData,
        availabilityAgainstShiftData,
        setAvailabilityAgainstShiftData,
        machineTimeLine,
        setMachineTimeLine,
        selectedResources,
        formattedShiftsData,
        showLegend,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useFilterContext = () => {
  return useContext(MyContext);
};
