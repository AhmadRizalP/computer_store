const express = require("express");
const multer = require("multer");
const app = express();
// call model
const models = require("../models/index");
const customer = models.customer;
const path = require("path");
const fs = require("fs");
// config multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./product_image");
  },
  filename: (req, file, cb) => {
    cb(null, "img-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
});

app.get("/", (req, res) => {
  // ambil data
  customer
    .findAll()
    .then((result) => {
      res.json({
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.get("/:customer_id", (req, res) => {
  // ambil data by id
  let param = {
    customer_id: req.body.customer_id,
  };
  customer
    .findOne({
      where: param,
    })
    .then((result) => {
      res.json({
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.post("/", upload.single("image"), (req, res) => {
  // insert data
  if (!req.file) {
    res.json({
      message: "no uploaded file",
    });
  } else {
    let data = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      image: req.file.filename,
    };
    // insert data
    customer
      .create(data)
      .then((result) => {
        res.json({
          message: "data has been inserted",
        });
      })
      .catch((error) => {
        res.json({
          message: error.message,
        });
      });
  }
});

app.put("/", upload.single("image"), async (req, res) => {
  // update data
  let param = {
    customer_id: req.body.customer_id,
  };
  let data = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
  };
  if (req.file) {
    // get data by id
    const row = await customer.findOne({
      where: param,
    });
    let oldFileName = row.image;
    // delete old file
    let dir = path.join(__dirname, "../product_image", oldFileName);
    fs.unlink(dir, (err) => console.log(err));
    // set new filename
    data.image = req.file.filename;
  }
  customer
    .update(data, {
      where: param,
    })
    .then((result) => {
      res.json({
        message: "data has been updated",
      });
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.delete("/:customer_id", async (req, res) => {
  // delete data
  try {
    let param = {
      customer_id: req.params.customer_id,
    };
    let result = await customer.findOne({
      where: param,
    });
    let oldFileName = result.image;
    // delete old file
    let dir = path.join(__dirname, "../product_image", oldFileName);
    fs.unlink(dir, (err) => console.log(err));
    // delete data
    customer
      .destroy({
        where: param,
      })
      .then((result) => {
        res.json({
          message: "data has been deleted",
        });
      })
      .catch((error) => {
        res.json({
          message: error.message,
        });
      });
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
});

module.exports = app;
