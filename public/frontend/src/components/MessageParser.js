class MessageParser {
    constructor(actionProvider) {
        this.actionProvider = actionProvider;
    }

    parse(message) {
        debugger
        const lowerCaseMessage = message.toLowerCase();


        if (lowerCaseMessage.includes("javascript")) {
            this.actionProvider.handleJavascriptList();
        }
    }
}

export default MessageParser;
