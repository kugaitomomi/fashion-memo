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


//get all picture
app.get("/pictures", async(req, res) => {
  //↓↓fire storageに格納されているファイルを定数に格納している。
  const listRef = ref(storage);

  //↓↓配列にして、for文で一つ一つ取り出してデータをJson形式で表示している。
  const productPictures = [];
  await listAll(listRef).then(async (pics) => {
  for(const item of pics.items){
    //firebaseに格納されているファイルのurl取得
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${item._location.bucket}/o/${item._location.path_}?alt=media`;
      //knexに格納されているデータの取得
      //knex.select(取得したい情報の名前1, 取得したい情報の名前2・・・).from(テーブル名).where(カラム名, 照らし合わせたい情報名(今回は、ヘッダー情報の(item.name)).first();
      //↓今回は画像名をキーにして、呼び出したい画像名とDBに格納されている画像名を照らし合わせて取得している。
      const serachResult = await knex.select("category", "note").from("fashion").where("name", item.name).first();
      //「定数・変数名?.プロティ」の「?」は、もし該当する値があれば。という意味。
      const category = serachResult?.category;
      const note = serachResult?.note;
      console.log(item.name);
      console.log(serachResult);
      //配列に情報を格納している↓
      productPictures.push({
        url: publicUrl,
        name: item._location.path_,
        category,
        note,
      });
  };
  //配列にして、情報をクライアントに投げている。↓
    res.status(200).send(productPictures);
  })
  .catch((err) => console.error(err));
})


