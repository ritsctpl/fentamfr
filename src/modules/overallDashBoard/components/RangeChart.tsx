import { useEffect, useState } from "react";

interface TimeRange {
  startTime: string;
  endTime: string | null;
}

interface RangeChartProps {
  data: {
    machine_id: string;
    shift_start_time: string;
    shift_end_time: string;
    shift_remaining_time: number;
    break_minutes: TimeRange[];
    downtime_minutes: TimeRange[];
  }[];
}

const RangeChart: React.FC<RangeChartProps> = ({ data }) => {
  // Move formatTimeForDisplay to component level so it's accessible everywhere
  const formatTimeForDisplay = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const calculateSegments = (item: any) => {
    const segments = [];
    
    // Get shift start and end times from data
    const shiftStartDate = new Date(item.shift_start_time);
    const shiftEndDate = new Date(item.shift_end_time);
    const now = new Date(); // Get current time
    const totalMinutes = (shiftEndDate.getTime() - shiftStartDate.getTime()) / (1000 * 60);
    
    // Check if the shift date is in the past (not today)

    const isShiftInPast = shiftStartDate?.toDateString() != now.toDateString();
    
    // Calculate shift start and end hours
    const shiftStart = shiftStartDate.getHours();
    const shiftEnd = shiftEndDate.getHours();

    // Helper function to convert time string to minutes from shift start
    const getMinutesFromShiftStart = (timeString: string | null) => {
      if (timeString === null) {
        // Use current time if endTime is null
        return (now.getTime() - shiftStartDate.getTime()) / (1000 * 60);
      }
      const date = new Date(timeString);
      return (date.getTime() - shiftStartDate.getTime()) / (1000 * 60);
    };

    // Calculate percentage for positioning
    const calculatePercentage = (minutes: number) => {
      return Math.max(0, Math.min(100, (minutes / totalMinutes) * 100));
    };

    // Get current time in minutes from shift start
    const currentTimeMinutes = isShiftInPast ? totalMinutes : ((now.getHours() - shiftStart) * 60) + now.getMinutes();

    // Create working time segments first
    const workingSegments = [];
    let timePointer = new Date(shiftStartDate);

    const allEvents = [
      ...(Array.isArray(item.break_minutes) ? item.break_minutes.map(e => ({ ...e, type: 'break' })) : []),
      ...(Array.isArray(item.downtime_minutes) ? item.downtime_minutes.map(e => ({ ...e, type: 'downtime' })) : [])
    ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    let currentPosition = 0;

    allEvents.forEach((event) => {
      const eventStart = getMinutesFromShiftStart(event.startTime);
      const eventEnd = getMinutesFromShiftStart(event.endTime);
      
      // Add working segment before the event if there's a gap
      if (eventStart > currentPosition) {
        const workingDuration = eventStart - currentPosition;
        const startDate = new Date(timePointer);
        const endDate = new Date(event.startTime);
        
        // Split working segment if it crosses current time
        if (currentPosition < currentTimeMinutes && eventStart > currentTimeMinutes) {
          // Add completed working time
          workingSegments.push({
            left: `${calculatePercentage(currentPosition)}%`,
            width: `${calculatePercentage(currentTimeMinutes - currentPosition)}%`,
            backgroundColor: '#3aa080',
            label: `${currentTimeMinutes - currentPosition} min`,
            tooltip: `Working: ${formatTimeForDisplay(startDate.toISOString())} - ${formatTimeForDisplay(now.toISOString())}`
          });
          
          // Add remaining working time in gray
          segments.push({
            left: `${calculatePercentage(currentTimeMinutes)}%`,
            width: `${calculatePercentage(eventStart - currentTimeMinutes)}%`,
            backgroundColor: '#9CA3AF'+50,
            label: `${eventStart - currentTimeMinutes} min`,
            tooltip: `Remaining Time: ${formatTimeForDisplay(now.toISOString())} - ${formatTimeForDisplay(event.startTime)}`
          });
        } else {
          // If segment is entirely before current time, show as completed
          if (eventStart <= currentTimeMinutes) {
            workingSegments.push({
              left: `${calculatePercentage(currentPosition)}%`,
              width: `${calculatePercentage(workingDuration)}%`,
              backgroundColor: '#3aa080',
              label: `${workingDuration} min`,
              tooltip: `Working: ${formatTimeForDisplay(startDate.toISOString())} - ${formatTimeForDisplay(endDate.toISOString())}`
            });
          } else {
            // If segment is entirely after current time, show as remaining
            segments.push({
              left: `${calculatePercentage(currentPosition)}%`,
              width: `${calculatePercentage(workingDuration)}%`,
              backgroundColor: '#9CA3AF'+50,
              label: `${workingDuration} min`,
              tooltip: `Remaining Time: ${formatTimeForDisplay(startDate.toISOString())} - ${formatTimeForDisplay(endDate.toISOString())}`
            });
          }
        }
      }

      // Add the event segment (break or downtime)
      segments.push({
        left: `${calculatePercentage(eventStart)}%`,
        width: `${calculatePercentage(eventEnd - eventStart)}%`,
        backgroundColor: event.type === 'break' ? '#FFD700' : '#e15b62',
        label: `${eventEnd - eventStart} min`,
        tooltip: `${event.type === 'break' ? 'Break' : 'Downtime'}: ${formatTimeForDisplay(event.startTime)} - ${event.endTime === null ? formatTimeForDisplay(now.toISOString()) : formatTimeForDisplay(event.endTime)}`
      });

      currentPosition = eventEnd;
      timePointer = event.endTime === null ? now : new Date(event.endTime);
    });

    // Add final working segment if needed
    if (currentPosition < totalMinutes) {
      const finalTime = new Date(timePointer);
      finalTime.setHours(shiftEnd, 0, 0);
      
      // Split final working segment if it crosses current time
      if (currentPosition < currentTimeMinutes && currentTimeMinutes < totalMinutes) {
        // Add completed working time
        workingSegments.push({
          left: `${calculatePercentage(currentPosition)}%`,
          width: `${calculatePercentage(currentTimeMinutes - currentPosition)}%`,
          backgroundColor: '#3aa080',
          label: `${currentTimeMinutes - currentPosition} min`,
          tooltip: `Working: ${formatTimeForDisplay(timePointer.toISOString())} - ${formatTimeForDisplay(now.toISOString())}`
        });
        
        // Add remaining time in gray
        segments.push({
          left: `${calculatePercentage(currentTimeMinutes)}%`,
          width: `${calculatePercentage(totalMinutes - currentTimeMinutes)}%`,
          backgroundColor: '#9CA3AF'+50,
          label: `${totalMinutes - currentTimeMinutes} min`,
          tooltip: `Remaining Time: ${formatTimeForDisplay(now.toISOString())} - ${formatTimeForDisplay(finalTime.toISOString())}`
        });
      } else if (currentPosition >= currentTimeMinutes) {
        // If final segment is entirely in the future
        segments.push({
          left: `${calculatePercentage(currentPosition)}%`,
          width: `${calculatePercentage(totalMinutes - currentPosition)}%`,
          backgroundColor: '#9CA3AF'+50,
          label: `${totalMinutes - currentPosition} min`,
          tooltip: `Remaining Time: ${formatTimeForDisplay(timePointer.toISOString())} - ${formatTimeForDisplay(finalTime.toISOString())}`
        });
      } else {
        // If final segment is entirely in the past
        workingSegments.push({
          left: `${calculatePercentage(currentPosition)}%`,
          width: `${calculatePercentage(totalMinutes - currentPosition)}%`,
          backgroundColor: '#3aa080',
          label: `${totalMinutes - currentPosition} min`,
          tooltip: `Working: ${formatTimeForDisplay(timePointer.toISOString())} - ${formatTimeForDisplay(finalTime.toISOString())}`
        });
      }
    }

    return [...workingSegments, ...segments];
  };

  // Add interface for interval items
  // Update TimeInterval interface
  interface TimeInterval {
    left: string;
    time: string;
    isStart?: boolean;
    isEnd?: boolean;
  }
  
  const renderTimeIntervals = (item: RangeChartProps['data'][0]) => {
    const intervals = new Set<TimeInterval>();
    const shiftStartDate = new Date(item.shift_start_time);
    const shiftEndDate = new Date(item.shift_end_time);
    const totalMinutes = (shiftEndDate.getTime() - shiftStartDate.getTime()) / (1000 * 60);

    // Helper function to calculate exact position
    const calculateExactPosition = (time: Date) => {
      const minutesFromStart = (time.getTime() - shiftStartDate.getTime()) / (1000 * 60);
      return (minutesFromStart / totalMinutes) * 100;
    };

    // Add all segment boundaries
    const allEvents = [
      ...(Array.isArray(item.break_minutes) ? item.break_minutes : []),
      ...(Array.isArray(item.downtime_minutes) ? item.downtime_minutes : [])
    ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Add start time
    intervals.add({
      left: '0%',
      time: formatTimeForDisplay(shiftStartDate.toISOString()),
      isStart: true
    });

    // Add segment boundaries
    // allEvents.forEach(event => {
    //   const startDate = new Date(event.startTime);
    //   const endDate = new Date(event.endTime);
      
    //   intervals.add({
    //     left: `${calculateExactPosition(startDate)}%`,
    //     time: formatTimeForDisplay(event.startTime),
    //     isStart: true
    //   });
      
    //   intervals.add({
    //     left: `${calculateExactPosition(endDate)}%`,
    //     time: formatTimeForDisplay(event.endTime),
    //     isEnd: true
    //   });
    // });

    // Add end time
    intervals.add({
      left: '100%',
      time: formatTimeForDisplay(shiftEndDate.toISOString()),
      isEnd: true
    });

    return Array.from(intervals)
      .sort((a, b) => parseFloat(a.left) - parseFloat(b.left));
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      height: '100%',
      padding: '10px 16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        width: '100%'
      }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex',
            width: '100%',
            gap: '12px',
            height: '100%',
            alignItems: 'flex-start',
          }}>
            <div style={{ 
              width: '10%',
              fontSize: '12px',
              color: '#374151',
              fontWeight: '500',
              paddingTop: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={item.machine_id}>{item.machine_id}</div>
            <div style={{
              width: '88%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <div style={{ 
                height: '30px',
                backgroundColor: '#f3f4f6', 
                position: 'relative',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                {calculateSegments(item).map((segment, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: '100%',
                      position: 'absolute',
                      ...segment,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid rgba(255,255,255,0.2)'
                    }}
                    title={segment.tooltip}
                  >
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#1F2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      padding: '0 8px'
                    }}>
                      {/* {segment.label} */}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                position: 'relative',
                height: '20px',
                width: '100%',
                borderTop: '1px solid #E5E7EB',
                marginTop: '2px'
              }}>
                {renderTimeIntervals(item).map((interval, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: interval.left,
                      transform: `translateX(${interval.isEnd ? '0' : '-100%'})`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: interval.isEnd ? 'flex-start' : 'flex-end',
                      top: '2px'
                    }}
                  >
                    <div style={{
                      width: '1px',
                      height: '6px',
                      backgroundColor: '#94A3B8',
                      marginBottom: '2px'
                    }} />
                    <span style={{
                      fontSize: '11px',
                      color: '#64748B',
                      whiteSpace: 'nowrap'
                    }}>
                      {interval.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginTop: '10px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#3aa080', 
            borderRadius: '2px',
            display: 'inline-block'
          }} />
          <span>Working Time</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#FFD700', 
            borderRadius: '2px',
            display: 'inline-block'
          }} />
          <span>Scheduled DT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#e15b62', 
            borderRadius: '2px',
            display: 'inline-block'
          }} />
          <span>Unscheduled DT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#9CA3AF'+50, 
            borderRadius: '2px',
            display: 'inline-block'
          }} />
          
          <span>Remaining Time</span>
        </div>
      </div>
    </div>
  );
};

export default RangeChart;