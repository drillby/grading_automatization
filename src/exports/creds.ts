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