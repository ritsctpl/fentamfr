import React, { useEffect, useState, useCallback } from 'react';
import { useConfigContext } from '../hooks/configData';
import { Typography, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { getSampleData2 } from '@services/oeeServices';

const FilterTab = ({ setFilter, filter }: any) => {
    const { filterValue } = useConfigContext();
    const [selectedValue, setSelectedValue] = useState<any>({});
    const [selectOptions, setSelectOptions] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const formatOptionsData = useCallback((data: any, filter: any) => {
        if (!data) return [];

        const responseKey = Object.keys(data).find(key => Array.isArray(data[key]));
        const responseData = responseKey ? data[responseKey] : (Array.isArray(data) ? data : []);

        if (Array.isArray(responseData)) {
            const uniqueValues = new Set();
            return responseData
                .filter(item => {
                    const value = item[filter.retriveFeild];
                    if (uniqueValues.has(value)) {
                        return false;
                    }
                    uniqueValues.add(value);
                    return true;
                })
                .map(item => ({
                    label: item[filter.retriveFeild],
                    value: item[filter.retriveFeild],
                }));
        }
        return [];
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchOptions = async () => {
            if (isLoading) return;
            setIsLoading(true);

            try {
                const multiSelectFilters = filterValue?.filter(f => f.status === true && f.type === 'multiselect') || [];
                const optionsPromises = multiSelectFilters.map(async filter => {
                    const response = await getSampleData2(filter.controller, filter.endpoint, 'RITS');
                    const formattedOptions = formatOptionsData(response, filter);
                    return { key: filter.keyName, options: formattedOptions };
                });

                const results = await Promise.all(optionsPromises);
                if (isMounted) {
                    const newOptions = results.reduce((acc, { key, options }) => ({
                        ...acc,
                        [key]: options
                    }), {});
                    setSelectOptions(newOptions);
                }
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchOptions();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (key: string, value: any) => {
        setSelectedValue(prev => ({
            ...prev,
            [key]: value
        }));

        if (setFilter) {
            setFilter({
                ...filter,
                [key]: value
            });
        }
    };

    const handleDateChange = (dates: any) => {
        if (dates) {
            const [start, end] = dates;
            const startTime = start ? dayjs(start).format('YYYY-MM-DDTHH:mm:ss.SSS') : null;
            const endTime = end ? dayjs(end).format('YYYY-MM-DDTHH:mm:ss.SSS') : null;

            setSelectedValue(prev => ({
                ...prev,
                startTime,
                endTime
            }));

            if (setFilter) {
                setFilter({
                    ...filter,
                    startTime,
                    endTime
                });
            }
        } else {
            setSelectedValue(prev => ({
                ...prev,
                startTime: null,
                endTime: null
            }));

            if (setFilter) {
                setFilter({
                    ...filter,
                    startTime: null,
                    endTime: null
                });
            }
        }
    };

    const renderFilterInput = (filter: any) => {
        switch (filter.type) {
            case 'multiselect':
                return <Select
                    mode="multiple"
                    style={{ width: '100%', marginBottom: '8px' }}
                    placeholder={`Select ${filter.filterName}`}
                    value={selectedValue[filter.keyName] || []}
                    onChange={(values) => handleInputChange(filter.keyName, values)}
                    options={selectOptions[filter.keyName] || []}
                    loading={!selectOptions[filter.keyName]}
                    size="middle"
                    maxTagCount={2}
                    maxTagTextLength={10}
                    optionFilterProp="label"
                />;
            case 'date':
                return <DatePicker.RangePicker
                    style={{ width: '100%', marginBottom: '8px' }}
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    value={[
                        selectedValue.startTime ? dayjs(selectedValue.startTime) : null,
                        selectedValue.endTime ? dayjs(selectedValue.endTime) : null
                    ]}
                    onChange={handleDateChange}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="filters-container">
            {filterValue
                ?.filter(filter => filter.status === true)
                .map(filter => (
                    <div key={filter.filterName} className="filter-item">
                        <Typography.Text className="filter-label">
                            {filter.filterName}
                        </Typography.Text>
                        {renderFilterInput(filter)}
                    </div>
                ))}
        </div>
    );
};

export default FilterTab;