import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocument.from(new DynamoDB());

const TableName = "location-marker";

export const handler = async (event) => {
    let body;
    let statusCode = "200";
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    };

    try {
        switch (event.httpMethod) {
            case 'DELETE':
                const id = JSON.parse(event.body)?.id;
                body = await dynamo.delete({
                    TableName,
                    Key: {
                        id,
                    },
                });
        
                break;
            case 'GET':
                body = await dynamo.scan({ TableName});
                break;
            case 'POST':
                body = await dynamo.put({ TableName, Item:JSON.parse(event.body) });
                break;
            case 'PUT':
                const updateData = JSON.parse(event.body);
                const updateId = updateData.id;
                const updateExpression = "SET #attributeName = :attributeValue";
                const expressionAttributeNames = { "#attributeName": "title" }; // Replace with your attribute name
                const expressionAttributeValues = { ":attributeValue": updateData.title }; // Replace with your attribute value
                body = await dynamo.update({
                    TableName,
                    Key: { id: updateId },
                    UpdateExpression: updateExpression,
                    ExpressionAttributeNames: expressionAttributeNames,
                    ExpressionAttributeValues: expressionAttributeValues,
                });
                
                // body = await dynamo.update({ TableName, Item:JSON.parse(event.body) });
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
