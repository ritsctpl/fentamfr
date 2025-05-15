/* eslint-disable @next/next/no-img-element */
import { Button, Table, Upload, Tooltip, message, Modal, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useState, useMemo, useEffect } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import start from '../../../images/pod_image/start.png';
import complete from '../../../images/pod_image/complete.png';
import { useTranslation } from 'react-i18next';
import { retrieveAllReasonCodeBySite, storeFile } from '@services/lineClearanceService';
import { parseCookies } from 'nookies';
import LinePluginManual from './LinePluginManual';
import InstructionModal from '@components/InstructionModal';

interface TableItem {
    key: number;
    templeteName: string;
    description: string;
    taskName: string;
    evidenceRequired: boolean;
    evidence?: string;
    status: 'new' | 'started' | 'completed';
    fileList?: UploadFile[];
    action?: boolean;
    reasonCode?: any;
    reason?: any;
}

interface CommonTableProps {
    TableData: Omit<TableItem, 'key'>[];
    setData: (data: any) => void;
    onStatusChange?: (keys: number[], newStatus: string, evidence?: string, record?: any) => void;
    loading?: boolean;
    selectedRowData?: any;
    filterFormData?: any;
    phaseByDefault?: string;
    filePathRef?: any;
    callBack1?: any;
    setCallBack1: (number: number) => void;
    call2: any;
    selectedReasons: any;
    setSelectedReasons: (selectedReasons: any) => void;
    call1: any;
    base64RawData: any;
    setBase64rawData: (base64RawData: any) => void;
}

const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};



