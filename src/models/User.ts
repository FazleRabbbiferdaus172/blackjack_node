import { DynamoDB, STS } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient({
    region: 'us-east-2'
});

const TABLE_NAME = 'BlackjackUsers';

export interface User {
    userId: string;
    username: string;
    password: string; // Not used with Cognito, but keeping for compatibility
    balance: number;
    gamesPlayed: number;
    gamesWon: number;
    createdAt: string;
    updatedAt: string;
}

export const UserModel = {
    async create(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const timestamp = new Date().toISOString();
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const user: User = {
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

    async findByUsername(username: string): Promise<User | null> {
        const result = await dynamoDB.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            }
        }).promise();

        return result.Items?.[0] as User || null;
    },

    async findById(userId: string): Promise<User | null> {
        const result = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { userId }
        }).promise();

        return result.Item as User || null;
    },

    async updateBalance(userId: string, newBalance: number): Promise<User | null> {
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

        return result.Attributes as User || null;
    },

    async updateStats(userId: string, won: boolean): Promise<User | null> {
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

        return result.Attributes as User || null;
    },

    async getLeaderboard(limit: number = 10): Promise<User[]> {
        const result = await dynamoDB.scan({
            TableName: TABLE_NAME,
            Limit: limit
        }).promise();

        return (result.Items as User[] || [])
            .sort((a, b) => b.gamesWon - a.gamesWon)
            .slice(0, limit);
    }
}; 