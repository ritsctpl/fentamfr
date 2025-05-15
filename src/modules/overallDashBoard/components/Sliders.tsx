import React, { useEffect, useState } from "react";
import { Slider, Typography, Row, Col } from "antd";

const { Text } = Typography;



const Sliders = ({ machineWiseData }) => {
  const [downtime, setDowntime] = useState(machineWiseData?.avail_downtime);
  const [count, setCount] = useState(machineWiseData?.good_qty);
  const [rejectionQty, setRejectionQty] = useState(machineWiseData?.bad_qty);
  const [actualQty, setActualQty] = useState<any>();

  const [abtyData, setAbtyData] = useState<any>();
  const [actualQttyData, setActualQttyData] = useState<any>();

  const [qualityData, setQualityData] = useState<any>();
  const [goodQtyData, setGoodQtyData] = useState<any>();

  const [oeeData, setOeeData] = useState<any>();

  const [actualRejection, setActualRejection] = useState(machineWiseData?.bad_qty);
  const [actualQtyProduced, setActualQtyProduced] = useState(machineWiseData?.actual_qty);
  const [actualDowntime, setActualDowntime] = useState(machineWiseData?.avail_downtime);

  // console.log("machineWiseData: ", machineWiseData)
  useEffect(() => {
    setCount(machineWiseData?.good_qty);
    setRejectionQty(machineWiseData?.bad_qty);
    setDowntime(machineWiseData?.avail_downtime);
    setActualQty(+Math.floor(machineWiseData?.perf_actual_qty));
    
    setActualQtyProduced(machineWiseData?.actual_qty);

    let abty = ((+Math.floor(machineWiseData?.avail_planned_time) - (+Math.floor(machineWiseData?.avail_downtime))) / (+Math.floor(machineWiseData?.avail_planned_time))) * 100;
    setAbtyData(Number(abty).toFixed(2));

    let actualQtyData = (+Math.floor(machineWiseData?.perf_actual_qty) / +Math.floor(machineWiseData?.target_qty)) * 100
    setActualQttyData(Number(actualQtyData).toFixed(2));

    let goodQuantityPerData = (+Math.floor(machineWiseData?.good_qty) / (+Math.floor(machineWiseData?.target_qty))) * 100;
    // setQualityData(Number(goodQuantityPerData).toFixed(2));
    setQualityData(Number(machineWiseData?.quality_qty).toFixed(2));

    setGoodQtyData(+Math.floor(machineWiseData?.good_qty));

    let oeeValue = ((+abty / 100) * (+actualQtyData / 100) * (+Math.floor(machineWiseData?.quality_qty) / 100)) * 100;
    setOeeData(oeeValue);



  }, [machineWiseData]);

  const handleOEE = () => {
    // debugger
    let oeeValue = ((+abtyData / 100) * (+actualQttyData / 100) * (+qualityData / 100)) * 100;
    setOeeData(oeeValue);
  }

  const handleAvailability = (downtime: any) => {
    // console.log("downtime", downtime)

    if(downtime < actualDowntime){
      return;
    }

    let abtyData = (+Math.floor(machineWiseData?.avail_planned_time) - downtime);
    setDowntime(downtime);
    let abty = ((+Math.floor(machineWiseData?.avail_planned_time) - downtime) / (+Math.floor(machineWiseData?.avail_planned_time))) * 100;
    setAbtyData(Number(abty).toFixed(2));

    // debugger
    const currentActualQty = actualQty;
    const totalPlannedTime = +Math.floor(machineWiseData?.avail_planned_time) + downtime;
    const totalRunTime = +Math.floor(machineWiseData?.avail_actual_time) + downtime;
    const cycleTime = +Math.floor(machineWiseData?.avail_planned_time) / +Math.floor(machineWiseData?.target_qty);

    // const actualQtyProducted = (totalRunTime / cycleTime);
    const qtyToBeProduced = totalPlannedTime / cycleTime;

    const performanceImpact = ( +currentActualQty / +qtyToBeProduced ) * 100;
    setActualQttyData(Number(performanceImpact)?.toFixed(2));
    
    // console.log("performanceImpact", performanceImpact);

    
    handleOEE();
  }

  const handlePerformance = (qty: any) => {
    // console.log("performance Qty", qty);
  debugger
    if(qty < actualQtyProduced){
      return;
    }

    setCount(qty);
    setActualQty(qty);


    let actualQtyData = (+qty / +Math.floor(machineWiseData?.target_qty)) * 100
    setActualQttyData(Number(actualQtyData).toFixed(2));

    handleOEE();
  }

  const handleQuality = (qty: any) => {
    // debugger
    // console.log("rejection Qty", qty);
    if(qty > actualQty || qty < actualRejection){
      return;
    }
    else{
      setRejectionQty(qty);
    }

    if(actualQty == 0){
      setRejectionQty(0);
      return;
    }



    setRejectionQty(qty);
    let targetQtyData = +Math.floor(machineWiseData?.target_qty);
    let goodQtyData = +Math.floor(machineWiseData?.target_qty) - (+qty);

    let goodQuantityData = (goodQtyData / targetQtyData) * 100;
    setQualityData(Number(goodQuantityData).toFixed(2));
    
    setGoodQtyData(targetQtyData - (+qty));

    handleOEE();
  }


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
                  Downtime: {Math.floor(downtime)}  / <strong> {Math.floor(machineWiseData?.avail_planned_time)} sec</strong>
                </Text>
              </Col>
            </Row>
            <Slider
              value={downtime}
              onChange={(e) => handleAvailability(e)}
              // onChange={setDowntime}
              min={0}
              max={machineWiseData?.avail_planned_time}
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
                  Output: {actualQty} / {" "}
                  <strong>{Math.floor(machineWiseData?.target_qty)} </strong>
                </Text>
              </Col>
            </Row>
            <Slider
              value={actualQty}
              // onChange={setCount}
              onChange={(e) => handlePerformance(e)}
              min={0}
              max={Math.floor(machineWiseData?.target_qty)}
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
                  Rejection: {rejectionQty} / {" "}
                  <strong>{Math.floor(machineWiseData?.target_qty)}  </strong>
                </Text>
              </Col>
            </Row>
            <Slider
              value={rejectionQty}
              // onChange={setRejectionQty}
              onChange={(e) => handleQuality(e)}
              min={0}
              max={Math.floor(machineWiseData?.target_qty)}
              style={{ marginTop: 0 }}
            />
          </Col>
        </Row>
      </Col>

      <Col span={14} style={{
        // marginLeft: "30px",
        // textAlign: 'center'
      }}>
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
          {/* Availability */}
          <div style={{ flex: "1", minWidth: "220px", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", }}>
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
              {/* <Text>OEE Impact: {+Math.floor(machineWiseData?.avail_actual_time) - downtime > 0 ? "Increases" : "Decreases"} availability</Text> */}
              <Text>OEE Impact: Impacts availability</Text>
            </div>
          </div>

          {/* Performance */}
          <div style={{ flex: "1", minWidth: "220px", justifyContent: "center", }}>
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
              <Text>Output: {actualQty} </Text>
              <br />
              <Text>OEE Impact: Impacts performance</Text>
            </div>
          </div>

          {/* Quality */}
          <div style={{ flex: "1", minWidth: "220px", justifyContent: "center" }}>
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
              <Text>Good qty: {goodQtyData} </Text>
              <br />
              <Text>OEE Impact: Impacts quality</Text>
            </div>
          </div>

          {/* OEE */}
          <div style={{ flex: "1", minWidth: "220px", justifyContent: "center" }}>
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
              <Text>OEE: {Number(oeeData).toFixed(2)}%</Text>
              <br />
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default Sliders;
