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
    const savedFilterColors = localStorage.getItem("filterColors");
    return savedFilterColors
      ? JSON.parse(savedFilterColors)
      : {
        'oeeOverTime': {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652'] // Light Blue, Light Orange, Light Pink
        },
        oeeByComponent: {
          itemcolor: ['#006200', '#E0E030', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        performanceOverTime: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        qualityOverTime: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        availabilityOverTime: {
          itemcolor: ['#006200', '#E0E030', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        defectTrendOverTime: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        oeeByMachine: {
          itemcolor: ['#006200', '#E0E030', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        oeeByOperation: {
          itemcolor: ['#006200', '#E0E030', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        oeeByShift: {
          itemcolor: ['#006200', '#6680FF', '#E0E030', '#FF80FF', '#80FFFF', '#FF8066'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },

        oeeByProduct: {
          itemcolor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        performanceByProductionLine: {
          itemcolor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        oeeBreakdown: {
          itemcolor: ['#006200', '#F03652', '#E0E030'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        performanceByShift: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        performanceByMachine: {
          itemcolor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },

        availabilityByShift: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        availabilityByMachine: {
          itemcolor: ['#006200', '#FFD700', '#dc3545'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        availabilityDowntimePareto: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },

        qualityByShift: {
          itemcolor: ['#006200', '#E0E030', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        qualityByMachine: {
          itemcolor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        qualityByProduct: {
          itemcolor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },


        defectsByReason: {
          itemcolor: ['#AD49E1', '#F5F580', '#006200'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        qualityLossByProductionLine: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        qualityByOperator: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        defectDistributionByProduct: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        scrapReworkTrend: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },

        oeeLossByReason: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        performanceLossReasons: {
          itemcolor: ['#F03652', '#F5F580', '#006200'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        performanceDowntimeAnalysis: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        downtimeHeatmap: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        downtimeOverTime: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#F03652', '#FFDAB9', '#F03652']
        },
        downtimeByReasonAndShift: {
          itemcolor: ['#28a745', '#FFD700', '#dc3545'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        downtimeByMachine: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        downtimeByReason: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
        downtimeImpact: {
          itemcolor: ['#006200', '#F5F580', '#F03652'], // Changed Light Green to #006200
          threshold: [60, 85],
          linecolor: ['#ADD8E6', '#FFDAB9', '#F03652']
        },
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
      localStorage.setItem("filterColors", JSON.stringify(filterColors));
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