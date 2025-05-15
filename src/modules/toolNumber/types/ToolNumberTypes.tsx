interface MeasurementPoints {
    key: string;
    measurementPoint: string;
  }
  
  interface CustomData {
    key: string;
    customData: string;
    value: string;
  }
  
 export interface ToolNumberRequest {
    toolNumber: string;
    description: string;
    status: string;
    toolGroup: string;
    qtyAvailable: number;
    erpEquipmentNumber: string;
    erpPlanMaintenanceOrder: string;
    toolQty: number;
    duration: number;
    location: string;
    calibrationType: string;
    startCalibrationDate: string;
    calibrationPeriod: string;
    calibrationCount: number;
    maximumCalibrationCount: number;
    expirationDate: string;
    toolGroupSetting: string;
    measurementPointsList: MeasurementPoints[];
    customDataList: CustomData[];
    userId: string;
  }
  
  // Default values
  export const defaultToolNumberRequest: ToolNumberRequest = {
    toolNumber: '',
    description: '',
    status: 'Enabled',
    toolGroup: '',
    qtyAvailable: 0,
    erpEquipmentNumber: '',
    erpPlanMaintenanceOrder: '',
    toolQty: 0,
    duration: 0,
    location: '',
    calibrationType: 'None',
    startCalibrationDate: '',
    calibrationPeriod: '',
    calibrationCount: 0,
    maximumCalibrationCount: 0,
    expirationDate: '',
    toolGroupSetting: '',
    measurementPointsList: [],
    customDataList: [],
    userId: '',
  };
