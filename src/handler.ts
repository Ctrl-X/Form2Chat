import {collectAnswer, askQuestion} from "./utils/bedrockUtils"
import {json} from "node:stream/consumers";

interface Field {
    field: string;
    type: string;
    value: any;
    description: string;
}


const handler = async function (event: any, context: any) {
    let statusCode = 400
    let bodyResult = null

    console.log("Model",process.env.MODEL_ID)

    try {
        let method = event.httpMethod
        console.log("method", method)
        if (method != "POST" || event.path !== "/") {
            // We only accept POST
            bodyResult = "We only accept POST /"
        } else {
            // parse the base64 from the API Gateway
            const body = event.body
            const jsonBody = JSON.parse(body);


            const {formInfo, answer, question} = jsonBody
            const {formName, formDescription, fields} = formInfo


            if (answer) {
                // There is an answer from the user, we need to parse and store it in the <field> array
                const collectAnswerResult = await collectAnswer(fields, question, answer)
                if (collectAnswerResult.statusCode != 200) {
                    return collectAnswerResult // return the error as is
                } else {
                    const {updatedFields} = collectAnswerResult

                    if (updatedFields) {
                        // We merge the answers with the existing form
                        bodyResult = {
                            updatedFields
                        }
                    }
                }
            }

            // Removing fields that already have a value
            const missing_fields = fields.filter((field: Field) => !field.value)


            const askQuestionResult = await askQuestion(missing_fields, answer, question, formName, formDescription)
            if (askQuestionResult.statusCode != 200) {
                return askQuestionResult // return the error as is
            } else {
                statusCode = 200
                const {nextQuestion} = askQuestionResult
                bodyResult = {
                    ...bodyResult,
                    nextQuestion
                }
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            bodyResult = error.stack
        } else {
            bodyResult = error
        }
    }

    console.log("bodyResult",bodyResult)
    const result = {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyResult),
    }
    // console.log("final result", result)
    return result
}

export {handler}
