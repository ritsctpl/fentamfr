import React from "react";
import { Row, Col, Progress } from "antd";
import styles from "../styles/OeeManagementReportMain.module.css";
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "@modules/buyOff/components/userInstructions";

interface OeePlantHeaderProps {
  plantData: any;
}

const getOeeColorClass = (percentage: number): string => {
  if (percentage <= 30) return styles.low;
  if (percentage <= 80) return styles.medium;
  return styles.high;
};

const OeePlantHeader: React.FC<OeePlantHeaderProps> = ({ plantData }) => {
  const data =
    plantData.length > 0
      ? {
        plantName: plantData[0].site,
        actualQuantity: Number(plantData[0].total_quantity),
        planQuantity: Number(plantData[0].plan || plantData[0].planned_quantity.toFixed(2)),
        goodQuantity: Number(plantData[0].total_good_quantity),
        badQualityCount: Number(plantData[0].total_bad_quantity),
        oeePercentage: Number(plantData[0].oee.toFixed(2)),
        performancePercentage: Number(plantData[0].performance.toFixed(2)),
        availabilityPercentage: Number(plantData[0].availability.toFixed(2)),
        quantityPercentage: Number(plantData[0].quality.toFixed(2)),
      }
      : {
        plantName: "",
        actualQuantity: 0,
        planQuantity: 0,
        goodQuantity: 0,
        badQualityCount: 0,
        oeePercentage: 0,
        performancePercentage: 0,
        availabilityPercentage: 0,
        quantityPercentage: 0,
      };

  const manualContent = [
    {
      title: 'OEE Management Report User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the OEE Management Report Screen for logging, updating, and tracking OEE Management Report.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'OEE Management Report' }
              ]
            }
          }
        },
        {
          title: '2. System Access',
          content: {
            type: 'table',
            data: {
              headers: ['Item', 'Description'],
              rows: [
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/oeeManagementReport_app' },
                { Item: 'Login Requirement', Description: 'Username & Password' },
                { Item: 'Access Roles', Description: 'Technician, Supervisor, Admin' }
              ]
            }
          }
        },
        {
          title: '3. Navigation Path',
          content: {
            type: 'text',
            data: 'Main Menu → OEE Management Report → OEE Management Report Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'In top Plant level, it will show the Plant Name, OEE, Performance, Availability, and Quality Progress Indicators.' },
                { Section: 'Body', Description: 'In bottom, it will show the day wise workcenter data card.' },
                { Section: 'Action Buttons', Description: 'Card, Drill Down' },
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Screen Navigation',
              content: {
                type: 'steps',
                data: [
                  {
                    text: 'List of Workcenter Card by day wise will be shown',
                    subSteps: [
                      'Oee',
                      'Performance', 
                      'Availability',
                      'Quality',
                      'Actual',
                      'Plan',
                      'Good',
                      'Rejections',
                    ]
                  },
                ]
              }
            }
          ]
        },
        {
          title: '6. Work Center Card',
          content: {
            type: 'table',
            data: {
              headers: ['Component','Action', 'Description'],
              rows: [
                { Component: 'Work Center Card', Action: 'Click "Workcenter Card"', Description: 'It will navigate to the Day wise Workcenter Drill Down Screen for perticular workcenter' },
              ]
            }
          }
        },
        {
          title: '7. Day Wise Workcenter Drill Down Screen',
          subsections: [
            {
              title: '7.1. Screen Navigation',
              content: {
                type: 'steps',
                data: [
                  {
                    text: 'Workcenter Card by day wise will be shown',
                    subSteps: [
                      'Left side of the screen will show the Workcenter Card',
                      'Right side of the screen will show the day wise oee, performance, availability, quality data based on the selected workcenter',
                      'On the top of the screen, Dropdown for day, month, year will be shown.',
                      'Click on the dropdown to select the day, month, year',
                      'Based on the selected day, month, year, data will be shown',
                      'Click on the "HOME" button to navigate to the OEE Management Report Screen'
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          title: '8. Workcenter Card',
          content: {
            type: 'table',
            data: {
              headers: ['Component','Action', 'Description'],
              rows: [
                { Component: 'Day Wise Workcenter Card', Action: 'Click "Day Wise Workcenter Card"', Description: 'It will navigate to the current shift wise Workcenter Drill Down Screen for perticular workcenter' },
              ]
            }
          }
        },
        {
          title: '9. Current Shift Workcenter Card',
          subsections: [
            {
              title: '9.1. Screen Navigation',
              content: {
                type: 'steps',
                data: [
                  {
                    text: 'Current Shift Workcenter Card will be shown',
                    subSteps: [
                      'It will navigate to the current shift wise workcenter drill down screen',
                      'Left side of the screen will show the current shift oee, performance, availability, quality data based on the selected workcenter',
                      'Right side of the screen will show the list of current shift resource',
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          title: '10. Resource Card',
          content: {
            type: 'table',
            data: {
              headers: ['Component','Action', 'Description'],
              rows: [
                { Component: 'Resource Card', Action: 'Click "Resource Card"', Description: 'It will navigate to the current shift wise Resource Drill Down Screen for perticular resource' },
              ]
            }
          }
        },
        {
          title: '11. Current Shift Resource Drill Down Screen',
          subsections: [
            {
              title: '11.1. Screen Navigation',
              content: {
                type: 'steps',
                data: [
                  {
                    text: 'Current Shift Resource Card will be shown',
                    subSteps: [
                      'It will navigate to the current shift wise resource drill down screen',
                      'Left side of the screen will show the current shift resource card for selected resource oee, performance, availability, quality data',
                      'Right side of the screen will show the time interval wise resource data oee, performance, availability, quality data',
                      'On click of oee or performance or availability or quality, it will navigate to the respective drill down screen',
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          title: '7. FAQs / Troubleshooting',
          content: {
            type: 'table',
            data: {
              headers: ['Issue', 'Solution'],
              rows: [
                { Issue: 'No data is showing in the screen', Solution: 'Check any production is done today, check the internet connection' },
                { Issue: 'Drill down screen is not working', Solution: 'Check the resource is available in the current shift' },
              ]
            }
          }
        }
      ]
    }
  ];

  return (
    <div className={styles.dashboardHeader}>
      <Row gutter={5} align="middle" justify="space-between">
        {/* Column 1: Plant Name */}
        <Col span={3} className={styles.plantSection}>
          <div className={styles.heading}>{data.plantName}</div>
          <div className={styles.plantName}>Management Dashboard</div>
        </Col>

        {/* Column 2: Progress Indicators */}
        <Col span={6} className={styles.progressSection}>
          <div
            className={`${styles.progressItem} ${styles.oee} ${getOeeColorClass(
              data.oeePercentage
            )}`}
          >
            <span
              className={styles.progressLabel}
              data-value={`${data.oeePercentage}%`}
            >
              OEE
            </span>
            <Progress
              percent={data.oeePercentage}
              showInfo={false}
              strokeWidth={6}
            />
          </div>
          <div className={`${styles.progressItem} ${styles.performance}`}>
            <span
              className={styles.progressLabel}
              data-value={`${data.performancePercentage}%`}
            >
              Performance
            </span>
            <Progress
              percent={data.performancePercentage}
              showInfo={false}
              strokeWidth={6}
            />
          </div>
        </Col>

        {/* Column 3: More Progress Indicators */}
        <Col span={6} className={styles.progressSection}>
          <div className={`${styles.progressItem} ${styles.availability}`}>
            <span
              className={styles.progressLabel}
              data-value={`${data.availabilityPercentage}%`}
            >
              Availability
            </span>
            <Progress
              percent={data.availabilityPercentage}
              showInfo={false}
              strokeWidth={6}
            />
          </div>
          <div className={`${styles.progressItem} ${styles.quantity}`}>
            <span
              className={styles.progressLabel}
              data-value={`${data.quantityPercentage}%`}
            >
              Quality
            </span>
            <Progress
              percent={data.quantityPercentage}
              showInfo={false}
              strokeWidth={6}
            />
          </div>
        </Col>

        {/* Column 4: Production Metrics */}
        <Col span={6} className={styles.metricsSection}>
          <Row gutter={14}>
            <Col span={12}>
              <div className={`${styles.metricBox} ${styles.blueBox}`}>
                <span className={styles.metricLabel}>Actual</span>
                <span className={styles.metricValue}>
                  {data.actualQuantity}
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div className={`${styles.metricBox} ${styles.blueBox}`}>
                <span className={styles.metricLabel}>Plan</span>
                <span className={styles.metricValue}>{data.planQuantity}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col span={12}>
              <div className={`${styles.metricBox} ${styles.greenBox}`}>
                <span className={styles.metricLabel}>Good</span>
                <span className={styles.metricValue}>{data.goodQuantity}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className={`${styles.metricBox} ${styles.redBox}`}>
                <span className={styles.metricLabel}>Rejections</span>
                <span className={styles.metricValue}>
                  {data.badQualityCount}
                </span>
              </div>
            </Col>
          </Row>
        </Col>
        <Col span={1} className={styles.metricsSection}>
          <div style={{ padding: '20px', }}>
            <InstructionModal title="OeeManagementReportMain">
              <UserInstructions manualContent={manualContent} />
            </InstructionModal>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OeePlantHeader;
