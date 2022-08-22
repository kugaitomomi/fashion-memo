//firestrageに接続して、呼び出す準備をしている。
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCufSzf6mcklMz5WS-j1gLVwCavyUE2EbM",
  authDomain: "fashion-memo-pj.firebaseapp.com",
  projectId: "fashion-memo-pj",
  storageBucket: "fashion-memo-pj.appspot.com",
  messagingSenderId: "458156261361",
  appId: "1:458156261361:web:55a5b53c6d100fc9f8ce50",
};

const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
module.exports = getStorage(firebaseApp);