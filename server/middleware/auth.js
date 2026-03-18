const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log(`[AUTH] Rejecting: Missing/null token for ${req.url}`);
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (!verified) {
        console.log(`[AUTH] Rejecting: Invalid verification for ${req.url}`);
        return res.status(401).json({ message: 'Token verification failed, access denied' });
      }

      req.user = verified.id;
      next();
    } catch (jwtErr) {
      console.log(`[AUTH] Rejecting: JWT Error for ${req.url} - ${jwtErr.message}`);
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error('[AUTH] System Error:', err);
    res.status(401).json({ message: 'System Error' });
  }
};

module.exports = auth;
