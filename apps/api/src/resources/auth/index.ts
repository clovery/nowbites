import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WechatLoginRequest, WechatLoginResponse, UserInfo } from '../../models/user.js';
import { createWechatAPI } from '../../utils/wechat.js';

// 微信登录控制器
export const wechatLogin = async (request: FastifyRequest<{ Body: WechatLoginRequest }>, reply: FastifyReply) => {
  try {
    const { code, userInfo } = request.body;
    
    if (!code) {
      return reply.code(400).send({ error: 'Missing code parameter' });
    }
    
    try {
      // 使用微信API工具类获取openid和session_key
      const wechatAPI = createWechatAPI();
      const response = await wechatAPI.code2Session(code);
      
      const { openid, session_key, errcode, errmsg } = response;
      
      if (errcode) {
        request.log.error(`WeChat API error: ${errcode} - ${errmsg}`);
        return reply.code(400).send({ error: `WeChat login failed: ${errmsg}` });
      }
      
      // 创建用户信息对象
      const userInfoData: UserInfo = {
        openid,
        ...userInfo
      };
      
      // 生成JWT令牌
      const token = await reply.jwtSign({
        openid,
        nickName: userInfo?.nickName
      }, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
      
      // 返回令牌和用户信息
      return reply.code(200).send({
        token,
        userInfo: userInfoData
      });
    } catch (error) {
      request.log.error('WeChat API error:', error);
      return reply.code(500).send({ error: 'Failed to connect to WeChat API' });
    }
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// 路由注册函数
export default async function authRoutes(fastify: FastifyInstance) {
  // 微信小程序登录
  fastify.post<{ Body: WechatLoginRequest }>(
    '/wechat-login',
    {
      schema: {
        description: 'WeChat Mini Program login',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string', description: 'WeChat login code' },
            userInfo: {
              type: 'object',
              properties: {
                nickName: { type: 'string' },
                avatarUrl: { type: 'string' },
                gender: { type: 'number' },
                country: { type: 'string' },
                province: { type: 'string' },
                city: { type: 'string' },
                language: { type: 'string' }
              }
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              userInfo: {
                type: 'object',
                properties: {
                  openid: { type: 'string' },
                  nickName: { type: 'string' },
                  avatarUrl: { type: 'string' },
                  gender: { type: 'number' },
                  country: { type: 'string' },
                  province: { type: 'string' },
                  city: { type: 'string' },
                  language: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    wechatLogin
  );

  // 验证令牌
  fastify.get(
    '/verify',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Verify JWT token',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  openid: { type: 'string' },
                  nickName: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return { user: request.user };
    }
  );
}