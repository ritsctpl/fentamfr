import { Card, Row, Col } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  BookOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import styles from "./dashboardscreen.module.css";
const TileDashboard = () => {
  const statsData = [
    {
      title: "Total Employees",
      count: 40,
      change: +2.36,
      icon: <UserOutlined />,
      increasedLastMonth: true,
      cardClass: styles.totalEmployeesCard,
    },
    {
      title: "Number of leave",
      count: 20,
      change: -1.25,
      icon: <TeamOutlined />,
      increasedLastMonth: false,
      cardClass: styles.numberOfLeaveCard,
    },
    {
      title: "Service open",
      count: 30,
      icon: <SolutionOutlined />,
      increasedLastMonth: true,
      description: "Currently, there are 30 open services being worked on.",
      cardClass: styles.serviceOpenCard,
    },
    {
      title: "Service closed",
      count: 60,
      icon: <BookOutlined />,
      increasedLastMonth: false,
      description: "A total of 60 services have been successfully closed.",
      cardClass: styles.serviceClosedCard,
    },
  ];
  return (
    <Row gutter={[16, 16]} className={styles.statsRow}>
      {statsData.map((stat, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card className={`${styles.statsCard} ${stat.cardClass}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>{stat.icon}</div>
              {/* Only show arrows for the first two cards */}
              {(stat.title === "Total Employees" ||
                stat.title === "Number of leave") && (
                <div
                  className={`${styles.arrow} ${
                    stat.increasedLastMonth ? styles.up : styles.down
                  }`}
                >
                  {stat.increasedLastMonth ? (
                    <CaretUpOutlined />
                  ) : (
                    <CaretDownOutlined />
                  )}
                </div>
              )}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.title}>{stat.title}</h3>
              <div className={styles.count}>{stat.count}</div>
              {/* Only show percentage change for the first two cards */}
              {(stat.title === "Total Employees" ||
                stat.title === "Number of leave") && (
                <div
                  className={`${styles.change} ${
                    stat.increasedLastMonth
                      ? styles.increased
                      : styles.decreased
                  }`}
                >
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                  <span className={styles.period}>vs last month</span>
                </div>
              )}
              {/* Display description for Service open and Service closed */}
              {stat.description && (
                <div className={styles.description}>{stat.description}</div>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
export default TileDashboard;
