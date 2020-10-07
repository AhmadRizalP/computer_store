const { urlencoded } = require("express");
const express = require("express");
const multer = require("multer");
const models = require("../models/index");
const transaksi = models.transaksi;
const detail_transaksi = models.detail_transaksi;
const app = express();
const dateformat = require("dateformat");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", async (req, res) => {
  let data = await transaksi.findAll({
    include: [
      "customer",
      {
        model: models.detail_transaksi,
        as: "detail_transaksi",
        include: ["product"],
      },
    ],
  });
  res.json({
    data: data,
  });
});

app.get("/:transaksi_id", async (req, res) => {
  let param = {
    transaksi_id: req.params.transaksi_id,
  };
  let data = await transaksi.findOne({
    where: param,
    include: [
      "customer",
      {
        model: models.detail_transaksi,
        as: "detail_transaksi",
        include: ["product"],
      },
    ],
  });
  res.json({
    data: data,
  });
});

app.post("/", async (req, res) => {
  let data = {
    customer_id: req.body.customer_id,
    time: dateformat(new Date(), "yyyy-mm-dd HH:MM:ss"),
  };
  transaksi
    .create(data)
    .then((result) => {
      let transaksi_id = result.transaksi_id;
      let detail = JSON.parse(req.body.detail_transaksi);

      detail.forEach((element) => {
        element.transaksi_id = transaksi_id;
      });

      detail_transaksi
        .bulkCreate(detail)
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
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.put("/", async (req, res) => {
  let data = {
    customer_id: req.body.customer_id,
    waktu: req.body.waktu,
  };
  let param = {
    transaksi_id: req.body.transaksi_id,
  };
  transaksi
    .update(data, {
      where: param,
    })
    .then((result) => {
      detail_transaksi
        .destroy({
          where: param,
        })
        .then()
        .catch();
      let transaksi_id = param.transaksi_id;
      let detail = JSON.parse(req.body.detail_transaksi);

      detail.forEach((element) => {
        element.transaksi_id = transaksi_id;
      });

      detail_transaksi
        .bulkCreate(detail)
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
    })
    .catch((error) => {
      res.json({
        message: error.message,
      });
    });
});

app.delete("/:transaksi_id", async (req, res) => {
  let param = {
    transaksi_id: req.params.transaksi_id,
  };
  try {
    await detail_transaksi.destroy({
      where: param,
    });
    await transaksi.destroy({
      where: param,
    });
    res.json({
      message: "data has been deleted",
    });
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
});

module.exports = app;
