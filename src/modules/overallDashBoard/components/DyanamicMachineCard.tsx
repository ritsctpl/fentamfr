import React, { useEffect, useState } from "react";
import {
  Card,
  Progress,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Alert,
} from "antd";
import { WarningFilled, WarningTwoTone } from "@ant-design/icons";
import { AiFillWarning } from "react-icons/ai";
import { MdGppGood } from "react-icons/md";
import { getApiRegistry } from "@services/oeeServices";
import { parseCookies } from "nookies";

import Sliders from "./Sliders";
import MachineTimeLine from "./MachineTimeLine";
import { FiActivity } from "react-icons/fi";
import { BsLayersFill } from "react-icons/bs";
import { SiInstatus } from "react-icons/si";
import { DiGitCompare } from "react-icons/di";
import { FiRepeat } from "react-icons/fi";
import NoDataScreen from "./NoData";

const { Title, Text } = Typography;

// Interface for machine card mockMachineData
interface MachineCardProps {
  machineName: string;
  oee: number;
  output: {
    value: number;
    unit: string;
  };
  status: {
    type: "success" | "warning" | "error" | "info";
    message: string;
  };
  outputTrend: number;
  outputByShift: number;
  target: number;
  lastOutput: number;
  currentOutput: number;
  outputByShiftEnd: number;
  availability: number;
  downTime: number;
  performance: number;
  quality: number;
  oeeChange: number;
  odeChange: number;
  whatIfScenarios: {
    reduceChangeoverTime: {
      minutes: number;
      availabilityIncrease: number;
      oeeIncrease: number;
    };
    increaseMachineSpeed: {
      percentage: number;
      performanceIncrease: number;
      outputIncrease: number;
    };
    reduceDefects: {
      value: number;
      scrapCost: string;
    };
  };
}

// Mock data from the image
const mockMachineData: MachineCardProps = {
  machineName: "BLEND MACHINE",
  oee: 52,
  output: {
    value: 600,
    unit: "kg",
  },
  status: {
    type: "success",
    message: "Success",
  },
  outputTrend: 60, // From the progress bar in the image
  outputByShift: 56,
  target: 950,
  lastOutput: 54,
  currentOutput: 52,
  outputByShiftEnd: 900,
  availability: 80,
  downTime: 20,
  performance: 88,
  quality: 80,
  oeeChange: 3.8,
  odeChange: 1.8,
  whatIfScenarios: {
    reduceChangeoverTime: {
      minutes: 5,
      availabilityIncrease: 3.5,
      oeeIncrease: 1.8,
    },
    increaseMachineSpeed: {
      percentage: 5,
      performanceIncrease: 9,
      outputIncrease: 50,
    },
    reduceDefects: {
      value: 10,
      scrapCost: "£3,000",
    },
  },
};

