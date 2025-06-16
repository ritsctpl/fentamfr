import { TextHead } from "./TextHead";

interface StatusData {
    id: string;
    value: string;
}

interface StatusSectionProps {
    data: StatusData[];
}

export const StatusSection = ({ data }: StatusSectionProps) => {
    return (
        <div style={{
            width: '100%',
            height: '13%',
            display: 'flex',
            gap: '0px',
            padding: '16px',
            borderBottom: '1px solid #e6e6e6',
            boxSizing: 'border-box',
        }}>
            {data.map((item) => (
                <div key={item.id} style={{
                    width: '100%',
                    height: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}>
                    <TextHead text={item.id} textColor="#555" fontSize="16px" fontWeight="600" />
                    <TextHead text={item.value} textColor="#666666" fontSize="16px" fontWeight="400" />
                </div>
            ))}
        </div>
    );
} 