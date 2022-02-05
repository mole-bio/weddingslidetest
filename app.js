const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser"); // 쿠키, 세션 이해하기 강좌 창고
const multer = require("multer");
const session = require("express-session");
const fs = require("fs");
const nunjucks = require("nunjucks");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

dotenv.config();
const indexRouter = require("./routes");
const userRouter = require("./routes/user");

const app = express();
app.set("port", process.env.PORT || 3000);
app.set("view engine", "html");

nunjucks.configure("views", {
  express: app,
  watch: true,
});

// 미들웨어간의 순서도 중요하다
app.use(morgan("dev"));
app.use("/", express.static(path.join(__dirname, "public")));
// coookie parsing
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session());
// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를생성합니다.");
  fs.mkdirSync("uploads");
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

app.use("/", indexRouter);

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: "weddingslidetest",
    key(req, file, cb) {
      cb(null, "original/${Date.now()}${path.basename(file.originalname)}");
    },
    // destination(req, file, done) {
    //   done(null, "uploads/");
    // },
    // fllename(req, file, done) {
    //   constext = path.extname(file.originalname); // 확장자 추출 3강 참고
    //   done(null, path.basename(flle.originalname, ext) + Date.now() + ext);
    // },
  }),
  limits: { file5ize: 5 * 1024 * 1024 }, // 5MB
});

app.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log(req.file);
  res.join({ url: req.file.location });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.post("/upload", upload.array("many"), (req, res) => {
  console.log(req.files, req.body);
  res.send("ok");
});

app.get("/category/:name", (req, res) => {
  res.send("hi swoosh wildcare");
});

app.use((req, res, next) => {
  res.status(404).send("404 error");
});

app.get("*", (req, res) => {
  res.send("hi swoosh to all requests");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "waiting");
});
