// Backend token verification utility
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Azure AD tenant information
const tenantId = 'c02e07f8-5785-4da1-b596-208d85c97500';
const clientId = 'dd0bb050-7cde-40de-b065-d9225ca4497e';

// Initialize JWKS client to fetch signing keys
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
});

// Function to get the signing key
const getSigningKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

/**
 * Verify the JWT token from Azure AD
 * @param {string} token - The JWT token to verify
 * @returns {Promise<object>} - The decoded token payload if valid
 */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('No token provided'));
    }

    // Remove 'Bearer ' prefix if present
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(
      tokenValue,
      getSigningKey,
      {
        audience: clientId,
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        algorithms: ['RS256']
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      }
    );
  });
};

/**
 * Express middleware to authenticate requests
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const authenticateRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    
    // Add user information to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Check if user has required role
 * @param {string[]} requiredRoles - Array of required roles
 * @returns {function} - Express middleware
 */
const hasRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Extract roles from token
    const userRoles = req.user.roles || [];
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  verifyToken,
  authenticateRequest,
  hasRole
};
