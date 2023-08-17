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