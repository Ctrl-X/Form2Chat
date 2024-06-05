import React, { useState } from 'react';
import { Layout, Row, Col } from 'antd';
import CenterColumn from './components/CenterColumn'; // Import the new CenterColumn component
import LeftColumn from './components/LeftColumn'; // Updated path
import CodePreviewComponent from './components/CodePreviewComponent'; // Updated path
import './App.css';

const { Sider, Content } = Layout;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [responseData, setResponseData] = useState({});

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const displayForm = collapsed ? "none": ""

    return (
        <Layout style={{ height: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={toggleCollapsed}
                width={400}
                style={{ backgroundColor: '#673ab7', overflow: 'auto' }} // Set the background color, width, and make it scrollable
            >
                <div style={{ margin: '16px',display:displayForm }}><LeftColumn /></div>
            </Sider>
            <Layout>
                <Content>
                    <Row gutter={16} style={{ height: '100%' }}>
                        {/* Center Column */}
                        <Col span={12} style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CenterColumn
                                apigateway="https://0h38olkxxc.execute-api.us-west-2.amazonaws.com/beta/"
                                // apigateway="http://127.0.0.1:3000/"
                                responseData={responseData}
                                setResponseData={setResponseData}
                            />

                        </Col>

                        {/* Right Column */}
                        <Col span={12}>
                            <CodePreviewComponent code={responseData} />
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
