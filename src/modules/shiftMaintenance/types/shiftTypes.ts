import { ColumnGroupType, ColumnType } from "antd/es/table";

// Define the data structure for the shift intervals and breaks
export interface Break {
    uniqueId: number;
    breakId: number;
    breakType: string;
    breakTimeStart: string;
    breakTimeEnd: string;
    meanTime: number;
    reason: string;
  }
  export interface CalendarRule {
    day:string;
    productionDay:string;
    dayClass:string;
  }
  export interface CalendarOverride {
    date: string;
    productionDay: string;
    dayClass: string;
  }
  export interface CustomData {
    customData: string;
    value: string;

  }
  export interface ShiftInterval {
    key: string;
    validFrom: string;
    validEnd: string;
    startTime: string;
    endTime: string;
    clockInStart: string;
    clockInEnd: string;
    clockOutStart: string;
    clockOutEnd: string;
    labourAssign: string;
    breakList: Break[];
  }
  export interface Data {
    shiftId: string;
    description: string;
    shiftType: string;
    workCenterId: string;
    resourceId: string;
    erpShift?: boolean;
    startTime?: Date | null;
    endTime?: Date | null;
    calendarRules :CalendarRule[];
    calendarOverrides :CalendarOverride[];
    customDataList :CustomData[];
    shiftIntervals: [];
    createdDateTime?: Date;
    modifiedDateTime?: Date;
  }
  interface FormData {
    shiftId: string;
    description: string;
    shiftType: string;
    workCenterId: string;
    resourceId: string;
    shiftIntervals: ShiftInterval[];
    calendarRules: CalendarRule[];
    calendarOverrides :CalendarOverride[];
    customData: CustomData[];
  }
  export type ColumnsType<RecordType = any> = (ColumnGroupType<RecordType> | ColumnType<RecordType>)[];

  export interface MainFormData {
  shiftId: string;
    description: string;
    shiftType: string;
    workCenterId: string;
    resourceId: string;
  }

  export interface DecodedToken {
    preferred_username: string;
  }
