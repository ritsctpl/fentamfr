import React, { useContext, useMemo } from 'react';
import { HolderOutlined } from '@ant-design/icons';
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
    sectionName: string;
    description?: string;
}

interface DndTableProps {
    data: SectionType[];
    onOrderChange?: (newOrder: SectionType[]) => void;
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

const DndTable: React.FC<DndTableProps> = ({ data, onOrderChange }) => {
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
            title: 'Section Name',
            dataIndex: 'sectionName',
            className: 'drag-visible',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            render: (text) => text || '-'
        },
    ];

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setDataSource((prevState) => {
                const activeIndex = prevState.findIndex((record) => record.id === active.id);
                const overIndex = prevState.findIndex((record) => record.id === over?.id);
                const newOrder = arrayMove(prevState, activeIndex, overIndex);
                // Notify parent component of the new order
                onOrderChange?.(newOrder);
                return newOrder;
            });
        }
    };

    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext items={dataSource.map((i) => i.id.toString())} strategy={verticalListSortingStrategy}>
                <Table<SectionType>
                    rowKey="id"
                    components={{ body: { row: Row } }}
                    columns={columns}
                    dataSource={dataSource}
                    bordered
                    pagination={false}
                />
            </SortableContext>
        </DndContext>
    );
};

export default DndTable;