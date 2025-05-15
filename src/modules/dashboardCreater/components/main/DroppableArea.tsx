import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableAreaProps {
    children?: React.ReactNode;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({ children }) => {
    const { setNodeRef } = useDroppable({
        id: 'dashboard-canvas',
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f5f5f5',
                border: '1px dashed #ccc',
                boxSizing: 'border-box',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0px',
                padding: '2px',
                alignContent: 'flex-start',
                overflowY: 'auto'
            }}
        >
            {children}
        </div>
    );
}; 