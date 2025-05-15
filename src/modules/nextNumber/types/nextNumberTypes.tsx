export interface NumberConfiguration {
  site: string;
  numberType: string;
  orderType: string;
  userId: string;
  defineBy: string;
  object: string;
  item: string;
  itemGroup: string;
  objectVersion: string;
  description: string;
  prefix: string;
  suffix: string;
  userBO: string;
  numberBase: number;
  sequenceLength: number;
  minSequence: number;
  maxSequence: number;
  warningThreshold: number;
  incrementBy: number;
  currentSequence: number;
  resetSequenceNumber: string;
  nextNumberActivity: string | null;
  createContinuousSfcOnImport: boolean;
  commitNextNumberChangesImmediately: boolean;
  sampleNextNumber: string;
  containerInput: string;
  extension: string;
}
export interface PayloadData {
  site: string;
  numberType: string;
  orderType: string;
  userId: string;
  defineBy: string;
  object: string;
  item: string;
  itemGroup: string;
  objectVersion: string;
  description: string;
  prefix: string;
  suffix: string;
  userBO: string;
  numberBase: number;
  sequenceLength: number;
  minSequence: number;
  maxSequence: number;
  warningThreshold: number;
  incrementBy: number;
  currentSequence: number;
  resetSequenceNumber: string;
  nextNumberActivity: string | null;
  createContinuousSfcOnImport: boolean;
  commitNextNumberChangesImmediately: boolean;
  sampleNextNumber: string;
  containerInput: string;
  extension: string;
}


const defaultNumberConfig: NumberConfiguration = {
  site: "",
  numberType: "PCU release",
  orderType: "Production",
  userId: "",
  defineBy: "Item",
  object: "",
  item: "",
  itemGroup: "",
  objectVersion: "",
  description: "",
  prefix: "",
  suffix: "",
  userBO: "",
  numberBase: 10,
  sequenceLength: 3,
  minSequence: 1,
  maxSequence: 100,
  warningThreshold: 0,
  incrementBy: 1,
  currentSequence: 5,
  resetSequenceNumber: "Never",
  nextNumberActivity: "",
  createContinuousSfcOnImport: false,
  commitNextNumberChangesImmediately: false,
  sampleNextNumber: "",
  containerInput: "",
  extension: ""
};


