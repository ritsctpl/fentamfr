import React, { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './CommonAccordion.module.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CommonDatePicker from './DatePicker';
import MultipleSelectChip from './MultiSelect';
import CheckSelect from './CheckSelect';
import { useFilterContext } from '@modules/oee_process/hooks/filterData';

const theme = createTheme({
    components: {
        MuiAccordion: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderRadius: 0,
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderRadius: 0,
                },
            },
        },
        MuiAccordionDetails: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderRadius: 0,
                },
            },
        },
    },
});

interface AccordionData {
    name: string;
    icon: any;
    childeren: any[];
}

interface CommonAccordionProps {
    data: AccordionData[];
    showOnlyIcons: boolean;
    setHamburger: (state: boolean) => void;
    deactivelist :any[]
}

const CommonAccordion: React.FC<CommonAccordionProps> = ({ data, showOnlyIcons, setHamburger,deactivelist }) => {
    
    // State to track expanded sections, initializing with all indices
    const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set(Array.from(data.keys())));

    const {color}=useFilterContext()

    // Handle accordion expansion and collapse
    const handleAccordionChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        if (deactivelist.includes(index)) return; // Prevent toggling for deactivated accordions

        setExpandedIndices(prev => {
            const newExpandedIndices = new Set(prev);
            if (isExpanded) {
                newExpandedIndices.add(index);
            } else {
                newExpandedIndices.delete(index);
            }
            return newExpandedIndices;
        });
        setHamburger(false);
    };

    return (
        <div className={styles.accordionContainer}>
            {data.map((item, index) => (
                <ThemeProvider key={index} theme={theme}>
                    <Accordion
                        expanded={expandedIndices.has(index) && !deactivelist.includes(index)} // Prevent expansion if deactivated
                        onChange={handleAccordionChange(index)}
                        disabled={deactivelist.includes(index)} // Disable accordion if deactivated
                        style={{background:'none',fontFamily:'roboto'}}
                        sx={{
                            '&::before': {
                                content: 'none',
                                display: 'none',
                            },
                            '& .MuiCollapse-root': {
                                display: showOnlyIcons ? 'none' : 'block', // Hide collapse wrapper
                            },
                            '& .MuiAccordion-root.Mui-expanded': {
                                margin: 0, // Override margin when expanded
                            },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={!showOnlyIcons && !deactivelist.includes(index) && <ExpandMoreIcon />}
                            aria-controls={`panel${index}-content`}
                            id={`panel${index}-header`}
                        >
                            <div className={showOnlyIcons ? styles.iconcenter : styles.accordionactive}>
                                {/* {item.icon} */}
                                <item.icon style={{color:color.color}}/>
                                <div className={showOnlyIcons ? styles.collapsed : styles.expanded}>
                                    <a style={{color:expandedIndices.has(index) ? color.color: 'gray'}}>
                                        {item.name}
                                    </a>
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            {item.childeren.map((data, childIndex) => (
                                <div key={childIndex} className={showOnlyIcons ? styles.collapsed : styles.expanded}>
                                    {data.type === "date" && <CommonDatePicker label={data.lable} filter={data.filter} item={data.item} />}
                                    {data.type === "select" && <MultipleSelectChip lable={data.lable} menus={data.menu} toggle={data.toggle} />}
                                    {data.type === "test" && <CheckSelect lable={data.lable} menus={data.menu} toggle={data.toggle} />}
                                </div>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                </ThemeProvider>
            ))}
        </div>
    );
};

export default CommonAccordion;
