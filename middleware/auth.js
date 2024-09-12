//middleware/auth

const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, 'YOUR_JWT_SECRET');
        req.user = decoded.user;

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}