export interface IUser {
    _id: string;
    username: string;
    password: string;
    wins: number;
    gamesPlayed: number;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export class User implements IUser {
    _id: string;
    username: string;
    password: string;
    wins: number;
    gamesPlayed: number;
    balance: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<IUser>) {
        this._id = data._id || '';
        this.username = data.username || '';
        this.password = data.password || '';
        this.wins = data.wins || 0;
        this.gamesPlayed = data.gamesPlayed || 0;
        this.balance = data.balance || 1000;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return this.password === candidatePassword;
    }
} 