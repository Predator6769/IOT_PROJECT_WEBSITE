const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const UD = require("../models/userDetails");
const OTP = require("../models/otpverification");
const bcryptjs = require('bcryptjs');
const fetchuserdets = require("../middlewares/fetchuserdets");
const nodemailer = require("nodemailer");
const secret = "IOT_PROJECT";

//user sign in
router.post(
  "/signin",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "Enter a valid password").isLength({ min: 8 }),
    check("breed", "Enter a valid breed").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var fgh = errors.array();
      return res.status(400).json({ errors: fgh[0].msg });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedpass = await bcryptjs.hash(req.body.password, salt);
    var b = req.body;
    b.password = hashedpass;
    b.verified = false;
    b.feedTime = ["", "", "", "", ""];
    const userdata = UD(b);
    await userdata.save((err, result) => {
      if (err) {console.log(err);return res.status(400).json({ errors: "user already exists" });}
      sendOTP(req.body.email,res);
    });
  }
);

router.post(
  "/login",
  [
    check("email", "enter a valid email").isEmail(),
    check("password", "password should be of minimum 8 charecters"),
  ],
  async (req, res) => {
    var valres = validationResult(req);
    if (!valres.isEmpty()) {
      var g = valres.array();
      return res.status(400).json({ errors: g[0].msg });
    }
    UD.findOne({ email: req.body.email }, async (error, result) => {
      if (result === null)
        return res.status(400).json({ errors: "This user doesnt exist" });
      const comp = await bcryptjs.compare(req.body.password, result.password);
      if (!comp)
        return res.status(400).json({ errors: "Incorrect password entered" });
      if (result.verified === false) {
        await OTP.deleteMany({ email: req.body.email });
        await sendotpverificationemail(result.email, result.username, res);
      } else {
        const data = { id: result._id };
        const t = jwt.sign(data, secret);
        // localStorage.setItem('authtoken',t)
        res.json({ authToken: t });
      }
    });
  }
);

router.post("/verifyotp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!(email || otp))
      return res.status(400).json({ errors: "invalid otp or email" });

    const otpdets = await OTP.findOne({ email });
    if (!otpdets)
      return res
        .status(400)
        .json({ errors: "user does not exist or verification already done" });

    if (otpdets.expiredAt < Date.now()) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ errors: "OTP is invalid" });
    }

    const validationotp = await bcryptjs.compare(otp, otpdets.otp);
    if (!validationotp)
      return res.status(400).json({ errors: "incorrect OTP entered" });

    await UD.findOneAndUpdate({ email }, { verified: true });
    await OTP.deleteOne({ email });
    const user = await UD.findOne({ email });
    const data = { id: user._id };
    const token = jwt.sign(data, secret);
    res.status(200).json({ authToken: token });
  } catch (err) {
    res.status(401).json({ errors: "internal server error" });
  }
});

const sendOTP = async (email, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    var transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: "petfeeder@zohomail.in",
        pass: "fK803GCy0SGP",
      },
      debug: false,
      logger: true,
    });
    var mailOptions = {
      from: "petfeeder@zohomail.in",
      to: email,
      subject: "Verify Email",
      html: `<p>your otp for verification is <b>${otp}</b></p>`,
    };
    const hashedotp = await bcryptjs.hash(otp, 10);
    const otpdata = {
      email,
      otp: hashedotp,
      createdAt: Date.now(),
      expiredAt: Date.now() + 3600000,
    };
    const otpcode = OTP(otpdata);
    await otpcode.save();

    await transporter.sendMail(mailOptions);
    res.json({
      message: "Otp sent to email",
    });
  } catch (err) {
    console.log(err)
    res.status(401).json({ errors: "internal server error" });
  }
};

router.post('/getuserdata',fetchuserdets,async(req,res)=>{
  const data = await UD.findById(req.id).select("-password");
  res.status(200).json(data);
});

module.exports = router;