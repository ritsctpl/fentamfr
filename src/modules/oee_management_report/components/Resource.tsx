import { Col, Row } from "antd";
import React from "react";
import StackedBarChartpopup from "../graph/StackedBarChartpopup";
import WorkcenterTitle from "./WorkcenterTitle";
import NoDataScreen from "./NoData";
import BarChartPopup from "../graph/Barchartclick";

const color = ["#FFB366", "#66B2FF", "#B366FF", "#FF6666"];
interface ResourceProps {
  onShiftClick: (machineItem: any) => void;
  resourceData: any[];
  currentShift: any[];
}
function Resource({ onShiftClick, resourceData, currentShift }: ResourceProps) {
  if (!resourceData?.length) {
    return (
      <NoDataScreen
        message="No Resource Data Available"
        subMessage="There is no resource data available for the selected day"
      />
    );
  }

  const handleMachineClick = (machineItem: any) => {
    onShiftClick(machineItem);
  };

  return (
    <Row>
      <Col xs={12} sm={12} md={8} lg={6} xl={6}>
        <BarChartPopup
          data={currentShift.map((item: any) => ({
            logdate: item?.shift_id?.split(",")?.pop(),
            oee: item.oee,
            availability: item.availability,
            quality: item.quality,
            performance: item.performance,
          }))}
          title={"Current Shift"}
          color={color}
          theshold={[]}
        />
      </Col>
      <Col xs={12} sm={12} md={16} lg={18} xl={18}>
        <div
          style={{
            display: "grid",
            height: "calc(100vh - 210px)",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            overflow: "scroll",
            marginBottom: "20px",
          }}
        >
          {resourceData.map((machineItem: any, index: React.Key) => (
            <div
              key={index}
              onClick={() => handleMachineClick(machineItem)}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <WorkcenterTitle data={[machineItem]} titleType={"Resource"} />
            </div>
          ))}
        </div>
      </Col>
    </Row>
  );
}

export default Resource;
