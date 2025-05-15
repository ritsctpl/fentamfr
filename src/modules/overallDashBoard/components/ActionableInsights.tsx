import React, { useState, useRef } from "react";
import { Card } from "antd";
import {
  BsLightbulb,
  BsExclamationTriangleFill,
  BsGraphUp,
  BsClipboardData,
  BsAlarmFill,
} from "react-icons/bs";
import { MdInsights, MdWarning, MdErrorOutline } from "react-icons/md";
import { FaIndustry, FaChartLine } from "react-icons/fa";
import styles from "../styles/ActionableInsights.module.css";

// Define a more specific type for insights
interface InsightItem {
  category: string;
  texts: string[];
}

interface InsightData {
  type: string;
  insights: InsightItem[];
}

interface ActionableInsightsProps {
  insights: InsightData;
  height?: string;
}

// Dynamic color mapping for categories
const CATEGORY_COLORS: { [key: string]: string } = {
  Downtime: "#FF6B6B", // Soft Red
  OEE: "#4ECDC4", // Teal
  Quality: "#45B7D1", // Bright Blue
  Availability: "#FDCB6E", // Warm Yellow
  "Downtime Forecast": "#6C5CE7", // Purple
  "What-If Forecast": "#A8E6CF", // Mint Green
  Prescriptive: "#FF8ED4", // Soft Pink
  Forecast: "#6A5ACD", // Slate Blue
  default: "#2C3E50", // Dark Grayish Blue
};

// Dynamic icon mapping for categories
const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  Downtime: <BsAlarmFill style={{ fontSize: "12px", color: "#FF6B6B" }} />,
  OEE: <FaChartLine style={{ fontSize: "12px", color: "#4ECDC4" }} />,
  Quality: <MdErrorOutline style={{ fontSize: "12px", color: "#45B7D1" }} />,
  Availability: <FaIndustry style={{ fontSize: "12px", color: "#FDCB6E" }} />,
  "Downtime Forecast": (
    <MdWarning style={{ fontSize: "12px", color: "#6C5CE7" }} />
  ),
  "What-If Forecast": (
    <MdInsights style={{ fontSize: "12px", color: "#A8E6CF" }} />
  ),
  Prescriptive: (
    <BsClipboardData style={{ fontSize: "12px", color: "#FF8ED4" }} />
  ),
  Forecast: <BsGraphUp style={{ fontSize: "12px", color: "#6A5ACD" }} />,
  default: <BsLightbulb style={{ fontSize: "12px", color: "#2C3E50" }} />,
};

const getIconForInsightType = (type: string) => {
  switch (type.toLowerCase()) {
    case "investigative":
      return <BsClipboardData style={{ fontSize: "14px", color: "#17a2b8" }} />;
    case "PRESCRIPTIVE".toLocaleLowerCase():
      return <MdInsights style={{ fontSize: "14px", color: "#dc3545" }} />;
    case "POSITIVE".toLocaleLowerCase():
      return <BsGraphUp style={{ fontSize: "14px", color: "#28a745" }} />;
    case "NEGATIVE".toLocaleLowerCase():
      return (
        <BsExclamationTriangleFill
          style={{ fontSize: "14px", color: "#ffc107" }}
        />
      );
    default:
      return <BsLightbulb style={{ fontSize: "14px", color: "#f39c12" }} />;
  }
};

// Add this dummy data at the top of the file
const dummyInsights: InsightData = {
  type: "Prescriptive",
  insights: [
    {
      category: "Downtime",
      texts: [
        "Machine X has experienced 15% more downtime than usual this week.",
        "Scheduled maintenance could reduce downtime by 20%."
      ]
    },
    {
      category: "OEE",
      texts: [
        "Overall Equipment Efficiency has dropped by 5% compared to last month.",
        "Improving setup times could increase OEE by 3%."
      ]
    },
    {
      category: "Quality",
      texts: [
        "Defect rate has increased by 2% in the last production run.",
        "Implementing quality control checks could reduce defects by 15%."
      ]
    }
  ]
};

