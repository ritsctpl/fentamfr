import React, { useEffect, useState } from "react";
import { Row, Col, Select } from "antd";
import StackedBarChartpopup from "../graph/StackedBarChartpopup";
import WorkcenterTitle from "./WorkcenterTitle";
import NoDataScreen from "./NoData";
import BarChartPopup from "../graph/Barchartclick";
import { parseCookies } from "nookies";
import { fetchEndpointsData } from "@services/oeeServicesGraph";

const color = ["#FFB366", "#66B2FF", "#B366FF", "#FF6666"];
interface DayData {
  name: string;
  oee: number;
  performance: number;
  quality: number;
  availability: number;
}
interface WorkcenterData {
  days: DayData[];
}

interface Props {
  selectedMachine: any;
  selectedWorkcenter: WorkcenterData[];
  onGraphClick: (x:any) => void;
  machineToggle: string;
}

function Days({ selectedMachine, selectedWorkcenter, onGraphClick, machineToggle }: Props) {
  console.log(selectedWorkcenter)
  const cookies = parseCookies();
  const [timeFilter, setTimeFilter] = useState("day");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeData, setSelectedTimeData] = useState<WorkcenterData[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        site: cookies.site,
        workcenter: selectedMachine?.workcenter_id,
        category:
          timeFilter === "day"
            ? "WORKCENTER_DAY"
            : timeFilter === "month"
            ? "WORKCENTER_MONTH"
            : "WORKCENTER_YEAR",
        eventSource: machineToggle,
      };
      try {
        setIsLoading(true);
        const response = await fetchEndpointsData(
          payload,
          "oee-service/apiregistry/",
          "getDurationByworkcenter"
        );
        setSelectedTimeData(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeFilter, cookies.site, selectedMachine?.workcenter_id]);
  console.log(selectedWorkcenter);
  if (selectedTimeData.length === 0) {
    console.log("No Days Data Available");
    return (
      <NoDataScreen
        message="No Days Data Available"
        subMessage="There is no data available for the selected workcenter"
      />
    );
  }



  return (
    <Row gutter={[24, 24]}>
      <Col xs={16} sm={16} md={6} lg={6} xl={6}>
      <div onClick={() => onGraphClick(selectedMachine)} style={{cursor: "pointer"}}>
        <WorkcenterTitle data={[selectedMachine]} titleType={"Workcenter"} />
        </div>
      </Col>
      <Col xs={24} sm={24} md={18} lg={18} xl={18}>
        <div
          style={{
            marginBottom: 5,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Select
            defaultValue="day"
            style={{ width: 120 }}
            onChange={(value) => setTimeFilter(value)}
            options={[
              { value: "day", label: "Day" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
        </div>
        <BarChartPopup
          data={selectedTimeData.map((item: any) => ({
            logdate: timeFilter === "day" ? item?.day?.toString() : timeFilter === "month" ? item?.month?.toString()?.substring(0, 7) : item?.year?.toString().substring(0, 4),
            oee: item?.oee,
            availability: item?.availability,
            quality: item?.quality,
            performance: item?.performance,
          }))}
          title={`${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}s`}
          color={color}
          theshold={[]}
        />
      </Col>
    </Row>
  );
}

export default Days;
