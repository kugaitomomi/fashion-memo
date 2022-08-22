const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const PORT = process.env.PORT || 5000;
const Pool = require("pg").Pool;

const devConfig = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

const proConfig = process.env.DATABASE_URL; //heroku addons

const pool = new Pool({
  connectionString:
    process.env.NODE_ENV === "production" ? proConfig : devConfig,
    ssl:{
        sslmode: 'require',
        rejectUnauthorized: false
    }
});

const {
  ref,
  uploadBytes,
  listAll,
  deleteObject,
} = require("firebase/storage");
const storage = require("./firebase");

//knex
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

console.log(__dirname);
console.log(path.join(__dirname, "client/build"));

// app.use(express.static(path.join(__dirname, "client/build")));

//process.env.PORT
//process.env.NODE_ENV => production or undefined
if (process.env.NODE_ENV === "production") {
  //server static content
  //npm run build
  app.use(express.static(path.join(__dirname, "client/build")));
}

//multer
const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

//add a picture
app.post("/addpicture", upload.single("pic"),async (req, res) => {
  const file = req.file;
  const imageRef = ref(storage, file.originalname);
  const metatype = { contentType: file.mimetype, name: file.originalname };
  console.log(file.originalname);

  try {
    await uploadBytes(imageRef, file.buffer, metatype);
    await knex("fashion").insert({ name: file.originalname , category: req.body.category, note: req.body.note });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }

  res.status(200).send();
});


//get all picture
app.get("/pictures", async(req, res) => {
  const listRef = ref(storage);

  const productPictures = [];
  await listAll(listRef).then(async (pics) => {
  for(const item of pics.items){
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${item._location.bucket}/o/${item._location.path_}?alt=media`;
      const serachResult = await knex.select("category", "note").from("fashion").where("name", item.name).first();
      const category = serachResult?.category;
      const note = serachResult?.note;
      console.log(item.name);
      console.log(serachResult);
      productPictures.push({
        url: publicUrl,
        name: item._location.path_,
        category,
        note,
      });
  };
    res.status(200).send(productPictures);
  })
  .catch((err) => console.error(err));
})


//delete a picture
app.delete("/delete", async(req, res) => {
  const deletePic = req.body.name;
  const deleteRef = ref(storage, deletePic);
  try {
     await deleteObject(deleteRef);
     res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

app.get("*", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, ()=>{
  console.log(`server has started on port ${PORT}`);
});

module.exports=pool;