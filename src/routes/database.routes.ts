import { PrismaClient } from '@prisma/client';
import express from 'express';

const databaseRouter = express.Router();

const prisma = new PrismaClient()

databaseRouter.get("/students/:className", async (req, res) => {
    const className = req.params.className;

    const students = await prisma.student.findMany({
        where: {
            class: className
        },
        select: {
            moodleId: true,
            lastValidTestId: true,
        }
    })

    res.send(students);
})

module.exports = databaseRouter;