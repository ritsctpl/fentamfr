import { Col, Row } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import StackedBarChartpopupClick from "../graph/StackedBarChartpopupClick";
import LineChart from "@modules/oee_discrete/components/reuse/LineChart";
import { parseCookies } from "nookies";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import NoDataScreen from "./NoData";
import BarchartSingleClick from "../graph/BarchartSingleClick";
const color = ["#FFB366", "#66B2FF", "#B366FF", "#FF6666"];
const oeeByComponentcolor = {
  itemcolor: ["#006200", "#E0E030", "#F03652"],
  threshold: [60, 85],
  linecolor: ["#ADD8E6", "#FFDAB9", "#F03652"],
};
interface ShiftDetailsProps {
  onShiftClick: () => void;
  duration: string;
  selectedShift: any;
  selectedResource: any;
  selectedWorkcenter: any;
}

interface ClickParams {
  name: string;
  value: number;
  seriesName: string;
}

function ShiftDetails({
  onShiftClick,
  duration,
  selectedShift,
  selectedResource,
  selectedWorkcenter,
}: ShiftDetailsProps) {
  console.log("selectedShift", selectedShift);
  const cookies = parseCookies();
  const [seriesName, setSeriesName] = useState<string>("oee");
  const [oeeByComponentData, setOeeByComponentData] = useState<any[]>([]);
  const [performanceByComponentData, setPerformanceByComponentData] = useState<
    any[]
  >([]);
  const [availabilityByComponentData, setAvailabilityByComponentData] =
    useState<any[]>([]);
  const [qualityByComponentData, setQualityByComponentData] = useState<any[]>(
    []
  );

  // const getTimeRange = (
  //   dateString: string
  // ): { startTime: string; endTime: string } => {
  //   const inputDate = new Date(dateString);
  //   const currentDate = new Date();

  //   // Start time logic (Same day 12:00 AM in local time)
  //   const startTime = new Date(inputDate);
  //   startTime.setHours(0, 0, 0, 0);

  //   // End time logic
  //   const endTime = new Date(inputDate);

  //   if (inputDate.toDateString() === currentDate.toDateString()) {
  //     // Scenario 2: For the current day, set end time to the current local time
  //     endTime.setHours(
  //       currentDate.getHours(),
  //       currentDate.getMinutes(),
  //       currentDate.getSeconds(),
  //       currentDate.getMilliseconds()
  //     );
  //   } else {
  //     // Scenario 1: For past or future dates, set end time to 23:59:59
  //     endTime.setHours(23, 59, 59, 999);
  //   }

  //   // Convert to ISO string in local timezone format
  //   const formatToISO = (date: Date) =>
  //     new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();

  //   console.log("Start Time:", formatToISO(startTime));
  //   console.log("End Time:", formatToISO(endTime));

  //   return {
  //     startTime: formatToISO(startTime),
  //     endTime: formatToISO(endTime),
  //   };
  // };

  const handleBarClick = useCallback(
    async (xValue: string, yValue: number, seriesName?: string) => {
      // Use seriesName if provided, otherwise fallback to previous logic
      const clickedSeriesName = seriesName || xValue;

      console.log(`Clicked ${clickedSeriesName} with value: ${yValue}%`);

      if (!clickedSeriesName) return;

      setSeriesName(clickedSeriesName.toLowerCase());

      // Convert to UTC 'Z' format
      const startTime = new Date(selectedShift[0]?.interval_start_date_time)
        .toISOString()
        .replace(/\.\d+Z$/, "Z");
      const endTime = new Date(selectedShift[0]?.interval_end_date_time)
        .toISOString()
        .replace(/\.\d+Z$/, "Z");

      const payload = {
        site: cookies.site,
        startTime: startTime,
        endTime: endTime,
        resourceId: [selectedResource.resource_id],
        batchNumber: null,
        shiftId: [selectedShift[0]?.shift_id],
        workcenterId: [selectedWorkcenter?.workcenter_id],
        type: clickedSeriesName.toLowerCase(),
      };

      try {
        if (clickedSeriesName.toLowerCase() === "oee") {
          const response = await fetchEndpointsData(
            payload,
            "oee-service",
            "getOEEByComponent"
          );
          setOeeByComponentData(response?.oeeByComponent || []);
        } else if (clickedSeriesName.toLowerCase() === "performance") {
          const response = await fetchEndpointsData(
            payload,
            "oee-service",
            "getByTime"
          );
          setPerformanceByComponentData(response?.oeeOverTime || []);
        } else if (clickedSeriesName.toLowerCase() === "availability") {
          const response = await fetchEndpointsData(
            payload,
            "availability-service",
            "availabilityByTime"
          );
          setAvailabilityByComponentData(response?.availabilityData || []);
        } else if (clickedSeriesName.toLowerCase() === "quality") {
          const response = await fetchEndpointsData(
            payload,
            "oee-service",
            "getByTime"
          );
          setQualityByComponentData(response?.oeeOverTime || []);
        }
      } catch (error) {
        console.error("Error:", error);
        setOeeByComponentData([]);
        setPerformanceByComponentData([]);
        setAvailabilityByComponentData([]);
        setQualityByComponentData([]);
      }
    },
    [cookies.site, selectedShift, selectedResource, selectedWorkcenter]
  );

  useEffect(() => {
    if (selectedShift?.[0]) {
      handleBarClick("0",0,"oee");
    }
  }, [selectedShift, handleBarClick]);

  const renderChartOrNoData = (data: any[], title: string) => {
    if (!data?.length) {
      return (
        <NoDataScreen
          message={`No ${title} Data Available`}
          subMessage={`There is no ${title.toLowerCase()} data available for the selected shift`}
        />
      );
    }
    return (
      <LineChart
        title={`${title} Over Time`}
        data={data}
        color={oeeByComponentcolor}
        description={
          "The OEE Component Trend Over Time chart tracks how the individual components of OEE (Availability, Performance, and Quality) change over time. This temporal view helps identify patterns, trends, and potential correlations between different OEE components, enabling more informed decision-making for continuous improvement efforts."
        }
      />
    );
  };

  if (!selectedShift) {
    return (
      <NoDataScreen
        message="No Shift Details Available"
        subMessage="Please select a shift to view detailed information"
      />
    );
  }

  return (
    <Row gutter={[12, 12]}>
      <Col xs={6}>
        <BarchartSingleClick
          data={selectedShift.map((item: any) => ({
            shiftId: item.shift_id,
            oee: item.oee,
            availability: item.availability,
            quality: item.quality,
            performance: item.performance,
          }))}
          title={"Shift"}
          color={color}
          onBarClick={handleBarClick}
          theshold={[]}
        />
      </Col>
      {seriesName === "oee" && (
        <Col xs={18}>
          {renderChartOrNoData(oeeByComponentData, "OEE Component Trend")}
        </Col>
      )}
      {seriesName === "performance" && (
        <Col xs={18}>
          {renderChartOrNoData(performanceByComponentData, "Performance")}
        </Col>
      )}
      {seriesName === "availability" && (
        <Col xs={18}>
          {renderChartOrNoData(availabilityByComponentData, "Availability")}
        </Col>
      )}
      {seriesName === "quality" && (
        <Col xs={18}>
          {renderChartOrNoData(qualityByComponentData, "Quality")}
        </Col>
      )}
    </Row>
  );
}

export default ShiftDetails;
