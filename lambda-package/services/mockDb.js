"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDb = void 0;
class MockDb {
    constructor() {
        this.users = new Map();
        this.nextId = 1;
    }
    async findOne(query) {
        for (const user of this.users.values()) {
            if (query.username && user.username === query.username) {
                return user;
            }
        }
        return null;
    }
    async find(query = {}, sort = {}, limit = 10) {
        let results = Array.from(this.users.values());
        // Apply filters
        if (query.username) {
            results = results.filter(user => user.username === query.username);
        }
        // Apply sorting
        const sortKey = Object.keys(sort)[0];
        if (sortKey) {
            results.sort((a, b) => {
                const aValue = a[sortKey];
                const bValue = b[sortKey];
                return sort[sortKey] * (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
            });
        }
        return results.slice(0, limit);
    }
    async create(userData) {
        const timestamp = new Date().toISOString();
        const userId = `user_${this.nextId}`;
        this.nextId++;
        const user = {
            userId,
            username: userData.username,
            password: userData.password,
            balance: userData.balance || 1000,
            gamesPlayed: 0,
            gamesWon: 0,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        this.users.set(userId, user);
        return user;
    }
    async findByIdAndUpdate(id, update) {
        const user = this.users.get(id);
        if (!user)
            return null;
        const updatedUser = {
            ...user,
            ...update,
            updatedAt: new Date().toISOString()
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
}
exports.mockDb = new MockDb();
