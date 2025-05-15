import { createContext, useContext, useState, useEffect } from "react";

interface SettingsDataProps {
  data: any[];
  setData: (data: any[]) => void;
  filterColors: any;
  setFilterColors: (state: any) => void;
}

const SettingsDataContext = createContext<SettingsDataProps | undefined>(undefined);

export const SettingsDataProvider = ({ children }) => {
  // Load 'data' from localStorage or fall back to an empty array
  const loadDataFromLocalStorage = () => {
    const savedData = localStorage.getItem("data");
    return savedData ? JSON.parse(savedData) : [];
  };

  // Load 'filterColors' from localStorage or fall back to defaults
  const loadFilterColorsFromLocalStorage = () => {
    const savedFilterColors = localStorage.getItem("filterColorsProcess");
    return savedFilterColors
      ? JSON.parse(savedFilterColors)
      :  {
        'oeeOverTime': {
            itemcolor:['#FF0000','#FFFF00','#00FF00'],
            threshold:[50,85,20],
            linecolor:['#0000FF','#FFA500','#FFC0CB']
        },
        oeeByComponent: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[50,85,20],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        downtimeOverTime: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[30,10,10],
          linecolor: ["red", "#FFA500", "#FFC0CB"],
        },
        performanceOverTime: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[70,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        qualityOverTime: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[80,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        availabilityOverTime: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[90,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        defectTrendOverTime: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[10,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        oeeByMachine: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[50,85,20],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        oeeByShift: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[50,85,20],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        downtimeByReasonAndShift: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[50,85,20],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        downtimeByMachine: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[50,85,20],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        downtimeByReason: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[50,85,20],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        performanceByShift: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[70,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        performanceByMachine: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[70,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        performanceByProductionLine: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[70,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        availabilityByShift: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[90,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        availabilityByMachine: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[90,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        availabilityDowntimePareto: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[90,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        downtimeHeatmap: {
          itemcolor: ["#0000FF", "#FFA500", "#FFC0CB"],
          threshold:[90,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        qualityByShift: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[80,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        qualityByMachine: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[80,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        qualityByProduct: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[80,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        defectsByReason: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[10,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        qualityLossByProductionLine: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold:[10,10,10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        qualityByOperator: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold: [80, 10, 10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        defectDistributionByProduct: {
          itemcolor: ["#FF0000", "#FFFF00", "#00FF00"],
          threshold: [10, 10, 10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        scrapReworkTrend: {
          itemcolor: ['#FF0000', '#FFFF00', '#00FF00'],
          threshold: [10, 10, 10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        goodQualityVsBadQuality: {
          itemcolor: ['#FF0000', '#FFFF00', '#00FF00'],
          threshold: [80, 10, 10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        downtimeImpact:{
          itemcolor: ['#FF0000', '#FFFF00', '#00FF00'],
          threshold: [90, 10, 10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"],
        },
        oeeLossByReason:{
          itemcolor: ['#FF0000', '#FFFF00', '#00FF00'],
          threshold: [10, 10, 10],
          linecolor: ["#0000FF", "#FFA500", "#FFC0CB"], 
        }
      ,
      performanceLossReasons: {
        itemcolor: ['#FF0000', '#FFFF00', '#00FF00'],
        threshold: [10, 10, 10],
        linecolor: ["#0000FF", "#FFA500", "#FFC0CB"]
      },
      performanceDowntimeAnalysis: {
        itemcolor: ['#FF0000', '#FFFF00', '#00FF00'],
        threshold: [10, 10, 10],
        linecolor: ["#0000FF", "#FFA500", "#FFC0CB"]
      }
      };
  };

  // Initialize the states
  const [data, setData] = useState<any[]>(loadDataFromLocalStorage());
  const [filterColors, setFilterColors] = useState(loadFilterColorsFromLocalStorage);

  // Effect to store 'data' in localStorage whenever it changes
  useEffect(() => {
    if (data) {
      localStorage.setItem("data", JSON.stringify(data));
    }
  }, [data]);

  // Effect to store 'filterColors' in localStorage whenever it changes
  useEffect(() => {
    if (filterColors) {
      localStorage.setItem("filterColorsProcess", JSON.stringify(filterColors));
    }
  }, [filterColors]);

  return (
    <SettingsDataContext.Provider value={{ data, setData, filterColors, setFilterColors }}>
      {children}
    </SettingsDataContext.Provider>
  );
};

export const useSettingsData = () => {
  return useContext(SettingsDataContext);
};
