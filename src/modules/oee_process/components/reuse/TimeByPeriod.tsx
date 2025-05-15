import React, { useState } from "react";
import { Col, Modal, Row, Tabs, Card, Button } from "antd";
import { parseCookies } from "nookies";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import StackedBarChartpopup from "./StackedBarChartpopup";
import { IoCloseSharp } from "react-icons/io5";
import StackedBarChartResource from "./stackbarresource";
type TimeByPeriodData = {
  workcenter: string;
  year: {
    year: string;
    OEE: number;
    Performance: number;
    Quality: number;
    Availability: number;
  }[];
  month: {
    year: string;
    OEE: number;
    Performance: number;
    Quality: number;
    Availability: number;
  }[];
  days: {
    year: string;
    OEE: number;
    Performance: number;
    Quality: number;
    Availability: number;
  }[];
};
// color and threshold for the bar chart
const color = ["#FFB366", "#66B2FF", "#B366FF", "#FF6666"];
const threshold = [60, 85];
interface TimeByPeriodProps {
  historicalData: TimeByPeriodData[];
  workcenter?: string;
  onClose?: () => void;
}

function TimeByPeriod({
  historicalData,
  workcenter,
  onClose,
}: TimeByPeriodProps) {
  const [resourceData, setResourceData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState<string>("");
  const handleBarClick = async (
    xValue: string,
    yValue: number,
    seriesName: string,
    graphLevel: number
  ) => {
    console.log("Bar Click Details:", {
      xValue,
      yValue,
      seriesName,
      graphLevel,
    });
    const cookies = parseCookies();
    const site = cookies.site;
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
      workcenterId: [workcenter],
      duration: formattedDuration,
    };

    console.log(payload, "payload from time by period");
    try {
      const responseTimeByPeriod = await fetchEndpointsData(
        payload,
        "oee-service",
        "getOverallResourceHistory"
      );
      setResourceData(responseTimeByPeriod);
      console.log(responseTimeByPeriod, "response time by period");
      setIsModalOpen(true);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // Since historicalData is an array, we need to access the first item
  const data = historicalData[0] || {
    year: [],
    month: [],
    days: [],
  };

  return (
    <Card
      size="small"
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{workcenter || "Workcenter"}</span>
          {onClose && (
            <Button
              type="text"
              icon={<IoCloseSharp size={20} color="#ffffff" />}
              onClick={onClose}
              size="small"
            />
          )}
        </div>
      }
      headStyle={{ background: "var(--background-color)" }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      bodyStyle={{
        flex: 1,
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Row
        gutter={[8, 8]}
        style={{
          flex: 1,
          margin: 0,
          width: "100%",
        }}
      >
        <Col
          span={12}
          style={{
            height: "33%",
          }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StackedBarChartpopup
              data={data.year}
              title={"Year"}
              color={color}
              onBarClick={(x, y, seriesName) =>
                handleBarClick(x, y, seriesName, 1)
              }
            />
          </div>
        </Col>
        <Col
          span={12}
          style={{
            height: "33%",
          }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StackedBarChartpopup
              data={data.month}
              title={"Month"}
              color={color}
              onBarClick={(x, y, seriesName) =>
                handleBarClick(x, y, seriesName, 2)
              }
            />
          </div>
        </Col>
        <Col
          span={24}
          style={{
            height: "34%",
          }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StackedBarChartpopup
              data={data.days}
              title={"Days"}
              color={color}
              onBarClick={(x, y, seriesName) =>
                handleBarClick(x, y, seriesName, 3)
              }
            />
          </div>
        </Col>
      </Row>
      {resourceData && (
        <Modal
          title={
            <div style={{ textAlign: "center" }}>
              <span>{workcenter}</span> <span>{duration}</span>
            </div>
          }
          centered
          open={isModalOpen}
          footer={null}
          width="100vw"
          style={{
            top: 20,
            paddingBottom: 0,
            height: "100vh",
          }}
          bodyStyle={{
            padding: "20px",
            overflow: "hidden",
            height: "calc(100vh - 100px)",
          }}
          onCancel={() => setIsModalOpen(false)}
        >
          {!resourceData.errorCode ? (
            <StackedBarChartResource
              data={resourceData}
              title={"Year"}
              color={color}
            />
          ) : (
            <h1>No Data Found</h1>
          )}
        </Modal>
      )}
    </Card>
  );
}

export default TimeByPeriod;
