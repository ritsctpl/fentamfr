import React from "react"
import styles from './CommonFooter.module.css'
interface FooterProps{
    logo:any
}

const Footer: React.FC<FooterProps> = ({logo}) => {

    return (
        <div className={styles.footer}>
            <img src={logo.src} alt="Fenta Logo" style={{ width: '110px', height: '40px' }} />
            <div style={{ color: 'gray' }}>&copy; {new Date().getFullYear()} Fenta Powered by Rits | All Rights Reserved</div>
        </div>
    )

}

export default Footer