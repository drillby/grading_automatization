import { Client as MoodleClient } from "akora-moodle";
import { bakalariStudent } from "../types/bakalari.types";
import { CourseActivity, CourseStructure, MoodleStudent } from "../types/moodle.types";

// vrátí všechny studenty v kurzu
export async function getStudentsByCourse(courseId: number | string, moodleSession: MoodleClient): Promise<MoodleStudent[]> {
    const students: Promise<MoodleStudent[]> = await moodleSession.call({
        wsfunction: "core_enrol_get_enrolled_users",
        args: {
            courseid: Number(courseId)
        }
    })

    return students;
}

// vrátí id studenta
export function getStudentId(studentName: { firstname: string, lastname: string }, students: MoodleStudent[]): number {
    for (const student of students) {
        if (student.firstname === studentName.firstname && student.lastname === studentName.lastname) {
            return student.id;
        }
    }

    return -1;
}

export function gradeableStudents(moodleStudents: MoodleStudent[], BakalariStudent: bakalariStudent[]): MoodleStudent[] {
    const gradeableStudents: MoodleStudent[] = [];

    for (const moodleStudent of moodleStudents) {
        const correspondingBakalariStudent = BakalariStudent.find(
            BakalariStudent =>
                BakalariStudent.firstname === moodleStudent.firstname &&
                BakalariStudent.lastname === moodleStudent.lastname &&
                BakalariStudent.class === moodleStudent.department);

        if (correspondingBakalariStudent) {
            gradeableStudents.push(moodleStudent);
        }
    }

    return gradeableStudents;
}

export function calculateGrades(students: MoodleStudent[], courseIds: string[] | number[], client: MoodleClient): { [fullname: string]: number } {
    return {};
    // throw new Error("Not implemented");
}

export function getLastTestNames(students: MoodleStudent[]): { [fullname: string]: string } {
    return {};
    // throw new Error("Not implemented");
}

export function noteLastTestNames(lastTestNames: { [fullname: string]: string }, courseIds: string[] | number[], moodleSession: MoodleClient) {
    // throw new Error("Not implemented");
}

export async function getTestsFromCourse(courseId: string | number, moodleSession: MoodleClient): Promise<CourseStructure[]> {
    const contents: CourseStructure[] = await moodleSession.call({
        wsfunction: "core_course_get_contents",
        args: {
            courseid: Number(courseId)
        }
    })
    return contents.slice(1);
}

export function getTestsFromCourseGroup(courseStructure: CourseStructure[], wantedGroup: string): CourseActivity[] {
    for (const courseActivity of courseStructure) {
        if (courseActivity.name.toLowerCase().includes(wantedGroup.toLowerCase())) {
            return courseActivity.modules;
        }
    }
}