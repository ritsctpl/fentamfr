import { FormField } from '../types';

export const groupFields = (fields: FormField[]) => {
    const groups: { [key: string]: FormField[] } = {
        ungrouped: []
    };

    fields.forEach(field => {
        const group = field.group || 'ungrouped';
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(field);
    });

    return groups;
}; 