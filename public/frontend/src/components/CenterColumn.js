import React, {useState, useEffect} from 'react';
import {Button, Result,Space} from 'antd';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';


import {createChatBotMessage} from 'react-chatbot-kit';

const chatConfig = {
    botName: "v3Stent AI",
    initialMessages: [],
    customStyles: {
        botMessageBox: {
            backgroundColor: "#8561c5",
        },
        chatButton: {
            backgroundColor: "#423062",
        },
    },
};

const CenterColumn = ({apigateway, setResponseData, responseData}) => {
    const [currentFormName, setCurrentFormName] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [started, setStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [botLastSentence, setBotLastSentence] = useState(null);

    useEffect(() => {
        // Retrieve the value of the "currentFormName" key from storage when the component mounts
        const formName = localStorage.getItem('currentFormName');
        setCurrentFormName(formName);

        // Add an event listener to listen for changes in local storage
        const handleStorageChange = () => {
            const updatedFormName = localStorage.getItem('currentFormName');
            setCurrentFormName(updatedFormName);
            console.log("setStarted", false)
            setStarted(false)
        };

        window.addEventListener('storage', handleStorageChange);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    const handleStartClick = async () => {
        const dropdownItems = JSON.parse(localStorage.getItem('dropdownItems')) || [];
        const item = dropdownItems.find(item => item.formName === currentFormName);
        setSelectedItem(item);
        setStarted(false)
        setIsComplete(false)
        setResponseData({})
        // the selectedItem has changed :
        loadFromEndpoint(null, null, item).then(sentence => {
            if (sentence) {
                const message = createChatBotMessage(sentence)
                chatConfig.initialMessages = [message]
                setStarted(true)
            }
        })
    };

    const updateResponseData = (updatedFields) => {
        // "updatedFields" have this structure : [
        //         {
        //             "field": "origin",
        //             "value": "France"
        //         }
        //     ]
        const updatedData = {...responseData, updatedFields}


        // We need to remove fields that are in updatedFields from the fields inside selectedItem
        // Create a copy of the current selectedItem
        const updatedSelectedItem = {...selectedItem};
        const {fields} = updatedSelectedItem

        // Remove the fields in updatedFields from the selectedItem
        updatedFields.forEach(updatedField => {
            console.log("field", updatedField.field)
            const selectedItem = fields.find(field => field.field === updatedField.field);
            if (selectedItem && updatedField.value !== null && updatedField.value !== 'null') {
                selectedItem.value = updatedField.value
            }
        });
        setSelectedItem(updatedSelectedItem);
        setResponseData(updatedSelectedItem)

        // Test if every fields have a value
        const isFormComplete = fields.every(field => field.value !== undefined && field.value !== null && field.value !== '')
        console.log("updatedSelectedItem", updatedSelectedItem)
        setIsComplete(isFormComplete)

    }

    const loadFromEndpoint = async (question, answer, formInfo) => {
        const body = {
            "question": question || null,
            "answer": answer || null,
            "formInfo": formInfo
        }
        setIsLoading(true)

        try {
            const response = await fetch(apigateway, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data) {
                const {updatedFields, nextQuestion} = data
                const {next_question, target_fields} = nextQuestion
                if (updatedFields) {
                    updateResponseData(updatedFields)
                }
                setBotLastSentence(next_question)

                setIsLoading(false)

                return next_question
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    const ActionProvider = ({createChatBotMessage, setState, children}) => {
        const handleAnswer = (nextQuestion) => {
            const botMessage = createChatBotMessage(nextQuestion);

            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, botMessage],
            }));
        };

        // Put the handleHello function in the actions object to pass to the MessageParser
        return (
            <div>
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, {
                        actions: {
                            handleAnswer,
                        },
                    });
                })}
            </div>
        );
    };
    const MessageParser = ({children, actions}) => {
        const parse = (message) => {
            // const lastQuestion = getLastQuestion()
            console.log("botLastSentence", botLastSentence)
            console.log("selectedItem", selectedItem)
            console.log("message", message)
            loadFromEndpoint(botLastSentence, message, selectedItem).then(nextQuestion => {
                    actions.handleAnswer(nextQuestion);
                }
            )
        };
        return (
            <div>
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, {
                        parse: parse,
                        actions: {},
                    });
                })}
            </div>
        );
    };

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',marginTop:40}}>



                <Button onClick={handleStartClick} style={{marginBottom: '16px'}}>
                    Start with {currentFormName}
                </Button>

                {started &&
                    <Chatbot
                        config={chatConfig}
                        messageParser={MessageParser}
                        actionProvider={ActionProvider}
                    />
                }

                {isComplete &&
                    <Result
                        status="success"
                        title="Successfully Gathered all informations!"
                        extra={[
                            <Button onClick={handleStartClick} type="primary" key="console">
                                Restart a new conversation
                            </Button>
                        ]}
                    />
                }



        </div>
    );
};

export default CenterColumn;
