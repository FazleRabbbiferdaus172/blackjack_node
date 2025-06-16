"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-2'
});
// Use environment variables
const USER_POOL_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
// Debug logging
console.log('Cognito configuration loaded:');
console.log('COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID ? 'Set' : 'Not set');
console.log('COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID ? 'Set' : 'Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-2');
exports.CognitoService = {
    async signUp(username, password, email) {
        console.log('Attempting to sign up user:', username);
        console.log('Using Client ID:', USER_POOL_CLIENT_ID);
        const command = new client_cognito_identity_provider_1.SignUpCommand({
            ClientId: USER_POOL_CLIENT_ID,
            Username: username,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        });
        try {
            const response = await cognitoClient.send(command);
            return {
                success: true,
                userSub: response.UserSub
            };
        }
        catch (error) {
            console.error('Cognito signup error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    },
    async confirmSignUp(username, code) {
        const command = new client_cognito_identity_provider_1.ConfirmSignUpCommand({
            ClientId: USER_POOL_CLIENT_ID,
            Username: username,
            ConfirmationCode: code
        });
        try {
            await cognitoClient.send(command);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    async signIn(username, password) {
        var _a, _b, _c;
        const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: USER_POOL_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        });
        try {
            const response = await cognitoClient.send(command);
            return {
                success: true,
                tokens: {
                    accessToken: (_a = response.AuthenticationResult) === null || _a === void 0 ? void 0 : _a.AccessToken,
                    idToken: (_b = response.AuthenticationResult) === null || _b === void 0 ? void 0 : _b.IdToken,
                    refreshToken: (_c = response.AuthenticationResult) === null || _c === void 0 ? void 0 : _c.RefreshToken
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    async verifyToken(token) {
        var _a, _b;
        const command = new client_cognito_identity_provider_1.GetUserCommand({
            AccessToken: token
        });
        try {
            const response = await cognitoClient.send(command);
            const userSub = (_b = (_a = response.UserAttributes) === null || _a === void 0 ? void 0 : _a.find(attr => attr.Name === 'sub')) === null || _b === void 0 ? void 0 : _b.Value;
            return {
                success: true,
                user: {
                    userId: userSub,
                    username: response.Username
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};
