const router = require("express").Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controller/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword", resetPassword);

module.exports = router;