const DyanamicMachineCard: React.FC<{ data?: any; eventSource?: string, date: any, shift: any }> = ({
  data,
  eventSource,
  date,
  shift
}) => {
  // console.log("data: ", data);
  const [machineWiseData, setMachineWiseData] = useState<any>();
  const [chartData, setChartData] = useState<any>();
  const [isNoData, setIsNoData] = useState<boolean>(false);

  // For debugging purposes, track chartData changes
  useEffect(() => {
    if (chartData) {
      console.log("chartData updated:", chartData);
    }
  }, [chartData]);

  const formatNumber = (num) => {
    num = +num;
    if(num != 0 && num != null && num != undefined){
        if (num % 1 === 0) {
            return num.toString(); // Return as integer if no decimal part
        }
        else
            return num.toFixed(2); // Return with two decimal points
    }
    else
        return 0
  };

  useEffect(() => {
    const cookies = parseCookies();
    const site = cookies?.site;
    const fetchData = async () => {
      const request = {
        resource_id: data?.machine,
        site: site,
        workcenter_id: data?.workcenter,
        eventSource: eventSource,
        date: date,
        shift: shift
      };
      try {
        const response = await getApiRegistry(
          request,
          "get_oee_shift_comparison"
        );
        if (!response?.errorCode) {
          setMachineWiseData(response?.data[0]);
        }
      } catch (e) {
        console.error("Error retrieving machine details: ", e);
      }
    };

  

    const fetchMachineBarData = async () => {
      const req = {
        resource: data?.machine,
        p_site: site,
        workcenter: data?.workcenter,
        eventSource: eventSource,
        date: date,
        shift: shift
      };
      try {
        const response = await getApiRegistry(
          req,
          "get_shift_and_downtime_summary"
        );
        if (!response?.errorCode) {
          // setMachineWiseData(response?.data[0]);
          // debugger
          if (response?.data?.[0]) {
            setIsNoData(false);
            if (response?.data[0]?.breaks?.value == null || response?.data[0]?.breaks?.value == "" || response?.data[0]?.breaks?.value == undefined) {
              response.data[0].breaks.value = [];
            }
            else {
              response.data[0].breaks.value = JSON.parse(
                response?.data?.[0]?.breaks.value
              );
            }

            if(response?.data[0]?.downtimes?.value == null || response?.data[0]?.downtimes?.value == "" || response?.data[0]?.downtimes?.value == undefined) {
              response.data[0].downtimes.value = [];
            }
            else {
              response.data[0].downtimes.value = JSON.parse(
                response?.data?.[0]?.downtimes.value
              );
            }
           

            if (
              response.data[0] != null &&
              response.data[0] != undefined &&
              response.data[0] != ""
            ) {
              if (response?.data?.[0]) {
                setChartData(response?.data?.[0]);
                console.log("chartData set:", response?.data?.[0]);
              }
            } else {
              setChartData({});
              setIsNoData(true);
            }
          } else {
            setIsNoData(true);
          }
        }
      } catch (e) {
        console.error("Error retrieving machine details: ", e);
      }
    };
    fetchData();
    fetchMachineBarData();
  }, [data, eventSource]);
  return (
    <Card
      style={{
        width: "100%",
        borderRadius: "8px",
        // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        boxShadow:
          "0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(0, 0, 0, 0.06)",
        // marginBottom: "10px",
      }}
    >
      <Card
        style={{
          width: "100%",
          borderRadius: "8px",
          boxShadow:
            "0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(0, 0, 0, 0.06)",
          marginBottom: "20px",
          padding: "16px",
        }}
      >
        {/* Top Section - Machine Info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Left Side - Title */}
          <Title level={4} style={{ margin: 0 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.3,
                // padding: "4px 8px",
                // background: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "23px",
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: "30px",
                }}
              >
                {data?.workcenter || "—"}
              </span>
              <div
                style={{
                  marginTop: "-11%",
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.3,
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    color: "#888",
                    marginBottom: "1px",
                    marginTop: "30px",
                  }}
                >
                  Machine:
                </span>
                <span
                  style={{ fontSize: "20px", fontWeight: 600, color: "#222" }}
                >
                  {data?.machine || "—"}
                </span>
              </div>
            </div>
          </Title>

          {/* Right Side - Cards Row */}
          <Row gutter={[8, 8]} style={{ marginTop: 0 }}>
            <Col
              span={8}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Card
                size="small"
                style={{
                  width: "auto",
                  height: "100px", // ensure space between top and bottom
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #3aa080",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <Text style={{ fontSize: "16px", color: "#777" }}>
                    <FiRepeat /> Shift
                  </Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text style={{ fontSize: "25px", fontWeight: "normal", whiteSpace: "nowrap" }}>
                    {/* {machineWiseData?.shift_name?.split(",")?.[2]} */}
                    {"General shift" }
                  </Text>
                </div>
              </Card>
            </Col>
            <Col
              span={8}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Card
                size="small"
                style={{
                  width: "auto",
                  height: "100px", // ensure enough height for spacing
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #3aa080",
                  padding: "8px", // optional, for some inner spacing
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <Text style={{ fontSize: "16px", color: "#777" }}>
                    {" "}
                    <FiActivity /> OEE
                  </Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text style={{ fontSize: "25px", fontWeight: "normal", whiteSpace: 'nowrap' }}>
                    {formatNumber(machineWiseData?.avg_oee)} %
                  </Text>
                </div>
              </Card>
            </Col>
            <Col
              span={8}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Card
                size="small"
                style={{
                  width: "auto",
                  height: "100px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #3aa080",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  // overflow: "hidden",              // hides overflow
                  // whiteSpace: "nowrap",            // prevents text wrap
                  // textOverflow: "ellipsis",        // adds "..." if needed
                  // maxWidth: "250px",               // optional: safety cap
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <Text style={{ fontSize: "16px", color: "#777" }}>
                    <BsLayersFill /> Output
                  </Text>
                </div>

                <div style={{ textAlign: "right" }}>
                  <Text
                    style={{
                      // fontSize: `${(machineWiseData?.perf_actual_qty)?.toString().length > 9 ? 25 : 21 }px`,
                      fontSize: "25px",
                      fontWeight: "normal",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {formatNumber(machineWiseData?.perf_actual_qty)}
                  </Text>
                </div>
              </Card>
            </Col>

            {/* <Col
              span={6}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Card
                size="small"
                style={{
                  width: "180px",
                  height: "100px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #3aa080",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <Text style={{ fontSize: "16px", color: "#777" }}>
                    <SiInstatus /> Status
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {machineWiseData?.oee_increased == false ? (
                    <AiFillWarning
                      style={{
                        fontSize: "40px",
                        marginRight: "8px",
                        fill: "orange",
                      }}
                    />
                  ) : machineWiseData?.oee_increased == true ? (
                    <MdGppGood
                      style={{
                        fontSize: "40px",
                        marginRight: "8px",
                        color: "green",
                      }}
                    />
                  ) : null}
                  <Text style={{ fontSize: "25px", fontWeight: "normal" }}>
                   
                  </Text>
                </div>
              </Card>
            </Col>  */}
          </Row>
        </div>

        {/* Bottom Section - Machine Timeline */}

        <div style={{ marginTop: "20px" }}>
          {isNoData ? (
            <NoDataScreen />
          ) : (
            <MachineTimeLine shiftData={chartData} />
          )}
        </div>
      </Card>

      {/* Machine Timeline */}
      <Card
        style={{
          width: "100%",
          borderRadius: "8px",
          // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          boxShadow:
            "0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(0, 0, 0, 0.06)",
          marginBottom: "20px",
          // textAlign: "center"
        }}
      >
        <div style={{ marginTop: "-1%" }}>
          <Text style={{ fontSize: "20px", fontWeight: 600 }}>
            Previous Shift Performance vs Current Shift Performance
          </Text>
          <Row
            style={{
              marginTop: "0px",
              paddingTop: "5px",
              borderBottom: "1px solid. #f0f0f0",
              textAlign: "center",
            }}
          >
            <Col span={6}>
              <Text style={{ fontSize: "18px" }}>
                Output by Shift:{" "}
                {formatNumber(machineWiseData?.inc_or_dec_qty)}%
              </Text>
            </Col>
            <Col span={6}>
              <Text style={{ fontSize: "18px" }}>
                Target: {formatNumber(machineWiseData?.target_qty)}
              </Text>
            </Col>
            <Col span={6}>
              <Text style={{ fontSize: "18px" }}>
                Prev Shift:{" "}
                {formatNumber(machineWiseData?.previous_performance)}%
              </Text>
            </Col>
            <Col span={6}>
              <Text style={{ fontSize: "18px" }}>
                Current Shift:{" "}
                {formatNumber(machineWiseData?.current_performance)}%
              </Text>
            </Col>
          </Row>

          <Title level={4} style={{ marginBottom: "20px" }}>
            Machine Timeline
          </Title>

          <Row
            style={{
              display: "flex",
              marginTop: "-10px",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "0px",
              flexWrap: "wrap",
              gap: "40px", // Add gap between cards
            }}
          >
            <Col style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  background: "#3aa080",
                  width: "270px",
                  height: "160px",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: "500" }}>
                  {"Output by Shift"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <Progress
                    percent={Math.floor(machineWiseData?.inc_or_dec_qty)}
                    showInfo={false}
                    strokeColor="#fff"
                    trailColor="rgba(255,255,255,0.3)"
                    style={{
                      width: "65%",
                      border: "1px solid rgba(255,255,255,0.4)",
                      borderRadius: "4px",
                      padding: "0.1px",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize:
                        machineWiseData?.good_qty?.toString().length > 3
                          ? "14px"
                          : "18px",
                      marginLeft: "10px",
                      overflow: "hidden",
                      // textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "30%",
                    }}
                  >
                    {formatNumber(machineWiseData?.perf_actual_qty)}
                  </Text>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Target</span>
                    <span>{formatNumber(machineWiseData?.target_qty)}</span>
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Actual Qty</span>
                    <span>
                      {formatNumber(machineWiseData?.perf_actual_qty)}
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  background: "#3aa080",
                  width: "270px",
                  height: "160px",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: "500" }}>
                  {"Availability"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "25px", fontWeight: "bold" }}>
                    {formatNumber(machineWiseData?.availability_qty)}%
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Available time</span>
                    <span>
                      {/* {Math.floor(machineWiseData?.avail_actual_time)} sec */}

                      {machineWiseData?.avail_actual_time
                        ? `${Math.floor(
                            machineWiseData?.avail_actual_time / 3600
                          )
                            .toString()
                            .padStart(2, "0")}h ${Math.floor(
                            (machineWiseData?.avail_actual_time % 3600) / 60
                          )
                            .toString()
                            .padStart(2, "0")}m ${Math.floor(
                            machineWiseData?.avail_actual_time % 60
                          )
                            .toString()
                            .padStart(2, "0")}s`
                        : "00h 00m 00s"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Scheduled Downtime</span>
                    <span>
                      {/* {Math.floor(machineWiseData?.break_time_val)} sec */}
                      {machineWiseData?.break_time_val
                        ? `${Math.floor(machineWiseData?.break_time_val / 3600)
                            .toString()
                            .padStart(2, "0")}h ${Math.floor(
                            (machineWiseData?.break_time_val % 3600) / 60
                          )
                            .toString()
                            .padStart(2, "0")}m ${Math.floor(
                            machineWiseData?.break_time_val % 60
                          )
                            .toString()
                            .padStart(2, "0")}s`
                        : "00h 00m 00s"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Unscheduled Downtime</span>
                    <span>
                      {/* {Math.floor(machineWiseData?.avail_downtime)} sec */}
                      {machineWiseData?.avail_downtime
                        ? `${Math.floor(machineWiseData?.avail_downtime / 3600)
                            .toString()
                            .padStart(2, "0")}h ${Math.floor(
                            (machineWiseData?.avail_downtime % 3600) / 60
                          )
                            .toString()
                            .padStart(2, "0")}m ${Math.floor(
                            machineWiseData?.avail_downtime % 60
                          )
                            .toString()
                            .padStart(2, "0")}s`
                        : "00h 00m 00s"}
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  background: "#3aa080",
                  width: "270px",
                  height: "160px",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: "500" }}>
                  {"Performance"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "25px", fontWeight: "bold" }}>
                    {formatNumber(machineWiseData?.performance_qty)}%
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Target Qty</span>
                    <span>{formatNumber(machineWiseData?.perf_plan_qty)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Actual Qty</span>
                    <span>
                      {formatNumber(machineWiseData?.perf_actual_qty)}
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  background: "#3aa080",
                  width: "270px",
                  height: "160px",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: "500" }}>
                  {"Quality"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "25px", fontWeight: "bold" }}>
                    {formatNumber(machineWiseData?.quality_qty)}%
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Good Qty</span>
                    <span>{formatNumber(machineWiseData?.good_qty)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Bad Qty</span>
                    <span>{formatNumber(machineWiseData?.bad_qty)}</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
      <div
        style={{
          marginTop: "10px",
          // boxShadow: "2px 4px 4px 4px rgba(0, 0, 0, 0.1)",
          boxShadow:
            "0 6px 16px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Card
          title={
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 0,
                lineHeight: 1,
              }}
            >
              What-If Scenarios
            </div>
          }
          style={{ width: "100%" }}
          headStyle={{
            padding: "6px 12px",
            minHeight: "28px",
            lineHeight: "1",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {/* <div style={{boxShadow: '2px 4px 4px 4px rgba(0, 0, 0, 0.1)'}}> */}
              <Sliders machineWiseData={machineWiseData} />
              {/* </div> */}
            </Col>
          </Row>
        </Card>
      </div>
    </Card>
  );
};

export default DyanamicMachineCard;
