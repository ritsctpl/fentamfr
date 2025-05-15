import { FC, useCallback } from 'react';
import BarChartPopup from '../graph/Barchartclick';

interface DataPoint {
  name: string;
  value: number;
}

interface TopLossDrillDownProps {
  data: DataPoint[];
  onDrillDown?: (name: string, value: number) => void;
}

export const TopLossDrillDown: FC<TopLossDrillDownProps> = ({ data, onDrillDown }) => {
  const handleBarClick = useCallback((xValue: string, yValue: number) => {
    onDrillDown?.(xValue, yValue);
  }, [onDrillDown]);

  return (
    // <BarChartPopup
    //   data={data}
    //   title="Top Loss Drill Down"
    //   color={["#3aa080", "#ffc107"]} // Primary and warning colors for visual hierarchy
    //   theshold={[70, 85]} // Industry standard thresholds for loss analysis
    //   description="Detailed breakdown of top losses"
    //   unit="%"
    //   timebyperiod={false}
    //   showXAxisLabel={true}
    //   onBarClick={handleBarClick}
    // />
    <></>
  );
};

// Type guard to ensure data format
export const isValidTopLossData = (data: any[]): data is DataPoint[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' &&
    'name' in item &&
    'value' in item &&
    typeof item.name === 'string' &&
    typeof item.value === 'number'
  );
}; 