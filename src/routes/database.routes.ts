import { PrismaClient } from '@prisma/client/edge';
import express from 'express';

const databaseRouter = express.Router();

const prisma = new PrismaClient()



module.exports = databaseRouter;