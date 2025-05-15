import React, { useEffect, useState } from "react";
import { Button, Table, Input, Modal } from "antd";
import { useBuyOff } from '../hooks/BuyOffContext';
import styles from '../styles/RoutingStep.module.css'
import AttachmentForm from "./AttachmentForm";
import { BuyOffData } from "../types/buyOff.types";

const BuyOffAttachment = () => {
    const { selectedRowData, setSelectedRowData, setFullScreen, fullScreen, setHasChanges } = useBuyOff();
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [selectedAttachmentDetails, setSelectedAttachmentDetails] = useState<any>(null)


    useEffect(() => {
        if (selectedRowData?.attachmentList) {
            const formattedData = selectedRowData.attachmentList.map((item: any, index: number) => {
                // Create formatted attachment string
                const attachmentParts = [];
                if (item.quantityRequired) attachmentParts.push(`quantityRequired:${item.quantityRequired}`);
                if (item.stepId) attachmentParts.push(`stepId:${item.stepId}`);
                if (item.item) attachmentParts.push(`item:${item.item}`);
                if (item.itemVersion) attachmentParts.push(`itemVersion:${item.itemVersion}`);
                if (item.routing) attachmentParts.push(`routing:${item.routing}`);
                if (item.routingVersion) attachmentParts.push(`routingVersion:${item.routingVersion}`);
                if (item.operation) attachmentParts.push(`operation:${item.operation}`);
                if (item.operationVersion) attachmentParts.push(`operationVersion:${item.operationVersion}`);
                if (item.workCenter) attachmentParts.push(`workCenter:${item.workCenter}`);
                if (item.recipe) attachmentParts.push(`recipe:${item.recipe}`);
                if (item.recipeVersion) attachmentParts.push(`recipeVersion:${item.recipeVersion}`);
                if (item.resource) attachmentParts.push(`resource:${item.resource}`);
                if (item.shopOrder) attachmentParts.push(`shopOrder:${item.shopOrder}`);
                if (item.pcu) attachmentParts.push(`pcu:${item.pcu}`);
                if (item.orderNumber) attachmentParts.push(`orderNumber:${item.orderNumber}`);
                if (item.batchNo) attachmentParts.push(`batchNo:${item.batchNo}`);

                return {
                    key: index.toString(),
                    sequence: item.sequence,
                    attachment: attachmentParts.join(', '),
                    details: item,
                };
            });
            setDataSource(formattedData);
        }
    }, [selectedRowData]);

    const columns = [
        {
            title: 'Sequence',
            dataIndex: 'sequence',
            key: 'sequence',
            width: '100px'
        },
        {
            title: 'Attachment',
            dataIndex: 'attachment',
            key: 'attachment',
            render: (text: string) => (
                <Input.TextArea
                    value={text}
                    readOnly
                    autoSize={{ minRows: 1, maxRows: 3 }}
                />
            )
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
            render: (_: any, record: any) => (
                <Button onClick={() => {
                    setSelectedAttachmentDetails(record.details);
                    setFullScreen(true);
                }}>
                    Details
                </Button>
            )
        }
    ];

    const handleInsertNew = () => {
        // Create new attachment with empty values
        const newSequence = (dataSource.length + 1) * 10;
        const newAttachment = {
            key: newSequence.toString(),
            sequence: newSequence,
            attachment: '',
            details: {
                sequence: newSequence,
                quantityRequired: '',
                stepId: '',
                item: '',
                itemVersion: '',
                routing: '',
                routingVersion: '',
                operation: '',
                operationVersion: '',
                workCenter: '',
                recipe: '',
                recipeVersion: '',
                resource: '',
                shopOrder: '',
                pcu: '',
                orderNumber: '',
                batchNo: ''
            }
        };

        // Update the data source with the new empty attachment
        setDataSource([...dataSource, newAttachment]);

        // Update the selected row data
        const currentSelectedRowData: Partial<BuyOffData> = selectedRowData || {
            id: '',
            site: '',
            buyOff: '',
            version: '',
            currentVersion: false,
            description: '',
            status: '',
            messageType: '',
            partialAllowed: false,
            rejectAllowed: false,
            skipAllowed: false,
            createdDateTime: '',
            modifiedDateTime: '',
            userGroupList: [],
            attachmentList: [],
            customDataList: []
        };

        const updatedSelectedRowData = {
            ...currentSelectedRowData,
            attachmentList: [
                ...(currentSelectedRowData.attachmentList || []),
                newAttachment.details
            ]
        } as BuyOffData;

        // Update all states in sequence
        setSelectedRowData(updatedSelectedRowData);
        setSelectedAttachmentDetails(newAttachment.details);
        setFullScreen(true);
        setHasChanges(true);
    };

    const handleRemoveSelected = () => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to remove selected items?',
            onOk: () => {
                // Get the sequences of items being removed
                const selectedSequences = dataSource
                    .filter(item => selectedKeys.includes(item.key))
                    .map(item => item.details.sequence);

                // Update dataSource
                const newData = dataSource.filter(item => !selectedKeys.includes(item.key));
                setDataSource(newData);

                // Update selectedRowData
                if (selectedRowData?.attachmentList) {
                    const updatedAttachmentList = selectedRowData.attachmentList.filter(
                        item => !selectedSequences.includes(item.sequence)
                    );
                    
                    const updatedSelectedRowData: BuyOffData = {
                        ...selectedRowData,
                        attachmentList: updatedAttachmentList
                    };
                    setSelectedRowData(updatedSelectedRowData);
                }

                // Clear the details panel if the currently displayed item is being removed
                if (selectedAttachmentDetails && selectedSequences.includes(selectedAttachmentDetails.sequence)) {
                    setSelectedAttachmentDetails(null);
                    // setFullScreen(false);
                }

                setSelectedKeys([]);
                setHasChanges(true);
            }
        });
    };

    const handleRemoveAll = () => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to remove all items?',
            onOk: () => {
                setDataSource([]);
                const updatedSelectedRowData: BuyOffData = {
                    ...(selectedRowData as BuyOffData),
                    attachmentList: []
                };
                setSelectedRowData(updatedSelectedRowData);
                // Clear the details panel
                setSelectedAttachmentDetails(null);
                // setFullScreen(false);
                setSelectedKeys([]);
                setHasChanges(true);
            }
        });
    };

    return (
        <div style={{width:'100%',display: 'flex',height: 'calc(100vh - 360px)'}}>
            <div style={{width: fullScreen ? '50%' : '100%'}}>
                <div className={styles.userGroupActions}>
                    <Button 
                        // type="primary"
                        // className={styles.cancelButton}
                        onClick={handleInsertNew}
                        style={{ marginRight: 8 }}
                    >
                        Insert New
                    </Button>
                    <Button 
                        // type="primary"
                        // className={styles.cancelButton}
                        onClick={handleRemoveSelected}
                        disabled={selectedKeys.length === 0}
                        style={{ marginRight: 8 }}
                    >
                        Remove Selected
                    </Button>
                    <Button 
                        // type="primary"
                        // className={styles.cancelButton}
                        onClick={handleRemoveAll}
                        disabled={dataSource.length === 0}
                    >
                        Remove All
                    </Button>
                </div>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedKeys,
                        onChange: (selectedRowKeys) => {
                            setSelectedKeys(selectedRowKeys as string[]);
                        }
                    }}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 360px)' }}
                />
            </div>
            <div style={{width: fullScreen ? '50%' : '0%'}}>
                {fullScreen && (
                
                        <AttachmentForm 
                            rowSelectedData={selectedAttachmentDetails} 
                            onDataChange={() => {
                                setHasChanges(true);
                            }}
                        />
                )}
            </div>
        </div>
    );
};

export default BuyOffAttachment;