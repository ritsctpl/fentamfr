import { getSampleData } from "@services/oeeServices";
import { fetchQueryBuilder } from "@services/queryBuilderService";
import { parseCookies } from 'nookies';

const site = parseCookies()?.site;

async function Checker(record, value) { 
    let data;
    if (record.query != "" && record.query != null) {
        data = await fetchQueryBuilder({ templateName: record.query,site:site});
    } else {
        data = await getSampleData(record.endPoint, null);
    }
   
    if (!data) {
        return ({ isValid: false });
    }
    const validateChartData = () => {
        if (!Array.isArray(data)) return false;
        switch (value.toLowerCase()) {
            case 'pie':
                return data.every(item => {
                    if (typeof item !== 'object' || item === null) return false;
                    const keys = Object.keys(item);
                    const values = Object.values(item);
                    if (keys.length !== 2) return false;
                    return typeof values[0] === 'string' &&
                        typeof values[1] === 'number' &&
                        values.filter(val => typeof val === 'number').length === 1;
                });
            case 'gauge':
                return typeof data === 'number';
            case 'pareto':
                return data.every(item => {
                    if (typeof item !== 'object' || item === null) return false;
                    const keys = Object.keys(item);
                    const values = Object.values(item);
                    if (keys.length < 2 || keys.length > 3) return false;
                    return typeof values[0] === 'string' &&
                        typeof values[1] === 'number' &&
                        (typeof values[2] === 'number' || values.length === 2);
                });
            case 'heatmap':
                return data.every(item => {
                    if (typeof item !== 'object' || item === null) return false;
                    const values = Object.values(item);
                    if (values.length !== 3) return false;
                    return typeof values[0] === 'string' &&
                           typeof values[1] === 'string' &&
                           typeof values[2] === 'number';
                });
            default:
                return true;
        }
    };

    const isValid = validateChartData();
    console.log('Chart validation result:', { data, value, isValid });

    return ({ isValid });
}

export default Checker;