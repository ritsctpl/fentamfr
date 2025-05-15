import React, { useEffect, useState, useCallback, useRef } from "react";
import { message } from "antd";
import CommonTable from "./components/CommonTable";
import {
  completeLineClearancePlugin,
  retrieveLineClearanceData,
  retriveLineClearancePlugin,
  startLineClearancePlugin,
} from "@services/lineClearanceService";
import { parseCookies } from "nookies";

interface RowData {
  id: string;
  templeteName: string;
  description: string;
  taskName: string;
  isMandatory: boolean;
  evidenceRequired: boolean;
  evidence: string;
  reasonCode: string;
  reason: string;
  status: "new" | "started" | "completed";
}

interface LineClearancePluginProps {
  filterFormData: any;
  selectedRowData: any;
  call2: boolean;
  call1: boolean;
  setCall2: (value: boolean) => void;
  phaseByDefault: string;
  buttonLabel: string;
  onRemoveContainer: (value: string) => void;
  setSelectedContainer: (value: any) => void;
}

const LineClearancePlugin: React.FC<LineClearancePluginProps> = ({
  filterFormData,
  selectedRowData,
  call2,
  call1,
  setCall2,
  phaseByDefault,
  buttonLabel,
  onRemoveContainer,
  setSelectedContainer,
}) => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const filePathRef = useRef<string | undefined>(undefined);
  const [callBack1, setCallBack1] = useState<number>(0);
  const [batchNodata, setBatchNodata] = useState<string[]>([]);
  const [lastData, setLastData] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState<{ [key: number]: string[] }>({});
  const [base64RawData, setBase64rawData] = useState<any>();
  console.log(filterFormData, "filterFormData");
  console.log(selectedRowData, "selectedRowData");
  const fetchData = useCallback(async () => {
    const batchNumbers = selectedRowData.map((item: any) => item.batchNo);
    if (batchNumbers.length > 0) {
      setBatchNodata(batchNumbers);
    }
    // debugger
    const cookies = parseCookies();
    const payload = {
      site: cookies.site,
      workCenterId: filterFormData?.defaultWorkCenter,
      resourceId: filterFormData?.defaultResource,
      batchNo: batchNumbers[0],
      phase: filterFormData?.defaultPhaseId || phaseByDefault,
      operation: filterFormData?.defaultOperation,
    };
    console.log(payload, "payload");
    try {
      setLoading(true);
      const response = await retriveLineClearancePlugin(payload);
      console.log(response, "response");
      // if (!response.ok) {
      //     throw new Error('Network response was not ok');
      // }
      setData(response);
      setLastData(response[response.length - 1]?.templeteName);
    } catch (error) {
      // message.error('Failed to fetch data');
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [call2, filterFormData, selectedRowData, callBack1, call1]);

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    },500);
  }, [fetchData, call2, filterFormData, selectedRowData]); 
  
  useEffect(() => {
    setSelectedReasons({});
  }, [ call1, call2, filterFormData, selectedRowData]);

  const getLineClearanceData = async () => {
    const cookies = parseCookies();
    const payload = {
      site: cookies.site,
      workCenterId: filterFormData?.defaultWorkCenter,
      resourceId: filterFormData?.defaultResource,
      batchNo: selectedRowData[0]?.batchNo,
    };
    const response = await retrieveLineClearanceData(payload);
    console.log(response, "response");
  };

  const updateStatus = async (
    id: string,
    newStatus: string,
    base64Evidence?: string,
    record?: any
  ) => {
    console.log(id, "base64Evidence");
    message.destroy();
    // debugger
    let response;
    const cookies = parseCookies();
    // const payload =
    // {
    //     "site": cookies.site,
    //     "userId": cookies.userId,
    //     "phase": filterFormData?.defaultPhase,
    //     "operation": filterFormData?.defaultOperation,
    //     workCenterId: filterFormData?.defaultWorkCenter,
    //     resourceId: filterFormData?.defaultResource,
    //     "isMandatory": true,
    //     "evidenceRequired": true,
    //     "evidence":base64Evidence || undefined,
    //     "status": "Start"
    //   }
    const taskName = record?.taskName;
    const taskDescription = record?.taskDescription;
    const templeteName = record?.templeteName;
    const description = record?.description;
    const batchNo = batchNodata ? batchNodata : selectedRowData?.[0]?.batchNo;
    const isMandatory = record?.isMandatory;
    const evidenceRequired = record?.evidenceRequired;
    const evidenceData = record?.evidence;
    const reasonCode = record?.reason;

    if (newStatus.toLowerCase() === "started") {
       const listpayloads = selectedRowData.map((item: any) => {
        return {
          site: cookies.site,
          templeteName: templeteName,
          description: description,
          batchNo: item.batchNo,
          phase: filterFormData?.defaultPhaseId || phaseByDefault,
          phaseId: filterFormData?.defaultPhaseId || phaseByDefault,
          operation: filterFormData?.defaultOperation,
          workCenterId: filterFormData?.defaultWorkCenter,
          resourceId: filterFormData?.defaultResource,
          userId: cookies.rl_user_id,
          taskName: taskName,
          taskDescription: taskDescription,
          isMandatory: isMandatory,
          evidenceRequired: evidenceRequired,
          evidence: base64Evidence || "",
          status: "Start",
          createdDateTime: new Date().toISOString(),
          reasonCode: reasonCode,
          reason: reasonCode,
          orderNumber: item?.orderNumber,
          item: item?.material,
          itemVersion: item?.materialVersion,
          quantity: item?.qty,
        };
      });
      console.log(listpayloads, "listpayload");
      const payload = {
        site: cookies.site,
        templeteName: templeteName,
        description: description,
        batchNo: batchNo,
        phase: filterFormData?.defaultPhaseId || phaseByDefault,
        phaseId: filterFormData?.defaultPhaseId || phaseByDefault,
        operation: filterFormData?.defaultOperation,
        workCenterId: filterFormData?.defaultWorkCenter,
        resourceId: filterFormData?.defaultResource,
        userId: cookies.rl_user_id,
        taskName: taskName,
        taskDescription: taskDescription,
        isMandatory: isMandatory,
        evidenceRequired: evidenceRequired,
        evidence: base64Evidence || "",
        status: "Start",
        createdDateTime: new Date().toISOString(),
        reasonCode: reasonCode,
        reason: reasonCode
      };
      response = await startLineClearancePlugin({lineClearanceLogRequestList:listpayloads});
      if (!response.errorCode) {
        message.success(response?.message);
      } else {
        message.error(response?.message);
      }
    } else if (newStatus.toLowerCase() === "completed") {
      const listpayloadc = selectedRowData.map((item: any) => {
        return {
          site: cookies.site,
          templeteName: templeteName,
          description: description,
          batchNo: item.batchNo,
          phase: filterFormData?.defaultPhaseId || phaseByDefault,
          phaseId: filterFormData?.defaultPhaseId || phaseByDefault,
          operation: filterFormData?.defaultOperation,
          workCenterId: filterFormData?.defaultWorkCenter,
          resourceId: filterFormData?.defaultResource,
          userId: cookies.rl_user_id,
          taskName: taskName,
          taskDescription: taskDescription,
          isMandatory: isMandatory,
          evidenceRequired: evidenceRequired,
          evidence: base64Evidence || "",
          status: "Complete",
          createdDateTime: new Date().toISOString(),
          reasonCode: reasonCode,
          reason: reasonCode,
          orderNumber: item?.orderNumber,
          item: item?.material,
          itemVersion: item?.materialVersion,
          quantity: item?.qty,
        };
      });
      console.log(listpayloadc, "listpayload");
      const payload = {
        site: cookies.site,
        templeteName: templeteName,
        description: description,
        batchNo: batchNo,
        phase: filterFormData?.defaultPhaseId || phaseByDefault,
        phaseId: filterFormData?.defaultPhaseId || phaseByDefault,
        operation: filterFormData?.defaultOperation,
        workCenterId: filterFormData?.defaultWorkCenter,
        resourceId: filterFormData?.defaultResource,
        userId: cookies.rl_user_id,
        taskName: taskName,
        taskDescription: taskDescription,
        isMandatory: isMandatory,
        evidenceRequired: evidenceRequired,
        evidence: base64Evidence || evidenceData || "",
        status: "Complete",
        createdDateTime: new Date().toISOString(),
        reasonCode: reasonCode,
        reason: reasonCode
      };
      response = await completeLineClearancePlugin({lineClearanceLogRequestList:listpayloadc});
      if (!response.errorCode) {
        message.success(response?.message);
        // if(templeteName===lastData){
        //     onRemoveContainer(buttonLabel)
        //     setSelectedContainer(null)
        // }
      } else {
        message.error(response?.message);
      }
    }

    // if (!response.ok) {
    //     debugger
    //     throw new Error('Failed to update status');
    // }

    return await response;
  };

  const handleStatusChange = useCallback(
    async (
      keys: number[],
      newStatus: string,
      base64Evidence?: string,
      record?: any
    ) => {
      try {
        setLoading(true);

        // Get the actual items that need to be updated
        const itemsToUpdate = data.filter((_, index) => keys.includes(index));
        // Update each item in sequence
        for (const item of itemsToUpdate) {
          // debugger
          await updateStatus(item.id, newStatus, base64Evidence, record);
          // debugger
        }
        // debugger
        // Refresh the data
        await fetchData();

        // message.success(`Status updated to ${newStatus}`);
      } catch (error) {
        message.error("Failed to update status");
        console.error("Error updating status:", error);
      } finally {
        setLoading(false);
      }
    },
    [data, fetchData]
  );

  // const TableData = data.map(item => ({
  //     templeteName: item.templeteName,
  //     description: item.description,
  //     taskName: item.taskName,
  //     isMandatory: item.isMandatory,
  //     evidenceRequired: item.evidenceRequired,
  //     evidence: item.evidence,
  //     action: true,
  //     status: item.status,
  // }));
  console.log(lastData, "datacc");
  return (
    <div className="line-clearance-container">
      <CommonTable
        TableData={data}
        setData={setData}
        onStatusChange={handleStatusChange}
        loading={loading}
        selectedRowData={selectedRowData}
        filterFormData={filterFormData}
        phaseByDefault={phaseByDefault}
        filePathRef={filePathRef}
        callBack1={callBack1}
        setCallBack1={setCallBack1}
        call2={call2}
        selectedReasons={selectedReasons} 
        setSelectedReasons={setSelectedReasons}
        call1={call1}
        base64RawData={base64RawData}
        setBase64rawData={setBase64rawData}
      />
    </div>
  );
};

export default LineClearancePlugin;
