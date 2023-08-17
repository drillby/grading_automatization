import { bakalariStudent } from "../types/bakalari.types";

export async function getStudentsByClass(className: string): Promise<bakalariStudent[]> {
    throw new Error("Not implemented");
}

export function writeGrades(grades: { [fullname: string]: number }, client: any): void {
    throw new Error("Not implemented");
}