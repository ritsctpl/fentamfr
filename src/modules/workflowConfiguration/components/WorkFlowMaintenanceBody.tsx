import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/WorkFlowMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { Form, Input, message, Button, Modal, Tooltip, Select, Row, Typography, Col, List, Tabs } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tab } from '@mui/material';
import dayjs from 'dayjs';
import { createConfiguration, deleteConfiguration, fetchAllUserGroup, retrieveAllConfigurations, retrieveAllWorkFlowStatesMaster, retrieveConfigurations, updateConfiguration, } from '@services/workflowConfigurationService';
import { useTranslation } from 'react-i18next';
import { useMyContext } from '../hooks/WorkFlowConfigurationContext';
import ApiConfigurationForm from './WorkFlowForm';
import { parseCookies } from 'nookies';
import LevelConfigurationTable from './levelConfigurationTable';
import FlowChart from './FlowChart';
const { Option } = Select
import { LuComponent } from "react-icons/lu";
import AddIcon from "@mui/icons-material/Add";
import { retrieveAllComponents, retrieveComponent } from '@services/componentBuilderService';
import WorkFlowForm from './WorkFlowForm';
import { retrieveUserGroup } from '@services/workFlowService';
import { defaultConfiguration } from '../types/workFlowTypes';

interface ApiConfigurationMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null
    onClose: () => void;
    setFullScreen: (boolean) => void;
    itemRowData: any;
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    call: number;
    setCall: (number) => void;
    setSelectedRowData: (any) => void;

}





