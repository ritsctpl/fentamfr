import { Col, Row, Spin } from "antd";
import React, { useEffect, useState } from "react";
import Barchart from "../graph/Barchart";
import BarChartPopup from "../graph/Barchart";
import DynamicTable from "../graph/Table";
import BarChartQty from "../graph/BarchartGroup";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import { parseCookies } from "nookies";
interface DataPoint {
  [key: string]: number | string;
}

interface TimeIntervalData {
  good_qty: number;
  Production_Actual_Quantity: number;
  interval_start_date_time: string;
  bad_qty: number;
  plan_Target_Quantity: number;
  interval_end_date_time: string;
  type?: string;
  shift_name?: string;
}

interface PerformanceProps {
  activeTab?: string;
  record?: any;
  eventType?: any;
}
function Quality({ activeTab, record, eventType }: PerformanceProps) {
  const cookies = parseCookies();
  const [isLoading, setIsLoading] = useState(false);
  const [resourceData, setResourceData] = useState<DataPoint[]>([]);
  const [shiftData, setShiftData] = useState<DataPoint[]>([]);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [lowestPerformanceResource, setLowestPerformanceResource] =
    useState<DataPoint | null>(null);
  const [goodbadQty, setGoodbadQty] = useState<any>([]);
  const resourcePayload = {
    site: cookies.site,
    workcenter: record?.workCenter,
    eventsource: eventType,
    date: record?.date,
  };
  const shiftPayload = {
    site: cookies.site,
    workcenter: record?.workCenter,
    eventsource: eventType,
    date: record?.date,
  };

  const handleResourceClick = (resourceId: string) => {
    setSelectedResource(resourceId);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab !== "quality") return; // Only fetch when performance tab is active

      setIsLoading(true);
      try {
        // First fetch resource data
        const resourceResponse = await fetchEndpointsData(
          resourcePayload,
          "oee-service/apiregistry",
          "getResourceByWorkcenter"
        ).catch(() => ({ data: { data: [] } }));

        const resourceData = resourceResponse?.data?.data || [];
        setResourceData(resourceData);

        // Find resource with lowest non-zero performance
        if (resourceData.length > 0) {
          // Filter out resources with zero performance and find lowest
          const nonZeroResources = resourceData.filter(
            (resource: { performance: any }) =>
              Math.round(Number(resource.performance)) > 0
          );

          let resourceToUse;
          if (nonZeroResources.length > 0) {
            // Find the resource with the lowest performance above 0
            resourceToUse = nonZeroResources.reduce((lowest, current) => {
              const currentPerformance = Math.round(
                Number(current.performance)
              );
              const lowestPerformance = Math.round(Number(lowest.performance));
              return currentPerformance < lowestPerformance ? current : lowest;
            });
          } else {
            // If no resources above 0, use the first resource in the array
            resourceToUse = resourceData[0];
          }

          // Prioritize selected resource, then lowest performance resource, then first resource
          const finalResourceId =
            selectedResource ||
            resourceToUse.resource_id ||
            (resourceData[0] && resourceData[0].resource_id);

          setLowestPerformanceResource(finalResourceId);

          // Fetch shift data with the selected resource
          const shiftResponse = await fetchEndpointsData(
            {
              ...shiftPayload,
              resource: finalResourceId,
            },
            "oee-service/apiregistry",
            "getShiftByResourceData"
          ).catch(() => ({ data: { data: [] } }));
          setShiftData(shiftResponse?.data?.data || []);
          const goodBadSUmmaryResponse = await fetchEndpointsData(
            {
              ...shiftPayload,
              resource: finalResourceId,
            },
            "oee-service/apiregistry",
            "getGoodBadQtySummary"
          ).catch(() => ({ data: { data: [] } }));
          setGoodbadQty(goodBadSUmmaryResponse?.data?.data || []);
        }
      } catch (error) {
        setResourceData([]);
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [cookies.site, activeTab, selectedResource]);
  return (
    <div style={{ height: "100%", overflowY: "auto", paddingRight: "8px" }}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Spin spinning={isLoading}>
            <BarChartPopup
              data={(resourceData || []).map((item) => ({
                resource_id: item?.resource_id || "N/A",
                performance: Number(item?.quality || 0),
              }))}
              title="Resource"
              color={[]}
              description=""
              theshold={undefined}
              onBarClick={handleResourceClick}
            />
          </Spin>
        </Col>
        <Col span={12}>
          <Spin spinning={isLoading}>
            <BarChartPopup
              data={(shiftData || []).map((item) => ({
                shift:
                  typeof item?.shift_id === "string"
                    ? item.shift_id.split(",").pop()
                    : item?.shift_id || "N/A",
                performance: Math.round(Number(item?.quality || 0)),
              }))}
              title={`Shift ${selectedResource ? "-" + selectedResource : ""}`}
              color={[]}
              description=""
              theshold={undefined}
              showXAxisLabel={true}
            />
          </Spin>
        </Col>
        <Col span={12}>
          <Spin spinning={isLoading}>
            <DynamicTable
              data={goodbadQty}
              title={`Quality Summary by Time Interval - ${
                selectedResource ? selectedResource : lowestPerformanceResource
              }`}
              columnOrder={[
                "interval_start_datetime",
                "interval_end_datetime",
                "good_qty",
                "bad_qty",
                "total_qty",
                "reason",
              ]}
            />
          </Spin>
        </Col>
        <Col span={12}>
          <Spin spinning={isLoading}>
            <BarChartQty
              data={(resourceData || []).map((item) => ({
                resource: item?.resource_id || "N/A",
                goodQty: Math.round(Number(item?.total_good_quantity || 0)),
                badQty: Math.round(Number(item?.total_bad_quantity || 0)),
              }))}
              title="Good Quantity Vs Bad Quantity Against Resource"
              color={[]}
              description={""}
              theshold={undefined}
            />
          </Spin>
        </Col>
      </Row>
    </div>
  );
}

export default Quality;
