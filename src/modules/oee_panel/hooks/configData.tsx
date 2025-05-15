import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createManagementData, updateManagementData, deleteManagementData, retrieveManagementData, retrieveAllManagementData } from '@services/managementService';
import { parseCookies } from 'nookies';

export interface ColorScheme {
    lineColor: string[];
    itemColor: { color: string; range: number; }[];
}

export interface ChartData {
    dataName: string;
    type: string;
    query: string;
    endPoint: string;
    enabled: boolean;
    seconds: string | number;
    column: string | number;
    colorScheme?: ColorScheme;
}

export interface CategoryData {
    category: string;
    enabled: boolean;
    data: ChartData[];
}

export interface FilterItem {
    filterName: string;
    type: string;
    status: boolean;
    controller: string;
    endpoint: string;
    keyName: string;
    retriveFeild: string;
}

export interface ManagementData {
    site: string;
    user: string;
    dashBoardName: string;
    dashBoardDataList: CategoryData[];
    filterDataList: FilterItem[];
}

interface ConfigContextType {
    value: ManagementData[];
    setValue: (value: ManagementData[]) => void;
    updateData: (data: ManagementData) => Promise<void>;
    createData: (data: ManagementData) => Promise<ManagementData>;
    handleDeleteManagementData: (dashBoardName: string) => Promise<void>;
    getCategories: () => string[];
    createNewVersion: () => Promise<void>;
    selectedValues: any;
    setSelectedValues: (value: any) => void;
    filterValue: any[];
    setFilterValue: (value: any[]) => void;
}

const cleanChartData = (item: any): ChartData => ({
    dataName: item.dataName,
    type: item.type,
    query: item.query,
    endPoint: item.endPoint,
    enabled: item.enabled,
    seconds: item.seconds,
    column: item.column,
    colorScheme: item.colorScheme || {
        lineColor: [],
        itemColor: []
    }
});

const cleanCategoryData = (category: any): CategoryData => ({
    category: category.category,
    enabled: category.enabled,
    data: category.data.map(cleanChartData)
});

const cleanManagementData = (response: any, site: string, user: string): ManagementData => ({
    site: response?.site || site,
    user: response?.user || user,
    dashBoardName: response?.dashBoardName || '',
    dashBoardDataList: response?.dashBoardDataList?.map(cleanCategoryData) || [],
    filterDataList: response?.filterDataList || []
});

class ApiService {
    static async fetchById(dashBoardName: string): Promise<ManagementData> {
        const { site = 'RITS', user = '' } = parseCookies();
        const response = await retrieveManagementData(site, dashBoardName);
        return cleanManagementData(response, site, user);
    }

    static async create(data: ManagementData): Promise<ManagementData> {
        await createManagementData(data);
        return this.fetchById(data.dashBoardName);
    }

    static async update(data: ManagementData): Promise<ManagementData> {
        await updateManagementData(data);
        return this.fetchById(data.dashBoardName);
    }

    static async delete(dashBoardName: string): Promise<void> {
        const { site = 'RITS' } = parseCookies();
        await deleteManagementData({ dashBoardName, site });
    }

    static async fetchAll(): Promise<ManagementData[]> {
        const { site = 'RITS', user = '' } = parseCookies();
        const response = await retrieveAllManagementData(site);
        console.log(response)
        return response;
    }
}

class DataManager {
    static generateNewDashboard(currentData?: ManagementData): ManagementData {
        const { site = '', user = '' } = parseCookies();
        return {
            site,
            user,
            dashBoardName: currentData ? `Copy of ${currentData.dashBoardName}` : 'New Dashboard',
            dashBoardDataList: currentData ? JSON.parse(JSON.stringify(currentData.dashBoardDataList)) : [],
            filterDataList: currentData ? JSON.parse(JSON.stringify(currentData.filterDataList)) : []
        };
    }
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const MyConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [value, setValue] = useState<ManagementData[]>([]);
    const [filterValue, setFilterValue] = useState<any[]>([]);
    const [selectedValues, setSelectedValues] = useState<any>(null);
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const getCategories = useCallback(() => {
        return value[0]?.dashBoardDataList?.map(item => item.category) || [];
    }, [value]);

    const updateData = useCallback(async (data: ManagementData): Promise<void> => {
        try {
            const updatedData = await ApiService.update(data);
            setValue([updatedData]);
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }, []);

    const createData = useCallback(async (data: ManagementData): Promise<ManagementData> => {
        try {
            const createdData = await ApiService.create(data);
            setValue(prev => [createdData, ...prev]);
            return createdData;
        } catch (error) {
            console.error('Error creating data:', error);
            throw error;
        }
    }, []);

    const handleDeleteManagementData = useCallback(async (dashBoardName: string): Promise<void> => {
        try {
            await ApiService.delete(dashBoardName);
            const updatedData = await ApiService.fetchById(dashBoardName);
            setValue([updatedData]);
        } catch (error) {
            console.error('Error deleting data:', error);
            throw error;
        }
    }, []);

    const createNewVersion = useCallback(async () => {
        try {
            const newVersionData = DataManager.generateNewDashboard(value[0]);
            const createdData = await createData(newVersionData);
            setValue(prev => [createdData, ...prev]);
        } catch (error) {
            console.error('Error creating new version:', error);
            throw error;
        }
    }, [value, createData]);

    useEffect(() => {
        const dashboardName = searchParams.get('dashBoardName') || searchParams.get('id');

        const parsedSearchParams: { [key: string]: string | string[] } = Object.fromEntries(searchParams.entries());

        Object.keys(parsedSearchParams).forEach(key => {
            const value = parsedSearchParams[key];
            if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
                try {
                    parsedSearchParams[key] = JSON.parse(value);
                } catch {
                    const trimmedValue = value.slice(1, -1);
                    parsedSearchParams[key] = trimmedValue ? trimmedValue.split(',').map(item => item.trim()) : [];
                }
            }
        });

        const { id, ...filteredParams } = parsedSearchParams;
        setSelectedValues(filteredParams);

        const fetchData = async () => {
            try {
                if (dashboardName) {
                    const data = await ApiService.fetchById(dashboardName);
                    setValue([data]);
                    setFilterValue(data.filterDataList);
                } else {
                    const data = await ApiService.fetchAll();
                    console.log(data)
                    const result = await ApiService.fetchById(data[data.length-1].dashBoardName);
                    setValue([result]);
                    setFilterValue(result?.filterDataList || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [searchParams, pathname]);

    const contextValue = {
        value,
        setValue,
        updateData,
        createData,
        handleDeleteManagementData,
        getCategories,
        createNewVersion,
        selectedValues,
        setSelectedValues,
        filterValue,
        setFilterValue
    };

    return (
        <ConfigContext.Provider value={contextValue}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfigContext = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfigContext must be used within a MyConfigProvider');
    }
    return context;
};