const CommonTable: React.FC<CommonTableProps> = ({
    TableData,
    onStatusChange,
    loading = false,
    selectedRowData,
    filterFormData,
    phaseByDefault,
    filePathRef,
    callBack1,
    setCallBack1,
    setData,
    call2,
    selectedReasons,
    setSelectedReasons,
    call1,
    base64RawData,
    setBase64rawData
}) => {
    const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
    const [fileList, setFileList] = useState<{ [key: number]: UploadFile[] }>({});
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewFile, setPreviewFile] = useState<string | undefined>(undefined);
    const [reasonOptions, setReasonOptions] = useState<any>();
    

    // const [batchNodata, setBatchNodata] = useState<string[]>([]);
    const { t } = useTranslation();

    // useEffect(() => {
    //     const batchNumbers = selectedRowData.map((item: any) => item.batchNo);
    //     if (batchNumbers.length > 0) {
    //       setBatchNodata(batchNumbers);
    //     }
    // }, [selectedRowData]);
    // const dataSource = useMemo(() => 
    //   TableData?.map((data, index) => ({
    //     key: index,
    //     ...data,
    //     fileList: fileList[index] || []
    //   })),
    // [TableData, fileList]);


    useEffect(() => {
        // debugger
        const getReasonCodelist = async () => {
            const cookies = parseCookies();
            const site = cookies?.site;
            try {
                let response = await retrieveAllReasonCodeBySite(site);
                response = response.map((item, index) => ({
                    // key: index,
                    label: item?.reasonCode,
                    value: item?.reasonCode
                }));
                setReasonOptions(response);
                console.log("reasonOptions: ", reasonOptions)
            }
            catch (e) {
                console.error("Error in retrieveing the list of reasoncodes: ", e);
            }
        }
        getReasonCodelist();
    }, []);
    
    useEffect(() => {
        setSelectedReasons({});
        setFileList([]);
    }, [selectedRowData, filterFormData, call2])




    

    const dataSource = useMemo(() =>
        TableData && TableData.length > 0
            ? TableData.map((data, index) => ({
                key: index,
                ...data,
                fileList: fileList[index] || []
            }))
            : [],
        [TableData, fileList]);
     
        const updatedDataSource = useMemo(() => {
            return TableData && TableData.length > 0
                ? TableData.map((data, index) => ({
                    key: index,
                    ...data,
                    reason: selectedReasons[index] || data.reason, // Preserve selected reasons
                    fileList: fileList[index] || []
                }))
                : [];
        }, [TableData, fileList, selectedReasons]);
        
        useEffect(() => {
            // Only update if the new data is different from the current data
            setData((prevData: any) => {
                const isDifferent = JSON.stringify(prevData) !== JSON.stringify(updatedDataSource);
                return isDifferent ? updatedDataSource : prevData;
            });
        }, [updatedDataSource, setData]);

    const handleStatusChange = async (newStatus: string, key?: number, record?: TableItem) => {
        message.destroy();
        const keysToUpdate = key !== undefined ? [key] : selectedKeys;
        debugger
        let alert = false;
        // if (keysToUpdate.length === 0) {
        //     message.warning('Please select at least one row');
        //     return;
        // }

        // Check if evidence is required but not uploaded
        // const hasRequiredEvidence = keysToUpdate.every(k => {
        //     const record = dataSource.find(item => item.key === k);
        //     return record?.evidenceRequired || (record?.fileList && record?.fileList.length > 0);
        // });

        // if (!hasRequiredEvidence) {
        //     message.error('Please upload required evidence before changing status');
        //     return;
        // }

        if (record?.status?.toLowerCase() == "start") {
            // const hasRequiredEvidence = keysToUpdate.every(k => {
            //     const record = dataSource.find(item => item.key === k);
            //     // Check if evidence is required but not uploaded
            //     if (record?.evidenceRequired) {
            //         if (!record?.evidence) {
            //             // Create a field to indicate evidence is missing
            //             alert = true;
            //         }
            //         else
            //             alert = false;
            //     }
            //     // return record?.evidenceRequired ? !!record?.evidence : true; // Return true if evidence is not required
            // });

            if (alert) {
                message.error('Please upload required evidence before changing status');
                return;
            }
        }

        try {
            // Get the evidence file if it exists
            const file = key !== undefined ? fileList[key]?.[0]?.originFileObj : undefined;

            // Convert file to base64 if it exists
            let base64File: string | undefined;
            if (file instanceof File) {
                base64File = await convertFileToBase64(file);
                setBase64rawData(base64File);
            }

            if (onStatusChange) {
                onStatusChange(keysToUpdate, newStatus, base64File, record);
            }
        } catch (error) {
            message.error('Error processing file');
            console.error('Error processing file:', error);
        }
    };

   

    const GroupAction = ({ record }: { record: TableItem }) => {
        
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Tooltip title="Start">
                    <Button
                        shape='circle'
                        style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleStatusChange('started', record?.key, record)}
                        disabled={record?.status === 'started' || record?.status === 'completed'}
                    >
                        <img src={start.src} alt="start" style={{ width: '25px', height: '25px', }} />
                    </Button>
                </Tooltip>
                <Tooltip title="Complete">
                    <Button
                        shape='circle'
                        style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleStatusChange('completed', record?.key, record)}
                        disabled={record?.status === 'new' || record?.status === 'completed'}
                    >
                        <img src={complete.src} alt="complete" style={{ width: '25px', height: '25px' }} />
                    </Button>
                </Tooltip>
            </div>
        );
    };

    const handleFileChange = async (key: number, info: any, record: any) => {
        // debugger
        const cookies = parseCookies();
        const site = cookies?.site;
        const taskName = record?.taskName;
        const taskDescription = record?.taskDescription;
        const templeteName = record?.templeteName;
        const description = record?.description;
        // const batchNo = batchNodata ? batchNodata : selectedRowData?.[0]?.pcu;
        // const batchNo = selectedRowData?.batchNo;
        const isMandatory = record?.isMandatory;
        const evidenceRequired = record?.evidenceRequired;
        const rawBase64Evidence = info?.fileList?.slice(-1)?.[0]?.originFileObj;
        const reasonCode = record?.reasonCode;
        let base64File: string | undefined;
        try {
            // Get the evidence file if it exists
            const file = rawBase64Evidence
            // Convert file to base64 if it exists

            if (file instanceof File) {
                base64File = await convertFileToBase64(file);
            }


        } catch (error) {
            message.error('Error processing file');
        }

        const request = selectedRowData?.map((item: any) => {
            console.log(item, 'itemss');
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
              evidence: base64File || "",
              status: "Start",
              createdDateTime: new Date().toISOString(),
              reasonCode: reasonCode,
              reason: reasonCode
            };
          });

          console.log(request, 'request');


        // const request = {
        //     "site": site,
        //     "templeteName": templeteName,
        //     "description": description,
        //     "batchNo": batchNo,
        //     "phase": filterFormData?.defaultPhaseId || phaseByDefault,
        //     "operation": filterFormData?.defaultOperation,
        //     "workCenterId": filterFormData?.defaultWorkCenter,
        //     "resourceId": filterFormData?.defaultResource,
        //     "userId": cookies.rl_user_id,
        //     "taskName": taskName,
        //     "taskDescription": taskDescription,
        //     "isMandatory": isMandatory,
        //     "evidenceRequired": evidenceRequired,
        //     "evidence": base64File || undefined,
        //     "status": "Start"
        // }
        try {
            filePathRef.current = base64File;
            const response = await storeFile({lineClearanceLogRequestList:request});
            if(response?.errorCode){
                message.error(response?.message);
                return;
            } else {
                message.success(response?.message);
                setFileList(prev => ({
                    ...prev,
                    [key]: info.fileList.slice(-1)
                }));
                setCallBack1(callBack1 + 1);
            }
        } catch (error) {
            console.error("Error storing file: ", error);
            // Clear the file list when error occurs
            setFileList(prev => ({
                ...prev,
                [key]: []
            }));
        }
        
    };

    const renderEvidence = (evidence: string | undefined, record: TableItem) => {
        // const hasEvidence = record?.evidence || fileList[record?.key]?.length > 0;
        const hasEvidence = record?.evidence;
        
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                {/* Show only preview button if evidence exists, to let the user to see the attachemnt as preview */}
                {hasEvidence && (
                    <Button
                        type="link"
                        onClick={() => handlePreview(record?.evidence)}
                    >
                        {t('preview')}
                    </Button>
                )}
                
                {/* Show upload button with file list only if evidence exists and status is not complete, to let the user to change the the attachment */}
                {hasEvidence && record?.status?.toLowerCase() !== "complete" && (
                    <Upload
                        fileList={[]} 
                        onChange={(info) => handleFileChange(record?.key, info, record)}
                        maxCount={1}
                        beforeUpload={() => false}
                        showUploadList={false} 
                    >
                        <Button
                            size='small'
                            icon={<UploadOutlined />}
                        >
                            {t('change')}
                        </Button>
                    </Upload>
                )}
                
                 {/* Show upload button with file list only if no evidence exists and status is not complete, to attach the attachment */}
                {!hasEvidence && record?.status?.toLowerCase() !== "complete" && (
                    <Upload
                        fileList={[]} 
                        onChange={(info) => handleFileChange(record?.key, info, record)}
                        maxCount={1}
                        beforeUpload={() => false}
                        showUploadList={false} 
                    >
                        <Button
                            size='small'
                            icon={<UploadOutlined />}
                        >
                            {t('attach')}
                        </Button>
                    </Upload>
                )}
            </div>
        );
    };

    const handlePreview = (fileUrl: string) => {

        setPreviewFile( fileUrl || filePathRef.current);
        setPreviewVisible(true);
    };

    // const Status = (status: TableItem['status']) => {
    //     const statusConfig = {
    //         complete: { icon: CheckCircleOutlined, color: 'green' },
    //         start: { icon: PlayCircleOutlined, color: 'blue' },
    //         inprogress: { icon: LoadingOutlined, color: 'orange' },
    //         pending: { icon: ExclamationCircleOutlined, color: 'red' },
    //         new: { icon: ExclamationCircleOutlined, color: 'red' }
    //     };

    //     const StatusIcon = statusConfig[status?.toLowerCase()?.replaceAll(' ', '')]?.icon || ExclamationCircleOutlined;
    //     const color = statusConfig[status?.toLowerCase()?.replaceAll(' ', '')]?.color || 'gray';

    //     return <StatusIcon style={{ color, fontSize: '18px' }} />;
    // };


    const handleCancel = () => setPreviewVisible(false);

    

    const handleReasonChange = (key: number, value: string[]) => {

        setSelectedReasons(prev => ({
            ...prev,
            [key]: value
        }));
        // Update the reason code for the specific record
        const updatedDataSource = dataSource.map(item => 
            item.key === key ? { ...item, reasonCode: value, reason: value } : item
        );
        console.log("Updated Line clearance list: ", updatedDataSource);
        setData(updatedDataSource);
      
    };

    const columns = useMemo(() => [
        {
            title: 'Template Name',
            dataIndex: 'templeteName',
            ellipsis: true,
            key: 'templeteName',
            align: 'center' as const,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            align: 'center' as const,
        },
        {
            title: 'Task Name',
            dataIndex: 'taskName',
            key: 'taskName',
            ellipsis: true,
            align: 'center' as const,
        },
        {
            title: 'Evidence',
            dataIndex: 'evidence',
            key: 'evidence',
            ellipsis: true,
            align: 'center' as const,
            render: (evidence: string, record: TableItem) => renderEvidence(evidence, record)
        },
        {
            title: 'Reason Code',
            dataIndex: 'reason',
            key: 'reason',
            align: 'center' as const,
            render: (_, record) => (
                <Select
                    // mode="single"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select reasons"
                    options={reasonOptions}
                    value={selectedReasons?.[record.key] || record?.reason}
                    onChange={(value) => handleReasonChange(record.key, value)}
                />
            )
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            ellipsis: true,
            render: (status: string) => {
                const statusMap: { [key: string]: string } = {
                    'new': 'New',
                    'start': 'Started',
                    'complete': 'Completed'
                };
                return statusMap[status.toLowerCase()] || status;
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            ellipsis: true,
            align: 'center' as const,
            render: (_, record) => <GroupAction record={record} />
        },
        {
            title: 'Info',
            dataIndex: 'action',
            key: 'action',
            ellipsis: true,
            align: 'center' as const,
            render: (_, record) => (
                <Tooltip title={`Task: ${record.taskName}\nDescription: ${record.description}`}>
                    <InstructionModal  title='Line Clearance Plugin' isButton={true}>
      <LinePluginManual />
     </InstructionModal>
                </Tooltip>
            )
        }
    ], [dataSource, selectedKeys, fileList, call2, call1]);

    return (
        <>
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                loading={loading}
                size='small'
                rowClassName={(record) =>
                    selectedKeys.includes(record?.key) ? 'selected-row' : ''
                }
                style={{ marginTop: '10px' }}
                pagination={false}
                scroll={{ y: 'calc(100vh - 400px)' }}
            />
            <Modal
                open={previewVisible}
                footer={null}
                onCancel={handleCancel}
                width="50%"
            >
                <iframe
                    src={previewFile}
                    style={{ width: '98%', height: '500px', border: 'none' }}
                    title={t('filePreview')}
                />
            </Modal>
        </>
    );
};

export default CommonTable;


