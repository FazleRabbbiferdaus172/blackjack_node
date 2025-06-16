"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const aws_sdk_1 = require("aws-sdk");
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient({
    region: 'us-east-2'
});
const TABLE_NAME = 'BlackjackUsers';
exports.UserModel = {
    async create(userData) {
        const timestamp = new Date().toISOString();
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = {
            ...userData,
            userId,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: user
        }).promise();
        return user;
    },
    async findByUsername(username) {
        var _a;
        const result = await dynamoDB.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            }
        }).promise();
        return ((_a = result.Items) === null || _a === void 0 ? void 0 : _a[0]) || null;
    },
    async findById(userId) {
        const result = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { userId }
        }).promise();
        return result.Item || null;
    },
    async updateBalance(userId, newBalance) {
        const timestamp = new Date().toISOString();
        const result = await dynamoDB.update({
            TableName: TABLE_NAME,
            Key: { userId },
            UpdateExpression: 'SET balance = :balance, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':balance': newBalance,
                ':updatedAt': timestamp
            },
            ReturnValues: 'ALL_NEW'
        }).promise();
        return result.Attributes || null;
    },
    async updateStats(userId, won) {
        const timestamp = new Date().toISOString();
        const result = await dynamoDB.update({
            TableName: TABLE_NAME,
            Key: { userId },
            UpdateExpression: 'SET gamesPlayed = gamesPlayed + :inc, gamesWon = gamesWon + :wonInc, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':inc': 1,
                ':wonInc': won ? 1 : 0,
                ':updatedAt': timestamp
            },
            ReturnValues: 'ALL_NEW'
        }).promise();
        return result.Attributes || null;
    },
    async getLeaderboard(limit = 10) {
        const result = await dynamoDB.scan({
            TableName: TABLE_NAME,
            Limit: limit
        }).promise();
        return (result.Items || [])
            .sort((a, b) => b.gamesWon - a.gamesWon)
            .slice(0, limit);
    }
};
