import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";

function Product() {
  // const router = useRouter();
  const [selectedType, setSelectedType] = useState("PrintedBook");
  // const [file, setFile] = useState([]);
  const [filePath, setFilePath] = useState("");
  const [fileURL, setFileURL] = useState("");

  const [videoFilePath, setVideoFilePath] = useState("");
  const [VideoFileURL, setVideoFileURL] = useState("");

  const [audioFilePath, setAudioFilePath] = useState("");
  const [AudioFileURL, setAudioFileURL] = useState("");

  function handleTypeChange(event) {
    const target = event.target;
    const value = target.value;
    // const name = target.name;

    console.log(value);

    setSelectedType(value);
    console.log(selectedType);
  }

  async function handleCoverUpload(event) {
    event.preventDefault();
    // setFile(event.target.files[0]);
    const file = event.target.files[0];

    // console.log("setting file");
    console.log(file);

    const { data, error } = await supabase.storage
      .from("covers")
      .upload(`public/file_${file.name}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    data && setFilePath(data.path);
    console.log("file path ...", data.path);

    console.log("file return info ...", JSON.stringify(data, null, 2));
    console.log("file return error ...", JSON.stringify(error, null, 2));

    data.path && console.log(`${data.path} returned`);

    const publicUrl = supabase.storage
      .from("covers")
      .getPublicUrl(`${data.path}`).data.publicUrl;

    console.log(`${publicUrl} returned`);

    setFileURL(publicUrl);
  }

  async function handleTrailerUpload(event) {
    event.preventDefault();

    const videoFile = event.target.files[0];

    console.log(videoFile);

    const { data, error } = await supabase.storage
      .from("trailers")
      .upload(`public/file_${videoFile.name}`, videoFile, {
        cacheControl: "3600",
        upsert: true,
      });

    data && setVideoFilePath(data.path);
    console.log("video file path ...", data.path);

    console.log("video file return info ...", JSON.stringify(data, null, 2));
    console.log("video file return error ...", JSON.stringify(error, null, 2));

    data.path && console.log(`${data.path} returned`);

    const publicUrl = supabase.storage
      .from("trailers")
      .getPublicUrl(`${data.path}`).data.publicUrl;

    console.log(`${publicUrl} returned`);

    setVideoFileURL(publicUrl);
  }

  async function handleAudioUpload(event) {
    event.preventDefault();

    const audioFile = event.target.files[0];

    console.log(audioFile);

    const { data, error } = await supabase.storage
      .from("audiobooks")
      .upload(`/file_${audioFile.name}`, audioFile, {
        cacheControl: "3600",
        upsert: true,
      });

    data && setAudioFilePath(data.path);
    console.log("audio file path ...", data.path);

    console.log("audio file return info ...", JSON.stringify(data, null, 2));
    console.log("audio file return error ...", JSON.stringify(error, null, 2));

    data.path && console.log(`${data.path} returned`);

    const publicUrl = supabase.storage
      .from("audiobooks")
      .getPublicUrl(`${data.path}`).data.publicUrl;

    console.log(`${publicUrl} returned`);

    setAudioFileURL(publicUrl);
  }

  async function setPrintedData(target, productID) {
    const description = target.description.value;
    const thesis = target.thesis.value;
    const pages = target.pages.value;
    const trailer = VideoFileURL;
    // const cover = filePath;

    const { data, error } = await supabase
      .from("PrintedBooks")
      .insert({
        description: description,
        thesis: thesis,
        trailer: trailer,
        pages: pages,
        ProductID: productID,
      })
      .select("*")
      .single();

    console.log("printed data ... ", data);
    console.log("printed data ... ", JSON.stringify(data, null, 2));
    console.log("printed error ... ", error);

    const printedBook_ID = data ? data.id : "no ID for me";

    console.log("printed Book ID ... ", printedBook_ID);

    return printedBook_ID;
  }

  async function setAudioData(target, productID) {
    const hours = +target.hours.value;
    const minutes = +target.minutes.value;
    const seconds = +target.seconds.value;

    const duration = hours * 3600 + minutes * 60 + seconds;
    const extention = target.extention.value;
    const audioURL = AudioFileURL;

    const { data, error } = await supabase
      .from("Audiobooks")
      .insert({
        duration: duration,
        fileExtention: extention,
        src: audioURL,
        productID: productID,
      })
      .select("*")
      .single();

    console.log("audiobook data ... ", data);
    console.log("audiobook data ... ", JSON.stringify(data, null, 2));
    console.log("audiobook error ... ", error);

    const audioBook_ID = data ? data.id : "no ID for me";

    console.log("audio Book ID ... ", audioBook_ID);

    return audioBook_ID;
  }

  async function setCoverData(coverUrl, printedBookID) {
    // const cover = filePath;

    const { data, error } = await supabase
      .from("PrintedCover")
      .insert({
        PrintedBookID: printedBookID,
        source: coverUrl,
        shade: "light",
        blurHash: "NoHash",
      })
      .select("*")
      .single();

    console.log("cover data ... ", data);
    console.log("cover data ... ", JSON.stringify(data, null, 2));
    console.log("cover error ... ", error);

    const cover_ID = data ? data.id : "no ID for me";

    console.log("printed Book ID ... ", cover_ID);

    return cover_ID;
  }

  async function setPrintOptionsData(target, printedBookID) {
    const bindings = target.bindings.value;
    const coverType = target.coverType.value;
    const paper = target.paper.value;
    const illustrations = target.illustrations.value;

    const { data, error } = await supabase
      .from("PrintOptions")
      .insert({
        bindings: bindings,
        cover: coverType,
        paper: paper,
        illustrations: illustrations,
        PrintedBookID: printedBookID,
      })
      .select("*")
      .single();

    console.log("print options data ... ", data);
    console.log("print options data ... ", JSON.stringify(data, null, 2));
    console.log("print options error ... ", error);

    const printOptionsID = data ? data.id : "no ID for me";

    console.log("print Options ID ... ", printOptionsID);

    return printOptionsID;
  }

  async function setPrintSizeData(target, printOptionsID) {
    const width = target.width.value;
    const height = target.height.value;

    const { data, error } = await supabase
      .from("PrintSize")
      .insert({
        width: width,
        height: height,
        PrintOptionsID: printOptionsID,
      })
      .select("*")
      .single();

    console.log("print size data ... ", data);
    console.log("print size data ... ", JSON.stringify(data, null, 2));
    console.log("print size error ... ", error);

    const printSizeID = data ? data.id : "no ID for me";

    console.log("print Size ID ... ", printSizeID);

    return printSizeID;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = event.target.name.value;
    const category = event.target.category.value;
    const price = event.target.price.value;
    const discount = event.target.discount.value;

    const { data, error } = await supabase
      .from("Products")
      .insert({
        name: name,
        category: category,
        price: price,
        discount: discount,
      })
      .select("*");

    const product_id = await data[0].id;

    if (selectedType == "PrintedBook") {
      const printedBookID = await setPrintedData(event.target, product_id);
      console.log("printed Book ID ... ", printedBookID);

      const coverID = await setCoverData(fileURL, printedBookID);
      console.log("Cover ID ... ", coverID);

      const printedOptionsID = await setPrintOptionsData(
        event.target,
        printedBookID
      );
      console.log("Printed Options ID ... ", printedOptionsID);

      const printSizeID = await setPrintSizeData(
        event.target,
        printedOptionsID
      );
      console.log("Print Size ID ... ", printSizeID);
    }

    if (selectedType == "AudioBook") {
      const audioBookID = await setAudioData(event.target, product_id);
      console.log("AudioBook ID ... ", audioBookID);
    }

    console.log("product data ... ", data);

    console.log("product id ... ", product_id);

    event.target.reset();

    error
      ? alert(error)
      : alert(`Created New ${selectedType} Product with name ${name}`);

    // router.reload();
  }

  return (
    <div className={styles.container}>
      <h1> Add Product </h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="name"> Name </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue="NewProductName"
        />

        <label htmlFor="category"> Type </label>
        <select id="category" name="category" onChange={handleTypeChange}>
          <option value="PrintedBook"> Printed Book </option>
          <option value="Ebook"> e-Book </option>
          <option value="AudioBook"> Audio Book </option>
          <option value="CardBook"> Book 2.0 </option>
        </select>

        <label htmlFor="price"> Price </label>
        <input
          type="number"
          min="0"
          id="price"
          name="price"
          defaultValue="150"
        />

        <label htmlFor="discount"> Discount </label>
        <input
          type="number"
          min="0"
          id="discount"
          name="discount"
          defaultValue="0"
        />

        {selectedType == "PrintedBook" && (
          <div className={styles.container}>
            <h1> Printed Book options </h1>

            <label htmlFor="description"> description </label>
            <input
              type="text"
              min="0"
              id="description"
              name="description"
              defaultValue="some description"
            />

            <label htmlFor="thesis"> thesis </label>
            <input
              type="text"
              min="0"
              id="thesis"
              name="thesis"
              defaultValue="some thesis"
            />

            <label htmlFor="pages"> Pages </label>
            <input
              type="number"
              min="0"
              id="pages"
              name="pages"
              defaultValue="123"
            />

            <label htmlFor="bindings"> Bindings </label>
            <input
              type="text"
              id="bindings"
              name="bindings"
              defaultValue="HardCore!"
            />

            <label htmlFor="coverType"> CoverType </label>
            <input
              type="text"
              id="coverType"
              name="coverType"
              defaultValue="DisCover!"
            />

            <label htmlFor="paper"> Paper </label>
            <input type="text" id="paper" name="paper" defaultValue="TwoPly" />

            <label htmlFor="illustrations"> Illustrations </label>
            <input
              type="text"
              id="illustrations"
              name="illustrations"
              defaultValue="Dazzling!"
            />

            <label htmlFor="width"> Width </label>
            <input type="number" id="width" name="width" defaultValue="42" />

            <label htmlFor="height"> Height </label>
            <input type="number" id="height" name="height" defaultValue="42" />

            <label htmlFor="cover"> Cover </label>
            {filePath && <img src={fileURL} alt={filePath} />}
            <input
              type="file"
              id="cover"
              name="cover"
              onChange={handleCoverUpload}
            />

            <label htmlFor="trailer"> trailer </label>
            {videoFilePath && <video src={VideoFileURL} alt={videoFilePath} />}
            <input
              type="file"
              id="trailer"
              name="trailer"
              onChange={handleTrailerUpload}
            />
          </div>
        )}

        {selectedType == "AudioBook" && (
          <div className={styles.container}>
            <h1> Audio Book options </h1>

            <div className={styles.container}>
              <h1> Duration </h1>
              <label htmlFor="hours"> Hours </label>
              <input
                type="number"
                id="hours"
                name="hours"
                defaultValue="0"
                min="0"
              />

              <label htmlFor="minutes"> Minutes </label>
              <input
                type="number"
                id="minutes"
                name="minutes"
                defaultValue="0"
                min="0"
                max="59"
              />

              <label htmlFor="seconds"> Seconds </label>
              <input
                type="number"
                id="seconds"
                name="seconds"
                defaultValue="0"
                min="0"
                max="59"
              />
            </div>

            <label htmlFor="extention">File Extention </label>
            <select id="extention" name="extention">
              <option value="MP3"> MP3 </option>
              <option value="AAC"> AAC </option>
              <option value="AAX"> AAX </option>
              <option value="M4A"> M4A </option>
              <option value="M4B"> M4B </option>
              <option value="OGG"> OGG </option>
              <option value="WMA"> WMA </option>
            </select>

            <label htmlFor="audioFile"> Audio File </label>
            {audioFilePath && <audio src={AudioFileURL} alt={audioFilePath} />}
            <input
              type="file"
              id="audioFile"
              name="audioFile"
              onChange={handleAudioUpload}
            />
          </div>
        )}

        <button type="submit" className={styles.button}>
          Add New Product
        </button>
      </form>

      <div className={styles.container}>
        <Link href="/">Back to home</Link>
        <Link href="/login">Login</Link>
        <Link href="/awards">Add / Remove Awards</Link>
        <Link href="/deleteProduct">Delete Products</Link>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  // const [product, setProduct] = useState(null);

  const get_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const get_products = async () => {
    try {
      const { data: products, error } = await supabase
        .from("Products")
        .select(
          `
        id,
        name,
        category,
        Audiobooks ( * ),
        Ebooks ( * ),
        PrintedBooks ( *,
          options:PrintOptions ( *,
            size:PrintSize( * )
          ),
          cover:PrintedCover( * )
        ),
        Awards ( * )
        `
        )
        .eq("name", params.title);
      // .eq("name", "Awesome Title");

      if (error) {
        console.error(error);
      } else {
        setProducts(products);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    get_session();
    // get_products();
  }, []);

  // console.log(products);
  return (
    <div className={styles.container}>
      {session ? (
        <div>
          <p> logged in as {user.email} </p>
          <Product />
        </div>
      ) : (
        <div> No User Session </div>
      )}
    </div>
  );
}
