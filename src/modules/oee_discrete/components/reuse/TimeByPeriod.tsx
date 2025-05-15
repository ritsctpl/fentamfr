import React, { useState } from "react";
import { Col, message, Modal, Row, Tabs } from "antd";
import BarChart from "./BarChart";
import NoDataFound from "./NoDataFound";
import BarChartPopup from "./BarChartPopup";
import { parseCookies } from "nookies";
import { fetchEndpointsData } from "@services/oeeServicesGraph";

type TimeByPeriodData = {
  workcenter: string;
  year: { name: string; value: number }[];
  month: { name: string; value: number }[];
  days: { name: string; value: number }[];
};
// color and threshold for the bar chart
const color = ["#FFCC99", "#99CCFF", "#D1B3FF"]; //[high,medium,low]
const threshold = [60, 85];
interface TimeByPeriodProps {
  historicalData: TimeByPeriodData[];
  type: string;
}

function TimeByPeriod({ historicalData, type }: TimeByPeriodProps) {
  console.log("calling from time period");
  // Return null if historicalData is empty
  if (!historicalData || historicalData.length === 0) {
    return (
      <div style={{ marginTop: "50px" }}>
        <NoDataFound />
      </div>
    );
  }

  // Create items for tabs based on unique workcenters
  const items = historicalData.map((center, index) => ({
    key: String(index + 1),
    label: center.workcenter,
    children: <WorkCenterTab data={center} type={type} />,
  }));

  return (
    <>
      <Tabs defaultActiveKey="1" items={items} />
      <style jsx global>{`
        .ant-tabs-content-holder {
          padding-top: 0px;
        }
      `}</style>
    </>
  );
}

export default TimeByPeriod;

const WorkCenterTab = ({ data, type }: { data: any; type: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceData, setResourceData] = useState<any>(null);
  const [duration, setDuration] = useState<string>("");
  const cookies = parseCookies();

  const handleBarClick = async (
    xValue: string,
    yValue: number,
    graphLevel: number
  ) => {
    let formattedDuration = "";
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");

    // Format duration based on graph level
    if (graphLevel === 1) {
      formattedDuration = xValue;
    } else if (graphLevel === 2) {
      formattedDuration = `${year}-${month}`;
    } else if (graphLevel === 3) {
      formattedDuration = `${year}-${month}-${xValue.padStart(2, "0")}`;
    }

    // Set duration first
    setDuration(formattedDuration);

    const payload = {
      site: cookies.site,
      type: type,
      workcenterId: [data.workcenter],
      duration: formattedDuration, // Use the formatted duration directly
    };

    console.log(payload, "payload from time by period");
    try {
      const responseTimeByPeriod = await fetchEndpointsData(
        payload,
        "oee-service",
        "getOverallResourceHistoryByType"
      );
      setResourceData(responseTimeByPeriod);
      console.log(responseTimeByPeriod, "response time by period");
      setIsModalOpen(true);
    } catch (error) {}
  };
  return (
    <>
      <Row gutter={[12, 12]}>
        <Col span={12}>
          <BarChartPopup
            title={"Year"}
            data={data.year}
            color={color}
            theshold={threshold}
            description={
              "Annual performance trends showing OEE distribution across different years. Compare yearly efficiency patterns to identify long-term improvements or declines in equipment effectiveness."
            }
            onBarClick={(x, y) => handleBarClick(x, y, 1)}
          />
        </Col>
        <Col span={12}>
          <BarChartPopup
            title={"Month"}
            data={data.month}
            color={color}
            theshold={threshold}
            description={
              "Monthly breakdown revealing seasonal variations in machine performance. Track monthly OEE fluctuations to optimize maintenance schedules and production planning."
            }
            onBarClick={(x, y) => handleBarClick(x, y, 2)}
          />
        </Col>
        <Col span={24}>
          <BarChartPopup
            title={"Days"}
            data={data.days}
            color={color}
            theshold={threshold}
            description={
              "Daily efficiency metrics highlighting short-term performance changes. Identify daily outliers to pinpoint operational issues or exceptional performance days."
            }
            timebyperiod={true}
            onBarClick={(x, y) => handleBarClick(x, y, 3)}
          />
        </Col>
      </Row>
      {resourceData && (
        <Modal
          title={data.workcenter}
          centered
          open={isModalOpen}
          footer={null}
          width="90vw"
          style={{
            maxWidth: "1400px",
            top: "20px",
          }}
          bodyStyle={{
            padding: "20px",
            height: "70vh",
            overflow: "hidden",
          }}
          onCancel={() => setIsModalOpen(false)}
        >
          {!resourceData.errorCode ? (
            <BarChart
              title={duration}
              data={resourceData}
              color={color}
              theshold={threshold}
              description={`Resource data for ${data.workcenter} during ${duration}. This visualization provides insights into performance variations across resources, helping to identify areas for improvement and optimize operations.`}
            />
          ) : (
            <NoDataFound />
          )}
        </Modal>
      )}
    </>
  );
};
