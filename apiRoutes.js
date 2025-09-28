const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

router.post("/login", (req, res, next) => {
    const { email, password } = req.body;

    console.log(email + " - " + password);

    fs.readFile(
        path.join(__dirname, "../models/users.json"),
        "utf-8",
        (err, data) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            const users = JSON.parse(data);
            const user = users.find((u) => u.email === email && u.password === password);
            if (user) {
                return res.status(200).json({ message: "Login successful", email });
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        }
    );
});

router.post("/register", (req, res, next) => {
    const { name, email, password } = req.body;

    console.log(name, email, password);

    const newUser = { name, email, password };
    fs.readFile(
        path.join(__dirname, "../models/users.json"),
        "utf-8",
        (err, data) => {
            if (err) return next(err);
            let users = [];
            if (data) {
                users = JSON.parse(data);
            }
            users.push(newUser);
            fs.writeFile(
                path.join(__dirname, "../models/users.json"),
                JSON.stringify(users, null, 2),
                (err) => {
                    if (err) return next(err);
                    return res.status(201).json({ message: "User registered" });
                }
            );
        }
    );
});

router.post("/contacts", (req, res, next) => {
    const { name, email, subject, message } = req.body;

    console.log(name, email, subject, message);

    const newContact = { name, email, subject, message };
    fs.readFile(
        path.join(__dirname, "../models/contact.json"),
        "utf-8",
        (err, data) => {
            if (err) return next(err);
            let contacts = [];
            if (data) {
                contacts = JSON.parse(data);
            }
            contacts.push(newContact);
            fs.writeFile(
                path.join(__dirname, "../models/contact.json"),
                JSON.stringify(contacts, null, 2),
                (err) => {
                    if (err) return next(err);
                    return res.status(201).json({ message: "Contact sent" });
                }
            );
        }
    );
});

function readUsers(callback) {
    fs.readFile(
        path.join(__dirname, "../models/users.json"),
        "utf-8",
        (err, data) => {
            if (err) return callback(err);
            let users = [];
            if (data) {
                try {
                    users = JSON.parse(data);
                } catch (e) {
                    return callback(e);
                }
            }
            return callback(null, users);
        }
    );
}

function writeUsers(users, callback) {
    fs.writeFile(
        path.join(__dirname, "../models/users.json"),
        JSON.stringify(users, null, 2),
        callback
    );
}

function getFavoritesHandler(req, res, next) {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: "email is required" });

    readUsers((err, users) => {
        if (err) return next(err);
        const user = users.find((u) => u.email === email);
        if (!user) return res.status(404).json({ message: "User not found" });
        const favourites = Array.isArray(user.favourites) ? user.favourites : [];
        return res.json({ favourites });
    });
}

function addFavoriteHandler(req, res, next) {
    const { email, bookId } = req.body || {};
    if (!email || !bookId) return res.status(400).json({ message: "email and bookId are required" });

    readUsers((err, users) => {
        if (err) return next(err);
        const userIndex = users.findIndex((u) => u.email === email);
        if (userIndex === -1) return res.status(404).json({ message: "User not found" });
        const user = users[userIndex];
        if (!Array.isArray(user.favourites)) user.favourites = [];
        if (!user.favourites.includes(bookId)) {
            user.favourites.push(bookId);
        }
        users[userIndex] = user;
        writeUsers(users, (wErr) => {
            if (wErr) return next(wErr);
            return res.status(200).json({ message: "Added to favourites", favourites: user.favourites });
        });
    });
}

router.get("/favorites", getFavoritesHandler);
router.post("/favorites", addFavoriteHandler);
module.exports = router;