import { Theme, useTheme } from '@mui/material/styles';
import { Radio, Select, Space } from 'antd';
import type { ConfigProviderProps, RadioChangeEvent, SelectProps } from 'antd';
import { useRef, useState } from 'react';
// import { useDatePickerDefaultizedProps } from '@mui/x-date-pickers/DatePicker/shared';
import styles from './CommonAccordion.module.css'
import { useFilterContext } from '@modules/oee_process/hooks/filterData';

interface MultipleSelectProp {
  lable: any
  toggle: boolean
  menus: any[],
}

const MultipleSelectChip: React.FC<MultipleSelectProp> = ({ lable, menus, toggle }) => {
  const theme = useTheme();
  const [personName, setPersonName] = useState<string[]>([]);

  const { overallfilter, setFilter } = useFilterContext();
  const options: SelectProps['options'] = [];
  
  menus?.map(data => (
    options?.push({
      value: data,
      label: data,
    })
  ))
  const handleChange = (values: string[]) => {
    // const processedValues = values.map(value => value.split("/")[0]);
    setFilter({ ...overallfilter, [lable]: values });
  };

  return (
    <div className={styles.datePicker}>
      <a className={styles.heading}>{lable}</a>
      <Select
        mode="tags"
        size={'large'}
        placeholder={lable}
        onChange={handleChange}
        value={overallfilter[lable]}
        style={{ width: '100%' }}
        options={options}
      />
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

export default MultipleSelectChip