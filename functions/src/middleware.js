const admin = require("firebase-admin");

//TODO: Ajout Middleware --> https://dev.to/emeka/securing-your-express-node-js-api-with-firebase-auth-4b5f

const adminAuth = admin.auth();

// Middleware
const getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        req.authToken = req.headers.authorization.split(" ")[1];
    } else {
        req.authToken = null;
    }
    next();
};

const checkIfAuthenticated = (req, res, next) => {
    getAuthToken(async (req, res) => {
        try {
            const { authToken } = req;
            const userInfo = await adminAuth.verifyIdToken(authToken);
            req.authId = userInfo.uid;
            return next();
        } catch (e) {
            return res
                .status(403)
                .send({ error: "You are not authorized to make this request" });
        }
    });
};

// Passing & check Admin User
const makeUserAdmin = async (req, res) => {
    const { userId } = req.body; // userId is the firebase uid for the user
    await adminAuth.setCustomUserClaims(userId, { admin: true });
    return res.send({ message: "Success" })
}

const checkIfAdmin = (req, res, next) => {
    getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            const userInfo = await adminAuth.verifyIdToken(authToken);

            if (userInfo.admin === true) {
                req.authId = userInfo.uid;
                return next();
            }

            throw new Error("unauthorized")
        } catch (e) {
            return res
                .status(403)
                .send({ error: "You are not authorized to make this request" });
        }
    });
};

module.exports = {
    checkIfAuthenticated: checkIfAuthenticated,
    checkIfAdmin: checkIfAdmin,
    makeUserAdmin: makeUserAdmin
}