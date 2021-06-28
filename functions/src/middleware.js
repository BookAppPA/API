const admin = require("firebase-admin");
const functions = require("firebase-functions");

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
    getAuthToken(req, res, async (request, result) => {
        try {
            const { authToken } = request;
            const userInfo = await adminAuth.verifyIdToken(authToken);
            request.authId = userInfo.uid;
            return next();
        } catch (e) {
            return res
                .status(403)
                .send({ error: "You are not authorized to make this request" });
        }
    });
};

const validateFirebaseIdToken = async (req, res, next) => {
    functions.logger.log('Check if request is authorized with Firebase ID token');
  
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
      functions.logger.error(
        'No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>',
        'or by passing a "__session" cookie.'
      );
      res.status(403).send('Unauthorized');
      return;
    }
  
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      functions.logger.log('Found "Authorization" header');
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
      functions.logger.log('Found "__session" cookie');
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie
      res.status(403).send('Unauthorized');
      return;
    }
  
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      functions.logger.log('ID Token correctly decoded', decodedIdToken);
      req.user = decodedIdToken;
      next();
      return;
    } catch (error) {
      functions.logger.error('Error while verifying Firebase ID token:', error);
      res.status(403).send('Unauthorized');
      return;
    }
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
    makeUserAdmin: makeUserAdmin,
    validateFirebaseIdToken: validateFirebaseIdToken,
}