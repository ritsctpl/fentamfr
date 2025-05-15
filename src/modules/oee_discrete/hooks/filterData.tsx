import {
  fetchEndpointsData,
  getAvailabilityOEE,
  getQualityOEE,
  getPerformanceOEE,
  getDownTimeOEE,
} from "@services/oeeServicesGraph";
import { message } from "antd";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { parseCookies } from "nookies";
import React, { createContext, useContext, useEffect, useState } from "react";

interface FilterProps {
  refresh: any;
  setRefresh: (state: any) => void;
  availability: any;
  overallfilter: any;
  setFilter: (state: any) => void;
  liveOeeData: any;
  setLiveOeeData: (state: any) => void;
  theme: boolean;
  setTheme: (state: any) => void;
  overallOeeData: any;
  qualityOeeData: any;
  call: number;
  setCall: (state: any) => void;

  downtimeOeeData: any;
  setDowntimeOeeData: (state: any) => void;
  performanceOeeData: any;
  availabilityOeeData: any;
  threshold: any;
  color: any;
  value: any;
  machineToggle: boolean;
  setMachineToggle: (state: boolean) => void;

  setThreshold: (state: any) => void;
  setValue: (state: any) => void;
  handleApply: () => void;
  handleReset: () => void;
}

const MyContext = createContext<FilterProps | undefined>(undefined);

export const MyProvider = ({ children }) => {
  const [overallfilter, setFilter] = useState<any>([]);
  const [refresh, setRefresh] = useState<any>(false)
  const [theme, setTheme] = useState(false);
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(
    Number(searchParams.get("seconds")) * 1000 || 20000
  );
  const [color, setColor] = useState({ color: "#0c4da2" });
  const [liveOeeData, setLiveOeeData] = useState([]);
  const [availability, setAvalibality] = useState();
  const [overallOeeData, setOverallOeeData] = useState<any[]>([]);
  const [qualityOeeData, setQualityOeeData] = useState<any[]>([]);
  const [performanceOeeData, setPerformanceOeeData] = useState<any[]>([]);
  const [call, setCall] = useState(0);
  const [downtimeOeeData, setDowntimeOeeData] = useState<any[]>([]);
  const [availabilityOeeData, setAvailabilityOeeData] = useState<any[]>([]);
  const [machineToggle, setMachineToggle] = useState<boolean>(null);
  console.log(machineToggle, "machineToggle");
  const [request, setRequest] = useState<any | undefined>(() => {
    const requestObj: any = {
      site: "RITS",
    };
    console.log(machineToggle, "machineToggle");
    // Add parameters only if they exist in searchParams
    const params = {
      startTime: searchParams.get("startTime"),
      endTime: searchParams.get("endTime"),
      resourceId: searchParams.get("resourceId"),
      shiftId: searchParams.get("shiftId"),
      batchNumber: searchParams.get("batchNumber"),
      workcenterId: searchParams.get("workcenterId"),
    };

    // Add non-null parameters to requestObj as arrays
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null) {
        requestObj[key] = [value];
      }
    });

    // Handle item separately
    const item = searchParams.get("item");
    const itemVersion = searchParams.get("itemVersion");
    if (item !== null || itemVersion !== null) {
      requestObj.item = [
        {
          ...(item !== null && { item }),
          ...(itemVersion !== null && { itemVersion }),
        },
      ];
    }

    return requestObj;
  });

  const [threshold, setThreshold] = useState({ color: "#399918", value: 84 });
  const [value, setValue] = React.useState(0);

  const cookies = parseCookies();

  useEffect(() => {
    setRequest({
      site: cookies.site,

      startTime: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      endTime: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      batchNumber: overallfilter?.BatchNumber,
      shiftId: overallfilter?.Shift,
      workcenterId: overallfilter?.Workcenter,
      item: [
        { item: "Item1", itemVersion: "A" },
        { item: "Item2", itemVersion: "B" },
      ],
    });
  }, [overallfilter]);

  // Update localStorage when color or colors state changes
  useEffect(() => {
    handleApply();

}, [call, refresh,]);
// useEffect(() => {
//   const timer = setTimeout(() => {
//     handleApply();
//   }, 2000);

