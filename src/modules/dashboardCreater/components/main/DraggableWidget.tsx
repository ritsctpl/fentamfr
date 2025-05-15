import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableWidgetProps {
    id: string;
    icon: React.ReactNode;
    label: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ id, icon, label }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    });

    const style = transform ? {
        transform: CSS.Transform.toString(transform),
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                width: '22%',
                height: '10%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around',
                boxSizing: 'border-box',
                border: '1px solid rgba(45, 45, 45, 0.2)',
                cursor: 'grab',
                touchAction: 'none'
            }}
            {...listeners}
            {...attributes}
        >
            {icon}
            <div style={{ fontSize: '13px' }}>{label}</div>
        </div>
    );
}; 