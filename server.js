const express = require("express");
const cors = require("cors");
const multer = require("multer");

const {
  ref,
  uploadBytes,
  listAll,
  deleteObject,
} = require("firebase/storage");
const storage = require("./firebase");

//knexとpsqlで作成したDBを繋げるコード↓
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
    database: "mycloset",
    user: "tomomi",
  }
});

const app = express();
app.use(cors());
app.use(express.json());

//multer
const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

//add a picture
app.post("/addpicture", upload.single("pic"),async (req, res) => {
  const file = req.file;
  const imageRef = ref(storage, file.originalname);
  const metatype = { contentType: file.mimetype, name: file.originalname };
  console.log(file.originalname);
  //最初に try ブロック内のコードが実行され、例外がスローされた場合は catch ブロック内のコードが実行されます。
  try {
    //firebaseにアップロードする画像のデータ
    await uploadBytes(imageRef, file.buffer, metatype);
    //knexに差し込むデータ
    await knex("fashion").insert({ name: file.originalname , category: req.body.category, note: req.body.note });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }

  res.status(200).send();
});


