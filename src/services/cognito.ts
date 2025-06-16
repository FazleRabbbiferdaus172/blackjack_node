import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, ConfirmSignUpCommand, GetUserCommand, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-2'
});

// Use environment variables
const USER_POOL_CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;

// Debug logging
console.log('Cognito configuration loaded:');
console.log('COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID ? 'Set' : 'Not set');
console.log('COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID ? 'Set' : 'Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-2');

export const CognitoService = {
    async signUp(username: string, password: string, email: string) {
        console.log('Attempting to sign up user:', username);
        console.log('Using Client ID:', USER_POOL_CLIENT_ID);

        const command = new SignUpCommand({
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
        } catch (error: any) {
            console.error('Cognito signup error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async confirmSignUp(username: string, code: string) {
        const command = new ConfirmSignUpCommand({
            ClientId: USER_POOL_CLIENT_ID,
            Username: username,
            ConfirmationCode: code
        });

        try {
            await cognitoClient.send(command);
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    async adminConfirmSignUp(username: string) {
        const command = new AdminConfirmSignUpCommand({
            UserPoolId: USER_POOL_ID,
            Username: username
        });

        try {
            await cognitoClient.send(command);
            console.log('User auto-confirmed:', username);
            return { success: true };
        } catch (error: any) {
            console.error('Admin confirm error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async signIn(username: string, password: string) {
        const command = new InitiateAuthCommand({
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
                    accessToken: response.AuthenticationResult?.AccessToken,
                    idToken: response.AuthenticationResult?.IdToken,
                    refreshToken: response.AuthenticationResult?.RefreshToken
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    async verifyToken(token: string) {
        const command = new GetUserCommand({
            AccessToken: token
        });

        try {
            const response = await cognitoClient.send(command);
            const userSub = response.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;
            return {
                success: true,
                user: {
                    userId: userSub,
                    username: response.Username
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}; 