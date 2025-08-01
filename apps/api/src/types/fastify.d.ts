import { FastifyRequest } from 'fastify';
import { UserInfo } from '../models/user.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      openid: string;
      nickName?: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}