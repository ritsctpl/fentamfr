import React from 'react';
import { Button, Tag, Badge } from "antd";
import { TextHead } from "./TextHead";
import { Message } from "@mui/icons-material";
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';
import { FaReadme } from "react-icons/fa6";
interface HeaderProps {
    OnClickMessage: () => void;
    count: number;
    onClickMessage: boolean;
}

export const Header: React.FC<HeaderProps> = ({ OnClickMessage, count, onClickMessage }) => {
    return (
        <div style={{
            width: '100%',
            height: '8%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            boxSizing: 'border-box',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
            }}>
                <TextHead text="MFR-Doc-001" textColor="black" fontSize="20px" fontWeight="bold" />
                <Tag color="green">
                    <TextHead text="Completed" textColor="black" fontSize="12px" fontWeight="500" />
                </Tag>
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
            }}>
                <Badge count={count} size="small">
                    {!onClickMessage && <Message
                        style={{
                            fontSize: '24px',
                            color: '#666',
                            cursor: 'pointer',
                        }}
                        onClick={OnClickMessage}
                    />}
                    {onClickMessage && <SpeakerNotesOffIcon style={{
                        fontSize: '24px',
                        color: '#666',
                        cursor: 'pointer'
                    }}
                        onClick={OnClickMessage}
                    />}
                </Badge>
                <Button
                    icon={<FaReadme size={16} style={{ color: 'white'}} />}
                    style={{
                        backgroundColor: '#009936',
                        color: 'white',
                        fontSize: '14px',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '8px 16px',
                    }}
                >
                    Start Review
                </Button>
            </div>
        </div>
    );
} 