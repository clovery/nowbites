import { fastify } from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// 导入路由和插件
import authRoutes from './resources/auth/index.js';
import recipeRoutes from './resources/recipe/index.js';
import mealPlanRoutes from './resources/meal-plan/index.js';
import authPlugin from './plugins/auth.js';
import prismaPlugin from './plugins/prisma.js';

// 加载环境变量
dotenv.config();

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// 注册插件
async function registerPlugins() {
  // CORS
  await server.register(cors, {
    origin: true, // 在生产环境中应该限制为特定域名
  });

  // JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'development_secret',
  });
  
  // 注册认证中间件
  await server.register(authPlugin);

  // 注册Prisma插件
  await server.register(prismaPlugin);

  // Swagger 文档
  await server.register(swagger, {
    swagger: {
      info: {
        title: 'NowBites API',
        description: 'NowBites API documentation',
        version: '1.0.0',
      },
      host: `${process.env.HOST || 'localhost'}:${process.env.PORT || 3100}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/documentation',
  });
}

// 注册路由
async function registerRoutes() {
  server.get('/', (req, res) => {
    res.send('NowBites API');
  });
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(recipeRoutes, { prefix: '/api/recipes' });
  server.register(mealPlanRoutes, { prefix: '/api/meal-plans' });
}

// 启动服务器
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = parseInt(process.env.PORT || '3100', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`Server is running at http://${host}:${port}`);
    console.log(`API documentation available at http://${host}:${port}/documentation`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();