/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import FentaLogo from "../../images/fenta_logo.png";
import {
  Col,
  Layout,
  Row,
  Empty,
  Switch,
  DatePicker,
  Input,
  Tooltip,
  Modal,
  Table,
  Select,
  Button,
  message,
  Card,
} from "antd";
const { Header, Content,  Footer, } = Layout;
import { parseCookies } from "nookies";
import { decryptToken } from "@/utils/encryption";
import jwtDecode from "jwt-decode";
import { useAuth } from "@context/AuthContext";
import HeaderCard from "./components/headerCard";
import DurationCard from "./components/DurationCard";
import styles from "./styles/OverallDashBoardMain.module.css";
import CommonAppBar from "@components/CommonAppBar";
import LineGraph from "./graph/LineGraph";
import BarChartPopup from "./graph/Barchartclick";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import WorkcenterComponent from "./components/workcenterComponent";
import { fetchEndpointsData } from "@services/oeeServicesGraph";
import DivisionSnapCard from "./components/DivisionSnapCard";
import ProductionTypeCard from "./components/ProductionTypeCard";
import ActionableInsights from "./components/ActionableInsights";
import LoadingScreen from "./components/LoadingScreen";
import MachineDowntime from "./components/machineDowntime";
import NoDataScreen from "./components/NoData";
import { FiActivity } from "react-icons/fi";
import { MdOutlineSpeed, MdOutlineEqualizer, MdLayers } from "react-icons/md";
import { retrieveActivity } from "@services/activityService";
import { GrChapterAdd } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { fetchShift, fetchShiftAllData } from "@services/shiftService";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TopLossBarchartForWorkCenter from "./graph/TopLossBarchartForWorkCenter";
import TopLossBarchart from "./graph/TopLossBarchart";
import TopLossBarchartForResource from "./graph/TopLossBarchartForResource";
import ReasonCodeDonutChart from "./graph/ReasonCodeDonutChart";
import { useMyContext } from "./hooks/managementReport";
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "./components/userInstructions";

interface DecodedToken {
  preferred_username: string;
}

