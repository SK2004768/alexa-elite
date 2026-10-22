const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');

const dynamoDbClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Alexa Elite. How can I help you manage your smart home devices today?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ControlMultipleDevicesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ControlMultipleDevicesIntent';
    },
    async handle(handlerInput) {
        const action = Alexa.getSlotValue(handlerInput.requestEnvelope, 'action');
        const room = Alexa.getSlotValue(handlerInput.requestEnvelope, 'room');
        
        const speakOutput = `Executing ${action} for all devices in the ${room}.`;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask Alexa Elite to control multiple smart home devices simultaneously by specifying the room and action.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`);
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(new ddbAdapter.DynamoDbPersistenceAdapter({
        tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME || 'AlexaEliteState',
        dynamoDbClient: dynamoDbClient
    }))
    .addRequestHandlers(
        LaunchRequestHandler,
        ControlMultipleDevicesIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
