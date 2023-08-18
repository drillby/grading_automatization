import dotenv from "dotenv";
import express from 'express';
import winston from "winston";
import { bakalariClientFactory } from "./src/bakalari/factroy";
import { getStudentsByClass } from "./src/bakalari/students";
import { moodleClientFactory } from './src/moodle/factory';
import { getStudentsByCourse, getTestsFromCourse, getTestsFromCourseGroup, gradeableStudents } from "./src/moodle/studetns";
import { UserGrade } from "./src/types/moodle.types";


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
    const a = [];

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
        // core_group_get_course_groupings [courseid] - skupiny v kurzu (Mohou přeskočit ústní)
        // core_course_get_contents [courseid] - dělení kurzu na sekce (Algoritmizace I, Algoritmizace II, ...)
        wsfunction: "gradereport_user_get_grade_items",
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

    // přihlášení
    const moodleClient = await moodleClientFactory(moodleCreds);
    const bakalariClient = await bakalariClientFactory(bakalariCreds);

    // dostanu studenty podle id kurzu (moodle)
    const moodleStudents = await getStudentsByCourse(courses[0].split("_")[0], moodleClient)

    // dostanu studenty podle třídy (bakaláři)
    const bakalariStudents = getStudentsByClass(params.className);

    // dostanu studenty, kteří jsou v obou systémech (moodle i bakaláři)
    const studentsToGrade = gradeableStudents(moodleStudents, bakalariStudents);

    // dostanu všechny testy v kurzu
    const coueseId = courses[0].split("_")[0];
    const allTests = await getTestsFromCourse(coueseId, moodleClient);

    // dostanu testy v kurzu podle tématu
    const topicName = courses[0].split("_")[1];
    const testsByGroup = getTestsFromCourseGroup(allTests, topicName);

    // známky všech studentů v kurzu
    const allGrades: UserGrade = await moodleClient.call({
        wsfunction: "gradereport_user_get_grade_items",
        args: {
            courseid: 229
        }
    })

    // filter známek jen pro studenty, kteří jsou v obou systémech
    const filteredGrades = allGrades.usergrades.filter((grade) => {
        return studentsToGrade.find((student) => {
            return student.lastname + " " + student.firstname === grade.userfullname;
        })
    })

    // ořízne první dvě aktivity (jedná se o sumarizaci)
    filteredGrades.forEach((grade) => {
        grade.gradeitems = grade.gradeitems.slice(2);
    })

    const grades = {};
    for (const student of filteredGrades) {
        grades[student.userid] = 5;
    }

    // vypočítá známky
    for (const student of filteredGrades) {
        const lastTestId = lastTestIds[student.userid];
        // index odkud mám začít počítat známky
        if (lastTestId) {
            var index = student.gradeitems.findIndex((grade) => {
                return grade.id === lastTestId;
            })
        }
        else {
            var index = 0;
        }
        // loop from index to end od student.gradeitems
        for (var i = index; i <= student.gradeitems.length; i++) {
            const grade = student.gradeitems[i];
            if ((grade.itemname.includes("Ústní") || grade.itemname.includes("Očekávání")) &&
                grade.graderaw >= grade.grademax) {
                grades[student.userid] -= 0.5;
            }
            else if (grade.graderaw >= grade.grademax * 2) {
                grades[student.userid] -= 1;
            }
            else if (grade.graderaw === null) {
                lastTestIds[student.userid] = index = 0 ? null : student.gradeitems[i - 1].id;
                break;
            }
        }
        // ošetření, aby známka nebyla menší než 1
        if (grades[student.userid] < 1) grades[student.userid] = 1;
    }

    // TODO: zapsat známky
    // TODO: sprovoznit pro kontrolu více kurzů a témat najednou (teoreticky jenom přidat cyklus?)
    res.send(grades);
})

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});