//   return () => clearTimeout(timer);
// }, []);
useEffect(() => {
  // Call handleApply when machineToggle changes
  console.log("Ya calling");
  handleApply();
}, [machineToggle]);
  const handleApply = async () => {
    console.log(overallfilter?.TimePeriod, "overallfilter?.TimePeriod");

    const cookies = parseCookies();

    const site = cookies.site;
    const activeTabIndex = sessionStorage.getItem("activeTabIndex");
    const requestOee = {
      site: site,
      startTime: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      endTime: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      resourceId:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      batchNumber: overallfilter?.BatchNumber?.length === 0 ? null : overallfilter?.BatchNumber || null,
      shiftId:
        overallfilter?.Shift?.length === 0
          ? null
          : overallfilter?.Shift || null,
      workcenterId:
        overallfilter?.Workcenter?.length === 0
          ? null
          : overallfilter?.Workcenter || null,

      type: "oee",
      eventSource: machineToggle ? "MACHINE" : "MANUAL",
    };

    const requestAvailability = {
      site: site,
      startTime: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      endTime: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      resourceId:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      batchNumber: overallfilter?.BatchNumber?.length === 0 ? null : overallfilter?.BatchNumber || null,
      shiftId:
        overallfilter?.Shift?.length === 0
          ? null
          : overallfilter?.Shift || null,
      workcenterId:
        overallfilter?.Workcenter?.length === 0
          ? null
          : overallfilter?.Workcenter || null,

      type: "availability",
      eventSource: machineToggle ? "MACHINE" : "MANUAL",
    };

    const requestQuality = {
      site: site,
      startTime: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      endTime: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      resourceId:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      batchNumber: overallfilter?.BatchNumber?.length === 0 ? null : overallfilter?.BatchNumber || null,
      shiftId:
        overallfilter?.Shift?.length === 0
          ? null
          : overallfilter?.Shift || null,
      workcenterId:
        overallfilter?.Workcenter?.length === 0
          ? null
          : overallfilter?.Workcenter || null,
      type: "quality",
      eventSource: machineToggle ? "MACHINE" : "MANUAL",
    };

    const requestPerformance = {
      site: site,
      startTime: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      endTime: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      resourceId:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      batchNumber: overallfilter?.BatchNumber?.length === 0 ? null : overallfilter?.BatchNumber || null,

      shiftId:
        overallfilter?.Shift?.length === 0
          ? null
          : overallfilter?.Shift || null,
      workcenterId:
        overallfilter?.Workcenter?.length === 0
          ? null
          : overallfilter?.Workcenter || null,
      type: "performance",
      eventSource: machineToggle ? "MACHINE" : "MANUAL",
    };

    const requestDowntime = {
      site: site,
      startTime: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      endTime: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      resourceId:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      batchNumber: overallfilter?.BatchNumber?.length === 0 ? null : overallfilter?.BatchNumber || null,
      shiftId:
        overallfilter?.Shift?.length === 0
          ? null
          : overallfilter?.Shift || null,
      workcenterId:
        overallfilter?.Workcenter?.length === 0
          ? null
          : overallfilter?.Workcenter || null,

      // type:'performance'

      type: "downtime",
      eventSource: machineToggle ? "MACHINE" : "MANUAL",
    };

    const requestDowntimeWC = {
      resourceIds:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      workcenterList:
        overallfilter?.Workcenter?.length === 0
          ? null
          : overallfilter?.Workcenter || null,
      site: site,
      intervalStart: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DD") +
        "T" +
        dayjs(overallfilter.TimePeriod[0]).format("HH:mm:ss")
        : null,
      intervalEnd: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DD") +
        "T" +
        dayjs(overallfilter.TimePeriod[1]).format("HH:mm:ss")
        : null,
    };
    const requestDowntimeResource = {
      resourceIds:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      site: site,
      intervalStart: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DD") +
        "T" +
        dayjs(overallfilter.TimePeriod[0]).format("HH:mm:ss")
        : null,
      intervalEnd: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DD") +
        "T" +
        dayjs(overallfilter.TimePeriod[1]).format("HH:mm:ss")
        : null,
    };
    const requestDowntimeResourceCode = {
      resourceIds:
        overallfilter?.Resource?.length === 0
          ? null
          : overallfilter?.Resource || null,
      site: site,
      intervalStart: overallfilter?.TimePeriod?.[0]
        ? dayjs(overallfilter.TimePeriod[0]).format("YYYY-MM-DD") +
        "T" +
        dayjs(overallfilter.TimePeriod[0]).format("HH:mm:ss")
        : null,
      intervalEnd: overallfilter?.TimePeriod?.[1]
        ? dayjs(overallfilter.TimePeriod[1]).format("YYYY-MM-DD") +
        "T" +
        dayjs(overallfilter.TimePeriod[1]).format("HH:mm:ss")
        : null,
    };
    //speed loss request
    const requestSpeedLossResource = {
      site: site,
      startTime: overallfilter?.TimePeriod?.[0] ? dayjs(overallfilter?.TimePeriod[0]).format('YYYY-MM-DDTHH:mm:ss') : null,
      endTime: overallfilter?.TimePeriod?.[1] ? dayjs(overallfilter?.TimePeriod[1]).format('YYYY-MM-DDTHH:mm:ss') : null,
      resourceId: overallfilter?.Resource?.length === 0 ? null : overallfilter?.Resource || null,
      type: 'performance',
      eventSource: machineToggle ? "MACHINE" : "MANUAL",
    }
    const requestSpeedLossWorkcenter = {
      site: site,
      startTime: overallfilter?.TimePeriod?.[0] ? dayjs(overallfilter?.TimePeriod[0]).format('YYYY-MM-DDTHH:mm:ss') : null,
      endTime: overallfilter?.TimePeriod?.[1] ? dayjs(overallfilter?.TimePeriod[1]).format('YYYY-MM-DDTHH:mm:ss') : null,
      workcenterId: overallfilter?.Workcenter?.length === 0 ? null : overallfilter?.Workcenter || null,
      type: 'performance',
      eventSource: machineToggle ? "MACHINE" : "MANUAL",
    }
    if (activeTabIndex?.includes("oee") || refresh) {

      try {
        const responseOverall = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getOverall"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          getOverall: responseOverall,
        }));

        const responseByTime = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getByTime"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeOverTime: responseByTime.resources,
        }));

        const responseByMachine = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getByMachine"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeByMachine: responseByMachine.oeeByMachine,
        }));

        const responseByShift = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getOeeByShiftByType"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeByShift: responseByShift,
        }));

        const responseBreakdown = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getOEEBreakdown"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeBreakdown: responseBreakdown.oeeBreakdown,
        }));

        const responseByLine = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getByProductionLine"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeByProductionLine: responseByLine.oeeByProductionLine,
        }));

        // const responseLossByReason = await fetchEndpointsData(requestOee, 'oee-service', 'getOeeLossByReason');
        // setOverallOeeData((prevData) => ({
        //   ...prevData,
        //   oeeLossByReason: responseLossByReason
        // }));

        const responseByComponent = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getOEEByComponent"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeByComponent: responseByComponent.oeeByComponent,
        }));
        const responseByProduct = await fetchEndpointsData(
          requestOee,
          "oee-service",
          "getByProduct"
        );
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeByProduct: responseByProduct.oeeByProduct,
        }));
        //Time By Period
        // const responseTimeByPeriod = await fetchEndpointsData(requestTimePeriodOee, 'oee-service', 'getOverallHistory');
        // setOverallOeeData((prevData) => ({
        //   ...prevData,
        //   oeeTimePeriodData: responseTimeByPeriod
        // }));

        const responseByOperation = await fetchEndpointsData(requestOee, 'oee-service', 'getByOperation');
        setOverallOeeData((prevData) => ({
          ...prevData,
          oeeByOperation: responseByOperation.oeeByOperation
        }));
        setRefresh(false)
      } catch (error) {
        // message.error(`Failed to fetch OEE data: ${error}`);
      }
    }
    if (activeTabIndex?.includes("performance") || refresh) {
      console.log('performance called');

      try {
        const responseOverall = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "getOverall"
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          getOverall: responseOverall,
        }));

        const responseByTime = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "getByTime"
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceOverTime: responseByTime.resources,
        }));

        const responseByMachine = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "getByMachine"
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceByMachine: responseByMachine.oeeByMachine,
        }));

        const responseByShift = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "getOeeByShiftByType"
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceByShift: responseByShift,
        }));

        const responseComparison = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "performanceComparison"
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceComparison: responseComparison.performanceComparison,
        }));
        const responseByProduct = await getPerformanceOEE(
          requestPerformance,
          "performance-service",
          "performanceByEfficiencyOfProduct"
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceByProduct:
            responseByProduct.performanceByEfficiencyOfProduct,
        }));
        const performanceLossReasons = await getPerformanceOEE(
          requestPerformance,
          "performance-service",
          "performanceLossReasons "
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceLossReason: performanceLossReasons.performanceLossReason,
        }));

        const getSpeedLossByResource = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "getSpeedLossByResource "
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          getSpeedLossByResource: getSpeedLossByResource,
        }));

        const performanceDowntimeAnalysis = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "getPerformanceDowntime"
        );
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceDowntimeAnalysis:
            performanceDowntimeAnalysis.downtimeAnalysis,
        }));

        const responseByLine = await getPerformanceOEE(
          requestPerformance,
          "oee-service",
          "getByProductionLine"
        );

        setPerformanceOeeData((prevData) => ({
          ...prevData,
          performanceByProductionLine: responseByLine.oeeByProductionLine,
        }));
        //speed loss
        const responseSpeedLossResource = await getPerformanceOEE(requestSpeedLossResource, 'oee-service', 'getSpeedLossByResource');
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          getSpeedLossByResource: responseSpeedLossResource
        }));

        const responseSpeedLossWorkcenter = await getPerformanceOEE(requestSpeedLossWorkcenter, 'oee-service', 'getSpeedLossByWorkcenter');
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          getSpeedLossByWorkcenter: responseSpeedLossWorkcenter
        }));

        //Time By Period
        // const responseTimeByPeriod = await fetchEndpointsData(requestTimePeriodPerformance, 'oee-service', 'getOverallHistory');
        // setPerformanceOeeData((prevData) => ({
        //   ...prevData,
        //   performanceTimePeriodData: responseTimeByPeriod
        // }));

        // by operation
        const responseByOperation = await getPerformanceOEE(requestPerformance, 'oee-service', 'getByOperation');
        setPerformanceOeeData((prevData) => ({
          ...prevData,
          oeeByOperation: responseByOperation.oeeByOperation
        }));


        setRefresh(false)
        // message.success(`Performance data fetched successfully`);
      } catch (error) {
        // message.error(`Failed to fetch Performance data: ${error}`);
        console.log(`Failed to fetch Performance data: ${error}`);
      }
    }
    if (activeTabIndex?.includes("quality") || refresh) {
      console.log('quality called');

      try {
        const responseOverall = await getQualityOEE(
          requestQuality,
          "oee-service",
          "getOverall"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          getOverall: responseOverall,
        }));

        const responseByTime = await getQualityOEE(
          requestQuality,
          "oee-service",
          "getByTime"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          qualityOverTime: responseByTime.resources,
        }));

        const responseByMachine = await getQualityOEE(
          requestQuality,
          "oee-service",
          "getByMachine"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          qualityByMachine: responseByMachine.oeeByMachine,
        }));

        const responseByOperation = await getQualityOEE(
          requestQuality,
          "oee-service",
          "getByOperation"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          oeeByOperation: responseByOperation.oeeByOperation,
        }));

        const responseByShift = await getQualityOEE(
          requestQuality,
          "oee-service",
          "getOeeByShiftByType"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          qualityByShift: responseByShift,
        }));

        const responseByProduct = await getQualityOEE(
          requestQuality,
          "oee-service",
          "getByProduct"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          qualityByProduct: responseByProduct.oeeByProduct,
        }));

        const responseDefectsByReason = await getQualityOEE(
          requestQuality,
          "quality-service",
          "defectsByReason"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          defectsByReason: responseDefectsByReason.defectsByReason,
        }));

        const responseQualityLossByLine = await getQualityOEE(
          requestQuality,
          "quality-service",
          "qualityLossByProductionLine"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          qualityLossByProductionLine:
            responseQualityLossByLine.qualityLossByProductionLine,
        }));

        const responseDefectDistribution = await getQualityOEE(
          requestQuality,
          "quality-service",
          "defectDistributionByProduct"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          defectDistributionByProduct:
            responseDefectDistribution.defectsByProduct,
        }));

        const responseDefectTrend = await getQualityOEE(
          requestQuality,
          "quality-service",
          "defectTrendByTime"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          defectTrendOverTime: responseDefectTrend.defectTrendOverTime,
        }));

        const responseGoodVsBad = await getQualityOEE(
          requestQuality,
          "quality-service",
          "getGoodVsBadQtyForResource"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          goodQualityVsBadQuality: responseGoodVsBad.goodVsBadQtyForResources,
        }));

        const responseScrapAndRework = await getQualityOEE(
          requestQuality,
          "oee-service",
          "getScrapAndReworkTrend"
        );
        setQualityOeeData((prevData) => ({
          ...prevData,
          scrapReworkTrend: responseScrapAndRework.scrapAndReworkTrends,
        }));
        //Time By Period
        // const responseTimeByPeriod = await fetchEndpointsData(requestTimePeriodQuality, 'oee-service', 'getOverallHistory');
        // setQualityOeeData((prevData) => ({
        //   ...prevData,
        //   qualityTimePeriodData: responseTimeByPeriod
        // }));
        setRefresh(false)
        // message.success(`Quality data fetched successfully`);
      } catch (error) {
        // message.error(`Failed to fetch Quality data: ${error}`);
      }
    }
    if (activeTabIndex?.includes("downtime") || refresh) {
      console.log('downtime called');

      try {
        const responseOverall = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "overallDowntime"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          getOverall: responseOverall.downtimeDurations,
        }));

        const responseByTime = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "downtimeOverTime"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeOverTime: responseByTime.downtimeOverTime,
        }));

        const responseByMachine = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "downtimeByMachine"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeByMachine: responseByMachine.downtimeByMachine,
        }));

        const responseByShift = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "downtimeByReasonAndShift"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeByShift: responseByShift.downtimeByReasonAndShift,
        }));

        const responseCumulativeDowntime = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "cumulativeDowntime"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          cumulativeDowntime: responseCumulativeDowntime.cumulativeDowntime,
        }));

        const responseDowntimeVsProduction = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "downtimeVsProductionOutput"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeVsProductionOutput:
            responseDowntimeVsProduction.downtimeVsProductionOutput,
        }));

        const responseDowntimeAnalysis = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "downtimeAnalysis"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeAnalysis: responseDowntimeAnalysis.downtimeAnalysis,
        }));
        const responseDowntimeByReason = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "downtimeByReason"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeByReason: responseDowntimeByReason.downtimeByReason,
        }));

        const responseDowntimeByWorkcenter = await getDownTimeOEE(
          requestDowntimeWC,
          "downtime-service",
          "getDowntimeByWorkcenter"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeByWorkCenter: responseDowntimeByWorkcenter,
        }));

        const responseDowntimeByResource = await getDownTimeOEE(
          requestDowntimeWC,
          "downtime-service",
          "getDowntimeByResource "
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeByMachineWC: responseDowntimeByResource,
        }));
        const responseDowntimeByResourceAndInterval = await getDownTimeOEE(
          requestDowntimeResource,
          "downtime-service",
          "getDowntimeByResourceAndInterval"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeByReasonMachine: responseDowntimeByResourceAndInterval,
        }));

        const responseDowntimeByReasonNew = await getDownTimeOEE(
          requestDowntimeResourceCode,
          "downtime-service",
          "getDowntimeByReason"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          detailedAnalysisReason: responseDowntimeByReasonNew,
        }));

        // const responsePerformanceMetrics = await getDownTimeOEE(requestDowntime, 'downtime-service', 'performanceMetrics');
        // setDowntimeOeeData((prevData) => ({
        //   ...prevData,
        //   performanceMetrics: responsePerformanceMetrics
        // }));

        const responseDowntimeImpact = await getDownTimeOEE(
          requestDowntime,
          "downtime-service",
          "downtimeImpact"
        );
        setDowntimeOeeData((prevData) => ({
          ...prevData,
          downtimeImpact: responseDowntimeImpact.downtimeImpact,
        }));
        setRefresh(false)
        // message.success(`Downtime data fetched successfully`);
      } catch (error) {
        // message.error(`Failed to fetch Downtime data: ${error}`);
      }
    }
    if (activeTabIndex?.includes("availability") || refresh) {
      console.log('availability called');

      try {
        const responseOverall = await getAvailabilityOEE(
          requestAvailability,
          "availability-service",
          "overallAvailability"
        );
        setAvailabilityOeeData((prevData) => ({
          ...prevData,
          getOverall: responseOverall?.availabilityPercentage,
        }));

        const responseByTime = await getAvailabilityOEE(
          requestAvailability,
          "availability-service",
          "availabilityByTime"
        );
        setAvailabilityOeeData((prevData) => ({
          ...prevData,
          availabilityOverTime: responseByTime?.resources,
        }));

        const responseByMachine = await getAvailabilityOEE(
          requestAvailability,
          "availability-service",
          "availabilityByMachine"
        );
        setAvailabilityOeeData((prevData) => ({
          ...prevData,
          availabilityByMachine: responseByMachine?.availabilityByMachine,
        }));

        const getAvailabilityDowntime = await getAvailabilityOEE(
          requestAvailability,
          "oee-service",
          "getAvailabilityDowntime"
        );
        setAvailabilityOeeData((prevData) => ({
          ...prevData,
          availabilityByDowntime: getAvailabilityDowntime.downtimeReasons,
        }));
        const responseByShift = await getAvailabilityOEE(
          requestAvailability,
          "availability-service",
          "availabilityByShift"
        );
        setAvailabilityOeeData((prevData) => ({
          ...prevData,
          availabilityByShift: responseByShift?.availabilityByShift,
        }));
        //Time By Period
        // const responseTimeByPeriod = await fetchEndpointsData(requestTimePeriodAvailability, 'oee-service', 'getOverallHistory');
        // setAvailabilityOeeData((prevData) => ({
        //   ...prevData,
        //   availabilityTimePeriodData: responseTimeByPeriod
        // }));
        //By Operation
        const responseByOperation = await getAvailabilityOEE(requestAvailability, 'oee-service', 'getByOperation');
        setAvailabilityOeeData((prevData) => ({
          ...prevData,
          oeeByOperation: responseByOperation.oeeByOperation
        }));
        setRefresh(false)
        // message.success(`Availability data fetched successfully`);
      } catch (error) {
        // message.error(`Failed to fetch Availability data: ${error}`);
      }
    }
  };

  const handleReset = async () => {
    // First set the filter state to empty
    setFilter({
      TimePeriod: [],
      BatchNumber: [],
      Shift: [],
      ProductionLine: [],
      MachineEquipment: [],
      Item: [],
      DowntimeReason: [],
      Workcenter: [],
      Resource: [],
    });

    // Increment call to trigger API refresh with empty filters
    setCall((prev) => prev + 1);
  };

  console.log(refresh, 'lkjhgfdsa');


  return (
    <MyContext.Provider
      value={{
        overallfilter,
        color,
        call,
        setCall,
        setFilter,
        availability,
        theme,
        setTheme,
        liveOeeData,
        setLiveOeeData,

        handleApply,
        overallOeeData,
        qualityOeeData,
        downtimeOeeData,
        setDowntimeOeeData,
        performanceOeeData,
        availabilityOeeData,
        threshold,
        setThreshold,
        setValue,
        value,
        handleReset,
        refresh,
        setRefresh,
        machineToggle,
        setMachineToggle,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useFilterContext = () => {
  return useContext(MyContext);
};
