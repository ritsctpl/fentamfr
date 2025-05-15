import { Select, Button, Checkbox } from 'antd';
import type { SelectProps } from 'antd';
import { useState, useEffect } from 'react';
import type { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import styles from './CommonAccordion.module.css';
import { useFilterContext } from '@modules/oee_discrete/hooks/filterData';

interface Menu {
    name: string;
    workcenter: string[];
    lable: string;
}

interface MultipleSelectProp {
    lable: string;
    toggle: boolean;
    menus: Menu[];
}

const CheckSelect: React.FC<MultipleSelectProp> = ({ lable, menus, toggle }) => {
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
    const [checkAll, setCheckAll] = useState<Record<string, boolean>>({});
    const [indeterminate, setIndeterminate] = useState<Record<string, boolean>>({});
    const { overallfilter, setFilter ,handleApply} = useFilterContext();
    const [tabOut, setTabOut] =useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if(loading){
     handleApply()
    }
    },  [tabOut]);

    useEffect(() => {
        const initialSelectedItems = menus.reduce((acc, menu) => {
            acc[menu.name] = [];
            return acc;
        }, {} as Record<string, string[]>);

        const initialCheckAll = menus.reduce((acc, menu) => {
            acc[menu.name] = false;
            return acc;
        }, {} as Record<string, boolean>);

        const initialIndeterminate = menus.reduce((acc, menu) => {
            acc[menu.name] = false;
            return acc;
        }, {} as Record<string, boolean>);

        setSelectedItems(initialSelectedItems);
        setCheckAll(initialCheckAll);
        setIndeterminate(initialIndeterminate);
    }, [menus]);

    const handleChange = (menuName: string) => (value: string | string[]) => {
        setSelectedItems(prev => ({
            ...prev,
            [menuName]: Array.isArray(value) ? value : [value],
        }));
        setFilter({ ...overallfilter, [menuName]: value })
        setTabOut(!tabOut)
        setLoading(true)
    };

    const handleCheckAllChange = (menuName: string) => (e: CheckboxChangeEvent) => {
        const checked = e.target.checked;
        setCheckAll(prev => ({
            ...prev,
            [menuName]: checked,
        }));
        setIndeterminate(prev => ({
            ...prev,
            [menuName]: false,
        }));
        setSelectedItems(prev => ({
            ...prev,
            [menuName]: checked ? menus.find(menu => menu.name === menuName)!.workcenter : [],
        }));
        setFilter(prev => ({
            ...prev,
            [menuName]: checked ? menus.find(menu => menu.name === menuName)!.workcenter : [],
        }));
        setTabOut(!tabOut)
        setLoading(true)
    };

    useEffect(() => {
        menus.forEach(menu => {
            const allSelected = selectedItems[menu.name]?.length === menu.workcenter.length;
            setCheckAll(prev => ({
                ...prev,
                [menu.name]: allSelected,
            }));
            setIndeterminate(prev => ({
                ...prev,
                [menu.name]: selectedItems[menu.name]?.length > 0 && !allSelected,
            }));
        });
    }, [selectedItems, menus]);

    return (
        <div className={styles.datePicker}>
            {menus.map(menu => {
                const options: SelectProps['options'] = menu.workcenter.map(data => ({
                    value: data,
                    label: data,
                }));

                return (
                    <div key={menu.name}>
                        <div className={styles.filter}><a className={styles.heading}>{menu.name}</a>
                            <div className={styles.buttonContainer}>
                                <Checkbox
                                    indeterminate={indeterminate[menu.name]}
                                    onChange={handleCheckAllChange(menu.name)}
                                    checked={selectedItems[menu.name]?.length === 0 ? false : checkAll[menu.name]}
                                >
                                    <a className={styles.heading}>{selectedItems[menu.name]?.length > 0 ? 'Deselect All' : 'Select All'}</a>
                                </Checkbox>
                            </div></div>
                        <Select
                            mode="tags"
                            size={'large'}
                            placeholder={`Select ${menu.name}`}
                            onChange={handleChange(menu.name)}
                            // value={selectedItems[menu.name]}
                            value={overallfilter[menu.name]}
                            style={{ width: '100%' }}
                            options={options}
                        />
                    </div>
                );
            })}
            {toggle && <div className={styles.toggleSwitch}>
                <a className={styles.heading}>Toggle</a>
                <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>}
        </div>
    );
}

export default CheckSelect;
