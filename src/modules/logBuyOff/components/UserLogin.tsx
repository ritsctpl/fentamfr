import React, { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { LogBuyOffContext } from '../hooks/logBuyOffContext';
import { useTranslation } from 'react-i18next';
import { parseCookies } from 'nookies';
import { validateUser } from '@/app/api/auth/keycloakCredentials';
import axios from 'axios';
import { getKeycloakInstance } from '@/keycloak';
import { headers } from 'next/headers';


const UserLogin: React.FC = () => {

    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const { showUserLogin, setShowUserLogin, reloadBuyOffList, setReloadBuyOffList, reloadBuyOff, setReloadBuyOff } = useContext(LogBuyOffContext);

    useEffect(() => {
        setModalVisible(showUserLogin);
    }, [showUserLogin]);



    const handleOk = async () => {
        message.destroy();
        try {
            const cookies = parseCookies();
            const site = cookies.site;
            if (form.getFieldValue('userId') == undefined || form.getFieldValue('userId') == "" || form.getFieldValue('userId') == null) {
                message.error("Username cannot be empty");
                return;
            }
            if (form.getFieldValue('password') == undefined || form.getFieldValue('password') == "" || form.getFieldValue('password') == null) {
                message.error("Password cannot be empty");
                return;
            }

            const request = {
                data: {
                    user: form.getFieldValue('userId'),
                }
            };
            console.log("User Login Request", request);



            try {
                // const uservalidateResponse = await validateUser(request);
                // console.log("User Login Response", uservalidateResponse);
                debugger
                // if (uservalidateResponse && uservalidateResponse?.length > 0) {

                    try {

                        const keyCloak = await getKeycloakInstance();

                        const baseUrl = keyCloak.authServerUrl;
                        const realm = keyCloak.realm;
                        const clientId = keyCloak.clientId;

                        try {
                            const response = await axios.post(
                                `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
                                {
                                    'client_id': clientId,
                                    // 'realm': realm,
                                    'grant_type': 'password',
                                    'username': form.getFieldValue('userId'),
                                    'password': form.getFieldValue('password'),
                                },
                                {
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                }
                            );

                            if (response?.status == 200) {
                                const responseData = response.data;
                                setShowUserLogin(false);
                                form.resetFields();
                                message.success("Login Successfully");
                                setReloadBuyOffList(reloadBuyOffList + 1);
                                setReloadBuyOff(true);
                                return responseData;
                            } else {
                                setReloadBuyOff(false);
                                console.error('Authentication failed: ${response.data}');
                            }
                        }
                        catch (error) {
                            message.error(error?.response?.data?.error_description);
                            setReloadBuyOff(false);
                            console.error('Login failed: ${error}');
                        }


                    } catch (e) {
                        console.error('Login failed: $e');
                        setReloadBuyOff(false);
                    }



                // }
                // else{
                //     message.error("Invalid Username or Password");
                //     setReloadBuyOff(false);
                // }
            }
            catch (error) {
                console.log("User Login Error", error);
            }



        }
        catch (error) {
            console.log(error);
        }
    };

    const handleCancel = () => {
        setShowUserLogin(false);
        setModalVisible(false);
        form.resetFields();
    };



    return (
        <>

            <Modal
                title={t('userAuthentication')}
                open={modalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={t('login')}
                cancelText={t('cancel')}
            >
                <Form
                    form={form}
                    name="userLogin"
                    layout="vertical"
                >
                    <Form.Item
                        label={t('username')}
                        name="userId"
                        rules={[{ required: true, message: 'Please input your username!' }]}

                    >
                        <Input onChange={(e) => { form.setFieldValue('userId', e.target.value); }} />
                    </Form.Item>

                    <Form.Item
                        label={t('password')}
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password onChange={(e) => { form.setFieldValue('password', e.target.value); }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UserLogin;
