import React, { useEffect, useState } from 'react';
import { Table, Button, Collapse, message, Tooltip } from 'antd';
import { t } from 'i18next';
import { completeBatchNumber, retrieveIngredients, retrievePCUInQueue, signOffBatchNumber, startBatchNumber, startPcu } from '@services/phaseListPluginService';
import { parseCookies } from 'nookies';
import type { AlignType } from 'rc-table/lib/interface';
import Start from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import Complete from '@mui/icons-material/CheckCircleOutlineOutlined';
import Signoff from '@mui/icons-material/ExitToApp';
import Retrieve from '@mui/icons-material/ArrowForward';
import Icon from '@mui/material/Icon';

// Define a type for the transformed data
type TransformedPhase = {
    key: string;
    phaseName: string;
    oPhaseList: any;
    steps: { key: string; stepName: string; phaseId: string }[];
    selectedRowData: any;
};

interface MyTableProps {
    oPhaseList: {
        phaseList: {
            phaseId: string;
            phaseName: string;
            steps: {
                stepId: string;
                stepName: string;
            }[];
        }[];
    };
    selectedRowData: any;
    filterFormData: any;
    oSubPod: any;
    podType: any;
}

const MyTable: React.FC<any> = ({ oPhaseList, selectedRowData, filterFormData, oSubPod, podType, phaseByDefault }) => {

    const [showButtons, setShowButtons] = useState<boolean>(false);
    let transformedData;


    useEffect(() => {
        // debugger
        const buttonValue = oSubPod?.tabConfiguration?.buttons;
        setShowButtons(buttonValue);
        // console.log("buttonValue: ", buttonValue);
    }, [oSubPod])

    if (podType?.toLowerCase().replaceAll(" ", "") == "workcenter") {
        transformedData = oPhaseList?.map(phase => ({ // Updated from "phases" to "phaseList"
            key: phase?.phaseId,
            phaseName: phase?.phaseName,
            phaseId: phase?.phaseId, // Keeping phaseId for reference   
            phaseSequence: phase?.sequence,
            operations: phase?.operations?.map(step => ({ // Ensure steps are correctly mapped
                key: step?.stepId,
                operationName: step?.operationName,
                operationId: step?.operationId,
                operationDescription: step?.operationDescription,
                opSequence: step?.sequence,
            }))
        }));
        // console.log("WC tranformedData: ", transformedData);
    }



    else if (podType?.toLowerCase().replaceAll(" ", "") == "operation") {
        // debugger
        transformedData = oPhaseList?.ops?.map((item, index) => ({ // Updated from "phases" to "phaseList"
            key: index,
            operationId: item?.operationId,
            operationName: item?.operationName,
            operationDescription: item?.operationDescription,
        }));
    }

    // // debugger

    const handlePhaseStart = async (record: any) => {
        // Implement your logic here
        debugger
        message.destroy();
        // message.error("Null pointer exception");
        let operationId, phaseId, phaseSequence;
        console.log('Phase:', record);
        const cookies = parseCookies();
        const site = cookies.site;
        const pcu = selectedRowData?.[0]?.pcu;
        const token = cookies.token;
        const username = cookies.rl_user_id;
        if(podType?.toLowerCase().replaceAll(" ", "") == "workcenter"){
             operationId = record?.operations?.[0]?.operationId;
             phaseId = record?.phaseId;
             phaseSequence = record?.phaseSequence;
        }
        else{
             operationId = record?.operationId;
             phaseId = filterFormData?.defaultPhaseId || phaseByDefault;
             phaseSequence = filterFormData?.defaultPhaseSequence;
        }

        let materialVersion ;
        if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
            materialVersion = selectedRowData?.[0]?.itemVersion;
        }
        else{
            materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
        }

        if(filterFormData?.qtty == "" || filterFormData?.qtty == null || filterFormData?.qtty == undefined){
            message.error("Quantity cannot be empty");
            return;
        }

        try {
            const request = {
                "startBatches": [
                    {
                        "site": site,
                        "batchNumber": selectedRowData?.[0]?.pcu,
                        "phase": phaseId,
                        "operation": operationId,
                        "resource": filterFormData?.defaultResource,
                        "workcenter": filterFormData?.defaultWorkCenter,
                        "user": username,
                        "orderNumber": selectedRowData?.[0]?.shopOrder,
                        "material": selectedRowData?.[0]?.item?.split("/")[0] || '',
                        "materialVersion": materialVersion,
                        "quantity": filterFormData?.qtty,
                        "phaseSequence": phaseSequence
                    }
                ],
                "sync": true
            };
            debugger;
            console.log("Start request: ", request);
            const startResponse = await startBatchNumber(request);
            console.log("Start response: ", startResponse);
            if(startResponse?.status == "failure"){
                message.error(startResponse?.processedStartBatches?.[0]?.message);
            }
            else{
                message.success(startResponse?.message);
            }
        }
        catch (error) {
            console.log("Error in start: ", error);
        }
    };

    const handlePhaseComplete = async (record: any) => {
        // Implement your logic here
        message.destroy();
        // message.error("Null pointer exception");
        console.log('Phase:', record);
        let operationId, phaseId, phaseSequence;

        const cookies = parseCookies();
        const site = cookies.site;
        const username = cookies.rl_user_id;
        if(podType?.toLowerCase().replaceAll(" ", "") == "workcenter"){
            operationId = record?.operations?.[0]?.operationId;
            phaseId = record?.phaseId;
            phaseSequence = record?.phaseSequence;
       }
       else{
            operationId = record?.operationId;
            phaseId = filterFormData?.defaultPhaseId || phaseByDefault;
            phaseSequence = filterFormData?.defaultPhaseSequence;
       }

       let materialVersion ;
       if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
           materialVersion = selectedRowData?.[0]?.itemVersion;
       }
       else{
           materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
       }

       if(filterFormData?.qtty == "" || filterFormData?.qtty == null || filterFormData?.qtty == undefined){
        message.error("Quantity cannot be empty");
        return;
    }

        try {
            const request = {
                "completeBatches": [
                    {
                        "site": site,
                        "batchNumber": selectedRowData?.[0]?.pcu,
                        "phase": phaseId,
                        "operation": operationId,
                        "resource": filterFormData?.defaultResource,
                        "workcenter": filterFormData?.defaultWorkCenter,
                        "user": username,
                        "orderNumber": selectedRowData?.[0]?.shopOrder,
                        "material": selectedRowData?.[0]?.item?.split("/")[0] || '',
                        "materialVersion": materialVersion,
                        "quantity": filterFormData?.qtty,
                        "finalReport": true,
                        "uom": "Kg",
                        "phaseSequence": phaseSequence
                    }
                ],
                "sync": true
            };

            debugger;
            console.log("Complete request: ", request);
            const completeResponse = await completeBatchNumber(request);
            console.log("Complete response: ", completeResponse);
            if(completeResponse?.status == "failure"){
                message.error(completeResponse?.batchDetails?.[0]?.message);
            }
            else{
                message.success(completeResponse?.message);
            }
        }
        catch (error) {
            console.log("Error in completing: ", error);
        }
    };

    const handlePhaseSignoff = async (record: any) => {
        // Implement your logic here
        message.destroy();
        console.log('Phase:', record);
        let operationId, phaseId, phaseSequence;
        const cookies = parseCookies();
        const site = cookies.site;
        const username = cookies.rl_user_id;
        const operation = record?.operations?.[0]?.operationId;
        if(podType?.toLowerCase().replaceAll(" ", "") == "workcenter"){
            operationId = record?.operations?.[0]?.operationId;
            phaseId = record?.phaseId;
            phaseSequence = record?.phaseSequence;
       }
       else{
            operationId = record?.operationId;
            phaseId = filterFormData?.defaultPhaseId || phaseByDefault;
            phaseSequence = filterFormData?.defaultPhaseSequence;
       }

       let materialVersion ;
       if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
           materialVersion = selectedRowData?.[0]?.itemVersion;
       }
       else{
           materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
       }

       if(filterFormData?.qtty == "" || filterFormData?.qtty == null || filterFormData?.qtty == undefined){
        message.error("Quantity cannot be empty");
        return;
    }

        try {
            const request = {
                "signoffBatches": [
                    {
                        "site": site,
                        "batchNumber": selectedRowData?.[0]?.pcu,
                        "phase": phaseId,
                        "operation": operationId,
                        "resource": filterFormData?.defaultResource,
                        "workcenter": filterFormData?.defaultWorkCenter,
                        "user": username,
                        "orderNumber": selectedRowData?.[0]?.shopOrder,
                        "material": selectedRowData?.[0]?.item?.split("/")[0] || '',
                        "materialVersion": materialVersion,
                        "quantity": filterFormData?.qtty,
                        "phaseSequence": phaseSequence
                    }
                ],
                "sync": true
            };
            debugger;
            console.log("Sign off request: ", request);
            const signOffResponse = await signOffBatchNumber(request);
            console.log("Sign off response: ", signOffResponse);
            if(signOffResponse?.status == "failure"){
                message.error(signOffResponse?.processedSignoffBatches?.[0]?.message);
            }
            else{
                message.success(signOffResponse?.message);
            }
        }
        catch (error) {
            console.log("Error in signing off batch number: ", error);
        }
    };

    const handleOperationStart = async (record: any, phase: any) => {
        // Implement your logic here
        message.destroy();
        // message.error("Null pointer exception");
        console.log('Step:', record);
        const cookies = parseCookies();
        const site = cookies.site;
        const username = cookies.rl_user_id;

        let materialVersion ;
        if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
            materialVersion = selectedRowData?.[0]?.itemVersion;
        }
        else{
            materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
        }

        if(filterFormData?.qtty == "" || filterFormData?.qtty == null || filterFormData?.qtty == undefined){
            message.error("Quantity cannot be empty");
            return;
        }

        try {
            const request = {
                "startBatches": [
                    {
                        "site": site,
                        "batchNumber": selectedRowData?.[0]?.pcu,
                        "phase": phase?.phaseId,
                        "operation": record?.operationId,
                        "resource": filterFormData?.defaultResource,
                        "workcenter": filterFormData?.defaultWorkCenter,
                        "user": username,
                        "orderNumber": selectedRowData?.[0]?.shopOrder,
                        "material": selectedRowData?.[0]?.item?.split("/")[0] || '',
                        "materialVersion": materialVersion,
                        "quantity": filterFormData?.qtty
                    }
                ],
                "sync": true
            };
            debugger;
            console.log("Start request: ", request);
            const startResponse = await startBatchNumber(request);
            console.log("Start response: ", startResponse);
        }
        catch (error) {
            console.log("Error in start: ", error);
        }
    };

    const handleOperationComplete = async (record: any, phase: any) => {
        // Implement your logic here
        message.destroy();
        // message.error("Null pointer exception");
        console.log('Operation:', record);

        const cookies = parseCookies();
        const site = cookies.site;
        const username = cookies.rl_user_id;

        let materialVersion ;
        if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
            materialVersion = selectedRowData?.[0]?.itemVersion;
        }
        else{
            materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
        }

        if(filterFormData?.qtty == "" || filterFormData?.qtty == null || filterFormData?.qtty == undefined){
            message.error("Quantity cannot be empty");
            return;
        }

        try {
            const request = {
                "completeBatches": [
                    {
                        "site": site,
                        "batchNumber": selectedRowData?.[0]?.pcu,
                        "phase": phase?.phaseId,
                        "operation": record?.operationId,
                        "resource": filterFormData?.defaultOperation,
                        "workcenter": filterFormData?.defaultWorkCenter,
                        "user": username,
                        "orderNumber": selectedRowData?.[0]?.shopOrder,
                        "material": selectedRowData?.[0]?.item?.split("/")[0] || '',
                        "materialVersion": materialVersion,
                        "quantity": filterFormData?.qtty,
                        "finalReport": true,
                        "uom": "Kg"
                    }
                ],
                "sync": true
            };

            debugger;
            console.log("Complete request: ", request);
            const startResponse = await completeBatchNumber(request);
            console.log("Complete response: ", startResponse);
        }
        catch (error) {
            console.log("Error in completing: ", error);
        }

    };

    const handleOperationSignoff = async (record: any, phase: any) => {
        // Implement your logic here
        message.destroy();
        console.log('Operation:', record);

        const cookies = parseCookies();
        const site = cookies.site;
        const username = cookies.rl_user_id;

        let materialVersion ;
        if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
            materialVersion = selectedRowData?.[0]?.itemVersion;
        }
        else{
            materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
        }

        if(filterFormData?.qtty == "" || filterFormData?.qtty == null || filterFormData?.qtty == undefined){
            message.error("Quantity cannot be empty");
            return;
        }

        try {
            const request = {
                "signoffBatches": [
                    {
                        "site": site,
                        "batchNumber": selectedRowData?.[0]?.pcu,
                        "phase": phase?.phaseId,
                        "operation": record?.operationId,
                        "resource": filterFormData?.defaultOperation,
                        "workcenter": filterFormData?.defaultWorkCenter,
                        "user": username,
                        "orderNumber": selectedRowData?.[0]?.shopOrder,
                        "material": selectedRowData?.[0]?.item?.split("/")[0] || '',
                        "materialVersion": materialVersion,
                        "quantity": filterFormData?.qtty
                    }
                ],
                "sync": true
            };
            debugger;
            console.log("Sign off request: ", request);
            const startResponse = await signOffBatchNumber(request);
            console.log("Sign off response: ", startResponse);
        }
        catch (error) {
            console.log("Error in signing off: ", error);
        }
    };



    const handlePanelChange = async (key: any) => {
        console.log('Expanded panel:', key);
        // Add your expansion logic here
        let operationId, phaseId, opSequence, phaseSequence;
        const cookies = parseCookies();
        const site = cookies.site;
        const batchNo = selectedRowData?.[0]?.pcu;
        const material = selectedRowData?.[0]?.item?.split("/")[0] || '';
        // const materialVersion = selectedRowData?.[0]?.item?.split("/")[1] || '';
        const orderNo = selectedRowData?.[0]?.shopOrder || '';
        
        let materialVersion ;
        if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
            materialVersion = selectedRowData?.[0]?.itemVersion;
        }
        else{
            materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
        }

        if(podType?.toLowerCase().replaceAll(" ", "") == "workcenter"){
            opSequence = key?.operations?.[0]?.opSequence;
            phaseSequence = key?.phaseSequence;
            operationId = key?.operations?.[0]?.operationId;
            phaseId = key?.phaseId;
       }
       else{
            opSequence = key?.opSequence;
            phaseSequence = filterFormData?.defaultPhase;
            operationId = key?.operationId;
            phaseId = filterFormData?.defaultPhase;
       }
        try {
            const request = {
                "site": site,
                "batchNo": batchNo,
                "material": material,
                "materialVersion": materialVersion,
                "orderNo": orderNo,
                "operationId": operationId,
                "phaseId": phaseId,
                "opSequence": opSequence,
                "phaseSequence": phaseSequence
            }
            debugger;
            console.log("Retrieve Ingredients request: ", request);
            const response = await retrieveIngredients(request);
            console.log("Retrieve Ingredients response: ", response);
        }
        catch (error) {
            console.log("Error in retrieveIngredients: ", error);
        }
    };

    const handleOperationPanelChange = async (operation: any, phaseId: any) => {
        // console.log('Expanded operation:', operationKey, 'for phase:', record);
        debugger
        let opSequence, phaseSequence;
        const cookies = parseCookies();
        const site = cookies.site;
        const batchNo = selectedRowData?.[0]?.pcu;
        const material = selectedRowData?.[0]?.item?.split("/")[0] || '';
        // const materialVersion = selectedRowData?.[0]?.item?.split("/")[1] || '';
        const orderNo = selectedRowData?.[0]?.shopOrder || '';
        const operationId = operation?.operationId;
        if(podType?.toLowerCase().replaceAll(" ", "") == "workcenter"){
            opSequence = operation?.opSequence;
            phaseSequence = phaseId?.phaseSequence;
       }
       else{
            opSequence = operation?.opSequence;
            phaseSequence = filterFormData?.defaultOperation;
       }

       let materialVersion ;
       if(selectedRowData?.[0]?.hasOwnProperty("itemVersion") == true){
           materialVersion = selectedRowData?.[0]?.itemVersion;
       }
       else{
           materialVersion = selectedRowData?.[0]?.item?.split("/")[1];
       }

        try {
            const request = {
                "site": site,
                "batchNo": batchNo,
                "material": material,
                "materialVersion": materialVersion,
                "orderNo": orderNo,
                "operationId": operationId,
                "phaseId": phaseId,
                "opSequence": opSequence,
                "phaseSequence": phaseSequence
            }
            debugger;
            console.log("Retrieve Ingredients request: ", request);
            const response = await retrieveIngredients(request);
            console.log("Retrieve Ingredients response: ", response);
        }
        catch (error) {
            console.log("Error in retrieveIngredients: ", error);
        }
    };


    return (


        <div style={{ margin: '10px' }}>
            <Collapse accordion bordered
                // onChange={(key) => key && handlePanelChange(phase)}
                 >
                {transformedData?.map(phase => (
                    <Collapse.Panel header={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '15px' }}
                    onClick={() => handlePanelChange(phase)}
                    >
                        <span style={{ fontSize: '12px', marginTop: '6px' }}>
                            {podType.toLowerCase().replaceAll(" ", "") == "workcenter" ? phase.phaseId : phase.operationId}</span>
                        <div style={{ textAlign: 'center', marginTop: '10px' }}  >
                            {showButtons && ( // Check if showButtons is true
                                <>
                                    {/* <Tooltip title="Retrieve">
                                        <Retrieve
                                            style={{ marginRight: '0px', cursor: 'pointer', color: '#1890ff' }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handlePanelChange(phase);
                                            }}
                                        />
                                    </Tooltip> */}
                                    <Tooltip title="Start">
                                        <Start
                                            style={{ marginRight: '2px', cursor: 'pointer', color: '#1890ff' }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handlePhaseStart(phase);
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Complete">
                                        <Complete
                                            style={{ marginRight: '2px', cursor: 'pointer', color: '#52c41a' }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handlePhaseComplete(phase);
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Sign Off">
                                        <Signoff
                                            style={{ cursor: 'pointer', color: 'red' }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handlePhaseSignoff(phase);
                                            }}
                                        />
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    </div>} key={phase?.key}>
                        {podType.toLowerCase().replaceAll(" ", "") == "workcenter" && (
                            <div>
                                {phase?.operations?.map(step => (
                                    <div
                                        key={step?.key}
                                        style={{
                                            padding: '8px',
                                            borderBottom: '1px solid #f0f0f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleOperationPanelChange(step, phase)}
                                    >
                                        <div>
                                            <span style={{ fontSize: '12px' }}>{step?.operationId}</span>
                                            {/* <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                                                Operation Name: {step?.operationDescription}
                                            </p> */}
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {showButtons && (
                                                <>
                                                    {/* <Tooltip title="Retrieve">
                                                        <Retrieve
                                                            style={{ marginRight: '0px', cursor: 'pointer', color: '#1890ff' }}
                                                            onClick={() => handleOperationPanelChange(step?.operationId, phase?.phaseId)}
                                                        />
                                                    </Tooltip> */}
                                                    <Tooltip title="Start">
                                                        <Start
                                                            style={{ marginRight: '2px', cursor: 'pointer', color: '#1890ff' }}
                                                            onClick={() => handleOperationStart(step, phase)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Complete">
                                                        <Complete
                                                            style={{ marginRight: '2px', cursor: 'pointer', color: '#52c41a' }}
                                                            onClick={() => handleOperationComplete(step, phase)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Sign Off">
                                                        <Signoff
                                                            style={{ cursor: 'pointer', color: 'red' }}
                                                            onClick={() => handleOperationSignoff(step, phase)}
                                                        />
                                                    </Tooltip>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Collapse.Panel>
                ))}
            </Collapse>
        </div>


    );
};

export default MyTable;