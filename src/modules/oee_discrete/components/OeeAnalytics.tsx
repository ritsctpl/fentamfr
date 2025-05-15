import React, { useState, useEffect, useRef } from "react";
import { Button, Checkbox, Drawer, Layout, Modal, ConfigProvider, Space } from "antd";
import CommonTabs from "./subComponents/CommonTabs";
import OeeScreen from "./oee/OeeMainScreen";
import DownTime from "@modules/oee_discrete/components/DownTime";
import Performance from "@modules/oee_discrete/components/Performance";
import Availability from "@modules/oee_discrete/components/availabilityComponents/Availability";
import QualityScreen from "@modules/oee_discrete/components/qualityDashBoard/QualityMainScreen";
import CommonAccordion from "./subComponents/CommonAccordion";
import { CalendarOutlined, DashboardOutlined, SettingOutlined, ProductOutlined } from "@ant-design/icons";
import { FaRegFilePdf } from "react-icons/fa6";
import { IoIosColorPalette } from "react-icons/io";
import { MenuOutlined } from "@mui/icons-material";
import { MyProvider, useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { fetchOee, fetchWorkCenter, fetchResource, fetchBatch } from "@services/oeeServices";
import { parseCookies } from "nookies";
import { fetchOperation } from "@services/operationService";
import { fetchTop50 } from "@services/itemServices";
import { decryptToken } from "@utils/encryption";
import { DecodedToken } from "../types/userTypes";
import jwtDecode from "jwt-decode";
import { useTranslation } from "react-i18next";
import { useAuth } from "@context/AuthContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import PdfContent from "@modules/oee_discrete/components/PdfContent";
import FilterSettings from "./setting";
import { SettingsDataProvider } from "../hooks/settingsData";
import CommonAppBar from "@components/CommonAppBar";
import FentaLogo from "../../../images/fenta_logo.png";
import ColorPallete from "./subComponents/ColorPallete";
import { retrieveActivity } from "@services/activityService";

const { Footer, Sider, Content } = Layout;

const OeeAnalytics: React.FC = () => {
  // const { setCall } = useFilterContext();
  const cookies = parseCookies();
  const [deactive, setDeactive] = useState([]);
  const [shiftData, setShiftData] = useState([]);
  const [operationData, setOperationData] = useState([]);
  const [workcenterData, setWorkcenterData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [batchNo, setBatchNo] = useState([]);
  const [hamburger, setHamburger] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [componentIds, setComponentIds] = useState<string[]>([]);
  const [filterReset, setFilterReset] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [options, setOptions] = useState([
    { label: "Oee", value: "oee" },
    { label: "Down Time", value: "downtime" },
    { label: "Performance", value: "performance" },
    { label: "Availability", value: "availability" },
    { label: "Quality", value: "quality" },
  ]);
  const [selectAll, setSelectAll] = useState(false);

  console.log(componentIds, "componentIds");

  const handleSelectAllChange = (e: any) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setComponentIds(options.map((option) => option.value));
    } else {
      setComponentIds([]);
    }
  };

  const handleCheckboxChange = (checkedValues: any) => {
    setComponentIds(checkedValues);
    setSelectAll(checkedValues.length === options.length);
  };

  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const allActivities = [];
  const handleSiteChange = (newSite: string) => {
    setSite(newSite);
  };

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `.ant-card .ant-card-head {border-bottom: ${"1px solid var(--line-color)"}}`;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const fetchShiftData = async () => {
      if (isAuthenticated && token) {
        try {
          const decryptedToken = decryptToken(token);
          const decoded: DecodedToken = jwtDecode(decryptedToken);
          setUsername(decoded.preferred_username);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      const cookies = parseCookies();
      const site = cookies.site;
      setSite(site);
    };

    fetchShiftData();
  }, [isAuthenticated, token, site]);
  useEffect(() => {
    const fetchActivityId = async () => {

      const urlParams = new URLSearchParams(window.location.search);
      const machineParam = urlParams.get('ActivityId')?.replace(/['"]/g, '');
      console.log(machineParam , "machineParam");
      try {
          const payload = {
            site: cookies.site,
            activityId: machineParam,
            currentSite: cookies.site,
          };
          const activityId = await retrieveActivity(payload.site, payload.activityId, payload.currentSite);
          console.log(activityId?.activityRules[0]?.setting, "activityId");
          const machineRule = activityId?.activityRules?.find(
            (rule: { ruleName: string; }) => rule?.ruleName?.toLowerCase() === "machinedata"
          );
          
          if (machineRule?.setting?.toLowerCase() === 'true') {
            setShowToggle(true);
            // setMachineToggle(true);
          } else {
            setShowToggle(false);
            // setMachineToggle(false);
          }
      } catch (error) {
        console.error("Error retrieving activity:", error);
      }
    }
    fetchActivityId();
  }, [cookies.site]);

  const filterApii = () => {
    setHamburger(!hamburger)
    const fetchShiftData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const activities = await fetchOee(site);
        console.log("Shift Data: ", activities);
        setShiftData(activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchShiftData();
    const fetchOperationData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const activities = await fetchOperation(site);
        setOperationData(activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchOperationData();

    const fetchWorkcenterData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const activities = await fetchWorkCenter(site);
        setWorkcenterData(activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchWorkcenterData();
    const fetchBatchNo = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const activities = await fetchBatch(site);
        setBatchNo(activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchBatchNo();

    const fetchResourceData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const activities = await fetchResource(site);
        setResourceData(activities);
        console.log("Resource Data: ", activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchResourceData();

    const fetchItemData = async () => {
      const cookies = parseCookies();
      const site = cookies.site; // Retrieve site from cookies
      try {
        let activities = await fetchTop50(site);
        activities = activities.map((item: any, index: any) => ({
          ...item,
          key: index + 1,
        }));
        setItemData(activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchItemData();
  }

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfContent = document.getElementById("pdf-content");

      if (pdfContent) {
        // Ensure all images are loaded
        const images = pdfContent.getElementsByTagName("img");
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // Handle errors
            });
          })
        );

        // Reduce additional wait time for efficiency
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const canvas = await html2canvas(pdfContent, {
          scale: 1.5, // Reduced scale for lower size
          useCORS: true,
          allowTaint: false, // Reduce unnecessary memory usage
          backgroundColor: "#ffffff",
          onclone: (doc) => {
            Array.from(doc.getElementsByTagName("img")).forEach((img) => {
              img.crossOrigin = "anonymous";
              if (!img.src.startsWith("data:")) {
                const originalSrc = img.src;
                img.src = "";
                img.src = originalSrc;
              }
            });
          },
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL("image/jpeg", 0.6);

        const addFooter = () => {
          const footerImg = document.querySelector("#pdf-content img[alt='RITS Logo']") as HTMLImageElement;
          if (footerImg && footerImg.src) {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 277, 210, 20, 'F');
            pdf.addImage(footerImg.src, 'JPEG', 15, 280, 15, 8);
            pdf.setTextColor(128, 128, 128);
            pdf.setFontSize(8);
            pdf.text('All Rights Reserved by Fenta Powered by Rits', 105, 285, { align: 'center' });
          }
        };

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
        addFooter();

        if (imgHeight > 297) {
          const pageHeight = 297;
          let remainingHeight = imgHeight - pageHeight;
          let position = -pageHeight;

          while (remainingHeight > 0) {
            pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            addFooter();
            remainingHeight -= pageHeight;
            position -= pageHeight;
          }
        }

        pdf.save("OEE-Report.pdf");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const tabData = [
    {
      tabname: "OEE",
      icon: null,
      component: <OeeScreen />,
    },
    {
      tabname: "DownTime",
      icon: null,
      component: <DownTime />,
    },
    {
      tabname: "Availability",
      icon: null,
      component: <Availability />,
    },
    {
      tabname: "Performance",
      icon: null,
      component: <Performance />,
    },
    {
      tabname: "Quality",
      icon: null,
      component: <QualityScreen />,
    },
  ];

  const sidbarData = [
    {
      name: "Time Period",
      icon: CalendarOutlined,
      childeren: [
        {
          lable: "TimePeriod",
          type: "date",
          filter: false,
          item: [
            {
              key: "1",
              label: "Today",
            },
            {
              key: "2",
              label: "Last 7 days",
            },
            {
              key: "3",
              label: "Month to date",
            },
          ],
        },
      ],
    },
    {
      name: "Batch Number",
      icon: ProductOutlined,
      childeren: [
        {
          lable: "BatchNumber",
          type: "select",
          menu: batchNo?.map((data) => data?.batchNo),
        },
      ],
    },
    {
      name: "Shift",
      icon: DashboardOutlined,
      childeren: [
        {
          lable: "Shift",
          type: "select",
          menu: shiftData.map((data) => data.handle),
        },
      ],
    },
    {
      name: "Machine / Equipment",
      icon: SettingOutlined,
      childeren: [
        {
          lable: "MachineEquipment",
          type: "test",
          menu: [
            {
              name: "Workcenter",
              workcenter: workcenterData.map((data) => data.workCenter),
            },
            {
              name: "Resource",
              workcenter: resourceData.map((data) => data.resource),
            },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    console.log("componentsIds", componentIds);
  }, [componentIds]);

  const SideBar = () => {
    const { setFilter, setCall } = useFilterContext();

    const handleReset = async () => {
      // Reset filter state
      setFilterReset(!filterReset);
      setFilter({
        TimePeriod: [],
        BatchNumber: [],
        Shift: [],
        ProductionLine: [],
        MachineEquipment: [],
        Item: [],
        DowntimeReason: [],
        Workcenter: [],
        Resource: [],
      });

      // Trigger API refresh
      setCall((prev) => prev + 1);
    };
    return (
      <Sider
        width={hamburger ? "4%" : "20%"}
        style={{
          overflow: "scroll",
          background: "white",
          boxShadow: "0 5px 10px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div
          style={{
            padding: "8px",
            borderBottom: "1px solid #e8e8e8",
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: "white",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => filterApii()}
            style={{ fontSize: "20px" }}
          />
          {!hamburger && (
            <Space>
              <Button danger onClick={handleReset}>
                Reset
              </Button>
            </Space>
          )}
        </div>
        <CommonAccordion
          data={sidbarData}
          showOnlyIcons={hamburger}
          setHamburger={setHamburger}
          deactivelist={deactive}
        />
      </Sider>
    );
  };

  const PreviewButton = () => {
    const { setRefresh } = useFilterContext();

    const handlePreviewClick = () => {
      setIsModalVisible(true);
      setRefresh(true);
    };

    return (
      <Button
        disabled={componentIds.length === 0}
        key="download"
        type="primary"
        onClick={handlePreviewClick}
      >
        Preview
      </Button>
    );
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            headerHeight: 30,
            headerBg: "var(--background-color)",
            colorTextHeading: "var(--text-color)",
            headerHeightSM: 30,
          },
        },
      }}
    >
      <SettingsDataProvider>
        <MyProvider>
          <Layout style={{ overflow: "hidden", height: "100vh" }}>
            <CommonAppBar
              allActivities={allActivities}
              username={username}
              site={site}
              appTitle={`${t("OEE Metrics and Analysis")}`}
              onSiteChange={handleSiteChange}
              onSearchChange={function (): void { }}
            />
            <Layout style={{ background: "#046169" + 10 }}>
              <SideBar />
              <Content style={{ color: "#fff", }}>
                <CommonTabs
                  data={tabData}
                  setDeactive={setDeactive}
                  setVisible={setVisible}
                  setIsModalVisible2={setIsModalVisible2}
                  showToggle={showToggle}
                />
                {/* <Settings /> */}
                <ColorPallete
                  visible={visible}
                  setVisible={setVisible}
                  componentIds={componentIds}
                  setComponentIds={setComponentIds}
                  selectAll={selectAll}
                  handleSelectAllChange={handleSelectAllChange}
                  options={options}
                  handleCheckboxChange={handleCheckboxChange}
                  isModalVisible={isModalVisible}
                  setIsModalVisible={setIsModalVisible}
                  isModalVisible2={isModalVisible2}
                  setIsModalVisible2={setIsModalVisible2}
                  generatePDF={generatePDF}
                />
              </Content>
            </Layout>
            <Footer
              style={{
                zIndex: 1000,
                textAlign: "center",
                height: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={FentaLogo.src}
                alt="Fenta Logo"
                style={{ width: "5vw", height: "8vh" }}
              />
              <div style={{ color: "gray", fontSize: "2vh" }}>
                &copy; {new Date().getFullYear()} Fenta Powered by RITS | All
                Rights Reserved
              </div>
            </Footer>
          </Layout>
        </MyProvider>
      </SettingsDataProvider>
    </ConfigProvider>
  );
};

export default OeeAnalytics;
