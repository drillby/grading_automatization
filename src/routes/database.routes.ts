import { PrismaClient } from '@prisma/client';
import express from 'express';

const databaseRouter = express.Router();

const prisma = new PrismaClient()

/**
 * @route GET /students/:className
 * @description Vrací seznam studentů z databáze podle třídy
 * @param {string} className Název třídy (např. EP1B)
 * @returns {{moodleId: number,
 *            bakalariId: number,
 *            lastValidTestId: number}[]} 200 - Pole objektů s informacemi o studentech
 */
databaseRouter.get("/students/:className", async (req, res) => {
    const className = req.params.className;

    const students = await prisma.student.findMany({
        where: {
            class: className
        },
        select: {
            moodleId: true,
            bakalariId: true,
            lastValidTestId: true,
        }
    })

    res.send(students);
})

module.exports = databaseRouter;