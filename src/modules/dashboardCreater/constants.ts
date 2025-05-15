import { LayoutConfig } from './types';

export const defaultLayoutConfig: LayoutConfig = {
    type: 'default',
    columns: 1,
    gutter: [16, 16],
    justify: 'start',
    align: 'top',
    wrap: true,
    fieldSpacing: 16,
    grouping: {
        enabled: true,
        spacing: 24
    }
}; 