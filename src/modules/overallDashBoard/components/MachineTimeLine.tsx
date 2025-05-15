import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Tooltip, Spin } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  ToolOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { Title, Text } = Typography;

interface Break {
  break_start: string;
  break_end: string;
}

interface Downtime {
  downtime_start: string;
  downtime_end: string;
}

interface ShiftData {
  shift_name: string;
  date: string;
  shift_start_time: string;
  shift_end_time: string;
  remaining_time: string;
  breaks: {
    type: string;
    value: Break[];
    null: boolean;
  };
  downtimes: {
    type: string;
    value: Downtime[];
    null: boolean;
  };
}

const shiftData1: ShiftData = {
  shift_name: "ShiftBO:1004,General,GENERAL",
  date: "2025-04-17",
  shift_start_time: "08:00:00",
  shift_end_time: "22:00:00",
  remaining_time: "03:46",
  breaks: {
    type: "json",
    value: [
      {
        break_start: "12:00:00",
        break_end: "13:00:00",
      },
    ],
    null: false,
  },
  downtimes: {
    type: "json",
    value: [
      {
        downtime_start: "12:52:10",
        downtime_end: "12:52:15",
      },
      {
        downtime_start: "13:38",
        downtime_end: "13:38",
      },
      {
        downtime_start: "14:22",
        downtime_end: "14:57",
      },
      {
        downtime_start: "15:39:00",
        downtime_end: "15:39:12",
      },
      {
        downtime_start: "16:08",
        downtime_end: "16:08",
      },
      {
        downtime_start: "16:08",
        downtime_end: "20:00",
      },
    ],
    null: false,
  },
};

const TimelineContainer = styled.div`
  width: 100%;
  margin: 20px 0;
  position: relative;
`;

const TimelineBar = styled.div`
  height: 30px;
  width: 100%;
  background: #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  position: relative;
`;

const TimelineSegment = styled.div<{ type: string }>`
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  ${(props) =>
    props.type === "break" &&
    `
    background: #FFD700;
  `}
  ${(props) =>
    props.type === "downtime" &&
    `
    background: red;
  `}
  ${(props) =>
    props.type === "available" &&
    `
    background: #3aa080;
  `}
  ${(props) =>
    props.type === "future" &&
    `
    background: #d9d9d9;
  `}
`;

const SegmentLabel = styled.div`
  position: absolute;
  top: 24px;
  font-size: 11px;
  white-space: nowrap;
  color: #666;
`;

const TimelineLegend = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 15px;
  height: 15px;
  border-radius: 2px;
  background: ${(props) => props.color};
`;

const TimeAxisLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
`;

const TimeAxisLabel = styled.div<{ color: string }>`
  position: absolute;
  font-size: 11px;
  transform: translateX(-50%);
  color: ${(props) => props.color};
`;

interface Marker {
  time: string;
  position: number;
  color: string;
  isCurrent?: boolean;
  isAvailableStart?: boolean;
}

interface MachineTimeLineProps {
  shiftData: any;
}