interface WorkcenterData {
  workcenter_id: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

// First, let's create a reusable Footer component
const AppFooter = ({ showToggle, selectedView, machineToggle, setMachineToggle, eventSource, setEventSource }) => (
  <Footer
    style={{
      zIndex: 1000,
      textAlign: "center",
      height: "40px",
      minHeight: "40px",
      maxHeight: "40px",
      display: "flex",
      alignItems: "center",
      background: "#f0f2f5",
      padding: "0 24px",
      borderTop: "1px solid #e0e0e0",
      position: "fixed",
      bottom: 0,
      width: "100%",
      left: 0,
    }}
  >
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={FentaLogo.src}
        alt="Fenta Logo"
        style={{ 
          height: "24px",
          width: "auto",
          marginRight: "10px" 
        }}
      />
      <div style={{ color: "#555", fontSize: "12px" }}>
        &copy; {new Date().getFullYear()} Fenta Powered by RITS | All Rights Reserved
      </div>
    </div>
    {showToggle && !selectedView && (
      <div
        style={{
          position: "absolute",
          right: "24px",
          display: "flex",
          alignItems: "center",
          height: "100%"
        }}
      >
        <span
          style={{
            marginRight: "8px",
            fontSize: "12px",
            color: "#555",
            fontWeight: "bold",
          }}
        >
          Machine Data :
        </span>
        <Switch
          checked={machineToggle}
          onChange={(checked) => { setMachineToggle(checked); setEventSource(checked ? "machine" : "manual");}}
          style={{
            backgroundColor: machineToggle ? "var(--button-color)" : "grey",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    )}
  </Footer>
);

function OverallDashBoardMain() {
  const cookies = parseCookies();
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<WorkcenterData | null>(null);
  const { isAuthenticated, token } = useAuth();
  ////////////State Variables///////////
  const [headerData, setHeaderData] = useState([]);
  const [durationComparection, setDurationComparection] = useState([]);
  const [lineData, setLineData] = useState([]);
  console.log(lineData, "lineData");

  const [oeeComponentsTrend, setOeeComponentsTrend] = useState([]);
  const [getOeeInsightsData, setGetOeeInsightsData] = useState([]);
  const [machineDowntimeData, setMachineDowntimeData] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [topLossTrend, setTopLossTrend] = useState([]);
  const [graphDataByDay, setGraphDataByDay] = useState([]);
  const [machineToggle, setMachineToggle] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [workcenterDataRetrive, setWorkcenterDataRetrive] = useState({});
  const [refreshSecond, setRefreshSecond] = useState(0);

  const [selectedShift, setSelectedShift] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [shiftData, setShiftData] = useState([]);
  const [shiftColumns, setShiftColumns] = useState([]);
  const [shiftBoValue, setShiftBoValue] = useState(null);

  const [showDrillDown, setShowDrillDown] = useState<any>(false);
  const { setTopLossForWorkcenterData, setTopLossForResourceData, setSelectedTopLossDate,
    setSelectedTopLossPercentage, topLossForResourceData, reasonCodeForResourceData, selectedTopLossDate,
    topLossForWorkcenterData, selectedTopLossPercentage, selectedWorkCenter, eventSource, setEventSource } = useMyContext();
  
  // Handle user authentication
  useEffect(() => {
    const handleAuthentication = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    handleAuthentication();
  }, [isAuthenticated, token]);

  

  const openModal = async (e: any) => {
    try {
      let oShiftList, typedValue;
      const oColumns = [
        { title: t("shiftId"), dataIndex: "shiftId", key: "shiftId" },
        { title: t("version"), dataIndex: "version", key: "version" },
        {
          title: t("description"),
          dataIndex: "description",
          key: "description",
        },
        { title: t("shiftType"), dataIndex: "shiftType", key: "shiftType" },
      ];
      setShiftColumns(oColumns);
      const cookies = parseCookies();
      const site = cookies.site;
      oShiftList = await fetchShift(site);
      if (typedValue) {
        oShiftList = await fetchShiftAllData(site);
      }
      if (oShiftList) {
        const formattedShiftList = oShiftList.map((item, index) => ({
          ...item,
          key: index,
          id: index,
          // shiftId: item.shiftId,
        }));
        setShiftData(formattedShiftList);
      } else {
      }
      // setVisible(true);
    } catch (error) {
      console.error("Error fetching all Routing list:", error);
    }
  };

  useEffect(() => {
    const fetchActivityId = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const machineParam = urlParams.get("ActivityId")?.replace(/['"]/g, "");
      const secound = urlParams.get("refreshSecond")?.replace(/['"]/g, "");

      try {
        const payload = {
          site: cookies.site,
          activityId: machineParam,
          currentSite: cookies.site,
        };
        const activityId = await retrieveActivity(
          payload.site,
          payload.activityId,
          payload.currentSite
        );
        console.log(activityId?.activityRules[0]?.setting, "activityId");
        const machineRule = activityId?.activityRules?.find(
          (rule: { ruleName: string }) =>
            rule?.ruleName?.toLowerCase() === "machinedata"
        );
        // const refreshSecond = activityId?.activityRules?.find(
        //   (rule: { ruleName: string }) =>
        //     rule?.ruleName?.toLowerCase() === "refreshsecond"
        // );
        // console.log(refreshSecond?.setting, "refreshSecond");
        // if (refreshSecond?.setting) {
        //   setRefreshSecond(refreshSecond?.setting);
        // }
        if (secound) {
          console.log(secound, "secound if");
          setRefreshSecond(Number(secound));
        } else {
          console.log(secound, "secound else");
          setRefreshSecond(0);
        }
        if (machineRule?.setting?.toLowerCase() == "true") {
          setShowToggle(true);
          setMachineToggle(true);
          setEventSource("machine");
        } else {
          setShowToggle(false);
          setMachineToggle(false);
          setEventSource("manual");
        }
      } catch (error) {
        setRefreshSecond(0);
        console.error("Error retrieving activity:", error);
      }
    };
    fetchActivityId();
    openModal(null);
  }, [cookies.site]);

  // Handle data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!cookies.site || !isAuthenticated) {
        return;
      }

      setIsLoading(true);
      // const shiftBoValue = "ShiftBO:" + cookies?.site + shiftType;
      // const oDate = selectedDate?.[0];
      const payload = machineToggle
        ? {
          site: cookies.site,
          eventSource: "machine",
          date: selectedDate,
          shift: null,
        }
        : {
          site: cookies.site,
          eventSource: "manual",
          date: shiftBoValue,
          shift: null,
        };

      try {
        const [
          plantResponse,
          durationComparectionData,
          allGraphData,
          oeeInsightsDataResponse,
          machineDowntimeDataResponse,
          lineDataResponse,
          oeeComponentsTrendResponse,
          topLossTrendResponse,
          graphDataByDayResponse,
        ] = await Promise.all([
          //get_oee_plantdata
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "getoeeplantdata"
          ).catch(() => ({ data: { data: [] } })),
          //compare_oee_trends
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "compareOeeTrends"
          ).catch(() => ({ data: { data: [] } })),
          //get_shift_trends
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "getShiftTrends"
          ).catch(() => ({ data: { data: [] } })),
          //get_combined_oee_insights
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "getOeeInsightsForManagementDashboard"
          ).catch(() => ({ data: { data: [] } })),
          //get_shift_top5_downtime_resources
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "machineDowntime"
          ).catch(() => ({ data: { data: [] } })),
          //get_workcenter_oee_avg
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "lineData"
          ).catch(() => ({ data: { data: [] } })),
          //compare_oee_components_trend (4)
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "compareOeeComponentsTrend"
          ).catch(() => ({ data: { data: [] } })),
          //get_top_loss_trend
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "topLossTrend"
          ).catch(() => ({
            data: {
              data: [
                {
                  get_top_loss_trend: {
                    value: JSON.stringify({
                      value: JSON.stringify({
                        Top_Loss_Trend: { shiftData: [], value: 0, status: "" },
                      }),
                    }),
                  },
                },
              ],
            },
          })),
          //get_oee_trend_by_day
          fetchEndpointsData(
            payload,
            "oee-service/apiregistry",
            "getShiftDay"
          ).catch(() => ({ data: { data: [] } })),
        ]);
        //set header data
        setHeaderData(plantResponse?.data?.data || []);
        console.log(headerData);
        //set duration comparection data
        setDurationComparection(durationComparectionData?.data?.data || []);
        //set graph data
        try {
          const parsedGraphData =
            allGraphData?.data?.data?.map(
              (item: { get_shift_trends: { value: string } }) => {
                try {
                  const graphValue = JSON.parse(
                    item?.get_shift_trends?.value || "{}"
                  );
                  return graphValue;
                } catch (e) {
                  console.error("Error parsing graph data:", e);
                  return {};
                }
              }
            ) || [];
          setGraphData(parsedGraphData);
        } catch (e) {
          console.error("Error processing graph data:", e);
          setGraphData([]);
        }

        try {
          const parsedGraphDataDay =
            graphDataByDayResponse?.data?.data?.map(
              (item: { get_shift_day: { value: string } }) => {
                try {
                  const graphValue = JSON.parse(
                    item?.get_shift_day?.value || "{}"
                  );
                  return graphValue;
                } catch (e) {
                  console.error("Error parsing day graph data:", e);
                  return {};
                }
              }
            ) || [];
          setGraphDataByDay(parsedGraphDataDay);
        } catch (e) {
          console.error("Error processing day graph data:", e);
          setGraphDataByDay([]);
        }

        //set oee insights data
        try {
          const oeeInsightsData = oeeInsightsDataResponse?.data?.data || [];
          const parsedInsights = oeeInsightsData
            .map((insight) => {
              try {
                const insightValue = JSON.parse(insight.insights.value);
                return {
                  type: insight.insight_type,
                  insights: insightValue,
                };
              } catch (e) {
                console.error("Error parsing individual insight:", e);
                return null;
              }
            })
            .filter(Boolean);
          setGetOeeInsightsData(parsedInsights);
          console.log(parsedInsights);
        } catch (e) {
          console.error("Error parsing OEE insights data:", e);
          setGetOeeInsightsData([]);
        }
        //set machine downtime data
        setMachineDowntimeData(machineDowntimeDataResponse?.data?.data || []);
        //set line data
        setLineData(lineDataResponse?.data?.data || []);
        //set top loss trend
        try {
          if (
            topLossTrendResponse?.data?.data?.[0]?.get_top_loss_trend?.value
          ) {
            const parsedValue = JSON.parse(
              topLossTrendResponse.data.data[0].get_top_loss_trend.value
            );
            const parsedTopLossTrend = JSON.parse(parsedValue.value);
            const formattedData = [
              {
                shiftData: (
                  parsedTopLossTrend.Top_Loss_Trend?.shiftData || []
                ).map((shift: any) => ({
                  name: shift.name || "",
                  value: shift.value || 0,
                })),
                value: parsedTopLossTrend.Top_Loss_Trend?.value || 0,
                status: parsedTopLossTrend.Top_Loss_Trend?.status || "",
              },
            ];
            setTopLossTrend(formattedData);
          } else {
            setTopLossTrend([]);
          }
        } catch (e) {
          console.error("Error processing top loss trend data:", e);
          setTopLossTrend([]);
        }
        //set oee components trend
        setOeeComponentsTrend(oeeComponentsTrendResponse?.data?.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setHeaderData([]);
        setDurationComparection([]);
        setGraphData([]);
        setGraphDataByDay([]);
        setGetOeeInsightsData([]);
        setMachineDowntimeData([]);
        setLineData([]);
        setOeeComponentsTrend([]);
        setTopLossTrend([]);
      } finally {
        setIsLoading(false);
      }
    };

    let intervalId: NodeJS.Timeout;

    if (cookies.site) {
      fetchDashboardData();

      if (refreshSecond > 0) {
        intervalId = setInterval(() => {
          fetchDashboardData();
        }, refreshSecond * 1000);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    cookies.site,
    isAuthenticated,
    machineToggle,
    refreshSecond,
    // selectedView,
  ]);

  const handleWorkcenterChange = async (workcenterId: string) => {
    //retrieve
    const payload = {
      site: cookies.site,
      workCenter: workcenterId,
      workCenterCategory: "Cell",
    };
    try {
      const [workcenterDataRetriveResponse] = await Promise.all([
        fetchEndpointsData(payload, "workcenter-service", "retrieve").catch(
          () => ({})
        ),
      ]);
      console.log(workcenterDataRetriveResponse);
      setWorkcenterDataRetrive(workcenterDataRetriveResponse || {});
    } catch (error) {
      console.error("Error fetching workcenter data:", error);
      setWorkcenterDataRetrive({});
    }
  };

  const fetchDashboardData = async () => {
    if (!cookies.site || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    // const shiftBoValue = "ShiftBO:" + cookies?.site + shiftType;
    // const oDate = selectedDate?.[0];
    const payload = machineToggle
      ? {
        site: cookies.site,
        eventSource: "machine",
        date: selectedDate,
        shift: shiftBoValue,
      }
      : {
        site: cookies.site,
        eventSource: "manual",
        date: selectedDate,
        shift: shiftBoValue,
      };

    try {
      const [
        plantResponse,
        durationComparectionData,
        allGraphData,
        oeeInsightsDataResponse,
        machineDowntimeDataResponse,
        lineDataResponse,
        oeeComponentsTrendResponse,
        topLossTrendResponse,
        graphDataByDayResponse,
      ] = await Promise.all([
        //get_oee_plantdata
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "getoeeplantdata"
        ).catch(() => ({ data: { data: [] } })),
        //compare_oee_trends
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "compareOeeTrends"
        ).catch(() => ({ data: { data: [] } })),
        //get_shift_trends
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "getShiftTrends"
        ).catch(() => ({ data: { data: [] } })),
        //get_combined_oee_insights
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "getOeeInsightsForManagementDashboard"
        ).catch(() => ({ data: { data: [] } })),
        //get_shift_top5_downtime_resources
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "machineDowntime"
        ).catch(() => ({ data: { data: [] } })),
        //get_workcenter_oee_avg
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "lineData"
        ).catch(() => ({ data: { data: [] } })),
        //compare_oee_components_trend (4)
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "compareOeeComponentsTrend"
        ).catch(() => ({ data: { data: [] } })),
        //get_top_loss_trend
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "topLossTrend"
        ).catch(() => ({
          data: {
            data: [
              {
                get_top_loss_trend: {
                  value: JSON.stringify({
                    value: JSON.stringify({
                      Top_Loss_Trend: { shiftData: [], value: 0, status: "" },
                    }),
                  }),
                },
              },
            ],
          },
        })),
        //get_oee_trend_by_day
        fetchEndpointsData(
          payload,
          "oee-service/apiregistry",
          "getShiftDay"
        ).catch(() => ({ data: { data: [] } })),
      ]);
      //set header data
      setHeaderData(plantResponse?.data?.data || []);
      console.log(headerData);
      //set duration comparection data
      setDurationComparection(durationComparectionData?.data?.data || []);
      //set graph data
      try {
        const parsedGraphData =
          allGraphData?.data?.data?.map(
            (item: { get_shift_trends: { value: string } }) => {
              try {
                const graphValue = JSON.parse(
                  item?.get_shift_trends?.value || "{}"
                );
                return graphValue;
              } catch (e) {
                console.error("Error parsing graph data:", e);
                return {};
              }
            }
          ) || [];
        setGraphData(parsedGraphData);
      } catch (e) {
        console.error("Error processing graph data:", e);
        setGraphData([]);
      }

      try {
        const parsedGraphDataDay =
          graphDataByDayResponse?.data?.data?.map(
            (item: { get_shift_day: { value: string } }) => {
              try {
                const graphValue = JSON.parse(
                  item?.get_shift_day?.value || "{}"
                );
                return graphValue;
              } catch (e) {
                console.error("Error parsing day graph data:", e);
                return {};
              }
            }
          ) || [];
        setGraphDataByDay(parsedGraphDataDay);
      } catch (e) {
        console.error("Error processing day graph data:", e);
        setGraphDataByDay([]);
      }

      //set oee insights data
      try {
        const oeeInsightsData = oeeInsightsDataResponse?.data?.data || [];
        const parsedInsights = oeeInsightsData
          .map((insight) => {
            try {
              const insightValue = JSON.parse(insight.insights.value);
              return {
                type: insight.insight_type,
                insights: insightValue,
              };
            } catch (e) {
              console.error("Error parsing individual insight:", e);
              return null;
            }
          })
          .filter(Boolean);
        setGetOeeInsightsData(parsedInsights);
        console.log(parsedInsights);
      } catch (e) {
        console.error("Error parsing OEE insights data:", e);
        setGetOeeInsightsData([]);
      }
      //set machine downtime data
      setMachineDowntimeData(machineDowntimeDataResponse?.data?.data || []);
      //set line data
      setLineData(lineDataResponse?.data?.data || []);
      //set top loss trend
      try {
        if (topLossTrendResponse?.data?.data?.[0]?.get_top_loss_trend?.value) {
          const parsedValue = JSON.parse(
            topLossTrendResponse.data.data[0].get_top_loss_trend.value
          );
          const parsedTopLossTrend = JSON.parse(parsedValue.value);
          const formattedData = [
            {
              shiftData: (
                parsedTopLossTrend.Top_Loss_Trend?.shiftData || []
              ).map((shift: any) => ({
                name: shift.name || "",
                value: shift.value || 0,
              })),
              value: parsedTopLossTrend.Top_Loss_Trend?.value || 0,
              status: parsedTopLossTrend.Top_Loss_Trend?.status || "",
            },
          ];
          setTopLossTrend(formattedData);
        } else {
          setTopLossTrend([]);
        }
      } catch (e) {
        console.error("Error processing top loss trend data:", e);
        setTopLossTrend([]);
      }
      //set oee components trend
      setOeeComponentsTrend(oeeComponentsTrendResponse?.data?.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setHeaderData([]);
      setDurationComparection([]);
      setGraphData([]);
      setGraphDataByDay([]);
      setGetOeeInsightsData([]);
      setMachineDowntimeData([]);
      setLineData([]);
      setOeeComponentsTrend([]);
      setTopLossTrend([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    message.destroy();
    // debugger
    if (
      selectedDate != undefined &&
      selectedDate != null &&
      selectedDate != "" &&
      (shiftBoValue == undefined || shiftBoValue == null || shiftBoValue == "")
    ) {
      message.error("Please select a shift");
      return;
    } else if (
      shiftBoValue != undefined &&
      shiftBoValue != null &&
      shiftBoValue != "" &&
      (selectedDate == undefined || selectedDate == null || selectedDate == "")
    ) {
      message.error("Please select a date");
      return;
    } else {
      fetchDashboardData();
    }
  };

  const metrics =
    headerData.length > 0
      ? [
        {
          title: "OEE",
          value: Number(headerData[0].oee.toFixed(2)),
          icon: <FiActivity />,
          rightValue: {
            targetQty: headerData[0].planned_quantity.toFixed(2),
            actualQty: headerData[0].total_quantity.toFixed(2),
          },
        },
        {
          title: "Performance",
          value: Number(headerData[0].performance.toFixed(2)),
          icon: <MdOutlineSpeed />,
          rightValue: {
            targetQty: headerData[0].planned_quantity.toFixed(2),
            actualQty: headerData[0].total_quantity.toFixed(2),
          },
        },
        {
          title: "Availability",
          value: Number(headerData[0].availability.toFixed(2)),
          icon: <MdOutlineEqualizer />,
          rightValue: {
            availableTime: headerData[0].actual_time.toFixed(2),
            downtime: headerData[0].total_downtime.toFixed(2),
          },
        },
        {
          title: "Quality",
          value: Number(headerData[0].quality.toFixed(2)),
          icon: <MdLayers />,
          rightValue: {
            goodQty: headerData[0].total_good_quantity.toFixed(2),
            badQty: headerData[0].total_bad_quantity.toFixed(2),
          },
        },
      ]
      : [
        { title: "OEE", value: 0, icon: <FiActivity />, rightValue: {} },
        {
          title: "Performance",
          value: 0,
          icon: <MdOutlineSpeed />,
          rightValue: {},
        },
        {
          title: "Availability",
          value: 0,
          icon: <MdOutlineEqualizer />,
          rightValue: {},
        },
        { title: "Quality", value: 0, icon: <MdLayers />, rightValue: {} },
      ];

  const handleViewChange = (view: WorkcenterData) => {
    setSelectedView(view);
    handleWorkcenterChange(view.workcenter_id);
    console.log(workcenterDataRetrive);
  };

  const handleShiftChange = (value: any) => {
    value = value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    setSelectedShift(value);
    setShiftBoValue(
      "ShiftBO:" + cookies?.site + "," + value?.shiftType + "," + value?.shiftId
    );
  };

  const handleRowSelection = (record: any) => {
    setSelectedShift(record?.shiftId);
    setShiftBoValue(
      "ShiftBO:" +
      cookies?.site +
      "," +
      record?.shiftType +
      "," +
      record?.shiftId
    );
    setVisible(false);
  };

  const renderContent = () => {
    if (selectedView) {
      return (
        <div className={styles.fadeIn}>
          <WorkcenterComponent
            selectedView={selectedView}
            onBack={() => setSelectedView(null)}
            eventSource={machineToggle ? "machine" : "manual"}
            workcenterDataRetrive={workcenterDataRetrive}
            selectedDate={selectedDate}
            shiftBoValue={shiftBoValue}
          />
        </div>
      );
    }

    return (
      <>
        {/* <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col span={24}>
            {lineData.length > 0 ? (
              <ProductionTypeCard
                onViewChange={handleViewChange}
                data={lineData}
              />
            ) : (
              <NoDataScreen subMessage="Currently no workcenter data" />
            )}
          </Col>
          <Col span={8}>
            {oeeComponentsTrend.length > 0 ? (
              <DivisionSnapCard
                availability={Number(
                  oeeComponentsTrend[0]?.availability_val?.toFixed(2)
                )}
                performance={Number(
                  oeeComponentsTrend[0]?.performance_val?.toFixed(2)
                )}
                quality={Number(oeeComponentsTrend[0]?.quality_val?.toFixed(2))}
                oeeScore={Number(oeeComponentsTrend[0]?.oee_val?.toFixed(2))}
                availabilityNote={oeeComponentsTrend[0]?.avail_msg}
                performanceNote={oeeComponentsTrend[0]?.perf_msg}
                qualityNote={oeeComponentsTrend[0]?.qual_msg}
              />
            ) : (
              <NoDataScreen subMessage="Currently no oee components trend data" />
            )}
          </Col>
          <Col span={8}>
            {getOeeInsightsData.length > 0 ? (
              <ActionableInsights insights={getOeeInsightsData} />
            ) : (
              <NoDataScreen subMessage="Currently no oee insights data" />
            )}
          </Col>
          <Col span={8}>
            {machineDowntimeData.length > 0 ? (
              <MachineDowntime data={machineDowntimeData} />
            ) : (
              <NoDataScreen subMessage="Currently no machine downtime data" />
            )}
          </Col>
        </Row> */}

        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          {/* <Col span={8}>
            {getOeeInsightsData.length > 0 ? (
              <ActionableInsights insights={getOeeInsightsData} />
            ) : (
              <NoDataScreen subMessage="Currently no oee insights data" />
            )}
          </Col> */}

          <Col span={8}>
            <div style={{ marginBottom: "10px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "5px",
                  flexDirection: "row",
                }}
              >
                <DatePicker
                  style={{ width: "50%" }}
                  onChange={(date) =>
                    setSelectedDate(date ? date.format("YYYY-MM-DD") : null)
                  }
                  value={selectedDate ? dayjs(selectedDate) : null}
                  placeholder="Select Date"
                  format="DD-MM-YYYY"
                />
                {/* <Input
                  placeholder="Enter Shift"
                  value={selectedShift}
                  // onChange={(e) => setSelectedShift(e.target.value)}
                  onChange={(e) => handleShiftChange(e.target.value)}
                  style={{ width: "50%" }}
                  suffix={
                      <Tooltip title="Browse Shift">
                        <GrChapterAdd
                          onClick={(e) =>
                            openModal(e)
                          }
                        />
                      </Tooltip>
                  }
                /> */}
                <Select
                  placeholder="Select Shift"
                  value={selectedShift}
                  showSearch
                  allowClear
                  onClear={() => {
                    setShiftBoValue(null);
                    setSelectedShift(null);
                  }}
                  onSearch={(value) => handleShiftChange(value)}
                  onChange={(value) => {
                    setSelectedShift(value);
                    const selectedRecord = shiftData.find(
                      (item: any) => item.handle === value
                    );
                    if (selectedRecord) {
                      setShiftBoValue(selectedRecord.handle);
                    }
                  }}
                  style={{ width: "50%" }}
                  // suffixIcon={<DownOutlined />}
                  options={shiftData.map((shift: any) => ({
                    label: shift.shiftId,
                    value: shift.handle,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
                <Button
                  icon={<SearchOutlined className={styles.searchButton} />}
                  onClick={handleSearch}
                  style={{ padding: "4px 8px" }}
                  type="primary"
                >
                  Search
                </Button>
               <span>
                <InstructionModal title="User Instructions">
                  <UserInstructions />
                </InstructionModal>
               </span>
              </div>
            </div>
            <ActionableInsights height="250px" insights={getOeeInsightsData[0]} /> 
            {getOeeInsightsData[0]?.insights?.length > 0 ? (
              <ActionableInsights height="250px" insights={getOeeInsightsData[0]} />
            ) : (
              <div style={{ height: "250px" }}>
                <NoDataScreen subMessage="Currently no oee insights data" />
              </div>
            )}
            <div style={{ marginTop: "10px" }} />
            {getOeeInsightsData[1]?.insights?.length > 0 ? (
              <ActionableInsights height="225px" insights={getOeeInsightsData[1]} />
            ) : (
              <div style={{ height: "225px" }}>
                <NoDataScreen subMessage="Currently no oee insights data" />
              </div>
            )}
          </Col>

          <Col span={8}>
            <Row>
              <Col span={24}>
                {lineData.length > 0 ? (
                  <ProductionTypeCard
                    onViewChange={handleViewChange}
                    data={lineData}
                  />
                ) : (
                  <NoDataScreen subMessage="Currently no workcenter data" />
                )}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                {oeeComponentsTrend.length > 0 ? (
                  <DivisionSnapCard
                    // availability={Number(oeeComponentsTrend[0]?.availability_val?.toFixed(2))}
                    availability={Number(
                      oeeComponentsTrend[0]?.availability_val === 0
                        ? "0"
                        : oeeComponentsTrend[0]?.availability_val === 100
                          ? "100"
                          : oeeComponentsTrend[0]?.availability_val?.toFixed(2)
                    )}
                    performance={Number(
                      oeeComponentsTrend[0]?.performance_val === 0
                        ? "0"
                        : oeeComponentsTrend[0]?.performance_val === 100
                          ? "100"
                          : oeeComponentsTrend[0]?.performance_val?.toFixed(2)
                    )}
                    quality={Number(
                      oeeComponentsTrend[0]?.quality_val === 0
                        ? "0"
                        : oeeComponentsTrend[0]?.quality_val === 100
                          ? "100"
                          : oeeComponentsTrend[0]?.quality_val?.toFixed(2)
                    )}
                    oeeScore={Number(
                      oeeComponentsTrend[0]?.oee_val === 0
                        ? "0"
                        : oeeComponentsTrend[0]?.oee_val === 100
                          ? "100"
                          : oeeComponentsTrend[0]?.oee_val?.toFixed(2)
                    )}
                    availabilityNote={oeeComponentsTrend[0]?.avail_msg}
                    performanceNote={oeeComponentsTrend[0]?.perf_msg}
                    qualityNote={oeeComponentsTrend[0]?.qual_msg}
                    oeeNote={oeeComponentsTrend[0]?.oee_msg}
                  />
                ) : (
                  <NoDataScreen subMessage="Currently no oee components trend data" />
                )}
              </Col>
              <Col span={24}>
                {machineDowntimeData.length > 0 ? (
                  <MachineDowntime data={machineDowntimeData} />
                ) : (
                  <NoDataScreen subMessage="Currently no machine downtime data" />
                )}
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={24}>
                {getOeeInsightsData[2]?.insights?.length > 0 ? (
                  <ActionableInsights
                    height="250px"
                    insights={getOeeInsightsData[2]}
                  />
                ) : (
                  <div style={{ height: "250px" }}>
                    <NoDataScreen subMessage="Currently no oee insights data" />
                  </div>
                )}
              </Col>
            </Row>
            <div style={{ marginTop: "10px" }} />
            <Row>
              <Col span={24}>
                {getOeeInsightsData[3]?.insights?.length > 0 ? (
                  <ActionableInsights
                    height="260px"
                    insights={getOeeInsightsData[3]}
                  />
                ) : (
                  <div style={{ height: "260px" }}>
                    <NoDataScreen subMessage="Currently no oee insights data" />
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <LineGraph
              data={graphDataByDay[0]?.OEE_Trend_Over_Time || []}
              title={"OEE By Day"}
              color={{
                threshold: [50, 85],
                itemcolor: ["#ff4d4f", "#faad14", "#52c41a"],
              }}
            />
          </Col>
          <Col span={8}>
            <LineGraph
              data={graphDataByDay[0]?.Performance_Trend_Over_Time || []}
              title={"Performance By Day"}
              color={[]}
            />
          </Col>
          <Col
            span={8}
            style={{
              width: "100%",
              borderRadius: "10px",
            }}
          >
            <BarChartPopup
              data={graphDataByDay[0]?.Quality_Trend_Over_Time || []}
              title={"Quality By Day"}
              color={"#5e9b94"}
              theshold={undefined}
              setShowDrillDown={setShowDrillDown}
              machineToggle={machineToggle}
              enableDrillDown={false}
            />
          </Col>
          <Col span={6}>
            <LineGraph
              data={graphData[0]?.OEE_Trend_Over_Time || []}
              title={"OEE By Month"}
              color={{
                threshold: [50, 85],
                itemcolor: ["#ff4d4f", "#faad14", "#52c41a"],
              }}
            />
          </Col>
          <Col span={6}>
            <LineGraph
              data={graphData[0]?.Performance_Trend_Over_Time || []}
              title={"Performance By Month"}
              color={[]}
            />
          </Col>
          <Col
            span={6}
            style={{
              width: "100%",
              borderRadius: "10px",
            }}
          >
            <BarChartPopup
              data={graphData[0]?.Quality_Trend_Over_Time || []}
              title={"Quality By Month"}
              color={"#5e9b94"}
              theshold={undefined}
              setShowDrillDown={setShowDrillDown}
              machineToggle={machineToggle}
              enableDrillDown={false}
            />
          </Col>
          <Col span={6}>
            <div
              style={{
                width: "100%",
                border: "1px solid #f0f0f0",
                background: "white",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: "80%" }}>
                  <BarChartPopup
                    data={topLossTrend[0]?.shiftData || []}
                    title="Top Loss Trend"
                    color={"#5e9b94"}
                    setShowDrillDown={setShowDrillDown}
                    machineToggle={machineToggle}
                    enableDrillDown={true}
                  />
                </div>
                <div
                  style={{
                    width: "20%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {topLossTrend[0]?.status === "increase" ? (
                      <TiArrowSortedUp fill="red" size={24} />
                    ) : (
                      <TiArrowSortedDown fill="green" size={24} />
                    )}
                    <text style={{ fontSize: 22, fontWeight: 600 }}>
                      {topLossTrend[0]?.value === 0
                        ? "0"
                        : topLossTrend[0]?.value?.toFixed(2)}
                      %
                    </text>
                  </div>
                  <text
                    style={{ fontSize: 18, color: "#666", fontWeight: "bold" }}
                  >
                    {topLossTrend[0]?.status}
                  </text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <Layout
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        paddingBottom: "40px", // Add padding to account for fixed footer
      }}
    >
      <CommonAppBar
        onSearchChange={() => {}}
        allActivities={[]}
        username={username}
        site={null}
        appTitle={"Management Report"}
        onSiteChange={() => {}}
      />

      {isLoading && <LoadingScreen />}
      
      {showDrillDown ? (
        <div style={{ 
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          minHeight: "calc(100vh - 80px)", 
          height: "100%",
          backgroundColor: 'white'
        }}>
          <div style={{backgroundColor: 'white'}}>
            <Button style={{ margin: "10px" }} onClick={() => setShowDrillDown(false)}>
              Back
            </Button>
          </div>

          <div style={{ 
            background: "white", 
            display: "flex", 
            flexDirection: "column",
            flex: 1
          }}>
            <Row>
              <Col span={24}>
                <p style={{ textAlign: 'left', margin: '10px' }}><strong>Date:</strong> {selectedTopLossDate} &nbsp; &nbsp; &nbsp; &nbsp; <strong>Top loss %:</strong> {selectedTopLossPercentage}</p>
              </Col>
            </Row>
            <Row style={{ flex: 1 }}>
              <Col span={24}>
                <Card size="small" style={{ height: "100%", marginTop: "0px", width: "99%", marginLeft: "8px" }}>
                  <TopLossBarchartForWorkCenter
                    data={topLossForWorkcenterData || []}
                    title="Top Loss Trend For Work Center"
                    color={"#5e9b94"}
                    setShowDrillDown={setShowDrillDown}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ justifyContent: "space-around", flex: 1, marginBottom: "16px" }}>
              <Col span={18}>
                <Card size="small" style={{ height: "100%", marginTop: "10px", width: "99%", marginLeft: "8px" }}>
                  <TopLossBarchartForResource
                    data={topLossForResourceData || []}
                    title="Top Loss Trend For Resource"
                    color={"#5e9b94"}
                    setShowDrillDown={setShowDrillDown}
                  />
                </Card>
              </Col>
              <Col span={6}>
                {/* <Card size="small" style={{ height: "100%", marginTop: "10px", width: "99%" }}> */}
                  <ReasonCodeDonutChart
                    title="Reason Code"
                    rejectedData={reasonCodeForResourceData}
                  />
                {/* </Card> */}
              </Col>
            </Row>
          </div>
        </div>
      ) : (
        <>
          {/* Your regular view content */}
          <div style={{ opacity: isLoading ? 0.5 : 1, transition: "opacity 0.3s" }}>
            {!selectedView && (
              <Header
                style={{
                  padding: "0px 25px",
                  // background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
                  background: "#fff",
                  borderBottom: "1px solid #e0e0e0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: "90px",
                  // padding: "5px",
                  width: "100%",
                  maxWidth: "100%",
                  display: "flex",
                  justifyContent: "space-evenly",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <Row gutter={[16, 16]} style={{}}>
                  {metrics.map(
                    (
                      metric: {
                        title: string;
                        value: any;
                        icon: unknown;
                        rightValue: {
                          targetQty?: number;
                          actualQty?: number;
                          availableTime?: number;
                          downtime?: number;
                          goodQty?: number;
                          badQty?: number;
                        };
                      },
                      index: React.Key
                    ) => (
                      <Col span={metric.title === "OEE" ? 3 : 7} key={index}>
                        <HeaderCard
                          title={metric.title}
                          value={Number(metric.value)}
                          color=""
                          icon={metric.icon}
                          rightValue={metric.rightValue}
                        />
                      </Col>
                    )
                  )}
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: "5px" }}>
                  <Col span={6}>
                    <DurationCard
                      title="Day"
                      currentValue={durationComparection[0]?.current_day_oee || 0}
                      previousValue={durationComparection[0]?.previous_day_oee || 0}
                      period="Last Day"
                    />
                  </Col>
                  <Col span={6}>
                    <DurationCard
                      title="Week"
                      currentValue={durationComparection[0]?.current_week_oee || 0}
                      previousValue={
                        durationComparection[0]?.previous_week_oee || 0
                      }
                      period="Last Week"
                    />
                  </Col>
                  <Col span={6}>
                    <DurationCard
                      title="Month"
                      currentValue={durationComparection[0]?.current_month_oee || 0}
                      previousValue={
                        durationComparection[0]?.previous_month_oee || 0
                      }
                      period="Last Month"
                    />
                  </Col>
                  <Col span={6}>
                    <DurationCard
                      title="Year"
                      currentValue={durationComparection[0]?.current_year_oee || 0}
                      previousValue={
                        durationComparection[0]?.previous_year_oee || 0
                      }
                      period="Last Year"
                    />
                  </Col>
                </Row>
              </Header>
            )}

            <Content
              style={{
                background: "#fff",
                flex: 1,
                overflow: "auto",
                position: "relative",
                height: selectedView ? "calc(100vh - 85px)" : "calc(100vh - 175px)",
                display: "flex",
                flexDirection: "column",
                padding: "16px",
              }}
            >
              {renderContent()}
            </Content>
          </div>

          <Modal
            title={
              <>
                {t("selectShift")}

                <Tooltip title="Select Shift"></Tooltip>
              </>
            }
            open={visible}
            // onOk={handleModalOk}
            onCancel={() => setVisible(false)}
            width={800}
            footer={null}
          >
            <Table
              columns={shiftColumns}
              dataSource={shiftData}
              onRow={(record) => ({
                onDoubleClick: () => handleRowSelection(record),
              })}
              pagination={false}
              scroll={{ y: 300 }}
              size="small"
              bordered
            />
          </Modal>
        </>
      )}

      {/* Single footer component for both views */}
      <AppFooter 
        showToggle={showToggle}
        selectedView={selectedView}
        machineToggle={machineToggle}
        setMachineToggle={setMachineToggle}
        eventSource={eventSource}
        setEventSource={setEventSource}
      />
    </Layout>
  );
}

export default OverallDashBoardMain;
