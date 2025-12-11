const jwt = require('jsonwebtoken');

module.exports = {
  required: (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'missing token' });
    const token = auth.split(' ')[1];
    try {
      const p = jwt.verify(token, process.env.JWT_SECRET);
      req.user = p;
      next();
    } catch(e){ return res.status(401).json({ error: 'invalid token' }); }
  },
  optional: (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return next();
    const token = auth.split(' ')[1];
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch(e){}
    next();
  }
};
