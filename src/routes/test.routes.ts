import express from 'express';
import { moodleClient } from '../../app';
import { moodleCreds } from '../exports/creds';
import { moodleClientFactory } from '../utils/moodle/factory';

const testRouter = express.Router();

/**
 * @route GET /brute-force
 * @description Testovací route, vrací info o všech funkcích moodle API
 * @private Pouze pro testování
 * @returns {object} 200 - Objekt s odpovědí z API moodle (všech funkcí)
 * @todo Odstranit
 */
testRouter.get("/brute-force", async (req, res) => {
    const client = moodleClient

    const functions = (await (await client).core.getInfo()).functions;
    const a: { name: string, versoin: string }[] = [];

    functions.map(async (f: { name: string, version: string }) => {
        try {
            const ans = await (await client).call({
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

/**
 * @route GET /test
 * @description Testovací route, vrací odpověď z určité funkce moodle API
 * @private Pouze pro testování
 * @param {string} plugin Název funkce moodle API
 * @param {number} courseId Id kurzu na moodle (pokud je potřeba)
 * @returns {object} 200 - Objekt s odpovědí z API moodle
 * @todo Odstranit
 */
// mod_quiz_get_quizzes_by_courses - info o každém testu ve všech kurzech (nevrací ústní)
// mod_assign_get_assignments - info o každé aktivitě ve všech kurzech
// gradereport_user_get_grade_items [courseid] - získá známky všech uživatelů v kurzu
// gradereport_user_get_grades_table [courseid] - to taky získá známky všech uživatelů v kurzu, ale v nějak divném formátu (asi pro HTML tabulku)
// core_enrol_get_enrolled_users [courseid] - získá všechny uživatele v kurzu
// core_course_get_courses_by_field - info o všech kurzech
// core_group_get_course_groups [courseid] - třídy v kurzu (Podrazký_2022_IT)
// core_group_get_course_groupings [courseid] - skupiny v kusrzu (Mohou přeskočit ústní)
// core_course_get_contents [courseid] - dělení kurzu na sekce (Algoritmizace I, Algoritmizace II, ...)
testRouter.get('/:plugin/:courseId', async (req, res) => {
    const plugin = req.params.plugin;
    const courseId = req.params.courseId;
    const client = await moodleClientFactory(moodleCreds);

    const callStructure = {
        wsfunction: plugin,
        ...(courseId !== undefined && { args: { courseid: Number(courseId) } })
    }

    const info = await client.call(
        callStructure
    )
    res.send(info);
});

module.exports = testRouter;