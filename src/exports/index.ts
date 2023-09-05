import dotenv from "dotenv";
import winston from "winston";

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
    ],
});

export const moodleCreds = {
    wwwroot: dotenv.config().parsed?.MOODLE_URL || "",
    username: dotenv.config().parsed?.MOODLE_USERNAME || "",
    password: dotenv.config().parsed?.MOODLE_PASSWORD || "",
    logger: logger
}

export const bakalariCreds = {
    wwwroot: dotenv.config().parsed?.BAKALARI_URL || "",
    username: dotenv.config().parsed?.BAKALARI_USERNAME || "",
    password: dotenv.config().parsed?.BAKALARI_PASSWORD || "",
    logger: logger
}

export const authorizationToken = dotenv.config().parsed?.AUTHORIZATION_TOKEN || "";

export const isProduction = dotenv.config().parsed?.NODE_ENV === "production";

export const allowList = [
    "127.0.0.1",
    "192.168.132.103",
    "localhost",
]

export const appTitle = "Grading Automation";
