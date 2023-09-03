import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import express from 'express';
import { MoodleStudent } from '../types/moodle';
import { getStudentsByClass } from '../utils/bakalari/students';

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

    prisma.$disconnect();

    res.send(students);
})

/**
 * @route POST /index
 * @description Indexuje studenty z moodle do databáze
 * @param {string} courseId Id kurzu na moodle
 * @param {string} className Název třídy (např. EP1B)
 * @returns {object} 200 - Objekt s informací o stavu indexace
*/
databaseRouter.post("/index", async (req: express.Request, res: express.Response) => {
    const courseId = req.body.courseId;
    const className = req.body.className;

    const moodleStudents: Promise<{ data: MoodleStudent[] }> = axios.get(
        `http://localhost:3000/moodle/students/${courseId}`);

    // ! TBD
    // dostanu studenty podle třídy (bakaláři)
    const bakalariStudents = getStudentsByClass(className);

    const databaseStudents: {
        moodleId: number,
        bakalariId: number,
        class: string,
        lastValidTestId: number
    }[] = [];

    for (const student of (await moodleStudents).data) {
        const correspondingBakalariStudent = bakalariStudents.find(
            BakalariStudent =>
                BakalariStudent.firstname === student.firstname &&
                BakalariStudent.lastname === student.lastname &&
                BakalariStudent.class === student.department);

        if (correspondingBakalariStudent) {
            databaseStudents.push({
                moodleId: student.id,
                bakalariId: correspondingBakalariStudent.id,
                class: className,
                lastValidTestId: 0
            });
        }
    }

    await prisma.student.createMany({
        data: databaseStudents
    })

    prisma.$disconnect();

    res.send({
        status: "ok"
    });

})

module.exports = databaseRouter;