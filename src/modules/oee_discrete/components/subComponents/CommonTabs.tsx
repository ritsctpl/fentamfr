import * as React from "react";
import { Tabs, Switch } from "antd";
import Box from "@mui/material/Box";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { Button } from "antd";
import { IoIosColorPalette } from "react-icons/io";
import { FaRegFilePdf } from "react-icons/fa";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            padding: 3,
            maxHeight: "calc(100vh - 150px)",
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface CommonTabsProps {
  tabname: string;
  icon: any;
  component: JSX.Element;
}

interface CommonTabData {
  data: CommonTabsProps[];
  setDeactive: (state: any[]) => void;
  setVisible: (visible: boolean) => void;
  setIsModalVisible2: (visible: boolean) => void;
  showToggle: boolean;
}

const CommonTabs: React.FC<CommonTabData> = ({
  data,
  setDeactive,
  setVisible,
  setIsModalVisible2,
  showToggle,
}) => {
  const {
    value,
    color,
    setValue,
    call,
    setCall,
    machineToggle,
    setMachineToggle,
  } = useFilterContext();
  sessionStorage.setItem("activeTabIndex", data[value]?.tabname.toLowerCase());

  React.useEffect(() => {
    console.log(showToggle, "showToggle");
    if (showToggle) {
      setMachineToggle(true);
    } else {
      setMachineToggle(false);
    }
  }, [showToggle]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCall(call + 1);
    setValue(newValue);
    const selectedTab = data[newValue]?.tabname;
    sessionStorage.setItem("activeTabIndex", selectedTab.toLowerCase());
    if (selectedTab === "DownTime" || selectedTab === "Performance") {
      setDeactive([4]);
    } else {
      setDeactive([]);
    }
  };

  return (
    <Box style={{ width: "100%" }}>
      <Tabs
        activeKey={String(value)}
        onChange={(key) => handleChange(null, Number(key))}
        tabBarStyle={{
          backgroundColor: "white",
          borderBottom: "1px solid #e8e8e8",
        }}
        tabBarExtraContent={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginRight: "10px",
            }}
          >
            {showToggle && <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#555",
                  fontWeight: "500",
                }}
              >
                Machine Data
              </span>
              <Switch
                checked={machineToggle}
                onChange={(checked) => setMachineToggle(checked)}
                style={{
                  backgroundColor: machineToggle
                    ? "var(--button-color)"
                    : "grey",
                }}
              />
            </div>}
            <div style={{ color: color.color }}>
              {/* <Button
                onClick={() => setVisible(true)}
                type="primary"
                style={{
                  marginRight: "8px",
                }}
              >
                <IoIosColorPalette size={16} />
              </Button> */}
              <Button onClick={() => setIsModalVisible2(true)} type="primary">
                <FaRegFilePdf size={16} />
              </Button>
            </div>
          </div>
        }
      >
        {data.map((item, index) => (
          <Tabs.TabPane
            tab={
              <span
                style={{
                  textAlign: "center",
                  color: "#6b6868",
                  minWidth: "80px",
                  display: "inline-block",
                  padding: "0 10px",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {item.icon}
                {item.tabname}
              </span>
            }
            key={index}
          >
            <div style={{ padding: "10px" }}>{item.component}</div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Box>
  );
};

export default CommonTabs;
