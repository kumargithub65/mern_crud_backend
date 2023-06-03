import { users } from "../models/userSchema.js";
import moment from "moment";
import csv from "fast-csv";
import fs from "fs";
import dotenv from "dotenv";
import e from "express";
dotenv.config();

const BASE_URL = process.env.BASE_URL;
// console.log({BASE_URL})

export const userpost = async (req, res) => {
  const file = req.file.filename;
  const { fname, lname, email, mobile, gender, location, status } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !mobile ||
    !gender ||
    !location ||
    !status ||
    !file
  ) {
    res.status(401).json("All Inputs is required");
  }

  try {
    const preuser = await users.findOne({ email: email });

    if (preuser) {
      res.status(401).json("This user already exist in our databse");
    } else {
      const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

      const userData = new users({
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        datecreated,
      });
      await userData.save();
      res.status(200).json(userData);
    }
  } catch (error) {
    res.status(401).json(error);
    // console.log("catch block error" + error);
  }
};

export const getalluser = async (req, res) => {
  const { search, gender, status, sort } = req.query || "";
  const query = { fname: { $regex: search, $options: "i" } };
  //   console.log(status)
  const page = req.query.page || 1;
  // console.log({ page });
  const ITEM_PER_PAGE = 4;

  if (gender !== "All") {
    query.gender = gender;
  }

  if (status !== "All") {
    query.status = status;
  }

  try {
    const skip = (page - 1) * ITEM_PER_PAGE; // 1 * 4 = 4

    const count = await users.countDocuments(query);
    // console.log(count);
    const usersdata = await users
      .find(query)
      .sort({ datecreated: sort == "new" ? -1 : 1 })
      .limit(ITEM_PER_PAGE)
      .skip(skip);

    // console.log(usersdata)
    const pageCount = Math.ceil(count / ITEM_PER_PAGE); // 8 /4 = 2

    res.status(200).json({
      Pagination: {
        count,
        pageCount,
      },
      usersdata,
    });
    // const allusers = await users.find(query).sort({datecreated : sort === "new" ? -1 : 1});
    // res.status(200).json(allusers);
  } catch (err) {
    res.json(400).json(err);
  }
};

export const getsingleuser = async (req, res) => {
  const { id } = req.params;

  try {
    const singleuser = await users.findOne({ _id: id });
    // console.log({singleuser})
    res.status(200).json(singleuser);
  } catch (err) {
    res.json(400).json({ err });
  }
};

export const useredit = async (req, res) => {
  const { id } = req.params;
  const {
    fname,
    lname,
    email,
    mobile,
    gender,
    location,
    status,
    user_profile,
  } = req.body;
  const file = req.file ? req.file.filename : user_profile;

  const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const updateuser = await users.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateUpdated,
      },
      {
        new: true,
      }
    );

    await updateuser.save();
    res.status(200).json(updateuser);
  } catch (error) {
    res.status(401).json(error);
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteUser = await users.findByIdAndDelete({ _id: id });
    res.status(200).json(deleteUser);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const userstatus = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  // console.log(data)
  try {
    const updatestatus = await users.findByIdAndUpdate(
      { _id: id },
      { status: data },
      { new: true }
    );
    // console.log(updatestatus)
    res.status(200).json(updatestatus);
  } catch (error) {
    // console.log(error.message)
    res.status(400).json(error);
  }
};

export const userExport = async (req, res) => {
  // debugger
  try {
    const usersdata = await users.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export/")) {
        if (!fs.existsSync("public/files")) {
            fs.mkdirSync("public/files/");
        }
        if (!fs.existsSync("public/files/export")) {
            fs.mkdirSync("./public/files/export/");
        }
    }

    const writablestream = fs.createWriteStream(
        "public/files/export/users.csv"
    );

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
        res.json({
            downloadUrl: `${BASE_URL}/files/export/users.csv`,
        });
    });
    if (usersdata.length > 0) {
        usersdata.map((user) => {
            csvStream.write({
                FirstName: user.fname ? user.fname : "-",
                LastName: user.lname ? user.lname : "-",
                Email: user.email ? user.email : "-",
                Phone: user.mobile ? user.mobile : "-",
                Gender: user.gender ? user.gender : "-",
                Status: user.status ? user.status : "-",
                Profile: user.profile ? user.profile : "-",
                Location: user.location ? user.location : "-",
                DateCreated: user.datecreated ? user.datecreated : "-",
                DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
            })
        })
    }
    csvStream.end();
    writablestream.end();

} catch (error) {
  console.log(error.message)
    res.status(401).json(error)
}
};
