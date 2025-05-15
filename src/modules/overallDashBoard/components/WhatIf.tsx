import React, { useEffect, useState } from "react";
import { Slider, Typography, Row, Col } from "antd";

const { Text } = Typography;

const Sliders = ({ machineWiseData }) => {
  // Initialize state with appropriate defaults
  const [downtime, setDowntime] = useState(0);
  const [actualQty, setActualQty] = useState(0);
  const [rejectionQty, setRejectionQty] = useState(0);
  const [goodQtyData, setGoodQtyData] = useState(0);

  // Calculated metrics
  const [abtyData, setAbtyData] = useState<any>(0);
  const [actualQttyData, setActualQttyData] = useState<any>(0);
  const [qualityData, setQualityData] = useState<any>(0);
  const [oeeData, setOeeData] = useState<any>(0);

  // Store original values for validation
  const [actualRejection, setActualRejection] = useState<any>(0);
  const [actualQtyProduced, setActualQtyProduced] = useState<any>(0);
  const [actualDowntime, setActualDowntime] = useState<any>(0);

  useEffect(() => {
    if (!machineWiseData) return;

    // Set initial values from machineWiseData
    setDowntime(machineWiseData.total_downtime || 0);
    setActualQty(machineWiseData.total_quantity || 0);
    setRejectionQty(machineWiseData.total_bad_quantity || 0);
    setGoodQtyData(machineWiseData.total_good_quantity || 0);

    // Store original values for validation
    setActualRejection(machineWiseData.total_bad_quantity || 0);
    setActualQtyProduced(machineWiseData.total_quantity || 0);
    setActualDowntime(machineWiseData.total_downtime || 0);

    // Calculate initial metrics
    calculateMetrics(
      machineWiseData.total_downtime || 0,
      machineWiseData.total_quantity || 0,
      machineWiseData.total_bad_quantity || 0
    );
  }, [machineWiseData]);

  // Centralized calculation function
  const calculateMetrics = (downtime, quantity, rejection) => {
    if (!machineWiseData) return;

    // Calculate availability
    const plannedTime = machineWiseData.planned_production_time || 0;
    const availability =
      plannedTime > 0 ? ((plannedTime - downtime) / plannedTime) * 100 : 0;
    setAbtyData(Number(availability === 0 ? "0" : availability === 100 ? "100" : availability?.toFixed(2) || "0"));

    // Calculate performance
    const targetQty = machineWiseData.planned_quantity || 0;
    const performance = targetQty > 0 ? (quantity / targetQty) * 100 : 0;
    setActualQttyData(Number(performance === 0 ? "0" : performance === 100 ? "100" : performance?.toFixed(2) || "0"));

    // Calculate quality
    const goodQty = quantity - rejection;
    const quality = quantity > 0 ? (goodQty / quantity) * 100 : 0;
    setQualityData(Number(quality === 0 ? "0" : quality === 100 ? "100" : quality?.toFixed(2) || "0"));
    setGoodQtyData(goodQty);

    // Calculate OEE
    const oee =
      (availability / 100) * (performance / 100) * (quality / 100) * 100;
    setOeeData(Number(oee === 0 ? "0" : oee === 100 ? "100" : oee?.toFixed(2) || "0"));
  };

  const handleAvailability = (newDowntime) => {
    // Allow any value between min and max
    setDowntime(newDowntime);
    calculateMetrics(newDowntime, actualQty, rejectionQty);
  };

  const handlePerformance = (newQty) => {
    // Allow any value between min and max
    setActualQty(newQty);
    calculateMetrics(downtime, newQty, rejectionQty);

    // If rejection is now more than the new quantity, adjust it
    if (rejectionQty > newQty) {
      setRejectionQty(newQty);
      calculateMetrics(downtime, newQty, newQty);
    }
  };

  const handleQuality = (newRejection) => {
    // Only validate against current actualQty
    if (newRejection > actualQty) {
      return;
    }

    setRejectionQty(newRejection);
    calculateMetrics(downtime, actualQty, newRejection);
  };

  return (
    <Row gutter={[32, 0]}>
      <Col span={10}>
        <Row gutter={[0, 0]}>
          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong>Downtime</Text>
              </Col>
              <Col>
                <Text type="secondary">
                  Downtime: {Math.floor(downtime)} /{" "}
                  <strong>
                    {Math.floor(machineWiseData?.planned_production_time || 0)}{" "}
                    sec
                  </strong>
                </Text>
              </Col>
            </Row>
            <Slider
              value={downtime}
              onChange={(e) => handleAvailability(e)}
              min={0}
              max={machineWiseData?.planned_production_time || 0}
              style={{ marginTop: 0 }}
            />
          </Col>

          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong>Output</Text>
              </Col>
              <Col>
                <Text type="secondary">
                  Output: {actualQty} /{" "}
                  <strong>
                    {Math.floor(machineWiseData?.planned_quantity || 0)}
                  </strong>
                </Text>
              </Col>
            </Row>
            <Slider
              value={actualQty}
              onChange={(e) => handlePerformance(e)}
              min={0}
              max={Math.floor(machineWiseData?.planned_quantity || 0)}
              style={{ marginTop: 0 }}
            />
          </Col>

          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong>Rejection</Text>
              </Col>
              <Col>
                <Text type="secondary">
                  Rejection: {rejectionQty} / <strong>{actualQty}</strong>
                </Text>
              </Col>
            </Row>
            <Slider
              value={rejectionQty}
              onChange={(e) => handleQuality(e)}
              min={0}
              max={actualQty}
              style={{ marginTop: 0 }}
            />
          </Col>
        </Row>
      </Col>

      <Col span={14}>
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
          {/* Availability */}
          <div
            style={{ flex: "1", minWidth: "220px", justifyContent: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#3aa195",
                  marginRight: "8px",
                }}
              />
              <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
                Current Availability Impact
              </Text>
            </div>
            <div style={{ marginTop: "8px", marginLeft: "16px" }}>
              <Text>Availability: {abtyData}%</Text>
              <br />
              <Text>OEE Impact: Impacts availability</Text>
            </div>
          </div>

          {/* Performance */}
          <div
            style={{ flex: "1", minWidth: "220px", justifyContent: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#3aa195",
                  marginRight: "8px",
                }}
              />
              <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
                Current Performance Impact
              </Text>
            </div>
            <div style={{ marginTop: "8px", marginLeft: "16px" }}>
              <Text>Performance: {actualQttyData}%</Text>
              <br />
              <Text>Output: {actualQty}</Text>
              <br />
              <Text>OEE Impact: Impacts performance</Text>
            </div>
          </div>

          {/* Quality */}
          <div
            style={{ flex: "1", minWidth: "220px", justifyContent: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#3aa195",
                  marginRight: "8px",
                }}
              />
              <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
                Current Quality Impact
              </Text>
            </div>
            <div style={{ marginTop: "8px", marginLeft: "16px" }}>
              <Text>Quality Rate: {qualityData}%</Text>
              <br />
              <Text>Good qty: {goodQtyData}</Text>
              <br />
              <Text>OEE Impact: Impacts quality</Text>
            </div>
          </div>

          {/* OEE */}
          <div
            style={{ flex: "1", minWidth: "220px", justifyContent: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#3aa195",
                  marginRight: "8px",
                }}
              />
              <Text style={{ fontSize: "14px", fontWeight: "bold" }}>
                Current OEE Impact
              </Text>
            </div>
            <div style={{ marginTop: "8px", marginLeft: "16px" }}>
              <Text>OEE: {oeeData}%</Text>
              <br />
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Sliders;
