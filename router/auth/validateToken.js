const jwt = require("jsonwebtoken");
const SECRET_KEY = "mokleters";

validateToken = (req, res, next) => {
  // mengambil data token dari header request
  let header = req.headers.authorization;
  let token = header ? header.split(" ")[1] : null;
  let jwtHeader = { algorithm: "HS256" };
  if (token == null) {
    // jika tidak mengirimkan kode token
    return res.json({ message: "Unauthorized" });
  } else {
    // proses verifikasi/validasi kode token
    jwt.verify(token, SECRET_KEY, jwtHeader, (error, user) => {
      if (error) {
        // jika kode token salah
        return res.json({ message: "Invalid Token" });
      } else {
        // jika kode token benar
        next();
        // melanjutkan proses mengakses endpoint yang dituju
      }
    });
  }
};

module.exports = validateToken;
