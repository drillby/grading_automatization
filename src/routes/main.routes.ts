import { Student } from '@prisma/client';
import axios from 'axios';
import express from 'express';
import { CourseStructure, MoodleStudent, UserGrades } from '../types/moodle';
import { getStudentsByClass } from '../utils/bakalari/students';
import { gradeableStudents } from '../utils/moodle/studetns';

const mainRouter = express.Router();

/** 
 * @route GET /
 * @description Root route, vrací ok pokud server běží
 * @access Veřejný
 * @returns {object} 200 - Objekt s informací o stavu serveru
 */
mainRouter.get('/', (req, res) => {
    res.json({ 'message': 'ok' });
})


/**
 * @route GET /grade/:courseIds/:className
 * @param {string} courseIds Id kurzu na moodle (oddělené &), každý kurz je rozdělený podtržítkem na id kurzu a název tématu (např. 229_Algoritmizace I)
 * @param {string} className Název třídy (např. EP1B)
 * @description Oznámkuje studenty v bakalářích podle známek v Moodle kurzech
 */

/**
 * Známkování:
 * Na Moodle jsou činnosti (testy, ústní povídání a průběžné odevzdávání projektu) seřazeny za sebou.
 * Jeden "Blok" obsahuje 4 testy + 2 ústní zkoušky v pořadí: 2x test, 1x ústní, 2x test, 1x ústní.
 * Nové období začíná po udělení známky do Bakalářů.
 *
 * Získání známky závisí na počtu splněných činností v daném období:
 * Každý splněný test posune známku o půl stupně (5 -> 4- -> 4 -> 3- -> 3 -> 2- -> 2 -> 1- -> 1).
 * Testy musí být splněny postupně, nelze žádný přeskočit.
 * Moodle umožňuje test označit za splněný až při 33 bodech, ale pro udělení známky se počítá
 * počet testů nad 66 bodů (nebo ústních nad 100) v řadě.
 * Úspěšné ústní zkoušení posune známku o 1 stupeň nahoru.
 *
 * Při rychlejším postupu (splnění nadstandardního množství činností) bude odměna dohodnuta individuálně.
 * Není možné přenést činnosti do dalšího období - vždy začínáte na "nule".
 * 
 * Více informací zde: https://xeon.spskladno.cz/~podrazky/informace.html
 */
mainRouter.get("/grade/:courseIds/:className", async (req, res) => {
    const params = req.params;
    const courses = params.courseIds.split("&");

    // studenti z databáze podle třídy
    const databaseStudents: Promise<{ data: Student[] }> = axios.get(
        `http://localhost:3000/database/students/${params.className}`);

    const finalGrades: { [bakalariId: number]: number } = {};

    // přednastavím všechny známky na 5
    for (const student of (await databaseStudents).data) {
        finalGrades[student.bakalariId] = 50;
    }

    // dostanu studenty podle id kurzu (moodle)
    for (const course of courses) {
        const courseId = course.split("_")[0]
        const courseTopic = course.split("_")[1]

        // všichni studenti v kurzu
        const moodleStudents: Promise<{ data: MoodleStudent[] }> = axios.get(
            `http://localhost:3000/moodle/students/${courseId}`);
        // známky všech studentů v kurzu
        const allGrades: Promise<{ data: { usergrades: UserGrades[] } }> = axios.get(
            `http://localhost:3000/moodle/grades/${courseId}`);
        // známkované testy
        const topicContent: Promise<{ data: CourseStructure }> = axios.get(
            `http://localhost:3000/moodle/tests/${courseId}/${courseTopic}`);

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

        // počítání známek
        // pro každého studenta
        for (const student of studentsToGrade) {
            // find if student.id is in databaseStudents (moodleId)
            //kouknu se jestli je v databázi
            const databaseStudent = (await databaseStudents).data.find(
                dstudent => dstudent.moodleId === student.userid);
            // pokud ne, tak ho přeskočím
            if (databaseStudent === undefined) {
                continue;
            }

            const grades = student.gradeitems;

            let lastTestIndex = grades.findIndex(
                grade => grade.cmid === databaseStudent.lastValidTestId)
            if (lastTestIndex === -1) {
                lastTestIndex = 0;
            }

            // pokud uložený index není v databázi, musíme projít všechny známky
            for (let i = lastTestIndex; i < grades.length; i++) {
                // pokud je známka null, tak ještě nebyla vyplněn test a končím cyklus
                if (grades[i].graderaw === null) {
                    break;
                }

                // pokud je ústní a splnil
                if (grades[i].itemname.includes("Ústní") &&
                    grades[i].graderaw == grades[i].grademax) {
                    finalGrades[databaseStudent.bakalariId] =
                        finalGrades[databaseStudent.bakalariId] - 5;
                }
                // pokud není ústní, dá se předpokládat, že je to test
                // a pokud splnil
                else if (grades[i].graderaw! >= grades[i].grademax * 2) {
                    finalGrades[databaseStudent.bakalariId] =
                        finalGrades[databaseStudent.bakalariId] - 10;
                }
            }
        }

        // nyní mám v finalGrades známky, které mají být zapsány do bakalářů
        // TODO: zapsat známky
    }
    res.send("OK");
})

module.exports = mainRouter;