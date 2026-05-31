// src/prisma/prisma.js
import "dotenv/config"; // 确保最先加载环境变量
import pkgClient from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg"; // ✨ 改为直接使用命名导入

const { PrismaClient } = pkgClient;
const { Pool } = pg;

// 1. 创建 pg 连接池
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// 2. 包装为 Prisma 适配器
const adapter = new PrismaPg(pool);

// 3. 实例化客户端
export const prisma = new PrismaClient({ adapter });
export default prisma;
