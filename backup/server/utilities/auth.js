const jwt = require('jsonwebtoken');

function authenticatePatientPtToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, patientPt) => {
        if (err) return res.sendStatus(401);
        req.patientPt = patientPt;
        next();
    });
}

function authenticatePatientSlpToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, patientSlp) => {
        if (err) return res.sendStatus(401);
        req.patientSlp = patientSlp;
        next();
    });
}

function authenticateClinicianToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, clinician) => {
        if (err) return res.sendStatus(401);
        req.clinician = clinician;
        next();
    });
}

function authenticateAdminToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
        if (err) return res.sendStatus(401);
        req.admin = admin;
        next();
    });
}

function authenticateSuperAdminToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, superAdmin) => {
        if (err) return res.sendStatus(401);
        req.superAdmin = superAdmin;
        next();
    });
}

module.exports = {
    authenticatePatientPtToken,
    authenticatePatientSlpToken,
    authenticateClinicianToken,
    authenticateAdminToken,
    authenticateSuperAdminToken,
};