const WorkFlowMaintenanceBody: React.FC<ApiConfigurationMaintenanceBodyProps> = ({
    isAdding, selectedRowData, onClose, call, setCall, setFullScreen, setAddClick, fullScreen, setSelectedRowData }) => {


    const { payloadData, setPayloadData, showAlert, setShowAlert, predefinedUsers, setPredefinedUsers,
        predefinedStates, setPredefinedStates, triggerToExport, setTriggerToExport, tranisitionList,
        configurationList, setConfigurationList } = useMyContext();
    // const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const { activeTab, setActiveTab } = useMyContext();
    const [isLoading, setIsLoading] = useState<any>();
    const [searchTerm, setSearchTerm] = useState<any>();
    const [collapsed, setCollapsed] = useState<boolean>(false);


    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setAddClick(false);
        setCollapsed(false)
        if (newValue == 1) {

            const fetchStates = async () => {
                try {
                    const cookies = parseCookies();
                    const site = cookies?.site;
                    const user = cookies?.rl_user_id
                    const request = {
                        site: site,
                        userId: user,
                        name: ""
                    }
                    const response = await retrieveAllWorkFlowStatesMaster(request);
                    setPayloadData((prev) => ({
                        ...prev,
                        statesList: response
                    }));
                    setPredefinedStates(response);
                }
                catch (error) {
                    console.error('Error fetching states:', error);
                }
            }
            //fetchStates();

            const retrieveUserGroupList = async () => {
                try {
                    const cookies = parseCookies();
                    const site = cookies?.site;

                    // Fetch user group list
                    const userGroupResponse = await fetchAllUserGroup(site);
                    let userGroupList = [];

                    if (!userGroupResponse?.errorCode) {
                        userGroupList = userGroupResponse.map((item, index) => ({
                            id: index,
                            userGroup: item?.description
                        }));
                    }
                    setPredefinedUsers(userGroupList);
                    // Set user group list
                    setPayloadData(prev => ({
                        ...prev,
                        userGroupList: userGroupList
                    }));

                } catch (e) {
                    console.log("Error in retrieving user configuration: ", e);
                    // Set empty lists in case of error
                    setPayloadData(prev => ({
                        ...prev,
                        userGroupList: [],
                        userList: []
                    }));
                }
            };
            retrieveUserGroupList();
            setFullScreen(true);
        }
        else {
            setFullScreen(false);
        }

    };

    const handleOpenChange = () => {
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);
    }


    const handleClose = () => {
        onClose();
    };


    const handleSave = async (oEvent) => {
        message.destroy();

        let flagToSave = true, flagToEncode = true;
        let buttonLabel = oEvent.currentTarget.innerText;

        if (payloadData?.name == "" || payloadData?.name == null || payloadData?.name == undefined) {
            flagToEncode = false;
            message.error("Name cannot be empty");
            return;
        }

        if (payloadData?.version == "" || payloadData?.version == null || payloadData?.version == undefined) {
            flagToEncode = false;
            message.error("Version cannot be empty");
            return;
        }

        const oCreateConfig = async () => {
            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const user = cookies?.rl_user_id
                let updatedRequest;

                // Explicitly get the latest transitions
                const latestTransitions = tranisitionList.current || payloadData?.transitions || [];
                // debugger
                updatedRequest = {
                    site: site,
                    ...payloadData,
                    transitions: latestTransitions,
                    userId: user,
                }

                // Log the transitions to verify
                console.log("Transitions being saved:", latestTransitions);

                if (buttonLabel == "Create" || buttonLabel == "बनाएं"
                    || buttonLabel == "ರಚಿಸಿ" || buttonLabel == "உருவாக்க") {
                    try {
                        const createResponse = await createConfiguration(updatedRequest);
                        if (createResponse) {
                            if (createResponse?.errorCode) {
                                message.error(createResponse?.message);
                            }
                            else {
                                setCall(call + 1);
                                setShowAlert(false);


                                message.success(createResponse?.message);
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error creating spec:', error);
                    }
                }

                else if (buttonLabel == "Save" || buttonLabel == "सहेजें" ||
                    buttonLabel == "ಉಳಿಸಿ" || buttonLabel == "சேமிக்க") {

                    if (flagToSave) {
                        try {
                            const updateResponse = await updateConfiguration(updatedRequest);
                            if (updateResponse) {
                                if (updateResponse?.errorCode) {
                                    message.error(updateResponse?.message);
                                }
                                else {
                                    setShowAlert(false);
                                    message.success(updateResponse?.message);
                                    setCall(call + 1);
                                }
                            }
                        }
                        catch (error) {
                            console.error('Error updating configuration:', error);
                        }
                    }
                }

            } catch (error) {
                console.error('Error creating configuration:', error);
            }
        };

        if (flagToEncode == true) {
            // Trigger export of workflow steps before saving
            setTriggerToExport(triggerToExport + 1);

            // Wait a short moment to allow transitions to be captured
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (flagToSave == true) {
            try {
                await oCreateConfig();
            }
            catch (e) {
                console.error("Error in creating configuration", e);
            }
        }
    };




    const handleCancel = () => {
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                // Proceed with the API call if confirmed
                onClose();
            },
            onCancel() {
            },
        });
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleConfirmDelete = () => {
        const oDeleteConfig = async () => { // Rename the inner function to avoid recursion
            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const id = payloadData?.id;
                const request = {
                    site: site,
                    name: payloadData?.name,
                    version: payloadData?.version,
                    userId: cookies?.rl_user_id,
                    entityType: payloadData?.entityType,
                    attachedto: payloadData?.attachedto || "",
                    attachedStatus: payloadData?.attachedStatus || ""
                }

                try {
                    const response = await deleteConfiguration(request); // Assuming retrieveItem is an API call or a data fetch function
                    if (!response.errorCode) {
                        message.success(response?.message);
                        setCall(call + 1);
                        setShowAlert(false);
                        setActiveTab(0);
                        setPayloadData(defaultConfiguration);
                    }
                    else {
                        message.error(response?.message);
                    }
                }
                catch (e) {
                    console.error("Error in deleting the configuration", e);
                }
            } catch (error) {
                console.error('Error deleting configuration:', error);
            }
        };

        oDeleteConfig();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        // debugger
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            name: selectedRowData?.name + "_COPY" || '',
            version: '',
        });
        // setPayloadData((prev) => ({
        //     ...prev,
        //     apiName: selectedRowData?.apiName + "_COPY" || '',
        //     storedProcedure: '',
        //     httpMethod: 'POST'
        // }))
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        formattedValue = value.replace(/ /g, '').replace(/[^a-zA-Z0-9_]/g, '');

        // console.log(`Field Change: ${fieldName}`, formattedValue); // Debugging line
        // Set field value
        form.setFieldsValue({ [fieldName]: formattedValue });
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: formattedValue
        }))
    };

    const handleRowSelect = (row: any) => {

        const fetchConfig = async () => {
            try {
                let response;
                const cookies = parseCookies();
                const site = cookies?.site;
                const request = {
                    site: site,
                    name: row?.name,
                    version: row?.version,
                    entityType: row?.entityType,
                    attachedto: row?.attachedto || "",
                    attachedStatus: row?.attachedStatus || ""
                }
                try {
                    response = await retrieveConfigurations(request);
                    if (!response?.errorCode) {
                        setActiveTab(0);
                        setPayloadData(response);
                        setSelectedRowData(response);
                    }

                }
                catch (e) {
                    console.error("Error in retrieveing the component", e);
                }
            } catch (error) {
                console.error("Error fetching component:", error);
            }
        };

        if (showAlert == true) {
            Modal.confirm({
                title: t('confirm'),
                content: t('rowSelectionMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    // Proceed with the API call if confirmed
                    try {
                        await fetchConfig();
                    }
                    catch (e) {
                        console.error("Error in retrieveing the component: ", e);
                    }
                    setShowAlert(false)
                },
                onCancel() {
                },
            });
        } else {
            // If no data to confirm, proceed with the API call
            fetchConfig();
        }

    };


    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then(async (values) => {
                // Add your copy logic here with the form values
                // console.log('Activity copied:', values);
                message.destroy();
                let flagToSave = true, flagToEncode = true;

                if (payloadData?.name == "" || payloadData?.name == null || payloadData?.name == undefined) {
                    flagToEncode = false;
                    message.error("Name cannot be empty");
                    return;
                }

                if (payloadData?.version == "" || payloadData?.version == null || payloadData?.version == undefined) {
                    flagToEncode = false;
                    message.error("Version cannot be empty");
                    return;
                }

                const oCopyConfiguration = async () => { // Rename the inner function to avoid recursion
                    let updatedRequest;
                    const cookies = parseCookies();
                    const site = cookies?.site;
                    const user = cookies?.rl_user_id
                    try {
                        updatedRequest = {
                            site: site,
                            ...payloadData,
                            userId: user
                        }

                        try {
                            const copyResponse = await createConfiguration(updatedRequest);
                            if (copyResponse?.errorCode) {
                                message.error(copyResponse?.message);
                            }
                            else {
                                setCall(call + 1);
                                message.success(copyResponse?.message);
                                setShowAlert(false);
                                onClose();
                            }
                        }
                        catch (e) {
                            console.error("Error in copying the configuration", e);
                        }

                    } catch (error) {
                        console.error('Error copying configuration:', error);
                    }
                };

                if (flagToEncode == true) {

                }
                if (flagToSave == true) {
                    try {
                        await oCopyConfiguration();
                    }
                    catch (e) {
                        console.error("Error in copying the configuration", e);
                    }

                }

                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };


    const { t } = useTranslation();

    const workflowSteps1 = [
        {
            currentUserOrState: [
                {
                    action: null,
                    user: "Initiator"
                }
            ],
            nextState: [
                {
                    action: "Submit",
                    user: "Department Manager"
                },
                {
                    action: "Draft",
                    user: "Technical Reviewer"
                }
            ]
        },
        {
            currentUserOrState: [
                {
                    action: "Approve",
                    user: "Department Manager"
                },
                {
                    action: "Reject",
                    user: "Department Manager"
                },
                {
                    action: "Approve",
                    user: "Technical Reviewer"
                },
                {
                    action: "Reject",
                    user: "Technical Reviewer"
                }
            ],
            nextState: [
                {
                    action: "Approve",
                    user: "Quality Assurance",
                    fromUser: "Department Manager"
                },
                {
                    action: "Reject",
                    user: "Initiator",
                    fromUser: "Department Manager"
                },
                {
                    action: "Approve",
                    user: "Senior Manager",
                    fromUser: "Technical Reviewer"
                },
                {
                    action: "Reject",
                    user: "Initiator",
                    fromUser: "Technical Reviewer"
                }
            ]
        },
        {
            currentUserOrState: [
                {
                    action: "Approve",
                    user: "Quality Assurance"
                },
                {
                    action: "Reject",
                    user: "Quality Assurance"
                },
                {
                    action: "Approve",
                    user: "Senior Manager"
                },
                {
                    action: "Reject",
                    user: "Senior Manager"
                }
            ],
            nextState: [
                {
                    action: "Approve",
                    user: "Final Approver",
                    fromUser: "Quality Assurance"
                },
                {
                    action: "Reject",
                    user: "Department Manager",
                    fromUser: "Quality Assurance"
                },
                {
                    action: "Approve",
                    user: "Final Approver",
                    fromUser: "Senior Manager"
                },
                {
                    action: "Reject",
                    user: "Technical Reviewer",
                    fromUser: "Senior Manager"
                }
            ]
        },
        {
            currentUserOrState: [
                {
                    action: "Approve",
                    user: "Final Approver"
                },
                {
                    action: "Reject",
                    user: "Final Approver"
                }
            ],
            nextState: [
                {
                    action: "Approve",
                    user: "Completed",
                    fromUser: "Final Approver"
                },
                {
                    action: "Reject",
                    user: "Initiator",
                    fromUser: "Final Approver"
                }
            ]
        }
    ];

    const workflowSteps2 = [
        {
            "currentUserOrState": [
                {
                    "action": null,
                    "user": "Initiator"
                }
            ],
            "nextState": [
                {
                    "action": "",
                    "user": "Initiator",
                    "fromUser": "Initiator"
                },
                {
                    "action": "Submit",
                    "user": "Senior Manager",
                    "fromUser": "Initiator"
                },
                {
                    "action": "Draft",
                    "user": "Quality Assurance Manager",
                    "fromUser": "Initiator"
                }
            ]
        },
        {
            "currentUserOrState": [
                {
                    "action": null,
                    "user": "Senior Manager"
                }
            ],
            "nextState": [
                {
                    "action": "",
                    "user": "Quality Assurance",
                    "fromUser": "Senior Manager"
                },
                {
                    "action": "",
                    "user": "Senior Manager",
                    "fromUser": "Senior Manager"
                },
                {
                    "action": "",
                    "user": "Initiator",
                    "fromUser": "Senior Manager"
                }
            ]
        },
        {
            "currentUserOrState": [
                {
                    "action": null,
                    "user": "Quality Assurance Manager"
                }
            ],
            "nextState": [
                {
                    "action": "Reject",
                    "user": "Initiator",
                    "fromUser": "Quality Assurance Manager"
                },
                {
                    "action": "Approve",
                    "user": "Department Manager",
                    "fromUser": "Quality Assurance Manager"
                },
                {
                    "action": "Approve",
                    "user": "Customer Support",
                    "fromUser": "Quality Assurance Manager"
                }
            ]
        },
        {
            "currentUserOrState": [
                {
                    "action": "Approve",
                    "user": "Department Manager"
                }
            ],
            "nextState": [
                {
                    "action": "Approve",
                    "user": "Technical Reviewer",
                    "fromUser": "Department Manager"
                }
            ]
        },
        {
            "currentUserOrState": [
                {
                    "action": "Approve",
                    "user": "Technical Reviewer"
                }
            ],
            "nextState": [
                {
                    "action": "Approve",
                    "user": "Final Approve",
                    "fromUser": "Technical Reviewer"
                },
                {
                    "action": "Reject",
                    "user": "Initiator",
                    "fromUser": "Technical Reviewer"
                }
            ]
        }
    ]

    const workflowSteps3 = [
        {
            "currentUserOrState": [
                {
                    "action": "Submit",
                    "user": "Department Manager"
                },
                {
                    "action": "Draft",
                    "user": "Department Manager"
                }
            ],
            "nextState": [
                {
                    "action": "Submit",
                    "user": "Technical Reviewer",
                    "fromUser": "Department Manager"
                },
                {
                    "action": "Draft",
                    "user": "Quality Assurance",
                    "fromUser": "Department Manager"
                }
            ]
        },
        {
            "currentUserOrState": [
                {
                    "action": "Approve",
                    "user": "Technical Reviewer"
                },
                {
                    "action": "Reject",
                    "user": "Technical Reviewer"
                }
            ],
            "nextState": [
                {
                    "action": "Approve",
                    "user": "Quality Assurance Manager",
                    "fromUser": "Technical Reviewer"
                },
                {
                    "action": "Reject",
                    "user": "Technical Reviewer",
                    "fromUser": "Technical Reviewer"
                },
                {
                    "action": "Reject",
                    "user": "Department Manager",
                    "fromUser": "Technical Reviewer"
                }
            ]
        },
        {
            "currentUserOrState": [
                {
                    "action": "Approve",
                    "user": "Quality Assurance"
                }
            ],
            "nextState": [
                {
                    "action": "Approve",
                    "user": "Technical Reviewer",
                    "fromUser": "Quality Assurance"
                }
            ]
        }
    ]

    const workflowSteps4 = {
        "workflowId": "approval_flow_v1",
        "transitions": [
            {
                "fromUserId": "start",
                "action": "Send for approval",
                "toUserId": "user1",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 8
                }
            },
            {
                "fromUserId": "user1",
                "action": "Reject",
                "toUserId": "user2",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "user2",
                "action": "Send for approval",
                "toUserId": "user3",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": true
                },
                "constraints": {
                    "dueInHours": 10
                }
            },
            {
                "fromUserId": "user2",
                "action": "Reject",
                "toUserId": "user1",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 6
                }
            },
            {
                "fromUserId": "user3",
                "action": "Approve",
                "toUserId": "user5",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": true
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "user3",
                "action": "Reject",
                "toUserId": "user4",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 8
                }
            },
            {
                "fromUserId": "user4",
                "action": "Approve",
                "toUserId": "user6",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 4
                }
            },
            {
                "fromUserId": "user5",
                "action": "Approve",
                "toUserId": "user6",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 4
                }
            }
        ]
    }

    const workflowSteps5 = {
        "workflowId": "approval_flow_v1",
        "transitions": [
            {
                "fromUserId": "initiator",
                "action": "Submit",
                "toUserId": "departmentManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 8
                }
            },
            {
                "fromUserId": "initiator",
                "action": "Draft",
                "toUserId": "seniorManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "seniorManager",
                "action": "Approve",
                "toUserId": "departmentManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "departmentManager",
                "action": "Reject",
                "toUserId": "initiator",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "departmentManager",
                "action": "Approve",
                "toUserId": "financeReviewer",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": true
                },
                "constraints": {
                    "dueInHours": 10
                }
            },
            {
                "fromUserId": "financeReviewer",
                "action": "Reject",
                "toUserId": "departmentManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 6
                }
            },
            {
                "fromUserId": "financeReviewer",
                "action": "Approve",
                "toUserId": "complianceOfficer",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": true
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "financeReviewer",
                "action": "Reject",
                "toUserId": "legalAdvisor",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 8
                }
            },
            {
                "fromUserId": "legalAdvisor",
                "action": "Approve",
                "toUserId": "finalApprover",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 4
                }
            },
            {
                "fromUserId": "complianceOfficer",
                "action": "Approve",
                "toUserId": "finalApprover",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 4
                }
            }
        ]
    };

    const workflowSteps = {
        "workflowId": "approval_flow_v1",
        "transitions": [
            {
                "fromUserId": "initiator",
                "action": "Submit",
                "toUserId": "departmentManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 8
                }
            },
            {
                "fromUserId": "initiator",
                "action": "Draft",
                "toUserId": "seniorManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "seniorManager",
                "action": "Approve",
                "toUserId": "departmentManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "departmentManager",
                "action": "Reject",
                "toUserId": "initiator",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "departmentManager",
                "action": "Approve",
                "toUserId": "financeReviewer",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": true
                },
                "constraints": {
                    "dueInHours": 10
                }
            },
            {
                "fromUserId": "financeReviewer",
                "action": "Reject",
                "toUserId": "departmentManager",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 6
                }
            },
            {
                "fromUserId": "financeReviewer",
                "action": "Approve",
                "toUserId": "complianceOfficer",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": true
                },
                "constraints": {
                    "dueInHours": 12
                }
            },
            {
                "fromUserId": "financeReviewer",
                "action": "Reject",
                "toUserId": "legalAdvisor",
                "uiConfig": {
                    "remarksRequired": true,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 8
                }
            },
            {
                "fromUserId": "legalAdvisor",
                "action": "Approve",
                "toUserId": "finalApprover",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 4
                }
            },
            {
                "fromUserId": "complianceOfficer",
                "action": "Approve",
                "toUserId": "finalApprover",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 4
                }
            },
            {
                "fromUserId": "complianceOfficer",
                "action": "Reject",
                "toUserId": "initiator",
                "uiConfig": {
                    "remarksRequired": false,
                    "attachmentRequired": false
                },
                "constraints": {
                    "dueInHours": 0
                }
            }
        ]
    };





    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', marginLeft: '0%' }}>
                        <WorkFlowForm />
                    </div>
                );

            case 1:
                return (
                    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)', marginLeft: '0%' }}>
                        <FlowChart workflowSteps={payloadData?.transitions} />
                    </div>
                );



            default:
                return null;
        }
    };



    const handleOnAdd = () => {
        setActiveTab(0);
        setPayloadData(defaultConfiguration);
        setSelectedRowData(null);
    }

    const handleSearch = async () => {

        const cookies = parseCookies();
        const site = cookies?.site;
        const request = {
            site: site,
            name: searchTerm
        }
        try {
            let response = await retrieveAllConfigurations(request);


            // Update the filtered data state
            setConfigurationList(response);

        }
        catch (e) {
            console.log("Error in retrieving all configuration", e);
        }
    }

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={styles.pageContainer}>

            <div >
                <div >
                    <div className={styles.split} >
                        <p className={styles.headingtext} style={{ marginLeft: '10px' }}>
                            {selectedRowData ? selectedRowData?.name : t('Create Configuration')}
                        </p>


                        <div className={styles.actionButtons}>
                            {activeTab === 1 && (
                                <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
                                    <Button
                                        onClick={toggleCollapse}
                                        className={styles.actionButton}
                                        icon={collapsed ? <OpenInFullIcon /> : <CloseFullscreenIcon />}

                                    />
                                </Tooltip>
                            )}

                            {selectedRowData && (
                                <>
                                    <Tooltip title="Copy">
                                        <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                            <CopyIcon sx={{ color: '#1874CE', fontSize: '22px' }} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <Button onClick={handleOpenModal} className={styles.actionButton}>
                                            <DeleteIcon sx={{ color: '#1874CE', fontSize: '22px' }} />
                                        </Button>
                                    </Tooltip>
                                </>
                            )}


                        </div>


                    </div>
                </div>

                <div style={{ borderTop: '1px solid #e0e0e0', marginTop: '0%' }}></div>

                <Row className={styles["section-builder-container"]}>
                    {/* Left side: List of dummy components */}
                    <Col span={
                        activeTab === 0
                            ? (4)  // When tab 0, collapsed hides left column
                            : (activeTab === 1
                                ? (collapsed ? 4 : 0)  // When tab 1, collapsed shows left column
                                : 4)  // Default fallback
                    } className={styles["left-section"]}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                                paddingBottom: "10px",
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontWeight: 500,
                                marginBottom: "16px"
                            }}>
                                <span>Configurations ({configurationList?.length || 0})</span>
                                <Tooltip title="Add">
                                    <Button onClick={handleOnAdd} className={styles.addButton}>
                                        <AddIcon style={{ cursor: 'pointer' }} />
                                    </Button>
                                </Tooltip>
                            </div>
                            <Input.Search
                                placeholder="Search configurations..."
                                style={{ marginBottom: "16px" }}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                value={searchTerm}
                                onSearch={handleSearch}
                            />
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                {isLoading ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "100%",
                                        }}
                                    >
                                        Loading configurations...
                                    </div>
                                ) : (
                                    <List
                                        dataSource={configurationList}
                                        renderItem={(configuration: any, index) => (
                                            <List.Item
                                                key={index}
                                                style={{
                                                    padding: "8px 12px",
                                                    backgroundColor: "#fff",
                                                    border: "1px solid rgba(0, 0, 0, 0.16)",
                                                    marginBottom: "8px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    transition: "all 0.3s ease",
                                                    // border: "1px solid transparent",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#f0f7ff";
                                                    e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
                                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(24,144,255,0.15)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#fff";
                                                    e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
                                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                                }}
                                                onClick={() => handleRowSelect(configuration)}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        width: "100%",
                                                    }}
                                                >

                                                    <span style={{
                                                        fontWeight: "400",
                                                        fontSize: configuration?.name.length > 30 ? "12px" : "12px",
                                                        display: 'flex', alignItems: 'center', gap: '3px'
                                                    }}>
                                                        <LuComponent /> {configuration.name}
                                                    </span>

                                                    <Typography style={{
                                                        fontSize: "0.8em",
                                                        color: "#666",
                                                        margin: "0",
                                                        fontWeight: "bold",
                                                    }}> {configuration.version} </Typography>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    </Col>

                    {/* Right side: Existing content */}
                    <Col span={
                        activeTab === 0
                            ? (20)  // When tab 0, collapsed expands right column
                            : (activeTab === 1
                                ? (collapsed ? 20 : 24)  // When tab 1, collapsed reduces right column
                                : 24)  // Default fallback
                    } style={{ paddingLeft: '10px' }}>
                        {/* Replace the existing content with Tabs */}
                        <Tabs
                            activeKey={activeTab.toString()}
                            onChange={(key) => handleTabChange(null, parseInt(key))}
                        >
                            <Tabs.TabPane key="0" tab="Main">
                                {renderTabContent()}
                            </Tabs.TabPane>
                            <Tabs.TabPane key="1" tab="User Role Configuration">
                                {renderTabContent()}
                            </Tabs.TabPane>

                        </Tabs>
                    </Col>
                </Row>

            </div>

            <footer className={styles.footer} style={{ marginTop: '-10%' }}>
                <div className={styles.floatingButtonContainer}
                    style={{ position: 'fixed', bottom: '10px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
                >
                    <Button type='primary'
                        onClick={handleSave}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {selectedRowData ? t("save") : t("create")}
                    </Button>
                    <Button
                        className={` ${styles.cancelButton}`}
                        onClick={handleCancel}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {t("cancel")}
                    </Button>
                </div>
            </footer>
            <Modal
                title={t("confirmDelete")}
                open={isModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("deleteApiConfigMessage")}: <strong>{selectedRowData?.name}</strong>?</p>
            </Modal>
            <Modal
                title={t("confirmCopy")}
                open={isCopyModalVisible}
                onOk={handleConfirmCopy}
                onCancel={handleCloseCopyModal}
                okText={t("copy")}
                cancelText={t("cancel")}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        name: selectedRowData?.name || '',
                        version: ''
                    }}
                >
                    <Form.Item
                        label={t("name")}
                        name="name"
                        required
                    >
                        <Input placeholder="" value={payloadData?.name + "_COPY"} onChange={(e) => handleFieldChange(e, 'name')} />
                    </Form.Item>

                    <Form.Item
                        name="version"
                        label={t("version")}
                        required
                    >
                        <Input placeholder="" value={payloadData?.version} onChange={(e) => handleFieldChange(e, 'version')} />
                    </Form.Item>

                    {/* <Form.Item
                        label={t('type')}
                        
                    >
                        <Select
                            value={payloadData?.type}
                            onChange={(value) => handleSelectChange("type", value)}
                        >
                            <Option value="MFR">MFR</Option>
                            <Option value="BMR">BMR</Option>
                            <Option value="BPR">BPR</Option>
                            <Option value="eBMR">eBMR</Option>
                        </Select>
                    </Form.Item> */}

                </Form>
            </Modal>



        </div>



    );
};

export default WorkFlowMaintenanceBody;