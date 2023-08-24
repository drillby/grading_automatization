import axios from 'axios';
import dotenv from "dotenv";
import express from 'express';
import winston from "winston";
import { getStudentsByClass } from "./src/bakalari/students";
import { moodleClientFactory } from './src/moodle/factory';
import { getStudentsByCourse, gradeableStudents } from "./src/moodle/studetns";
import { MoodleStudent, UserGrades } from "./src/types/moodle";

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

// vrátí všechny funkce, které můžeme volat
app.get('/all', async (req, res) => {
    const client = await moodleClientFactory(moodleCreds);

    const info = await client.core.getInfo()

    res.send(info);
});

// vrátí všechny kurzy
app.get('/courses', async (req, res) => {
    const client = await moodleClientFactory(moodleCreds);

    const info = await client.core.getAllCourses()

    res.send(info);
});

// vrátí všechny uživatele v kurzu
app.get('/usersInCourse/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    const client = await moodleClientFactory(moodleCreds);

    const info = await getStudentsByCourse(courseId, client);

    res.send(info);
});

app.get('/gradesInCourse/:courseId', async (req, res) => {
    const params = req.params;
    const client = await moodleClientFactory(moodleCreds);

    const info = await client.core.course.getContents({
        courseid: Number(params.courseId)
    })

    res.send(info);
});


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

    // dostanu studenty podle id kurzu (moodle)
    for (const course of courses) {
        const courseId = course.split("_")[0]
        const courseTopic = course.split("_")[1]

        // všichni studenti v kurzu
        const moodleStudents: Promise<{ data: MoodleStudent[] }> = axios.get(`http://localhost:3000/moodle/students/${courseId}`);
        // známky všech studentů v kurzu
        const allGrades: Promise<{ data: { usergrades: UserGrades[] } }> = axios.get(`http://localhost:3000/moodle/grades/${courseId}`);

        // ! TBD
        // dostanu studenty podle třídy (bakaláři)
        const bakalariStudents = getStudentsByClass(params.className);

        // dostanu studenty, kteří jsou v obou systémech (moodle i bakaláři)
        const studentsToGrade = gradeableStudents((await moodleStudents).data, bakalariStudents);


        const filteredStudents = (await allGrades).data.usergrades.filter((grade) => {
            return studentsToGrade.find((student) => {
                return student.id === grade.userid;
            })
        })

        // ořízne první dvě aktivity (jedná se o sumarizaci)
        filteredStudents.forEach((grade) => {
            grade.gradeitems = grade.gradeitems.slice(2);
        })

        // ve filteredStudents známky studentů
        // z těch jsem schopen vypočítat známky, které mají být zapsány do bakalářů
        // TODO: vypočítat známky
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