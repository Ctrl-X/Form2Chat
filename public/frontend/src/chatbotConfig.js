import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
    botName: "v3Stent AI",
    initialMessages: [createChatBotMessage("Hi, I'm here to help. What do you want to learn?")],
    customStyles: {
        botMessageBox: {
            backgroundColor: "#8561c5",
        },
        chatButton: {
            backgroundColor: "#423062",
        },
    },
};

export default config;
