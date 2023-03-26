const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../../models/User");
const {
  getAccessTokenFromHeader,
  isTokenIncluded,
} = require("../../helpers/auth/tokenHelper");
const getAccessToRoute = (req, res, next) => {
  if (!isTokenIncluded) {
    res.status(500).json({
      success: false,
      message: "Token is not found",
    });
  }
  const accessToken = getAccessTokenFromHeader(req);

  jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
    }
    req.user = {
      id: decoded.id,
      name: decoded.name,
    };
    console.log(decoded);
    next();
  });
};
const getAdminAcces = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findById(id);

  if (user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Only acces for admin",
    });
  }
  next();
});

module.exports = {
  getAccessToRoute,
  getAdminAcces,
};
