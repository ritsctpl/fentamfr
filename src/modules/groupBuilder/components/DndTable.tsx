import React, { useContext, useMemo } from 'react';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { MdDeleteOutline } from "react-icons/md";
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
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
            style={{ cursor: 'move' }}
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
    } = useSortable({ id: props['data-row-key'] });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
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

    // Update dataSource when data prop changes
    React.useEffect(() => {
        setDataSource(data);
    }, [data]);

    const columns: TableColumnsType<SectionType> = [
        {
            title: 'Sort',
            dataIndex: 'sort',
            width: 50,
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
            width: 100,
            render: (_, record) => (
                <Button 
                    type="text" 
                    icon={<MdDeleteOutline color='red' size={20} />} 
                    onClick={() => onDelete?.(record.instanceId)}
                />
            )
        }
    ];

    const onDragEnd = ({ active, over }: DragEndEvent) => {
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

    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext items={dataSource.map((i) => i.instanceId)} strategy={verticalListSortingStrategy}>
                <Table<SectionType>
                    rowKey="instanceId"
                    components={{ body: { row: Row } }}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                />
            </SortableContext>
        </DndContext>
    );
};

export default DndTable;