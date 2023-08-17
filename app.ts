import dotenv from "dotenv";
import express from 'express';
import winston from "winston";
import { moodleClientFactory } from './src/moodle/factory';


const app = express();
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



// bude nahrazeno Bakalari API
const studetns = [
    "Roman Demeďuk",
    "Barbora Lapuníková",
    "Tobiáš Michalovský",
]

// vrátí všechny funkce, které můžeme volat
app.get('/', async (req, res) => {
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
    const params = req.params;
    const client = await moodleClientFactory(moodleCreds);

    const info = await client.call({
        wsfunction: "core_enrol_get_enrolled_users",
        args: {
            courseid: params.courseId
        }
    })

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


app.get("/bruteForceEndpoints", async (req, res) => {
    const client = await moodleClientFactory(moodleCreds);

    const functions = (await client.core.getInfo()).functions;

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

    res.send("OK");
});

app.get('/test', async (req, res) => {
    const params = req.params;
    const client = await moodleClientFactory(moodleCreds);

    const info = await client.call({
        // mod_quiz_get_quizzes_by_courses - info o každém testu ve všech kurzech
        // mod_assign_get_assignments - info o každé aktivitě ve všech kurzech
        // gradereport_user_get_grade_items [courseid] - získá známky všech uživatelů v kurzu
        // gradereport_user_get_grades_table [courseid] - to taky získá známky všech uživatelů v kurzu, ale v nějak divném formátu (asi pro HTML tabulku)
        // core_enrol_get_enrolled_users [courseid] - získá všechny uživatele v kurzu
        wsfunction: "core_enrol_get_enrolled_users",
        args: {
            courseid: 229
        }
    })
    // console.log(await getStudentId({ firstname: "Barbora", lastname: "Lapuníková" }, 229));
    res.send(info);
});


app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
