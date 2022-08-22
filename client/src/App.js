import axios from "axios";
import { useEffect, useState } from "react";
import './App.css';

function App() {

  const [allPics, setAllPics] = useState([]);
  useEffect(() => {
    getAllInfo();
  },[allPics]);

  const getAllInfo = async () => {
    await axios.get('http://localhost:5000/pictures').then(res => {
      setAllPics(res.data);
      console.log(allPics);
    }).catch((error) => {
      console.log(error.messeage);
    })
  }

  const handleDelete = async (name) => {
    await axios
      .delete("http://localhost:5000/delete", {
        //bodyに値をセットする場合は、第2引数にdataというキー名でセットする。
        data: { name: name },
      })
      .then(getAllInfo())
      .catch((error) => console.log(error.message));
  };



  return (
    <div className="App">

    <div className="imgsContainer">
      {allPics && allPics.map((pic, index) => {
        return <div className="imgItem" key={index}><img src={pic.url} alt={pic.name} width="50%" /><p>{pic.category}</p><p>{pic.note}</p><button className="imgButton" onClick={() => handleDelete(pic.name)}>Delete</button></div>
      
      })}
      
    </div>
    </div>
  );
}

export default App;
