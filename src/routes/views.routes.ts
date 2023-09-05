import express from 'express';
import { appTitle } from '../exports';

const viewsRouter = express.Router();

viewsRouter.get("/", (req, res) => {
    res.render("index", {
        title: appTitle,
    });
})

viewsRouter.get("/step-1", (req, res) => {
    res.cookie("invalidPass", undefined);
    if (req.cookies.classes) {
        res.redirect("/step-2");
    }

    const classes = [
        {
            name: "CS 101",
            id: "cs101",
        },
        {
            name: "CS 102",
            id: "cs102",
        },
        {
            name: "CS 103",
            id: "cs103",
        },
        {
            name: "CS 104",
            id: "cs104",
        }
    ] // bude nahrazeno Bakaláří API

    res.render("step-1", {
        title: appTitle,
        classes: classes,
    });
})

viewsRouter.post("/step-1", (req, res) => {
    const classes = req.body.classes;
    res.cookie("classes", classes, {
        secure: true,
        maxAge: 5 * 60 * 1000,
    });

    res.redirect("/step-2");
})

viewsRouter.get("/step-2", (req, res) => {
    if (!req.cookies.classes) {
        res.redirect("/step-1");
    }

    if (req.cookies.courses) {
        res.redirect("/step-3");
    }

    const courses = [
        {
            id: 229,
            name: "Algoritmizace",
        },
        {
            id: 228,
            name: "Databáze",
        },
        {
            id: 226,
            name: "Python",
        },
        {
            id: 299,
            name: "C++",
        }
    ]

    res.render("step-2.ejs", {
        title: appTitle,
        courses: courses,
    });
})

viewsRouter.post("/step-2", (req, res) => {
    res.cookie("courses", req.body.courses, {
        secure: true,
        maxAge: 5 * 60 * 1000
    });

    res.redirect("/step-3");
})

viewsRouter.get("/step-3", (req, res) => {
    if (!req.cookies.classes) {
        res.redirect("/step-1");
    }
    else if (!req.cookies.courses) {
        res.redirect("/step-2");
    }

    // vypsat seznam témat na základě kurzů (cookies.courses)

    res.render("step-3.ejs", {
        title: appTitle,
    });
})

viewsRouter.post("/step-3", (req, res) => {
})


module.exports = viewsRouter;