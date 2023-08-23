import winston from "winston";

export type bakalariStudent = {
    id: number;
    firstname: string;
    lastname: string;
    class: string;
    email: string;
}

export type bakalariCreds = {
    wwwroot: string;
    username: string;
    password: string;
    logger?: winston.Logger;
}
