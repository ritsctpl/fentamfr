import React, { useContext, useMemo, useState } from 'react';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { MdDeleteOutline } from "react-icons/md";
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table } from 'antd';
import type { TableColumnsType } from 'antd';

interface SectionType {
    id: number;
    instanceId: string;
    sectionLabel: string;
    description?: string;
    componentIds?: Array<{
        handle: string;
        label: string;
        dataType: string;
    }>;
}

interface DndTableProps {
    data: SectionType[];
    onOrderChange?: (newOrder: SectionType[]) => void;
    onDelete?: (instanceId: string) => void;
}

interface RowContextProps {
    setActivatorNodeRef?: (element: HTMLElement | null) => void;
    listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
        <Button
            type="text"
            size="small"
            icon={<HolderOutlined />}
            style={{ cursor: 'move', touchAction: 'none' }}
            ref={setActivatorNodeRef}
            {...listeners}
        />
    );
};

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
}

const Row: React.FC<RowProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: props['data-row-key'],
        transition: {
            duration: 150,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging ? { 
            position: 'relative', 
            zIndex: 999,
            background: '#fafafa',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'grabbing',
            touchAction: 'none',
        } : {
            touchAction: 'none',
            cursor: 'grab',
        }),
    };

    const contextValue = useMemo<RowContextProps>(
        () => ({ setActivatorNodeRef, listeners }),
        [setActivatorNodeRef, listeners],
    );

    return (
        <RowContext.Provider value={contextValue}>
            <tr {...props} ref={setNodeRef} style={style} {...attributes} />
        </RowContext.Provider>
    );
};

const DndTable: React.FC<DndTableProps> = ({ data, onOrderChange, onDelete }) => {
    const [dataSource, setDataSource] = React.useState<SectionType[]>(data);
    const [activeId, setActiveId] = useState<string | null>(null);

    React.useEffect(() => {
        setDataSource(data);
    }, [data]);

    const columns: TableColumnsType<SectionType> = [
        {
            title: 'Sort',
            dataIndex: 'sort',
            width: 100,
            className: 'drag-visible',
            render: () => <DragHandle />,
        },
        {
            title: 'Section Label',
            dataIndex: 'sectionLabel',
            className: 'drag-visible',
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            width: 80,
            render: (_, record) => (
                <Button 
                    type="text" 
                    icon={<MdDeleteOutline color='red' size={20} />} 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(record.instanceId);
                    }}
                />
            )
        }
    ];

    const onDragStart = (event: any) => {
        setActiveId(event.active.id as string);
        // Add a class to the body to prevent scrolling while dragging
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    };

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        setActiveId(null);
        // Reset body styles
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        if (active.id !== over?.id) {
            setDataSource((prevState) => {
                const activeIndex = prevState.findIndex((record) => record.instanceId === active.id);
                const overIndex = prevState.findIndex((record) => record.instanceId === over?.id);
                const newOrder = arrayMove(prevState, activeIndex, overIndex);
                onOrderChange?.(newOrder);
                return newOrder;
            });
        }
    };

    const DraggedRow = () => {
        if (!activeId) return null;
        const item = dataSource.find(i => i.instanceId === activeId);
        if (!item) return null;

        return (
            <table style={{ 
                width: '100%', 
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                borderRadius: '4px',
                border: '1px solid #f0f0f0',
                opacity: 0.9,
            }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50px', padding: '8px' }}><HolderOutlined /></td>
                        <td style={{ padding: '8px' }}>{item.sectionLabel}</td>
                        <td style={{ width: '80px', padding: '8px' }}></td>
                    </tr>
                </tbody>
            </table>
        );
    };

    return (
        <div style={{ position: 'relative' }}>
            <DndContext 
                modifiers={[restrictToVerticalAxis]} 
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <SortableContext 
                    items={dataSource.map((i) => i.instanceId)} 
                    strategy={verticalListSortingStrategy}
                >
                    <Table<SectionType>
                        rowKey="instanceId"
                        components={{ body: { row: Row } }}
                        columns={columns}
                        dataSource={dataSource}
                        pagination={false}
                        scroll={{ y: 'calc(100vh - 430px)' }}
                        style={{ 
                            position: 'relative',
                            background: '#ffffff',
                        }}
                    />
                </SortableContext>
                {/* <DragOverlay dropAnimation={null}>
                    {activeId ? <DraggedRow /> : null}
                </DragOverlay> */}
            </DndContext>
        </div>
    );
};

export default DndTable;