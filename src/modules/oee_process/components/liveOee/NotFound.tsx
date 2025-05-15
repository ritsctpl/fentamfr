import { Result } from 'antd';

const NotFound = () => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "start",
            width:'100%',
            height: "100vh",  // Ensure it takes the full viewport height to center vertically
        }}>
            <Result
                status="404"
                title="No Record Found"
                subTitle="We couldn't find any records matching your criteria."
            />
        </div>
    );
}

export default NotFound;
