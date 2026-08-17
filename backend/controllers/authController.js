const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================

exports.register = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({
        message: "Please Fill All Fields",
      });

    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

      return res.status(400).json({
        message: "Please Enter Valid Email",
      });

    }

    if (password.length < 8) {

      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });

    }

    const exist = await User.findOne({
      email,
    });

    if (exist) {

      return res.status(400).json({
        message: "Email Already Exists",
      });

    }

    const hashPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({

      name,

      email,

      password: hashPassword,

    });

    res.status(201).json({

      success: true,

      message: "Registration Successful",

      user,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};
// ================= LOGIN =================

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        message: "Please Fill All Fields",
      });

    }

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        message: "Email Does Not Exist",
      });

    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return res.status(401).json({
        message: "Wrong Password",
      });

    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({

      success: true,

      message: "Login Successful",

      token,

      user,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};