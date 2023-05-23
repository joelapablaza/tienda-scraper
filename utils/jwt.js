import jwt from "jsonwebtoken";

const generarToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15d",
    }
  );
};

export default generarToken;
