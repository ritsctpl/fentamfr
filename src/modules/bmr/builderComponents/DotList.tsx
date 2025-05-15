import { Input, Button, Space, Tooltip, message } from "antd";
import { 
    PlusOutlined, 
    DeleteOutlined,
    ClearOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    SaveOutlined,
    CloseOutlined
} from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import styles from '../styles/DocumentCreator.module.css';
import { FaCodePullRequest } from "react-icons/fa6";

interface Section {
    title: string;
    list: string[];
}

interface DotListProps {
    isEditable?: boolean;
    props: {
        title: string;
        type?: string;
        data: Section[];
        style?: {
            heading?: {
                titleAlign?: 'left' | 'center' | 'right';
            };
            list?: React.CSSProperties;
        };
        onChange?: (newData: Section[]) => void;
        componentId: string;
    }
}

const DotList: React.FC<DotListProps> = ({ isEditable = true, props }) => {
    const { title, data = [], style = {}, componentId } = props;
    const { heading = {}, list = {} } = style;
    const [localData, setLocalData] = useState<Section[]>(data);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (Array.isArray(data)) {
            setLocalData(data);
        } else {
            setLocalData([{
                title: 'New Section',
                list: ['New Item']
            }]);
        }
    }, [data]);

    const handleSave = () => {
        try {
            // Get existing templates from localStorage
            const templatesStr = localStorage.getItem('templates');
            if (!templatesStr) {
                message.error('No templates found');
                return;
            }

            const templates = JSON.parse(templatesStr);
            
            // Find the current template that contains this component
            const currentTemplate = templates.find((t: any) => 
                t.components?.main?.some((c: any) => c.id === componentId)
            );

            if (!currentTemplate) {
                message.error('Template not found');
                return;
            }

            // Find the component in the main array
            const componentIndex = currentTemplate.components.main.findIndex(
                (c: any) => c.id === componentId
            );

            if (componentIndex === -1) {
                message.error('Component not found');
                return;
            }

            // Update only the data part of the config
            currentTemplate.components.main[componentIndex].config.data = localData;

            // Save back to localStorage
            localStorage.setItem('templates', JSON.stringify(templates));
            
            setHasChanges(false);
            message.success('List data saved successfully');
            props.onChange?.(localData);
        } catch (error) {
            message.error('Failed to save list data');
            console.error('Save error:', error);
        }
    };

    const handleCancel = () => {
        setLocalData(data);
        setHasChanges(false);
        message.info('Changes discarded');
    };

    const handleItemChange = (sectionIndex: number, itemIndex: number, value: string) => {
        const newData = [...localData];
        newData[sectionIndex].list[itemIndex] = value;
        setLocalData(newData);
        setHasChanges(true);
    };

    const handleSectionTitleChange = (sectionIndex: number, value: string) => {
        const newData = [...localData];
        newData[sectionIndex].title = value;
        setLocalData(newData);
        setHasChanges(true);
    };

    const handleAddSection = () => {
        const newData = [...localData];
        newData.push({
            title: 'New Section',
            list: ['New Item']
        });
        setLocalData(newData);
        setHasChanges(true);
    };

    const handleDeleteSection = (sectionIndex: number) => {
        const newData = [...localData];
        newData.splice(sectionIndex, 1);
        setLocalData(newData);
        setHasChanges(true);
    };

    const handleAddItem = (sectionIndex: number) => {
        const newData = [...localData];
        newData[sectionIndex].list.push('New Item');
        setLocalData(newData);
        setHasChanges(true);
    };

    const handleDeleteItem = (sectionIndex: number, itemIndex: number) => {
        const newData = [...localData];
        newData[sectionIndex].list.splice(itemIndex, 1);
        setLocalData(newData);
        setHasChanges(true);
    };

    const handleClearAll = () => {
        setLocalData([]);
        setHasChanges(true);
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%' }}>
            <div className={styles.listHeader}>
                <h3 style={{
                    margin: 5,
                    marginBottom: 20,
                    fontWeight: 600,
                    textAlign: heading.titleAlign || 'left',
                }}>
                    {title}
                </h3>
                <Space className={styles.listActions}>
                    <Tooltip title="Add new section">
                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleAddSection}
                        />
                    </Tooltip>
                    <Tooltip title="Clear all sections">
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClearAll}
                        />
                    </Tooltip>
                </Space>
            </div>
            {localData.map((section, sectionIndex) => (
                <div key={sectionIndex} className={styles.listSection}>
                    <div className={styles.sectionHeader}>
                        {isEditable ? (
                            <Input
                                value={section.title}
                                onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                                className={styles.sectionTitle}
                                placeholder="Section Title"
                            />
                        ) : (
                            <h4 style={{
                                margin: 5,
                                marginBottom: 10,
                                fontWeight: 600,
                                textAlign: heading.titleAlign || 'left',
                            }}>
                                {section.title}
                            </h4>
                        )}
                        <Space>
                            <Tooltip title="Delete section">
                                <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteSection(sectionIndex)}
                                    danger
                                    size="small"
                                />
                            </Tooltip>
                        </Space>
                    </div>
                    <ul style={{ 
                        paddingLeft: '20px', 
                        margin: 0, 
                        listStyleType: 'disc',
                        ...list 
                    }}>
                        {section.list.map((item, itemIndex) => (
                            <li key={itemIndex} className={styles.listItem}>
                                <div className={styles.itemContent}>
                                    {isEditable ? (
                                        <Input
                                            value={item}
                                            onChange={(e) => handleItemChange(sectionIndex, itemIndex, e.target.value)}
                                            className={styles.itemInput}
                                            placeholder="List item"
                                        />
                                    ) : (
                                        item
                                    )}
                                    {isEditable && (
                                        <Button
                                            icon={<MinusCircleOutlined />}
                                            onClick={() => handleDeleteItem(sectionIndex, itemIndex)}
                                            size="small"
                                            className={styles.deleteItemButton}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                        {isEditable && (
                            <li className={styles.addItemButton}>
                                <Button
                                    type="text"
                                    icon={<PlusCircleOutlined />}
                                    onClick={() => handleAddItem(sectionIndex)}
                                >
                                    Add Item
                                </Button>
                            </li>
                        )}
                    </ul>
                </div>
            ))}
            <div className={styles.componentFooter}>
                <Space>
                <Button
                    // type="primary" 
                    icon={<FaCodePullRequest />}
                    // onClick={handleSave}
                    // disabled={!hasChanges}
                >
                    Load Data
                </Button>
                    <Button
                        icon={<SaveOutlined />}
                        // type="primary"
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        Save
                    </Button>
                    <Button
                        icon={<CloseOutlined />}
                        onClick={handleCancel}
                        disabled={!hasChanges}
                    >
                        Cancel
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default DotList;
