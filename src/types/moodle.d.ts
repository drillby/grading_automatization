import winston from "winston";

export type MoodleStudent = {
    id: number;
    firstname: string;
    lastname: string;
    fullname: string;
    email: string;
    department: string;
    firstaccess: number;
    lastaccess: number;
    lastcourseaccess: number;
    description: string;
    descriptionformat: number;
    country: string;
    profileimageurlsmall: string;
    profileimageurl: string;
    groups: Group[];
    roles: Role[];
    enroledcourses: Course[];
}

type Group = {
    id: number;
    name: string;
    description: string;
    descriptionformat: number;
}

type Role = {
    roleid: number;
    name: string;
    shortname: string;
    sortorder: number;
}

type Course = {
    id: number;
    fullname: string;
    shortname: string;
}

export type MoodleCreds = {
    wwwroot: string;
    username: string;
    password: string;
    logger?: winston.Logger;
}

export type CourseStructure = {
    id: number;
    name: string;
    modules: CourseActivity[];
}

export type CourseActivity = {
    id: number;
    name: string;
    instance: number;
    contextid: number;
    visible: number;
    uservisible: number;
    visibleoncoursepage: number;
}

export type UserGrades = {
    itemmodule: number;
    courseid: number;
    courseidnumber: string;
    userid: number;
    userfullname: string;
    useridnumber: string;
    maxdepth: number;
    gradeitems: GradeItem[];
}

export type GradeItem = {
    cmid: number;
    itemname: string;
    itemtype: string;
    graderaw: number | null;
    grademax: number;
}