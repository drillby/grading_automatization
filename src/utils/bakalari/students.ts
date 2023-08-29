import { bakalariStudent } from "../../types/bakalari";


export function getStudentsByClass(className: string): bakalariStudent[] {
    return [
        {
            id: 1,
            firstname: "Patrik",
            lastname: "Salaba",
            class: "EP1B",
            email: "test@example.com"
        },
        {
            id: 2,
            firstname: "Roman",
            lastname: "Demeďuk",
            class: "EP1B",
            email: "test@example.com"
        },
        {
            id: 3,
            firstname: "Barbora",
            lastname: "Lapuníková",
            class: "EP1B",
            email: "test@example.com"
        },
    ]
    // throw new Error("Not implemented");
}

export function writeGrades(grades: { [fullname: string]: number }, client: any): void {
    throw new Error("Not implemented");
}