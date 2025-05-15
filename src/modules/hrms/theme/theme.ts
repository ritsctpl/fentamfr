import { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#ffffff',
    colorText: '#000000',
    colorBgLayout: '#f0f2f5',
    colorBorder: '#d9d9d9',
    colorTextSecondary: '#666666',
  },
  components: {
    Layout: {
      bodyBg: '#ffffff',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Card: {
      colorBgContainer: '#ffffff',
    },
    Table: {
      colorBgContainer: '#ffffff',
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#141414',
    colorText: '#ffffff',
    colorBgLayout: '#000000',
    colorBorder: '#303030',
    colorTextSecondary: '#999999',
  },
  components: {
    Layout: {
      bodyBg: '#141414',
      headerBg: '#1f1f1f',
      siderBg: '#1f1f1f',
    },
    Card: {
      colorBgContainer: '#1f1f1f',
    },
    Table: {
      colorBgContainer: '#1f1f1f',
    },
  },
};
