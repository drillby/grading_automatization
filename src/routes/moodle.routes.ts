import express from 'express';
import { moodleClient } from "../../app";
import { CourseStructure, MoodleStudent, UserGrades } from "../types/moodle";


const moodleRouter = express.Router();

moodleRouter.get("/students/:courseId", async (req, res) => {
    const courseId = Number(req.params.courseId);

    if (isNaN(courseId)) {
        res.status(400).send("Course id must be a number");
        return;
    }

    const students: MoodleStudent[] = await (await moodleClient).call({
        wsfunction: "core_enrol_get_enrolled_users",
        args: {
            courseid: courseId
        }
    })

    res.send(students);
});

moodleRouter.get("/grades/:courseId", async (req, res) => {
    const courseId = Number(req.params.courseId);

    if (isNaN(courseId)) {
        res.status(400).send("Course id must be a number");
        return;
    }

    const grades: { usergrades: UserGrades[] } = await (await moodleClient).call({
        wsfunction: "gradereport_user_get_grade_items",
        args: {
            courseid: courseId
        }
    })

    res.send(grades);
});

moodleRouter.get("/tests/:courseId/:topic", async (req, res) => {
    const courseId = Number(req.params.courseId);
    const topic = req.params.topic;

    if (isNaN(courseId)) {
        res.status(400).send("Course id must be a number");
        return;
    }

    const tests: CourseStructure[] = await (await moodleClient).call({
        wsfunction: "core_course_get_contents",
        args: {
            courseid: Number(courseId)
        }
    })

    const topicTests = tests.find(test => test.name.includes(topic));

    if (!topicTests) {
        res.send({})
    }

    res.send(topicTests);
});

module.exports = moodleRouter;