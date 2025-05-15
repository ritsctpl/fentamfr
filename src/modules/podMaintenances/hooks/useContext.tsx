// import { createContext } from "react";

// interface CombinedContextType {
//   mainForm: object;
//   componentForm: object;
//   sequence: number;
//   formChange: boolean;
//   componentCall: boolean;
//   activeTab: boolean;
//   setMainForm: (value: Object) => void;
//   setComponentForm: (value: Object) => void;
//   setSequence: (value: number) => void;
//   setFormChange: (value: boolean) => void;
//   setComponentCall: (value: boolean) => void;
//   setActiveTab: (value: boolean) => void;
// }

// export const BomContext = createContext<CombinedContextType | undefined>(undefined);





import { createContext } from "react";
import { PodRequest, RButton } from "../types/podMaintenanceTypes";

interface CombinedContextType {
    mainForm: PodRequest;
    sequence: number;
    buttonForm: RButton;
    formChange: boolean;
    componentCall: number;
    activitySequence: number;
    setMainForm: (value: PodRequest) => void;
    setButtonForm: (value: RButton) => void;
    setSequence: (value: number) => void;
    setActivitySequence: (value: number) => void;
    setFormChange: (value: boolean) => void;
    setComponentCall: (value: number) => void;
    mainActiveTab: number;
    setMainActiveTab: (value: number) => void;
    subPodActiveTab: number;
    setSubPodActiveTab: (value: number) => void;
    activeTab: number;
    setActiveTab: (value: number) => void;
    retriveRow: any;
    setRetriveRow: (value: any) => void;
    buttonActiveTab: number;
    setButtonActiveTab: (value: number) => void;
    buttonFormChange: boolean;
    setButtonFormChange: (value: boolean) => void;
} 
export const PodMaintenanceContext = createContext<CombinedContextType | undefined>(undefined);