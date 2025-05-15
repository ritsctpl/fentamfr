import { Tabs } from "antd";
import {
  CalendarOutlined,
  FieldTimeOutlined,
  ScheduleOutlined,
  HomeOutlined,
  MonitorOutlined,
} from "@ant-design/icons";
import styles from "../calenderScreen/style/calenderScreen.module.css";
import LeaveCalender from "./leaveCalender";
import TimeManagementScreen from "./timeMangement";
import Scheduling from "./Scheduling";
// import LeaveCalender from './leaveCalender';

const CalenderScreen = () => {
  const items = [
    {
      label: "Leave Calendar",
      key: "1",
      icon: <CalendarOutlined />,
      children: <LeaveCalender />,
    },
    {
      label: "Time Management",
      key: "2",
      icon: <FieldTimeOutlined />,
      children: <TimeManagementScreen />,
    },
    {
      label: "Scheduling",
      key: "3",
      icon: <ScheduleOutlined />,
      children: <Scheduling />,
    },
    // {
    //   label: "Holiday List",
    //   key: "4",
    //   icon: <HomeOutlined />,
    //   children: <div>Holiday List Content</div>,
    // },
    // {
    //   label: "Team Availability",
    //   key: "5",
    //   icon: <MonitorOutlined />,
    //   children: <div>Team Availability Content</div>,
    // },
  ];

  return (
    <div className={styles.calendarContainer}>
      <Tabs
        size="small"
        tabPosition="left"
        items={items}
        className={styles.tabs}
        defaultActiveKey="1"
        destroyInactiveTabPane={true}
        style={{ height: "calc(100vh - 140px)" }}
      />
    </div>
  );
};

export default CalenderScreen;