const MachineTimeLine: React.FC<MachineTimeLineProps> = ({ shiftData }) => {
  const [timelineSegments, setTimelineSegments] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [timeAxisMarkers, setTimeAxisMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    try {
      // Check if shiftData is defined and has the necessary properties
      if (
        !shiftData ||
        !shiftData?.shift_start_time ||
        !shiftData?.shift_end_time
      ) {
        console.log(
          "MachineTimeLine: Waiting for complete shiftData...",
          shiftData
        );
        setIsLoading(true);
        return;
      }

      console.log("MachineTimeLine: Processing complete shiftData", shiftData);
      setIsLoading(true);

      const segments: any[] = [];
      const now = new Date();
      const currentTimeStr = `${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      setCurrentTime(currentTimeStr);

      // Check if the shift date is today's date
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const isToday = shiftData?.date == today;
      
      // If it's not today, we'll use the shift end time as our "current" time
      // This ensures all segments are treated as "available" instead of "future"
      const effectiveCurrentTime = isToday 
        ? currentTimeStr 
        : shiftData?.shift_end_time;
      
      const shiftStart = convertTimeToMinutes(shiftData?.shift_start_time) || 0;
      const shiftEnd = convertTimeToMinutes(shiftData?.shift_end_time) || 0;

      const totalShiftDuration = shiftEnd - shiftStart || 1;

      // Use the effective current time for calculations
      const current = isToday 
        ? convertTimeToMinutes(currentTimeStr)
        : shiftEnd; // For past dates, current = shift end
      
      const currentPercentage =
        ((current - shiftStart) / totalShiftDuration) * 100;

      const markers: Marker[] = [];

      if (shiftData?.shift_start_time) {
        markers.push({
          time: shiftData.shift_start_time,
          position: 0,
          color: "#3aa080",
        });
      }

      const breaks =
        !shiftData?.breaks?.null && shiftData?.breaks?.value
          ? shiftData.breaks.value
          : [];

      breaks.forEach((breakItem) => {
        if (breakItem && breakItem.break_start) {
          const breakStart = convertTimeToMinutes(breakItem.break_start);
          const startPercentage =
            ((breakStart - shiftStart) / totalShiftDuration) * 100;

          markers.push({
            time: breakItem.break_start.substring(0, 5),
            position: startPercentage,
            color: "#FFD700",
          });
        }
      });

      const downtimes =
        !shiftData?.downtimes?.null && shiftData?.downtimes?.value
          ? shiftData.downtimes.value
          : [];

      downtimes.forEach((downtimeItem) => {
        if (downtimeItem && downtimeItem.downtime_start) {
          const downtimeStart = convertTimeToMinutes(
            downtimeItem.downtime_start
          );
          const startPercentage =
            ((downtimeStart - shiftStart) / totalShiftDuration) * 100;

          markers.push({
            time: downtimeItem.downtime_start.substring(0, 5),
            position: startPercentage,
            color: "red",
          });
        }
      });

      if (currentPercentage >= 0 && currentPercentage <= 100) {
        markers.push({
          time: currentTimeStr,
          position: currentPercentage,
          color: "#3aa080",
          isCurrent: true,
        });
      }

      if (shiftData?.shift_end_time) {
        markers.push({
          time: shiftData.shift_end_time.substring(0, 5),
          position: 100,
          color: "#d9d9d9",
        });
      }

      const uniqueMarkers: Marker[] = [];
      const seenPositions = new Set<number>();

      markers
        .filter(
          (marker) =>
            marker &&
            (marker.color === "red" ||
              marker.color === "#FFD700" ||
              marker.color === "#3aa080")
        )
        .forEach((marker) => {
          uniqueMarkers.push({
            ...marker,
            position: Math.round(marker.position * 2) / 2,
          });
          seenPositions.add(Math.round(marker.position * 2) / 2);
        });

      markers
        .filter(
          (marker) =>
            marker &&
            marker.color !== "red" &&
            marker.color !== "#FFD700" &&
            marker.color !== "#3aa080"
        )
        .sort((a, b) => a.position - b.position)
        .forEach((marker) => {
          const roundedPosition = Math.round(marker.position * 2) / 2;

          const isDuplicate = Array.from(seenPositions).some(
            (pos) => Math.abs(pos - roundedPosition) < 5
          );

          if (!isDuplicate || marker.isCurrent) {
            uniqueMarkers.push({
              ...marker,
              position: roundedPosition,
            });
            seenPositions.add(roundedPosition);
          }
        });

      uniqueMarkers.sort((a, b) => a.position - b.position);

        // ================= TO SHOW START AND END TIMES =================
        const startEndMarkers = [];
      
        // Add shift start marker
        if (shiftData.shift_start_time) {
          startEndMarkers.push({
            time: shiftData.shift_start_time.substring(0, 5),
            position: 0,
            // color: "#3aa080",
            color: "black",
          });
        }
        
        // Add shift end marker
        if (shiftData.shift_end_time) {
          startEndMarkers.push({
            time: shiftData.shift_end_time.substring(0, 5),
            position: 100,
            color: "black",
          });
        }
  
        // Add current time here
        // if (currentTimeStr) {
        //   startEndMarkers.push({
        //     time: currentTimeStr,
        //     position: currentPercentage,
        //     color: "#3aa080",
        //     isCurrent: true,
        //   });
        // }
        
        setTimeAxisMarkers(startEndMarkers);
        // ================= TO SHOW START AND END TIMES =================

      // setTimeAxisMarkers(uniqueMarkers);

      if (!shiftData?.breaks?.null && shiftData?.breaks?.value) {
        shiftData.breaks.value.forEach((breakItem) => {
          if (breakItem && breakItem.break_start && breakItem.break_end) {
            const breakStart = convertTimeToMinutes(breakItem.break_start);
            const breakEnd = convertTimeToMinutes(breakItem.break_end);
            const startPercentage =
              ((breakStart - shiftStart) / totalShiftDuration) * 100;
            const widthPercentage =
              ((breakEnd - breakStart) / totalShiftDuration) * 100;

            const durationMinutes = breakEnd - breakStart;
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            const durationStr =
              hours > 0
                ? `${hours}h ${minutes.toFixed(1)}m`
                : `${minutes.toFixed(1)}m`;

            segments.push({
              type: "break",
              start: startPercentage,
              width: widthPercentage,
              startTime: breakItem.break_start,
              endTime: breakItem.break_end,
              tooltip: `Scheduled Downtime: ${breakItem.break_start} - ${breakItem.break_end} (${durationStr})`,
              timeValue: breakStart,
            });
          }
        });
      }

      if (!shiftData?.downtimes?.null && shiftData?.downtimes?.value) {
        shiftData.downtimes.value.forEach((downtimeItem) => {
          if (
            downtimeItem &&
            downtimeItem.downtime_start &&
            downtimeItem.downtime_end
          ) {
            const downtimeStart = convertTimeToMinutes(
              downtimeItem.downtime_start
            );
            const downtimeEnd = convertTimeToMinutes(downtimeItem.downtime_end);
            const startPercentage =
              ((downtimeStart - shiftStart) / totalShiftDuration) * 100;
            let widthPercentage =
              ((downtimeEnd - downtimeStart) / totalShiftDuration) * 100;

              const MIN_VISIBLE_WIDTH = 0.1;
              if (widthPercentage > 0 && widthPercentage < MIN_VISIBLE_WIDTH) {
                widthPercentage = MIN_VISIBLE_WIDTH;
              }

            const durationMinutes = downtimeEnd - downtimeStart;
            const hours = Math.floor(durationMinutes / 60);
            const minutes = Math.round((durationMinutes % 60) * 10) / 10;
            const durationStr =
              hours > 0
                ? `${hours}h ${minutes.toFixed(1)}m`
                : `${minutes.toFixed(1)}m`;

            segments.push({
              type: "downtime",
              start: startPercentage,
              width: widthPercentage,
              startTime: downtimeItem.downtime_start,
              endTime: downtimeItem.downtime_end,
              tooltip: `Unscheduled Downtime: ${downtimeItem.downtime_start} - ${downtimeItem.downtime_end} (${durationStr})`,
              timeValue: downtimeStart,
            });
          }
        });
      }

      let availableSegments: any[] = [];
      let lastEnd = 0;

      const sortedSegments = [...segments].sort((a, b) => a.start - b.start);

      sortedSegments.forEach((segment) => {
        if (segment && segment.start > lastEnd) {
          const startMinutes =
            (lastEnd / 100) * totalShiftDuration + shiftStart;
          const endMinutes =
            (segment.start / 100) * totalShiftDuration + shiftStart;
          const startTimeStr = formatTimeFromMinutes(startMinutes);
          const endTimeStr = formatTimeFromMinutes(endMinutes);

          const startPercentage =
            ((startMinutes - shiftStart) / totalShiftDuration) * 100;
          markers.push({
            time: startTimeStr,
            position: startPercentage,
            color: "#3aa080",
            isAvailableStart: true,
          });

          const durationMinutes = endMinutes - startMinutes;
          const hours = Math.floor(durationMinutes / 60);
          const minutes = Math.round(durationMinutes % 60);
          const durationStr =
            hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

          if (!isToday || endMinutes <= current) {
            availableSegments.push({
              type: "available",
              start: lastEnd,
              width: segment.start - lastEnd,
              startTime: startTimeStr,
              endTime: endTimeStr,
              tooltip: `Available: ${startTimeStr} - ${endTimeStr} (${durationStr})`,
              timeValue: startMinutes,
            });
          } else if (startMinutes >= current) {
            availableSegments.push({
              type: "future",
              start: lastEnd,
              width: segment.start - lastEnd,
              startTime: startTimeStr,
              endTime: endTimeStr,
              tooltip: `Future: ${startTimeStr} - ${endTimeStr} (${durationStr})`,
              timeValue: startMinutes,
            });
          } else {
            const currentPoint =
              ((current - shiftStart) / totalShiftDuration) * 100;

            const availableDuration = current - startMinutes;
            const availableHours = Math.floor(availableDuration / 60);
            const availableMinutes = Math.round(availableDuration % 60);
            const availableDurationStr =
              availableHours > 0
                ? `${availableHours}h ${availableMinutes}m`
                : `${availableMinutes}m`;

            availableSegments.push({
              type: "available",
              start: lastEnd,
              width: currentPoint - lastEnd,
              startTime: startTimeStr,
              endTime: currentTimeStr,
              tooltip: `Available: ${startTimeStr} - ${currentTimeStr} (${availableDurationStr})`,
              timeValue: startMinutes,
            });

            const futureDuration = endMinutes - current;
            const futureHours = Math.floor(futureDuration / 60);
            const futureMinutes = Math.round(futureDuration % 60);
            const futureDurationStr =
              futureHours > 0
                ? `${futureHours}h ${futureMinutes}m`
                : `${futureMinutes}m`;

            availableSegments.push({
              type: "future",
              start: currentPoint,
              width: segment.start - currentPoint,
              startTime: currentTimeStr,
              endTime: endTimeStr,
              tooltip: `Future: ${currentTimeStr} - ${endTimeStr} (${futureDurationStr})`,
              timeValue: current,
            });
          }
        }
        lastEnd = Math.max(
          lastEnd,
          segment ? segment.start + segment.width : 0
        );
      });

      if (lastEnd < 100) {
        const startMinutes = (lastEnd / 100) * totalShiftDuration + shiftStart;
        const endMinutes = shiftEnd;

        const startTimeStr = formatTimeFromMinutes(startMinutes);
        const endTimeStr = formatTimeFromMinutes(endMinutes);

        const startPercentage =
          ((startMinutes - shiftStart) / totalShiftDuration) * 100;
        markers.push({
          time: startTimeStr,
          position: startPercentage,
          color: "#3aa080",
          isAvailableStart: true,
        });

        const durationMinutes = endMinutes - startMinutes;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = Math.round(durationMinutes % 60);
        const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        if (endMinutes <= current) {
          availableSegments.push({
            type: "available",
            start: lastEnd,
            width: 100 - lastEnd,
            startTime: startTimeStr,
            endTime: endTimeStr,
            tooltip: `Available: ${startTimeStr} - ${endTimeStr} (${durationStr})`,
            timeValue: startMinutes,
          });
        } else if (startMinutes >= current) {
          availableSegments.push({
            type: "future",
            start: lastEnd,
            width: 100 - lastEnd,
            startTime: startTimeStr,
            endTime: endTimeStr,
            tooltip: `Future: ${startTimeStr} - ${endTimeStr} (${durationStr})`,
            timeValue: startMinutes,
          });
        } else {
          const currentPoint =
            ((current - shiftStart) / totalShiftDuration) * 100;

          const availableDuration = current - startMinutes;
          const availableHours = Math.floor(availableDuration / 60);
          const availableMinutes = Math.round(availableDuration % 60);
          const availableDurationStr =
            availableHours > 0
              ? `${availableHours}h ${availableMinutes}m`
              : `${availableMinutes}m`;

          availableSegments.push({
            type: "available",
            start: lastEnd,
            width: currentPoint - lastEnd,
            startTime: startTimeStr,
            endTime: currentTimeStr,
            tooltip: `Available: ${startTimeStr} - ${currentTimeStr} (${availableDurationStr})`,
            timeValue: startMinutes,
          });

          const futureDuration = endMinutes - current;
          const futureHours = Math.floor(futureDuration / 60);
          const futureMinutes = Math.round(futureDuration % 60);
          const futureDurationStr =
            futureHours > 0
              ? `${futureHours}h ${futureMinutes}m`
              : `${futureMinutes}m`;

          availableSegments.push({
            type: "future",
            start: currentPoint,
            width: 100 - currentPoint,
            startTime: currentTimeStr,
            endTime: endTimeStr,
            tooltip: `Future: ${currentTimeStr} - ${endTimeStr} (${futureDurationStr})`,
            timeValue: current,
          });
        }
      }

      const allSegments = [...segments, ...availableSegments]
        .filter(
          (segment) => segment && !isNaN(segment.start) && !isNaN(segment.width)
        )
        .sort((a, b) => a.start - b.start);

      const finalMarkers = uniqueMarkers.filter(
        (marker) => marker && !isNaN(marker.position)
      );

      // setTimeAxisMarkers(finalMarkers);
      setTimelineSegments(allSegments);

      // End of component logic
      setIsLoading(false);
      setHasError(false);
    } catch (error) {
      console.error("Error processing timeline data:", error);
      setIsLoading(false);
      setHasError(true);
    }
  }, [shiftData]);

  const convertTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr?.split(":").map(Number);
    if (!parts || !parts.length) return 0;

    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
    return hours * 60 + minutes + seconds / 60;
  };

  const formatTimeFromMinutes = (totalMinutes: number): string => {
    if (isNaN(totalMinutes)) return "00:00";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading && (!shiftData || !shiftData.shift_start_time)) {
    return (
      <Card style={{ marginBottom: 20, textAlign: "center", padding: 20 }}>
        <Spin size="large" />
        <Text style={{ display: "block", marginTop: 15 }}>
          Loading shift data...
        </Text>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card style={{ marginBottom: 20 }}>
        <Text type="danger">
          Error loading timeline data. Please try again later.
        </Text>
      </Card>
    );
  }

  if (!shiftData) {
    return (
      <Card style={{ marginBottom: 20 }}>
        <Text>No shift data available</Text>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <Row gutter={24}>
        <Col span={24}>
          <TimelineContainer>
            <TimelineBar>
              {timelineSegments.map((segment, index) => (
                <Tooltip key={index} title={segment?.tooltip || ""}>
                  <TimelineSegment
                    type={segment?.type || "future"}
                    style={{
                      left: `${segment?.start || 0}%`,
                      width: `${segment?.width || 0}%`,
                    }}
                  >
                    {/* {segment?.width > 5 && (
                      <SegmentLabel>{segment?.startTime || ""}</SegmentLabel>
                    )} */}
                  </TimelineSegment>
                </Tooltip>
              ))}
            </TimelineBar>

            {timeAxisMarkers.map((marker, index) => (
              <TimeAxisLabel
                key={index}
                style={{ left: `${marker?.position || 0}%` }}
                color={marker?.color || "#d9d9d9"}
              >
                {marker?.time || ""}
              </TimeAxisLabel>
            ))}

            <TimelineLegend>
              <LegendItem>
                <LegendColor color="#3aa080" />
                <Text>Available</Text>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#FFD700" />
                <Text>Scheduled Downtime</Text>
              </LegendItem>
              <LegendItem>
                <LegendColor color="red" />
                <Text>Unscheduled Downtime</Text>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#d9d9d9" />
                <Text>Future</Text>
              </LegendItem>
            </TimelineLegend>
          </TimelineContainer>
        </Col>
      </Row>
    </Card>
  );
};

export default MachineTimeLine;
