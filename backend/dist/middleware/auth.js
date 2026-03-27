"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const firebase_1 = require("../firebase");
async function verifyToken(request, reply) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Unauthorized: missing token' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        const decoded = await firebase_1.auth.verifyIdToken(token);
        request.uid = decoded.uid;
    }
    catch {
        return reply.code(401).send({ error: 'Unauthorized: invalid token' });
    }
}
