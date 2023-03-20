// import React, { Component } from 'react' 밑에가 같은 뜻임
const express = require("express");
const cors = require("cors");
const app = express(); /* 이게 주인공 app을불러 서버에 필요한 걸 가져옴*/
const port = 8080;
const models = require("./models");
/* 0317 multer*/
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
}); /* multer */
/* 환경설정 */
app.use(express.json()); //json파일을 처리할 수 있게 하는 메서드
app.use(cors());
app.use("/uploads", express.static("uploads"));
/* 경로설정 */
app.get("/products", function (req, res) {
  models.Product.findAll({
    /* 데이터제한 데이터 많을 시응답속도 개선에 도움이됨 */
    // limit: 1,
    /* 정렬기능 ASC,DESC*/
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "price", "seller", "imageUrl", "createdAt"],
  })
    .then((result) => {
      console.log("product 조회결과:", result);
      res.send({ product: result });
    })
    .catch((err) => {
      console.error(err);
      res.send("에러발생");
    });
});
app.get("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Product.findOne({
    where: { id: id },
  })
    .then((result) => {
      console.log("조회결과", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품조회시 에러가 발생 하였습니다.");
    });
});
/* 0317 multer*/
app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});
//상품생성데이터를 데이터베이스 추가. database.sqlite3 = 저장하드역할
app.post("/products", function (req, res) {
  // body에 post방식으로 요청들어온걸 전부 저장.
  const body = req.body;
  // 저장한것을 상수 body에 각각 아래 키로 구조분해할당.
  const { name, description, price, seller } = body;
  /* 앞단 방어코드 */
  /*   if (!name || !description || !price || !seller) {
    res.send("모든필드를 입력하세요.");
  } */
  //레코드생성
  models.Product.create({
    name,
    description,
    price,
    seller,
  })
    .then((result) => {
      console.log("상품생성결과:", result);
      res.send({ result });
    })
    .catch((err) => {
      console.error(err);
      // res.send("상품업로드에 문제가 생겼습니다.");
    });
});
// method: post, /login 로그인이 완료되었습니다.
app.post("/login", function (req, res) {
  res.send("로그인이 완료 되었습니다.");
});
/* app실행 */
app.listen(port, () => {
  console.log("서버가 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(function () {
      console.log("연결성공");
    })
    .catch(function () {
      console.error("error");
      console.log("error");
      process.exit(); //sever 종료
    });
});