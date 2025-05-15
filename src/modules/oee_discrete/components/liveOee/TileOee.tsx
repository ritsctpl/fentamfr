import { MdFactory } from "react-icons/md";
import React from "react";
import styles from "./tileOee.module.css";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";
import { Card } from "antd";
import { fontFamily } from "html2canvas/dist/types/css/property-descriptors/font-family";

interface TileOeeProps {
  item: {
    resource: string;
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    downtime: boolean;
    itemDetails: {
      item: string;
      actual: number;
      plan: number;
      rejection: number;
      productionTime: number;
      actualTime: number;
      downtime: number;
      goodQualityCount: number;
      badQualityCount: number;
    };
  };
}

const TileOee: React.FC<TileOeeProps> = ({ item }) => {
  const { color } = useFilterContext();
  const { oee, resource, downtime, itemDetails } = item;

  const getColor = (value: number) => {
    if (value < 50) return "#dc3545"; 
    if (value < 84) return "#ffc107"; 
    return "#28a745"; 
  };

  return (
    <>
      <Card
        size="small"
        title={
          <div className={styles.cardTitle}>
            <div className={styles.resourceName}>
              <MdFactory className={styles.resourceIcon} />
              <span className={styles.resourceText}>{resource}</span>
            </div>
            <span className={styles.itemName}>{itemDetails.item}</span>
            <div style={{background: downtime ? "red" : "#54ee54",  width:'20px', height:'20px', borderRadius:'50%',boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)'}}>
            </div>
          </div>
        }
        className={styles.mainCard}
        style={{ background:"white" }}
      >
        <div className={styles.detailsDisplay}>
          <Card
            className={styles.productionCard}
            styles={{
              body: {
                padding: "8px 10px 5px 8px",
                fontFamily:'roboto',
                boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
              },
            }}
          >
            <div className={styles.productionDetails}>
              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <ClockCircleOutlined className={styles.productionIcon} style={{color:'#3b82f6'}} />
                  Prod-Time <a style={{color:'#000',fontSize:'8px'}}>(mins)</a>
                </span>
                <span className={styles.productionItemvalue}>
                : <span><strong style={{color:'#3b82f6',fontSize:'16px'}}>{itemDetails.productionTime}</strong></span>
                </span>
              </p>
              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <PlayCircleOutlined className={styles.productionIcon} style={{color:'#22c55e'}} />
                  Act-Time <a style={{color:'#000',fontSize:'8px'}}>(mins)</a>
                </span>
                <span className={styles.productionItemvalue}>
                : <span><strong style={{color:'#22c55e',fontSize:'16px'}}>{itemDetails.actualTime}</strong></span>
                </span>
              </p>
              <p className={styles.productionItem}>
                <span className={`${styles.productionLabel}`}>
                  <PauseCircleOutlined className={styles.productionIcon} style={{color:'#ef4444'}} />
                  D-Time <a style={{color:'#000',fontSize:'8px'}}>(mins)</a>
                </span>
                <span className={styles.productionItemvalue}>
                : <span><strong style={{color:'#ef4444',fontSize:'16px'}}>{itemDetails.downtime}</strong></span>
                </span>
                
              </p>
            </div>
          </Card>
          <Card
            className={styles.actualCard}
            style={{ background: color.lightcolor, fontFamily:'roboto',boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}
          >
            <div className={styles.actualPlanContainer}>
              <span className={styles.actualLabel}>Actual</span>
              <span className={styles.actualPlanValue}>
                {itemDetails.actual}
              </span>
            </div>
            <div className={styles.divider} />
            <div className={styles.actualPlanContainer}>
              <span className={styles.actualPlanValue}>{itemDetails.plan}</span>
              <span className={styles.planLabel}>Plan</span>
            </div>
          </Card>
        </div>
        <div className={styles.boxFull}>
          <div className={styles.reject}>
            <p>REJECTION: {itemDetails.rejection}</p>
          </div>
          {/* <div className={styles.cardLength}> */}
            <div className={styles.qualityItem}>
              <span className={styles.qualityLabel}>GQ</span>
              <div className={styles.qualityValue}>
                <ArrowUpOutlined
                  style={{
                    color: "green",
                    marginRight: "4px",
                    fontSize: "11px",
                  }}
                />
                <span style={{ color: "green" }}>
                  {itemDetails.goodQualityCount}
                </span>
              </div>
            </div>
            <div className={styles.qualityItem}>
              <span className={styles.qualityLabel}>BQ</span>
              <div className={styles.qualityValue}>
                <ArrowDownOutlined
                  style={{ color: "red", marginRight: "4px", fontSize: "11px" }}
                />
                <span style={{ color: "red" }}>
                  {itemDetails.badQualityCount}
                </span>
              </div>
            </div>
          {/* </div> */}
        </div>
        <div className={styles.oeebox}>
          <div style={{ textAlign: "center" }}>
            <span>OEE</span>
            <h1 style={{ color: getColor(oee) }}>{oee}%</h1>
          </div>
          <div style={{ textAlign: "center" }}>
            <span>Availability</span>
            <h1 style={{ color: getColor(item.availability) }}>
              {item.availability}%
            </h1>
          </div>
          <div style={{ textAlign: "center" }}>
            <span>Performance</span>
            <h1 style={{ color: getColor(item.performance) }}>
              {item.performance}%
            </h1>
          </div>
          <div style={{ textAlign: "center" }}>
            <span>Quality</span>
            <h1 style={{ color: getColor(item.quality) }}>{item.quality}%</h1>
          </div>
        </div>
      </Card>
    </>
  );
};

export default TileOee;
