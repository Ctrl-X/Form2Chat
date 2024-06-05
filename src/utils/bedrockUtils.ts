import {BedrockRuntimeClient, InvokeModelCommand} from "@aws-sdk/client-bedrock-runtime"

// Initialize the Bedrock client with your region
const bedrockClient = new BedrockRuntimeClient({region: "us-west-2"})


/**
 * Take the values from a source array and merge it into a second array if it has a new value
 * @param fields : input array
 * @param parsed_answers : array with new values
 */
const mergeArrays = (fields: any[], parsed_answers: any[]) => {
    return fields.map(field => {
        const answer = parsed_answers.find(answer => answer.field === field.field);
        if (answer) {
            return {...field, value: answer.value};
        }
        return field;
    });
};


async function collectAnswer( fields: [],question: string, answer: string) {

    console.log("Model",process.env.MODEL_ID)
    console.log("question",question)
    console.log("answer",answer)
    // Collect the answer and try to match the fields
    const params = {
        modelId: process.env.MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2048,
            temperature: 0,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            "type": "text",
                            "text": "I am providing you with a JSON object that contains all the informations that need to be gather and a description of each field : "
                        },
                        {
                            "type": "text",
                            "text": "<json>" + JSON.stringify(fields) + "</json>"
                        },
                        {
                            "type": "text",
                            "text": "I want you to extract the information from the user answer and update the corresponding \"value\" field of associated field."
                        },
                        {
                            "type": "text",
                            "text": "Here was the question ask to the user : <question>" + question + "</question> and here is the answer he provided : <answer>" + answer + "</answer>. "
                        },
                        {
                            "type": "text",
                            "text": "When you find an answer for the \"value\" field, match the expected \"type\"."
                        },

                        {
                            "type": "text",
                            "text": "Reply with just a JSON Object containing an array of fields with the same JSON structure containing the only the \"field\" and  \"value\" property. Do not include <json> html tag or other properties like \"Description\" but keep the same JSON structure.Do no include fields that have a \"value\" of \"null\", only include fields that have a \"value\" that is NOT \"null\". Do ensure that the JSON object is properly formatted with correct attribute names and values enclosed in double quotes if needed. Skip preambule and answer with the json directly."
                        }
                    ]
                },
            ],
        }),
    }

    // Create the command object
    const command = new InvokeModelCommand(params)

    try {
        // Use the client to send the command
        const response = await bedrockClient.send(command)
        const textDecoder = new TextDecoder("utf-8")
        const response_body = JSON.parse(textDecoder.decode(response.body))
        const parsed_answers = JSON.parse(response_body.content[0].text)
        console.log("parsed_answer", parsed_answers)
        // const updatedFields = mergeArrays(fields, parsed_answers);

        return {
            statusCode: 200,
            updatedFields: parsed_answers
        }
    } catch (err: any) {
        console.error("Error invoking Bedrock:", err)
        return {
            statusCode: 500,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                message: "Failed to collect answers",
                error: err.message,
            }),
        }
    }
}


async function askQuestion(fields: [], previous_answer: string,question:string, formName: string, formDescription: string) {

    let intro_context = ""
    if (previous_answer === null) {
        intro_context = "Threat this is as the beginning of your discussion and start with a casual introduction in the \"next_question\" response field."
    } else {
        intro_context = "This is not the beginning of your conversation, here is the previous answer : <answer>" + previous_answer + "</answer> about this <question>"+question+"</question>. You may include the last information OR NOT in your \"next_question\" response field as a short aknowledgment and ligature"
    }

    let messages = []

    if(fields.length === 0){
        // Every Fields have been answered : End the conversation
        messages = [
            {
                role: "user",
                content: [
                    {
                        "type": "text",
                        "text": "Act as an expert at interviewing people for " + formName +
                            ". Use all the best practices about recruitment and inclusiveness." +
                            "Here is the description of the purpose of the form : '" + formDescription + "'. All questions have been answered and the interview is completed. "
                    },{
                        "type": "text",
                        "text": "Generate a JSON object containing the following attributes: \"next_question\"."
                    },
                    {
                        "type": "text",
                        "text": "The \"next_question\" attribute should contain a cordial and friendly closing of the interview, thanking the user for their time, for example."
                    }]
            }]
    }else{
        messages = [
            {
                role: "user",
                content: [
                    {
                        "type": "text",
                        "text": "Act as an expert at interviewing people for " + formName +
                            ". Use all the best practices about recruitment and inclusiveness." +
                            "Here is the description of the purpose of the form : '" + formDescription + "'."
                    },
                    {
                        "type": "text",
                        "text": "I am providing you with a JSON object that contains all the information that need to be gather and a description of each field : "
                    },
                    {
                        "type": "text",
                        "text": "<json>" + JSON.stringify(fields) + "</json>"
                    },
                    {
                        "type": "text",
                        "text": "Generate a JSON object containing the following attributes: \"next_question\", \"target_fields\"."
                    },
                    {
                        "type": "text",
                        "text": "The \"next_question\" should be a concise phrase of no more than 30 words that ask a question that could help to get answer for fields that have null values.Prefer asking one topic at a time. Only group multiple fields into one question that are from the same topic (like firstname and lastname, or city and country)."
                    },
                    {
                        "type": "text",
                        "text": intro_context
                    },
                    {
                        "type": "text",
                        "text": "The \"target_fields\" should be an array of the field we try to get a value for."
                    },
                    {
                        "type": "text",
                        "text": "Ensure that the JSON object is properly formatted with correct attribute names and values enclosed in double quotes if needed.Skip preambule and answer with the json directly."
                    }
                ]
            },
        ]
    }

    // prepare Claude 3 prompt
    const params = {
        modelId: process.env.MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2048,
            temperature: 0,
            messages
        }),
    }

    // Create the command object
    const command = new InvokeModelCommand(params)

    try {
        // Use the client to send the command
        const response = await bedrockClient.send(command)
        const textDecoder = new TextDecoder("utf-8")
        const response_body = JSON.parse(textDecoder.decode(response.body))
        const nextQuestion = JSON.parse(response_body.content[0].text)
        return {
            statusCode: 200,
            nextQuestion
        }
    } catch (err: any) {
        console.error("Error invoking Bedrock:", err)
        return {
            statusCode: 500,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                message: "Failed to generate the question",
                error: err.message,
            }),
        }
    }
}

export {collectAnswer, askQuestion}
