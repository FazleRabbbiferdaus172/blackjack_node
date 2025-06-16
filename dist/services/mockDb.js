"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            if (query._id && user._id === query._id) {
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
        // Apply limit
        return results.slice(0, limit);
    }
    async create(userData) {
        const id = this.nextId.toString();
        this.nextId++;
        const user = {
            _id: id,
            username: userData.username,
            password: userData.password,
            wins: userData.wins || 0,
            gamesPlayed: userData.gamesPlayed || 0,
            balance: userData.balance || 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            comparePassword: async (candidatePassword) => {
                return userData.password === candidatePassword;
            }
        };
        this.users.set(id, user);
        return user;
    }
    async findByIdAndUpdate(id, update) {
        const user = this.users.get(id);
        if (!user)
            return null;
        const updatedUser = {
            ...user,
            ...update,
            updatedAt: new Date()
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
}
// Create a singleton instance
const mockDb = new MockDb();
exports.default = mockDb;
