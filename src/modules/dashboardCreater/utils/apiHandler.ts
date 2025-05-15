import { fetchQueryBuilder } from '@services/queryBuilderService';
import { ApiConfig, QueryConfig } from '../types';
import { apiDashboard } from '@/services/dashboard';
import { parseCookies } from 'nookies';
export const executeApiCall = async (config: ApiConfig, formValues?: any) => {
    try {
        // Prepare query parameters
        let url = config.url;
        if (config.queryParams) {
            const queryString = new URLSearchParams(config.queryParams).toString();
            url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
        }

        // Prepare request body
        const requestBody: {
            method: string;
            headers: Record<string, string>;
            body?: any;
        } = {
            method: config.method,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers
            }
        };

        // Handle request body based on bodySource configuration
        if (config.method !== 'GET') {
            let finalBody: any = {};

            // Handle form values first
            if (formValues && (config.bodySource?.type === 'form' || config.bodySource?.type === 'both')) {
                if (config.bodySource.type === 'both' && config.bodySource.mergeStrategy === 'nested') {
                    finalBody[config.bodySource.formDataKey || 'formData'] = formValues;
                } else {
                    finalBody = { ...finalBody, ...formValues };
                }
            }

            // Then handle manual body
            if (config.body && (config.bodySource?.type === 'manual' || config.bodySource?.type === 'both')) {
                const manualBody = typeof config.body === 'string' ?
                    JSON.parse(config.body) : config.body;
                finalBody = { ...finalBody, ...manualBody };
            }
            requestBody.body = finalBody;
        }

        // Make the API call using apiDashboard
        const response = await apiDashboard(url, requestBody.body, requestBody.headers);

        // Ensure we have valid data
        const data = response || {};

        // If arrayPath is specified, try to get the array from the response
        if (config.arrayPath) {
            const pathParts = config.arrayPath.split('.');
            let arrayData = data;

            for (const part of pathParts) {
                arrayData = arrayData?.[part];
            }

            // Ensure arrayData is an array
            if (Array.isArray(arrayData)) {
                return arrayData;
            } else {
                console.warn(`Data at path ${config.arrayPath} is not an array:`, arrayData);
                return [];
            }
        }

        // Process response mapping
        if (config.responseMapping && config.responseMapping.length > 0) {
            const mappedData: Record<string, any> = {};

            config.responseMapping.forEach(mapping => {
                const { targetProperty, sourcePath } = mapping;
                let value = data;

                // Navigate through the response object using the source path
                const pathParts = sourcePath.split('.');
                for (const part of pathParts) {
                    if (value && typeof value === 'object') {
                        value = value[part];
                    } else {
                        value = undefined;
                        break;
                    }
                }

                mappedData[targetProperty] = value;
            });

            return mappedData;
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

export const executeQueryCall = async (config: QueryConfig, formValues?: any) => {

    console.log('formValues', formValues, config);
    try {
        let finalBody: any = {};

        // Handle form values first
        if (formValues && (config.bodySource?.type === 'form' || config.bodySource?.type === 'both')) {
            if (config.bodySource.type === 'both' && config.bodySource.mergeStrategy === 'nested') {
                finalBody[config.bodySource.formDataKey || 'formData'] = formValues;
            } else {
                finalBody = { ...finalBody, ...formValues };
            }
        }

        // Then handle manual body
        if (config.body && (config.bodySource?.type === 'manual' || config.bodySource?.type === 'both')) {
            const manualBody = typeof config.body === 'string' ?
                JSON.parse(config.body) : config.body;
            finalBody = { ...finalBody, ...manualBody };
        }

        // Prepare query parameters
        const runQueryData = {
            templateName: config.query,
            site: parseCookies().site,
            filters: Object.keys(finalBody).reduce((acc, key) => {
                if (finalBody[key] !== null) {
                    if (Array.isArray(finalBody[key])) {
                        if (finalBody[key].length > 0)
                            acc[key] = finalBody[key];
                    }
                    if (typeof finalBody[key] === 'string' || typeof finalBody[key] === 'number') {
                        acc[key] = finalBody[key];
                    }
                }
                return acc;
            }, { })
        }

        // Make the API call using apiDashboard
        const response = await fetchQueryBuilder(runQueryData);

        // Ensure we have valid data
        const data = response || {};
        if (config.arrayPath) {
            const pathParts = config.arrayPath.split('.');
            let arrayData = data;

            for (const part of pathParts) {
                arrayData = arrayData?.[part];
            }

            // Ensure arrayData is an array
            if (Array.isArray(arrayData)) {
                return arrayData;
            } else {
                console.warn(`Data at path ${config.arrayPath} is not an array:`, arrayData);
                return [];
            }
        }
        return data;
    } catch (error) {
        console.error('Query call failed:', error);
        throw error;
    }
};