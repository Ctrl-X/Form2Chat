import React, {useState, useEffect} from 'react';
import {Dropdown, Button, Card, Input, Form, Menu, Modal, Row, Col,Space} from 'antd';
import {PlusOutlined, CaretDownOutlined} from '@ant-design/icons';

const {Item} = Form;
const {TextArea} = Input;

const LeftColumn = () => {
    const [formFields, setFormFields] = useState([]);
    const [dropdownItems, setDropdownItems] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFormName, setNewFormName] = useState('');
    const [selectedFormName, setSelectedFormName] = useState(null);
    const [formDescription, setFormDescription] = useState('');

    // Load initial state from local storage
    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem('dropdownItems')) || [];
        setDropdownItems(storedItems);
    }, []);

    useEffect(() => {
        if (!selectedFormName && dropdownItems.length > 0) {
            // No selectedFormName yet : Load it
            const currentFormName = localStorage.getItem('currentFormName') || '';
            handleSelectChange(currentFormName);
        }
    }, [dropdownItems]);


    const handleAddForm = () => {
        const updatedFormFields = [...formFields, {field: '', type: '', description: ''}];
        setFormFields(updatedFormFields);
        updateLocalStorage(selectedFormName, updatedFormFields, formDescription);
    };

    const handleFormChange = (index, field, value) => {
        const updatedFormFields = [...formFields];
        updatedFormFields[index][field] = value;
        setFormFields(updatedFormFields);
        updateLocalStorage(selectedFormName, updatedFormFields, formDescription);
    };

    const handleAddDropdownItem = () => {
        const newItem = {formName: newFormName, fields: [], formDescription: ''}; // Updated line
        const updatedItems = [...dropdownItems, newItem];
        setDropdownItems(updatedItems);
        setSelectedFormName(newFormName);
        setFormFields(newItem.fields);
        setFormDescription('');
        setIsModalVisible(false);
        setNewFormName('');
        localStorage.setItem('dropdownItems', JSON.stringify(updatedItems));
        window.dispatchEvent(new Event('storage'));
    };

    const handleSelectChange = (formName) => {
        setSelectedFormName(formName);
        const selectedItem = dropdownItems.find(item => item.formName === formName);
        if (selectedItem) {

            setFormFields(selectedItem.fields);
            setFormDescription(selectedItem.formDescription || '');
            localStorage.setItem('currentFormName', formName);
            window.dispatchEvent(new Event('storage'));
        }
    };

    const updateLocalStorage = (formName, updatedFormFields, updatedFormDescription) => {
        if (formName) {
            const updatedItems = dropdownItems.map(item =>
                item.formName === formName ? {...item, fields: updatedFormFields, formDescription: updatedFormDescription} : item
            );
            setDropdownItems(updatedItems);
            localStorage.setItem('currentFormName', formName);
            localStorage.setItem('dropdownItems', JSON.stringify(updatedItems));
            window.dispatchEvent(new Event('storage'));
        }
    };

    const items = dropdownItems.map((item, index) => ({
        key: index,
        label: (
            <a onClick={() => handleSelectChange(item.formName)}>
                {item.formName}
            </a>
        ),
    }));


    return (
        <Form layout="horizontal" size="small" style={{margin: 32}}>
            <Item>
                <Space>
                    <Dropdown menu={{items}}>
                        <Button style={{width:"200px",display:"flex",justifyContent:"space-between", alignItems:"center"}}>{selectedFormName || 'Select an Form'}
                            <CaretDownOutlined/>
                        </Button>
                    </Dropdown>
                    <Button>

                        <PlusOutlined onClick={() => setIsModalVisible(true)}/>
                    </Button>
                </Space>
            </Item>
            {selectedFormName && (
                <>
                    <Item>
                        <TextArea
                            placeholder="Enter form description"
                            value={formDescription}
                            onChange={(e) => {
                                setFormDescription(e.target.value);
                                updateLocalStorage(selectedFormName, formFields, e.target.value);
                            }}
                            autoSize={{minRows: 3, maxRows: 5}} // Make the formDescription field multiline
                        />
                    </Item>
                    {formFields.map((form, index) => (
                        <Card key={index} style={{marginBottom: 16, backgroundColor: '#e7dafc'}}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Item label="Field">
                                        <Input
                                            placeholder="Enter field"
                                            value={form.field}
                                            onChange={(e) => handleFormChange(index, 'field', e.target.value)}
                                            style={{width: '100%'}} // Set the width of the field input field
                                        />
                                    </Item>
                                </Col>
                                <Col span={12}>
                                    <Item label="Type">
                                        <Input
                                            placeholder="string, number or {json structure}"
                                            value={form.type}
                                            onChange={(e) => handleFormChange(index, 'type', e.target.value)}
                                            style={{width: '100%'}} // Set the width of the type input field
                                        />
                                    </Item>
                                </Col>
                            </Row>
                            <Item label="Description">
                                <TextArea
                                    placeholder="Enter description"
                                    value={form.description}
                                    onChange={(e) => handleFormChange(index, 'description', e.target.value)}
                                    autoSize={{minRows: 3, maxRows: 5}} // Make the description field multiline
                                />
                            </Item>
                        </Card>
                    ))}
                    <Button type="dashed" onClick={handleAddForm} style={{width: '100%', marginBottom: 150}}>
                        <PlusOutlined/> Add another Data point
                    </Button>
                </>
            )}

            {/* Modal for adding new dropdown item */}
            <Modal
                title="Add a new Form"
                open={isModalVisible}
                onOk={handleAddDropdownItem}
                onCancel={() => setIsModalVisible(false)}
            >
                <Input
                    placeholder="Enter Form name"
                    value={newFormName}
                    onChange={(e) => setNewFormName(e.target.value)}
                />
            </Modal>
        </Form>
    );
};

export default LeftColumn;
