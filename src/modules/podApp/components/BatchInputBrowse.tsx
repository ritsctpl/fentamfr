import React, { useContext, useEffect, useRef, useState } from 'react';
import { Input, Modal, Table, Button, Tag, InputRef } from 'antd';
import { GrChapterAdd } from 'react-icons/gr';
import { PodContext } from '@modules/podApp/hooks/userContext';
import { parseCookies } from 'nookies';
import { retrieveActivity, retrieveListOfPcuBO } from '@services/podServices';
import { useTranslation } from 'react-i18next';
import api from '@services/api';

// Define interfaces for the data structure


interface SelectedRow {
    batchNo: string;
    item: string;
    router: string;
    qty: string;
    shopOrder: string;
    status: string;
}

// Context type
interface PodContextType {
    setSelectedRowData: (data: SelectedRow[]) => void;
    selectedRowData: SelectedRow[];
    setSelectedRowCurrent: (value: []) => void;
    selectedRowDataCurrent:any
    phaseByDefault: string;
    activityId: string;
}

interface BatchInputProps {
    onBlur?: () => void;
}

const BatchInput: React.FC<BatchInputProps> = ({ onBlur }) => {
    const { setSelectedRowData, selectedRowData,setSelectedRowCurrent,selectedRowDataCurrent, phaseByDefault, activityId } = useContext(PodContext) as PodContextType;
    const [showModal, setShowModal] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [data, setData] = useState([]);
    const { filterFormData } = useContext(PodContext);
    const { t } = useTranslation();

    const inputRef = useRef<InputRef>(null);

    const fetchShiftData = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        console.log(filterFormData?.podCategory?.toLowerCase(),"filterFormData.podCategory.toLowerCase()");
        
        try {
            const params = filterFormData?.podCategory?.toLowerCase()==="processorder" || filterFormData?.podCategory?.toLowerCase()==="process" ? {
                site: site,
                list: filterFormData.listOptions[0].podWorkList,
                category: 'POD Work List',
                resource: filterFormData.defaultResource,
                operation: `${filterFormData.defaultOperation}`,
                phaseId: filterFormData.defaultPhaseId || phaseByDefault,
                podName: activityId
            }:
            {
                site: site,
                list: filterFormData.listOptions[0].podWorkList,
                category: 'Browse Work List',
                resource: filterFormData.defaultResource,
                operation: `${filterFormData.defaultOperation}`,
                podName: activityId
                // operationVersion: "00"
            };
            const PcuData = filterFormData.podCategory.toLowerCase()==="processorder" || filterFormData.podCategory.toLowerCase()==="process" ? 
            // await batchRecipeByFilters(site, params):
            await getListOfPcu(params):
            await retrieveListOfPcuBO(site, params);
            
            const newData = filterFormData.podCategory.toLowerCase()==="processorder" || filterFormData.podCategory.toLowerCase()==="process" ?PcuData.batchNoResponse.map((item:any) => ({
                ...item,
                material: item.item,
                materialVersion: item.itemVersion,
                recipe: item.recipe,
                orderNumber: item.processOrder,
                status: item.status
            })): PcuData
            setData(newData);
            console.log(PcuData, "PcuData");

        } catch (error) {
            console.error('Error fetching data fields:', error);
        }
    };

    useEffect(() => {
       

        fetchShiftData();

    }, [filterFormData]);

    const getListOfPcu = async (params) => {
        const cookies = parseCookies();
        const site = cookies?.site;
        const activityId = filterFormData?.settings?.pcuorBatchNumberBrowseActivity;
        let URL;
        // debugger
        try {
            const response = await retrieveActivity(site, activityId);
            console.log("Srv url from activity: ", response);
            if (!response?.errorCode) {
                URL = response?.url;
                if(URL.includes("v1")){
                    URL = URL.split("v1")[1];
                }

                try {
                    const getPcuList = await api.post(URL, params);
                    return getPcuList.data;
                }
                catch (error) {
                    console.log("Error retrieving list of pcu: ", error);
                }
            }

        }
        catch (error) {
            console.log("Error retrieving activity: ", error);
        }


    };


    useEffect(() => {
        const selectedPcuBOs = selectedRowData.map(item => item.batchNo);
        const newSelectedRowKeys = Array.isArray(data)
            ? data.map((item, index) => selectedPcuBOs.includes(item.batchNo) ? index : null)
            : [];

        setSelectedRowKeys(newSelectedRowKeys);
        setTags(selectedPcuBOs);
        setSelectedRowCurrent(selectedRowData as []);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedRowCurrentData', JSON.stringify(selectedRowData));
        }
    }, [selectedRowData, data]);

    const handleSuffixClick = () => {
        fetchShiftData();
        setShowModal(true);
    };

    const handleReset = () => {
        setTags([]);
        setSelectedRowKeys([]);
        setSelectedRowData([]); // Clear the context data
        setInputValue('');
    };

    const handleRowSelection = (selectedKeys: number[]) => {
        setSelectedRowKeys(selectedKeys);
        const selectedData = data.filter((_, index) => selectedKeys.includes(index));
        
        // Always set selectedRowCurrent with the selectedData array
        setSelectedRowCurrent(selectedData as []);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedRowCurrentData', JSON.stringify(selectedData)); // Store selected data in browser session storage
        }
    };

    const handleSave = () => {
        const selectedData = data?.filter((_, index) => selectedRowKeys.includes(index));
        const selectedPcuBOs = selectedData?.map(item => item.batchNo);
        setTags(selectedPcuBOs);
        setSelectedRowData(selectedData)

        setShowModal(false);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleTagClose = (tagToRemove: string) => {
        setTags(prev => {
            const newTags = prev.filter(tag => tag !== tagToRemove);

            // Remove the corresponding entry from selectedRowData
            const updatedSelectedRowData = selectedRowData.filter(item => item.batchNo !== tagToRemove);
            setSelectedRowData(updatedSelectedRowData);

            // Update selectedRowKeys to remove the index of the closed tag
            const indexToRemove = data?.findIndex(item => item.batchNo === tagToRemove);
            if (indexToRemove !== -1) {
                setSelectedRowKeys(prevKeys => prevKeys.filter(key => key !== indexToRemove));
            }

            return newTags;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const matchedPcu = data.find(item => item.batchNo === inputValue.trim());
            if (matchedPcu && !tags.includes(matchedPcu.batchNo)) {
                setTags(prev => [...prev, matchedPcu.batchNo]);
                setSelectedRowData([...selectedRowData, matchedPcu as SelectedRow]);
                setInputValue('');
            } else {
                // Show error message if no matching PCU is found or if it's already selected
                Modal.error({
                    title: 'Invalid PCU',
                    content: 'No matching PCU found or PCU already selected.',
                });
            }
        }
    };

    const handleRowClick = (record: any, index: number) => {
        const newSelectedRowKeys = selectedRowKeys.includes(index)
            ? selectedRowKeys.filter(key => key !== index)
            : [...selectedRowKeys, index];
        handleRowSelection(newSelectedRowKeys);
    };

    const columns = filterFormData?.podCategory?.toLowerCase()?.replaceAll(" ", "")==="process" || filterFormData?.podCategory?.toLowerCase()?.replaceAll(" ", "")==="processorder"? [
        {
            title: 'Select',
            dataIndex: 'select',
            width: '100px',
            ellipsis:true,
            render: (_, record, index) => (
                <input
                    type="checkbox"
                    checked={selectedRowKeys.includes(index)}
                    onChange={() => {
                        const newSelectedRowKeys = selectedRowKeys.includes(index)
                            ? selectedRowKeys.filter(key => key !== index)
                            : [...selectedRowKeys, index];
                        handleRowSelection(newSelectedRowKeys);
                    }}
                />
            ),
        },
        {
            title: 'Batch No',
            dataIndex: 'batchNo',
            ellipsis:true,
            key: 'batchNo',
        },
        {
            title: 'Product Code',
            dataIndex: 'material',
            ellipsis:true,
            key: 'material',
        },
        {
            title: 'Qty In Queue',
            dataIndex: 'quantity',
            ellipsis:true,
            key: 'quantity',
        },
        {
            title: 'Recipe',
            dataIndex: 'recipe',
            ellipsis:true,
            key: 'recipe',
        },
        {
            title: 'Process Order',
            dataIndex: 'processOrder',
            ellipsis:true,
            key: 'processOrder',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            ellipsis:true,
            key: 'status',
        },
    ]:
    [
        {
            title: 'Select',
            dataIndex: 'select',
            ellipsis:true,
            width: '100px',
            render: (_, record, index) => (
                <input
                    type="checkbox"
                    checked={selectedRowKeys.includes(index)}
                    onChange={() => {
                        const newSelectedRowKeys = selectedRowKeys.includes(index)
                            ? selectedRowKeys.filter(key => key !== index)
                            : [...selectedRowKeys, index];
                        handleRowSelection(newSelectedRowKeys);
                    }}
                />
            ),
        },
        {
            title: 'PCU',
            dataIndex: 'pcu',
            ellipsis:true,
            key: 'pcu',
        },
        {
            title: 'Item ',
            dataIndex: 'item',
            ellipsis:true,
            key: 'item',
        },
        {
            title: 'Qty In Queue',
            dataIndex: 'qtyInQueue',
            ellipsis:true,
            key: 'qtyInQueue',
        },
        {
            title: 'Router',
            dataIndex: 'router',
            ellipsis:true,
            key: 'routerBO',
        },
        {
            title: 'Shop Order',
            dataIndex: 'shopOrder',
            ellipsis:true,
            key: 'shopOrderBO',
        },
    ];

    const displayedTag = tags.length > 0 ? tags[0] : null;
    const additionalCount = tags.length > 1 ? `(+${tags.length - 1})` : '';
    const truncateTag = (tag: string, maxLength: number = 14) => {
        return tag.length > maxLength ? `${tag.substring(0, maxLength)}...` : tag;
    };
// console.log(selectedRowDataCurrent,"selectedRowDataCurrent");
// console.log(selectedRowData,"newSelectedRowKeys");
    return (
        <>
            <div >
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'text',
                    backgroundColor: '#fff'
                }}>
                    {displayedTag && (
                        <Tag
                            key={displayedTag}
                            closable
                            onClose={() => handleTagClose(displayedTag)}
                            style={{
                                margin: '0px',
                            }}
                        >
                            {truncateTag(displayedTag)}
                        </Tag>
                    )}
                    {additionalCount && <span style={{ margin: '0px' }}>{additionalCount}</span>}
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        onBlur={onBlur}
                        style={{ border: 'none', flex: '1', minWidth: '50px', minHeight: '18px', padding: '0', fontSize: '14px', width: '50%' }}
                    />
                    <GrChapterAdd style={{ marginLeft: '8px', cursor: 'pointer' }} onClick={handleSuffixClick} />

                </div>
            </div>

            <Modal
                title={filterFormData?.podCategory?.toLowerCase()?.replaceAll(" ", "")==="process" || filterFormData?.podCategory?.toLowerCase()?.replaceAll(" ", "")==="processorder"? t('selectBatchNo'): t('selectPcu')}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={[
                    <Button key="reset" onClick={handleReset}>
                        Reset
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSave}>
                        Ok
                    </Button>,
                ]}
                width={'auto'}
            >
                <Table
                    columns={columns}
                    dataSource={Array.isArray(data) ? data.map((item, index) => ({ ...item, key: index })) : []}
                    onRow={(record, index) => ({
                        onClick: () => index !== undefined && handleRowClick(record, index),
                        style: { cursor: 'pointer' }
                    })}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 370px)' }}
                />
            </Modal>
        </>
    );
};

export default BatchInput;