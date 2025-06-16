"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(data) {
        this._id = data._id || '';
        this.username = data.username || '';
        this.password = data.password || '';
        this.wins = data.wins || 0;
        this.gamesPlayed = data.gamesPlayed || 0;
        this.balance = data.balance || 1000;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
    async comparePassword(candidatePassword) {
        return this.password === candidatePassword;
    }
}
exports.User = User;
