import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../firebase';

// Attaches decoded uid to the request object for use in controllers
declare module 'fastify' {
  interface FastifyRequest {
    uid?: string;
    userEmail?: string;
  }
}

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Unauthorized: missing token' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await auth.verifyIdToken(token);
    request.uid = decoded.uid;
    request.userEmail = decoded.email;
  } catch {
    return reply.code(401).send({ error: 'Unauthorized: invalid token' });
  }
}
