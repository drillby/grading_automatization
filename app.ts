import { Student } from '@prisma/client';
import axios from 'axios';
import dotenv from "dotenv";
import express from 'express';
import winston from "winston";
import { CourseStructure, MoodleStudent, UserGrades } from "./src/types/moodle";
import { getStudentsByClass } from "./src/utils/bakalari/students";
import { moodleClientFactory } from './src/utils/moodle/factory';
import { gradeableStudents } from "./src/utils/moodle/studetns";

export const app = express();
const port = 3000;

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
    ],
});

const moodleCreds = {
    wwwroot: dotenv.config().parsed?.MOODLE_URL || "",
    username: dotenv.config().parsed?.MOODLE_USERNAME || "",
    password: dotenv.config().parsed?.MOODLE_PASSWORD || "",
    logger: logger
}

export const moodleClient = moodleClientFactory(moodleCreds);

const bakalariCreds = {
    wwwroot: dotenv.config().parsed?.BAKALARI_URL || "",
    username: dotenv.config().parsed?.BAKALARI_USERNAME || "",
    password: dotenv.config().parsed?.BAKALARI_PASSWORD || "",
    logger: logger
}

// ? bude vytahováno někde z databáze
const lastTestIds: { [id: number]: number | null } = {
    1648: null, // Patrik Salaba moodle id: id posledního splněného testu
    1623: null, // Roman Demeďuk moodle id: id posledního splněného testu
    1830: null, // Barbora Lapuníková moodle id: id posledního splněného testu
};

app.get('/', (req, res) => {
    res.json({ 'message': 'ok' });
})

app.get("/brute-force", async (req, res) => {
    const client = await moodleClientFactory(moodleCreds);

    const functions = (await client.core.getInfo()).functions;
    const a: { name: string, versoin: string }[] = [];

    functions.map(async (f: { name: string, version: string }) => {
        try {
            const ans = await client.call({
                wsfunction: f.name,
                args: {
                    courseid: 229
                }
            })
            console.log(f.name, ans);
        } catch (e) {
            console.log(f.name, e);
        }
    });

    res.send(a);
});

app.get('/test', async (req, res) => {
    const params = req.params;
    const client = await moodleClientFactory(moodleCreds);

    const info = await client.call({
        // mod_quiz_get_quizzes_by_courses - info o každém testu ve všech kurzech (nevrací ústní)
        // mod_assign_get_assignments - info o každé aktivitě ve všech kurzech
        // gradereport_user_get_grade_items [courseid] - získá známky všech uživatelů v kurzu
        // gradereport_user_get_grades_table [courseid] - to taky získá známky všech uživatelů v kurzu, ale v nějak divném formátu (asi pro HTML tabulku)
        // core_enrol_get_enrolled_users [courseid] - získá všechny uživatele v kurzu
        // core_course_get_courses_by_field - info o všech kurzech
        // core_group_get_course_groups [courseid] - třídy v kurzu (Podrazký_2022_IT)
        // core_group_get_course_groupings [courseid] - skupiny v kusrzu (Mohou přeskočit ústní)
        // core_course_get_contents [courseid] - dělení kurzu na sekce (Algoritmizace I, Algoritmizace II, ...)
        wsfunction: "core_course_get_contents",
        args: {
            courseid: 229
        }
    })
    res.send(info);
});

// vypočítá známky, které mají být zapsány do bakalářů (zatím pouze pro jeden kurz)
app.get("/grade/:courseIds/:className", async (req, res) => {
    const params = req.params;
    const courses = params.courseIds.split("&");

    const finalGrades: { [bakalariId: number]: number }[] = [];

    // dostanu studenty podle id kurzu (moodle)
    for (const course of courses) {
        const courseId = course.split("_")[0]
        const courseTopic = course.split("_")[1]

        // všichni studenti v kurzu
        const moodleStudents: Promise<{ data: MoodleStudent[] }> = axios.get(`http://localhost:3000/moodle/students/${courseId}`);
        // známky všech studentů v kurzu
        const allGrades: Promise<{ data: { usergrades: UserGrades[] } }> = axios.get(`http://localhost:3000/moodle/grades/${courseId}`);
        // známkované testy
        const topicContent: Promise<{ data: CourseStructure }> = axios.get(`http://localhost:3000/moodle/tests/${courseId}/${courseTopic}`);
        // studenti z databáze podle třídy
        const databaseStudents: Promise<{ data: Student[] }> = axios.get(`http://localhost:3000/database/students/${params.className}`);

        // ! TBD
        // dostanu studenty podle třídy (bakaláři)
        const bakalariStudents = getStudentsByClass(params.className);

        // dostanu studenty, kteří jsou v obou systémech (moodle i bakaláři)
        const filteredStudents = gradeableStudents((await moodleStudents).data, bakalariStudents);

        // studenti a jejich známky v kurzu
        const filteredStudentIds = new Set(filteredStudents.map(student => student.id));
        const studentsToGrade = (await allGrades).data.usergrades.filter(grade => {
            return filteredStudentIds.has(grade.userid);
        });

        // v studentsToGrade jsou pouze testy z daného tématu
        const moduleIds = new Set((await topicContent).data.modules.map(module => module.id));
        for (const student of studentsToGrade) {
            student.gradeitems = student.gradeitems.filter(grade => moduleIds.has(grade.cmid));
        }

        // ve filteredStudents známky studentů
        // z těch jsem schopen vypočítat známky, které mají být zapsány do bakalářů
        // TODO: vypočítat známky
        // známkování si předstabuju takto:
        // vytáhnu si studentsToGrade pro všechny kurzy(témata) a uložím si je do nějakého objektu
        // klíčem bude id studenta a hodnotou pole gradeitems přes všechny kurzy(témata)
        // pak cyklím přes všechny studenty a vypočítám známky


        // TODO: zapsat známky
        // ! musím si pamatovat kdy pro studenta skončil poslední blok testů (pokud ještě nesplnil všechny)
    }
    res.send("OK");
})

const moodleRouter = require('./src/routes/moodle.routes');
app.use('/moodle', moodleRouter);

const databaseRouter = require('./src/routes/database.routes');
app.use('/database', databaseRouter);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});