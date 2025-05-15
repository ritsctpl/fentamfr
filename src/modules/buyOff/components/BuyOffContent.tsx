"use client"
import React, { useEffect, useState } from "react";
import styles from "../styles/DataCollectionMaintenance.module.css";
import { IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommonTable from "./CommonTable";
import { parseCookies } from "nookies";
import DataCollectionCommonBar from "./DataCollectionCommonBar";
import BuyOffBodyContent from "./BuyOffBodyContent";
import { useBuyOff } from '../hooks/BuyOffContext';
import { useTranslation } from "react-i18next";
import AttachmentForm from "./AttachmentForm";
import { fetchBuyOffAll, fetchBuyOffById, fetchBuyOffTop50 } from "@services/buyOffService";
import { Button, message, Modal } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons'
import InstructionModal from "@components/InstructionModal";
import UserInstructions from "./userInstructions";

export default function BuyOffContent() {
    const { t } = useTranslation();
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [rowSelectedData, setRowSelectedData] = useState<any>(null);
    const [schema, setSchema] = useState<any>(null);
    const { site } = parseCookies();
    const {
        selectedRowData,
        setSelectedRowData,
        isAdding,
        setIsAdding,
        fullScreen,
        setFullScreen,
        resetForm,
        attachment,
        setAttachment,
        hasChanges,
        setHasChanges
    } = useBuyOff();

    const manualContent = [
        {
            title: 'BuyOff Screen User Manual',
            sections: [
                {
                    title: '1. Introduction',
                    content: {
                        type: 'table',
                        data: {
                            rows: [
                                { label: 'Purpose', value: 'To guide users on how to use the BuyOff Screen for logging, updating, and tracking maintenance activities.' },
                                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                                { label: 'Module Name', value: 'BuyOff Management' }
                            ]
                        }
                    }
                },
                {
                    title: '2. System Access',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Item', 'Description'],
                            rows: [
                                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/buyOff_app' },
                                { Item: 'Login Requirement', Description: 'Username & Password' },
                                { Item: 'Access Roles', Description: 'Technician, Supervisor, Admin' }
                            ]
                        }
                    }
                },
                {
                    title: '3. Navigation Path',
                    content: {
                        type: 'text',
                        data: 'Main Menu → BuyOff Maintenance Application → BuyOff Entry/Tracking'
                    }
                },
                {
                    title: '4. Screen Overview',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Section', 'Description'],
                            rows: [
                                { Section: 'Header', Description: 'Filters by BuyOff Id' },
                                { Section: 'BuyOff Table', Description: 'Lists past buyoff records (columns like BuyOff Id, Version, Description)' },
                                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                                { Section: 'Form Panel', Description: 'Form fields to log or update buyoff' }
                            ]
                        }
                    }
                },
                {
                    title: '5. Step-by-Step Instructions',
                    subsections: [
                        {
                            title: '5.1. Add New BuyOff Record',
                            content: {
                                type: 'steps',
                                data: [
                                    'Click "(+) Add New"',
                                    'Main Tab',
                                    {
                                        text: 'Fill in the required fields:',
                                        subSteps: [
                                            'BuyOff Id (Text)',
                                            'Version (Text)',
                                            'Description (Text)',
                                            'Status (Dropdown)',
                                            'Message Type (Text)',
                                            'Partial Allowed (Switch)',
                                            'Rejected Allowed (Switch)',
                                            'Skip Allowed (Switch)',
                                            'Current Version (Switch)',
                                        ]
                                    },
                                    'Navigate Main Tab → User Group',
                                    {
                                        text: 'Select the user groups for the buyoff',
                                        subSteps: [
                                            'Click "Insert New"',
                                            'One by one select the user groups for the buyoff',
                                            'User can delete the user group by clicking the Remove button',
                                        ]
                                    },
                                    'Navigate User Group Tab → Attachment List',
                                    'Click "Insert New"',
                                    {
                                        text: 'One by one select the attachment list for the buyoff',
                                        subSteps: [
                                            'Quantity Required',
                                            'Step ID',
                                            'Item',
                                            'Recipe',
                                            'Operation',
                                            'Work Center',
                                            'Resource'
                                        ]
                                    },
                                    'User can delete the user group by clicking the Remove button',
                                    'Click "Details" to view the attachment list',
                                    'Click "Save"'
                                ]
                            }
                        },
                        {
                            title: '5.2. Edit Existing Record',
                            content: {
                                type: 'steps',
                                data: [
                                    'Select a record from the table',
                                    'Click "Edit"',
                                    'Modify the necessary fields',
                                    'Click "Update"'
                                ]
                            }
                        },
                        {
                            title: '5.3. Clone BuyOff Record',
                            content: {
                                type: 'steps',
                                data: [
                                    'Select a record from the table',
                                    'Click "Copy Button"',
                                    'Change the BuyOff Id',
                                    'Change the Version',
                                    'Change the Description',
                                    'Click "Copy"'
                                ]
                            }
                        },
                        {
                            title: '5.4. Delete a Record',
                            content: {
                                type: 'steps',
                                data: [
                                    'Select a record from the table',
                                    'Click "Delete Button"',
                                    'Confirm the prompt'
                                ]
                            }
                        },
                    ]
                },
                {
                    title: '6. Field Definitions',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Field Name', 'Description', 'Required'],
                            rows: [
                                { 'Field Name': 'BuyOff Id', Description: 'Unique identifier for the buyoff', Required: 'Yes' },
                                { 'Field Name': 'Version', Description: 'Version of the buyoff', Required: 'Yes' },
                                { 'Field Name': 'Description', Description: 'Description of the buyoff', Required: 'NO' },
                                { 'Field Name': 'Status', Description: 'Status of the buyoff', Required: 'Yes' },
                                { 'Field Name': 'Message Type', Description: 'Message Type of the buyoff', Required: 'NO' },
                                { 'Field Name': 'Partial Allowed', Description: 'This BuyOff can be partially accepted', Required: 'NO' },
                                { 'Field Name': 'Rejected Allowed', Description: 'This BuyOff can be rejected', Required: 'NO' },
                                { 'Field Name': 'Skip Allowed', Description: 'This BuyOff can be skipped', Required: 'NO' },
                                { 'Field Name': 'Current Version', Description: 'This is the current version of the buyoff', Required: 'NO' },
                            ]
                        }
                    }
                },
                {
                    title: '7. Attachment Field Definitions',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Field Name', 'Description', 'Required'],
                            rows: [
                                { 'Field Name': 'Quantity Required', Description: 'Quantity Required', Required: 'NO' },
                                { 'Field Name': 'Step ID', Description: 'Step ID', Required: 'NO' },
                                { 'Field Name': 'Item', Description: 'Item', Required: 'NO' },
                                { 'Field Name': 'Recipe', Description: 'Recipe', Required: 'NO' },
                                { 'Field Name': 'Operation', Description: 'Operation', Required: 'NO' },
                                { 'Field Name': 'Work Center', Description: 'Work Center', Required: 'NO' },
                                { 'Field Name': 'Resource', Description: 'Resource', Required: 'NO' }
                            ]
                        }
                    }
                },
                {
                    title: '8. FAQs / Troubleshooting',
                    content: {
                        type: 'table',
                        data: {
                            headers: ['Issue', 'Solution'],
                            rows: [
                                { Issue: 'Cannot save record', Solution: 'Check mandatory fields and at least one attachment should be selected' },
                                { Issue: 'Cannot edit closed record', Solution: 'Only Admin role can edit closed entries' },
                                { Issue: 'Cannot select attachment', Solution: 'Check the represented maintenance screens' }
                            ]
                        }
                    }
                }
            ]
        }
    ];
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { site } = parseCookies();
                const data = await fetchBuyOffTop50(site);
                setFilteredData(data);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();
    }, []);

    const handleSearch = async (searchTerm: string) => {
        try {
            const { site } = parseCookies();
            const allItems = await fetchBuyOffAll(site, searchTerm);

            if (!searchTerm.trim()) {
                const top50 = await fetchBuyOffTop50(site);
                setFilteredData(top50);
                return;
            }

            const lowercasedTerm = searchTerm.toLowerCase();
            const filtered = allItems.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(lowercasedTerm)
                )
            );

            setFilteredData(filtered);
        } catch (error) {
            console.error('Error during search:', error);
        }
    };

    const handleAddClick = () => {
        resetForm();
        setIsAdding(true);
    };

    const refreshData = async () => {
        try {
            const { site } = parseCookies();
            const data = await fetchBuyOffTop50(site);
            setFilteredData(data);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    return (
        <div>
            <div className={styles.dataFieldBopayloadDatady}>
                {attachment ? <AttachmentForm />
                    :
                    <div className={styles.dataFieldBodyContentsBottom}>
                        <div className={`${styles.commonTableContainer} ${isAdding ? styles.shrink : ""}`}>
                            <DataCollectionCommonBar
                                onSearch={handleSearch}
                                setFilteredData={setFilteredData}
                                button={
                                    <InstructionModal title="BuyOffMaintenance">
                                        <UserInstructions manualContent={manualContent} />
                                    </InstructionModal>
                                }
                            />
                            <div className={styles.dataFieldBodyContentsTop}>
                                <Typography className={styles.dataLength}>
                                    BuyOff ({filteredData?.length})
                                </Typography>

                                <IconButton
                                    onClick={handleAddClick}
                                    className={styles.circlepayloadDataButton}
                                >
                                    <AddIcon sx={{ fontSize: 30 }} />
                                </IconButton>
                            </div>
                            <CommonTable
                                data={filteredData}
                                onRowSelect={async (selectedRow) => {
                                    if (hasChanges) {
                                        Modal.confirm({
                                            title: 'Confirm',
                                            content: 'You have unsaved changes. Are you sure you want to Change?',
                                            onOk: async () => {
                                                try {
                                                    const res = await fetchBuyOffById(site, selectedRow);
                                                    if (res?.errorCode) {
                                                        message.error(res?.message);
                                                        return;
                                                    }
                                                    setSelectedRowData(res);
                                                    setIsAdding(true);
                                                    setHasChanges(false);
                                                } catch (error) {
                                                    message.error(error);
                                                }
                                            }
                                        });
                                    } else {
                                        try {
                                            const res = await fetchBuyOffById(site, selectedRow);
                                            if (res?.errorCode) {
                                                message.error(res?.message);
                                                return;
                                            }
                                            setSelectedRowData(res);
                                            setIsAdding(true);
                                            setHasChanges(false);
                                        } catch (error) {
                                            message.error(error);
                                        }
                                    }

                                }}
                            />
                        </div>
                        {isAdding && (
                            <div className={`${styles.formContainer} ${isAdding ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}` : ""}`}>
                                <BuyOffBodyContent
                                    schema={schema}
                                    onSuccess={refreshData}
                                />
                            </div>
                        )}
                    </div>}
            </div>
        </div>
    );
} 