// Modify the component props to use dummy data as default
const ActionableInsights: React.FC<ActionableInsightsProps> = ({
  insights = dummyInsights,
  height,
}) => {
  console.log(insights);
  const [hoverState, setHoverState] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle hover state change for the entire scroll container
  const handleHover = (isHovering: boolean) => {
    setHoverState(isHovering);
  };

  // Prepare insights for display with category information
  const prepareInsights = () => {
    const allInsights: { text: string; category: string }[] = [];

    // Check if insights is an object with insights property
    if (insights && insights.insights) {
      insights.insights.forEach((insight) => {
        insight.texts.forEach((text) => {
          allInsights.push({
            text,
            category: insight.category,
          });
        });
      });
    }

    return allInsights.length > 0
      ? allInsights
      : [{ text: "No insights available", category: "default" }];
  };

  // Calculate animation duration based on content length
  const getAnimationDuration = (): number => {
    const displayInsights = prepareInsights();
    const minDuration = 15;
    const contentFactor = Math.max(displayInsights.length, 1) * 3;
    return minDuration + contentFactor;
  };

  // Determine if scrolling should be enabled (more than 2 items)
  const displayInsights = prepareInsights();
  const shouldScroll = displayInsights.length > 2;

  return (
    <Card
      style={{
        height: height || "250px",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: "12px",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            color: "#0e2328",
            fontSize: "16px",
            marginBottom: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#262626",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {getIconForInsightType(insights?.type || "default")}
            {insights?.type || "Actionable Insights"}
          </span>
        </div>

        <div
          className={styles.insightContainer}
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
          ref={scrollRef}
        >
          {shouldScroll ? (
            // Scrolling content for more than 2 items
            <div
              className={styles.scrollingContent}
              ref={contentRef}
              style={{
                animationDuration: `${getAnimationDuration()}s`,
                animationPlayState: hoverState ? "paused" : "running",
              }}
            >
              {/* First copy of the insights for scrolling */}
              <ul className={styles.insightList}>
                {displayInsights.map((insight, index) => (
                  <li key={`insight-${index}`} className={styles.insightItem}>
                    <span
                      className={styles.bulletPointIcon}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: "8px",
                      }}
                    >
                      {CATEGORY_ICONS[insight.category] ||
                        CATEGORY_ICONS.default}
                    </span>
                    <div className={styles.textWrapper}>
                      <span
                        style={{
                          color:
                            CATEGORY_COLORS[insight.category] ||
                            CATEGORY_COLORS.default,
                          fontWeight: 600,
                          marginRight: "8px",
                        }}
                      >
                        {insight.category}:
                      </span>
                      {insight.text}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Second copy of the insights for seamless looping */}
              <ul className={styles.insightList}>
                {displayInsights.map((insight, index) => (
                  <li
                    key={`insight-dup-${index}`}
                    className={styles.insightItem}
                  >
                    <span
                      className={styles.bulletPointIcon}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: "8px",
                      }}
                    >
                      {CATEGORY_ICONS[insight.category] ||
                        CATEGORY_ICONS.default}
                    </span>
                    <div className={styles.textWrapper}>
                      <span
                        style={{
                          color:
                            CATEGORY_COLORS[insight.category] ||
                            CATEGORY_COLORS.default,
                          fontWeight: 600,
                          marginRight: "8px",
                        }}
                      >
                        {insight.category}:
                      </span>
                      {insight.text}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            // Static content for 1-2 items
            <ul className={styles.insightList}>
              {displayInsights.map((insight, index) => (
                <li
                  key={`insight-static-${index}`}
                  className={styles.insightItem}
                >
                  <span
                    className={styles.bulletPointIcon}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: "8px",
                    }}
                  >
                    {CATEGORY_ICONS[insight.category] || CATEGORY_ICONS.default}
                  </span>
                  <div className={styles.textWrapper}>
                    <span
                      style={{
                        color:
                          CATEGORY_COLORS[insight.category] ||
                          CATEGORY_COLORS.default,
                        fontWeight: 600,
                        marginRight: "8px",
                      }}
                    >
                      {insight.category}:
                    </span>
                    {insight.text}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActionableInsights;
