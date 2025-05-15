"use client"
import React, { useEffect, useState } from 'react'
import { Button, Layout, Tabs, Tooltip, message, Modal } from 'antd'
import { Content, Header } from 'antd/es/layout/layout'
import { DynamicBrowse } from '@components/BrowseComponent';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Typography } from "@mui/material";
import CommonTable from "./CommonTable";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from '@mui/icons-material/Close';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import RouteScreen from './RouteScreen';
import './styles/Styles.css';
import { RouteProvider } from './hooks/routeContext';
import { useRoute } from './hooks/routeContext';
import { deleteRouting, fetchTop50Routing, retrieveRouting, updateRouting } from '@services/routingServices';
import Dynamicform from './Dynamicform';
import CommonAppBar from '@components/CommonAppBar';
import RoutingCommonBar from './RoutingCommonBar';
import styles from "./styles/RoutingMaintenance.module.css";
import { parseCookies } from 'nookies';
import dayjs from 'dayjs';
import CustomData from './components/CustomData';
function RouteContent() {
    const { t } = useTranslation();
    const { formData, setFormData } = useRoute();
    const [createNew, setCreateNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [initialFormData, setInitialFormData] = useState<any>(null);
    const [done, setDone] = useState(false);
    useEffect(() => {
        const fetchItemData = async () => {
            const cookies = parseCookies();
            const site = cookies.site;
            try {
                const item = await fetchTop50Routing(site);
                setFilteredData(item);
            } catch (error) {
                console.error("Error fetching top 50 routing:", error);
            }
        };
        fetchItemData();
    }, [done]);
    const handleSearch = (value: any) => {
        setFilteredData(value);
    };
    const handleAddClick = () => {
        setFormData(null);
        setInitialFormData(null);
        setIsAdding(true);
        setCreateNew(true);
        setHasUnsavedChanges(false);
    };
    const handleRowSelect = (row: any) => {
        if (hasUnsavedChanges) {
            Modal.confirm({
                title: 'Confirm',
                content: 'You have unsaved changes. Are you sure you want to close?',
                onOk: () => {
                    setCreateNew(false);
                    handleBrowseSelection(row);
                    setIsAdding(true);
                    // setFullScreen(true);
                },
                onCancel: () => { }
            })
        } else {
            setCreateNew(false);
            handleBrowseSelection(row);
            setIsAdding(true);
        }
    };

    const items = [
        { label: 'Main', key: '1', children: <Dynamicform /> },
        { label: 'Routing', key: '2', children: <RouteScreen /> },
        { label: 'Custom Data', key: '3', children: <CustomData /> },
    ]

    const handleOpenCopyModal = () => {
        console.log("Open Copy Modal");
    }

    const handleOpenChange = () => {
        setFullScreen(!fullScreen);
    }

    const handleClose = () => {
        if (hasUnsavedChanges) {
            Modal.confirm({
                title: 'Confirm',
                content: 'You have unsaved changes. Are you sure you want to close?',
                onOk: () => {
                    setIsAdding(false);
                    setFullScreen(false);
                    setFormData(null);
                    setHasUnsavedChanges(false);
                },
                onCancel: () => {

                }
            });
        } else {
            setIsAdding(false);
            setFullScreen(false);
            setFormData(null);
        }
    };

    const handleSave = async () => {
        if (!formData?.routing) {
            message.error('No routing data to save');
            return;
        }
        if(formData.createdDateTime && formData.routingStepList == null){
            console.log(formData)
            message.error('Routing Step List Should be Not be Empty Before Update');
            return;
        }
        try {
            setLoading(true);
            const updatedData = {
                ...formData,
                userId: "senthil",
                modifiedBy: "senthil",
                site: "RITS"
            };

            const response = await updateRouting(updatedData);

            if (!response.errorCode) {
                message.success(`Routing "${formData.routing}" ${response.message_details.msg}`);
                setInitialFormData(JSON.stringify(updatedData));
                setFormData(null);
                setIsAdding(false);
                setFullScreen(false);
                setHasUnsavedChanges(false);
                setDone(!done);
            } else {
                message.error(`${response.message_details.msg || response.message}`);
            }
        } catch (error: any) {
            message.error(error.message || 'Error saving routing');
            console.error('Save error:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!formData?.routing) {
            message.error('No routing selected to delete');
            return;
        }

        try {
            setLoading(true);

            const response = await deleteRouting(
                formData.site,
                formData.routing,
                formData.version,
                "senthil"
            );

            if (!response.errorCode) {
                message.success(`Routing "${formData.routing}" ${response.message_details.msg} `);
                setFormData(null);
                setHasUnsavedChanges(false);
                setIsAdding(false);
                setFullScreen(false);
                setDone(!done);
            } else {
                message.error(`${response.message}`);
            }
        } catch (error: any) {
            message.error(error.message || 'Error deleting routing');
            console.error('Delete error:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleBrowseSelection = async (value: any) => {
        if (!value?.routing) {
            setFormData([]);
            setInitialFormData([]);
            return;
        }

        try {
            setLoading(true);
            const data = await retrieveRouting(
                "RITS",
                value.routing,
                value.version
            );
            setFormData(data);
            setInitialFormData(JSON.stringify(data));
            setHasUnsavedChanges(false);
            message.success(`Routing "${value.routing}" loaded successfully`);
        } catch (error: any) {
            setFormData(null);
            setInitialFormData(null);
            message.error(error.message || 'Error loading routing');
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formData && initialFormData) {
            const currentDataString = JSON.stringify(formData);
            setHasUnsavedChanges(currentDataString !== initialFormData);
        }
    }, [formData, initialFormData]);

    return (
        <div style={{ height: '100%', display: 'flex', backgroundColor: 'white' }}>
            <div style={{ height: '100%', width: `${fullScreen && isAdding ? '0%' : isAdding && !fullScreen ? '50%' : '100%'}`, transition: 'width 0.3s ease' }}>
                <RoutingCommonBar
                    onSearch={handleSearch}
                    setFilteredData={setFilteredData}
                />
                <div style={{ overflow: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>
                        {"Routing"} ({filteredData ? filteredData.length : 0})
                    </Typography>
                    <IconButton
                        onClick={handleAddClick}
                        className={styles.circlepayloadDataButton}
                    >
                        <AddIcon sx={{ fontSize: 30 }} />
                    </IconButton>
                </div>
                <CommonTable data={filteredData} onRowSelect={handleRowSelect} />
            </div>
            <div style={{ height: '100%', padding: '10px', width: `${fullScreen && isAdding ? '100%' : isAdding && !fullScreen ? '50%' : '0%'}`, transition: 'width 0.3s ease', backgroundColor: 'white' }}>
                {isAdding &&
                    <div style={{ width: '100%', height: '13%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p className={styles.headingtext}>
                                {formData && !createNew ? formData.routing : "Create Routing"}
                            </p>
                            {formData && !createNew && (
                                <>
                                    <p className={styles.dateText}>
                                        {t('versions')}
                                        <span className={styles.fadedText}>
                                            {formData.version
                                                ? (formData.version)
                                                : ''}
                                        </span>
                                    </p>
                                    <p className={styles.dateText}>
                                        {t('createdDate')}
                                        <span className={styles.fadedText}>
                                            {formData.createdDateTime
                                                ? dayjs(formData.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                : 'N/A'}
                                        </span>
                                    </p>
                                    <p className={styles.dateText}>
                                        {t('modifiedTime')}
                                        <span className={styles.fadedText}>
                                            {formData.updatedDateTime
                                                ? dayjs(formData.updatedDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                : 'N/A'}
                                        </span>
                                    </p>

                                </>
                            )}
                        </div>

                        <div className={styles.actionButtons}>
                            <Tooltip title={fullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                                <Button
                                    onClick={handleOpenChange}
                                    className={styles.actionButton}
                                >
                                    {fullScreen ? <CloseFullscreenIcon sx={{ color: '#1874CE' }} /> : <OpenInFullIcon sx={{ color: '#1874CE' }} />}
                                </Button>
                            </Tooltip>


                            {formData && !createNew && (
                                <>
                                    <Tooltip title="Copy">
                                        <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                            <CopyIcon sx={{ color: '#1874CE' }} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <Button onClick={handleDelete} className={styles.actionButton}>
                                            <DeleteIcon sx={{ color: '#1874CE' }} />
                                        </Button>
                                    </Tooltip>
                                </>
                            )}

                            <Tooltip title="Close">
                                <Button onClick={handleClose} className={styles.actionButton}>
                                    <CloseIcon sx={{ color: '#1874CE' }} />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                }
                {isAdding &&
                    <div style={{ height: '500px', overflow: 'auto' }}>
                        <Tabs
                            defaultActiveKey="1"
                            items={items}
                            className="full-height-tabs"
                        />
                    </div>
                }
                {isAdding &&
                    <div style={{ height: '2%', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                        <Button onClick={handleSave} type='primary'>Save</Button>
                        <Button onClick={handleClose}>Cancel</Button>
                    </div>
                }
            </div>
        </div>
    )
}

function RouteMain() {
    const [formData, setFormData] = useState<any>(null);
    const [call, setCall] = React.useState(0)
    return (
        <RouteProvider>
            <Layout style={{ height: '100vh' }}>
                <CommonAppBar
                    onSearchChange={() => { }}
                    allActivities={null}
                    username={''}
                    site={''}
                    appTitle={'Routing Maintenance'}
                    onSiteChange={function (): void { setCall(call + 1) }}
                />
                <RouteContent />
            </Layout>
        </RouteProvider >
    )
}

export default RouteMain