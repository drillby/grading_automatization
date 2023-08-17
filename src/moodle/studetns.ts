import { Client as MoodleClient } from "akora-moodle";
import { Student } from "../types/moodle.types";


export async function getStudentsByCourse(courseId: Number, moodleSession: MoodleClient): Promise<Student[]> {
    const students = await moodleSession.call({
        wsfunction: "core_enrol_get_enrolled_users",
        args: {
            courseid: courseId
        }
    })

    return students;
}

// vrátí id studenta
export function getStudentId(studentName: { firstname: string, lastname: string }, students: Student[]): Number {
    for (const student of students) {
        if (student.firstname === studentName.firstname && student.lastname === studentName.lastname) {
            return student.id;
        }
    }
    return -1;
}