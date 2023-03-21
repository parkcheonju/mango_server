const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;
const models = require("./models");

/*=================================  multer ======================================= */

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

/*================================== 환경설정  ================================= */

app.use(express.json()); //json파일을 처리할 수 있게 하는 메서드
app.use(cors());
app.use("/uploads", express.static("uploads")); //업로드 생성 매핑

/*================================ get.banners ======================================== */

app.get("/banners", (req, res) => {
  models.Banner.findAll({
    limit: 2,
  })
    .then((result) => {
      res.send({
        banners: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("에러가 발생했습니다");
    });
});

/*================================ get.products ===================================== */

app.get("/products", function (req, res) {
  models.Product.findAll({
    //findAll은 어떤걸 내보낼지 스스로 설정할 수 있음
    /* 데이터제한 데이터 많을 시응답속도 개선에 도움이됨 */
    // limit: 1,
    /* 정렬기능 ASC,DESC*/
    //최신 등록일 순으로 설정
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "price", "seller", "imageUrl", "createdAt", "soldout"],
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

/*============================== get./products/:id" ========================================== */

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

/*================================ post.image ======================================== */

/* 0317 multer*/
app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});

/*================================= post.products ===================================== */

app.post("/products", function (req, res) {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  /* 앞단 방어코드 */
  /*   if (!name || !description || !price || !seller) {
    res.send("모든필드를 입력하세요.");
  } */
  models.Product.create({
    name,
    description,
    price,
    seller,
    imageUrl,
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

/*================================== post.login ====================================== */

app.post("/login", function (req, res) {
  res.send("로그인이 완료 되었습니다.");
});

/*================================ listen ======================================== */

app.listen(port, () => {
  console.log("기명섭의 정신이 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(function () {
      console.log("연결성공!");
    })
    .catch(function () {
      console.error("error");
      console.log("error");
      process.exit();
    });
});
