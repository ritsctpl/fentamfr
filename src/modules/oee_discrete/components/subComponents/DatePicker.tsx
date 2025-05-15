import React, { useEffect } from 'react';
import { DatePicker } from 'antd';
import styles from './CommonAccordion.module.css';
import { Dropdown, Space, Typography } from 'antd';
import { FilterOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import moment from 'moment';
import { useFilterContext } from "@modules/oee_discrete/hooks/filterData";


const { RangePicker } = DatePicker;

interface CommonDatePickerProps {
    label: any;  // Changed type to string for better type safety
    filter: boolean;
    item: any[];
}

const CommonDatePicker: React.FC<CommonDatePickerProps> = ({ label, filter, item }) => {
    const [tabOut, setTabOut] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const { overallfilter, setFilter,handleApply, color } = useFilterContext();
    useEffect(() => {
        if(loading){
     handleApply()
    }
    },  [tabOut]);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `:where(.css-dev-only-do-not-override-qnu6hi).ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item-selected, :where(.css-dev-only-do-not-override-qnu6hi).ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-item-selected, :where(.css-dev-only-do-not-override-qnu6hi).ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-submenu-title-selected, :where(.css-dev-only-do-not-override-qnu6hi).ant-dropdown-menu-submenu .ant-dropdown-menu .ant-dropdown-menu-submenu-title-selected{
                            color: ${color.color}; background: ${color.lightcolor};
                            }`;

        document.head.appendChild(style);

        // Cleanup function to remove the style element on component unmount
        return () => {
            document.head.removeChild(style);
        };
    }, [color]); // Update the style when the color changes

    const items: MenuProps['items'] = item
    const handleDateChange = (e: any) => {
  
        
        
        if (e) {
            const [startDate, endDate] = e;
            const formattedDates = [ startDate, endDate];
            setFilter({ ...overallfilter, [label]: formattedDates });
       

        } else {
            setFilter({ ...overallfilter, [label]: null });
            
        }
        setTabOut(!tabOut)
        setLoading(true)
    };


    return (
        <div className={styles.datePicker}>
            <div className={styles.filter}>
                <a className={styles.heading}>{label}</a>
                {filter && (
                    <Dropdown
                        menu={{
                            items,
                            selectable: true,
                            defaultSelectedKeys: overallfilter[label] || [],
                        }}
                    >
                        <Typography.Link style={{ color: color.color }}>
                            <Space>
                                Filter
                                <FilterOutlined />
                            </Space>
                        </Typography.Link>
                    </Dropdown>
                )}
            </div>

            <Space direction="vertical" size={18}>
                <RangePicker
                    showTime
                    size={'large'}
                    style={{ width: '100%' }}
                    onChange={handleDateChange}
                    value={overallfilter[label]}
                />
            </Space>
        </div>
    );
};

export default CommonDatePicker;
