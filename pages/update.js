import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import Nav from "@/components/nav";

function Update() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  const [selectedType, setSelectedType] = useState("PrintedBook");

  const [filePath, setFilePath] = useState("");
  const [fileURL, setFileURL] = useState("");

  const [videoFilePath, setVideoFilePath] = useState("");
  const [VideoFileURL, setVideoFileURL] = useState("");

  const [audioFilePath, setAudioFilePath] = useState("");
  const [AudioFileURL, setAudioFileURL] = useState("");

  const [eBookFilePath, setEBookFilePath] = useState("");
  const [eBookFileURL, setEBookFileURL] = useState("");

  const [name, setName] = useState("");

  let trailerFile;

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
    setSelectedProduct({ ...selectedProduct, trailer: publicUrl });
  }

  async function handleCoverUpload(event) {
    event.preventDefault();
    const file = event.target.files[0];

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

    const coverObj = selectedProduct.PrintedBooks.cover[0];
    const newCoverObj = { ...coverObj, source: publicUrl };
    const printedBooksObj = {
      ...selectedProduct.PrintedBooks,
      cover: [newCoverObj],
    };
    setSelectedProduct({ ...selectedProduct, PrintedBooks: printedBooksObj });
  }

  async function handleEBookUpload(event) {
    event.preventDefault();

    const eBookFile = event.target.files[0];

    console.log(eBookFile);

    const { data, error } = await supabase.storage
      .from("eBooks")
      .upload(`/file_${eBookFile.name}`, eBookFile, {
        cacheControl: "3600",
        upsert: true,
      });

    data && setEBookFilePath(data.path);
    console.log("eBook file path ...", data.path);

    console.log("eBook file return info ...", JSON.stringify(data, null, 2));
    console.log("eBook file return error ...", JSON.stringify(error, null, 2));

    data.path && console.log(`${data.path} returned`);

    const publicUrl = supabase.storage
      .from("eBooks")
      .getPublicUrl(`${data.path}`).data.publicUrl;

    console.log(`${publicUrl} returned`);

    setEBookFileURL(publicUrl);
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

  async function getProducts() {
    const { data, error } = await supabase.from("Titles").select(
      `
        *,
        Audiobooks ( * ),
        Ebooks ( * ),
        PrintedBooks ( *,
          options:PrintOptions ( *,
            size:PrintSize( * )
          ),
          cover:PrintedCover( * )
        ),
        CardBooks ( * ),
        TitlesAwards ( *, awards: Awards(*) )
      `
    );

    data &&
      (setProducts(data),
      console.log("all products data", JSON.stringify(data, null, 2)));
    error && console.error(JSON.stringify(error, null, 2));
  }

  async function getFiles(url) {
    let trailerFile = await fetch(url)
      .then((r) => r.blob())
      .then(
        (blobFile) => new File([blobFile], "trailerFile", { type: "video/3gp" })
      );
    return trailerFile;
  }

  async function getProductByTableAndID(titleID, table, id) {
    setSelectedType(table);

    const { data, error } = await supabase
      .from("Titles")
      .select(
        `
        *,
        CardBooks ( * ),
        Audiobooks ( * ),
        Ebooks ( * ),
        PrintedBooks ( *,
          options:PrintOptions ( *,
            size:PrintSize( * )
          ),
        cover:PrintedCover( * )
        ),
        TitlesAwards ( *,  awards: Awards(*) )
      `
      )
      .eq("id", titleID)
      .single();

    data && setSelectedProduct(data);
    data && setName(data.name);

    data && console.log("selected product ... ", JSON.stringify(data, null, 2));

    error && console.log(JSON.stringify(error, null, 2));

    if (!error) {
      trailerFile = await getFiles(data.traier);
      console.log("Trailer File", trailerFile);
    }
  }

  function changeProduct() {
    const SelectedProductObject = JSON.parse(
      document.getElementById("productSelect").value
    );

    const id = SelectedProductObject.id;
    const table = SelectedProductObject.type;
    const titleID = SelectedProductObject.title;

    console.log("selected object ... ", SelectedProductObject);

    getProductByTableAndID(titleID, table, id);
  }

  function changePrintBookIsPublished(event) {
    console.log("change is published ...", event.target.checked);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      is_published: event.target.checked,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookIsFeatured(event) {
    console.log("change is featured ...", event.target.checked);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      is_featured: event.target.checked,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className={styles.container}>
      <h1> Update Product </h1>

      <select onChange={changeProduct} id="productSelect">
        <option key={"select Product"} disabled selected value="false">
          -- select Product --
        </option>

        {products.map((title) => {
          const optionValues = [
            {
              title: title.id,
              type: "Audiobooks",
              id: title.Audiobooks ? title.Audiobooks.id : 0,
            },
            {
              title: title.id,
              type: "Ebooks",
              id: title.Ebooks ? title.Ebooks.id : 0,
            },
            {
              title: title.id,
              type: "PrintedBooks",
              id: title.PrintedBooks ? title.PrintedBooks.id : 0,
            },
            {
              title: title.id,
              type: "CardBooks",
              id: title.CardBooks ? title.CardBooks.id : 0,
            },
          ];

          const audioString = JSON.stringify(optionValues[0]);
          const ebooktring = JSON.stringify(optionValues[1]);
          const printedString = JSON.stringify(optionValues[2]);
          const cardString = JSON.stringify(optionValues[3]);

          return (
            <>
              {title.Audiobooks && (
                <option key={audioString} value={audioString}>
                  {title.name} - Audiobok
                </option>
              )}
              {title.Ebooks && (
                <option key={ebooktring} value={ebooktring}>
                  {title.name} - eBook
                </option>
              )}
              {title.PrintedBooks && (
                <option key={printedString} value={printedString}>
                  {title.name} - printed book
                </option>
              )}
              {title.CardBooks && (
                <option key={cardString} value={cardString}>
                  {title.name} - book 2.0
                </option>
              )}
            </>
          );
        })}
      </select>

      <div className={styles.container}>
        <pre> {JSON.stringify(selectedProduct, null, 2)}</pre>
      </div>

      <p> selected product {selectedProduct && selectedProduct.name}</p>

      {selectedProduct && (
        <form
          // onSubmit={handleSubmit}
          className={styles.form}
        >
          <label htmlFor="name"> Name </label>
          <input
            type="text"
            id="name"
            name="name"
            value={selectedProduct.name || ""}
            onChange={(e) => {
              setSelectedProduct({ ...selectedProduct, name: e.target.value });
            }}
          />

          <label htmlFor="description"> description </label>
          <textarea
            type="text"
            rows="4"
            cols="50"
            id="description"
            name="description"
            value={selectedProduct.description || ""}
            onChange={(e) => {
              setSelectedProduct({
                ...selectedProduct,
                description: e.target.value,
              });
            }}
          ></textarea>

          <label htmlFor="thesis"> thesis </label>
          <textarea
            type="text"
            rows="4"
            cols="50"
            id="thesis"
            name="thesis"
            value={selectedProduct.thesis || ""}
            onChange={(e) => {
              setSelectedProduct({
                ...selectedProduct,
                thesis: e.target.value,
              });
            }}
          ></textarea>

          <label htmlFor="trailer"> trailer </label>
          <p>{selectedProduct.trailer}</p>
          {selectedProduct && (
            <video
              src={selectedProduct.trailer}
              alt={selectedProduct.trailer}
            />
          )}
          <input
            type="file"
            id="trailer"
            name="trailer"
            onChange={handleTrailerUpload}
          />

          <label htmlFor="ageRestriction"> Age Restriction </label>
          <input
            type="number"
            min="0"
            id="ageRestriction"
            name="ageRestriction"
            value={selectedProduct.age_restriction || ""}
            onChange={(e) => {
              setSelectedProduct({
                ...selectedProduct,
                age_restriction: e.target.value,
              });
            }}
          />

          {selectedType == "PrintedBooks" && (
            <div className={styles.container}>
              <h1> Printed Book options </h1>

              <label htmlFor="pages"> Pages </label>
              <input
                type="number"
                min="0"
                id="pages"
                name="pages"
                defaultValue="123"
              />

              <label htmlFor="extra"> Extra Info </label>
              <input
                type="text"
                id="extra"
                name="extra"
                defaultValue="Some extra info text"
              />

              <label htmlFor="litForm"> literature Form </label>
              <input
                type="text"
                id="litForm"
                name="litForm"
                defaultValue="Роман"
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
              <input
                type="text"
                id="paper"
                name="paper"
                defaultValue="TwoPly"
              />

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
              <input
                type="number"
                id="height"
                name="height"
                defaultValue="42"
              />

              <label htmlFor="cover"> Cover </label>
              {selectedProduct && (
                <img
                  src={selectedProduct.PrintedBooks.cover[0].source}
                  alt={selectedProduct.PrintedBooks.cover[0].source}
                />
              )}
              {selectedProduct && selectedProduct.PrintedBooks.cover[0].source}
              <input
                type="file"
                id="cover"
                name="cover"
                onChange={handleCoverUpload}
              />

              <label htmlFor="isPublished"> Is Published </label>
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                // defaultChecked="checked"
                value={selectedProduct.PrintedBooks.is_published || ""}
                onChange={changePrintBookIsPublished}
              />

              <label htmlFor="publishDate"> Publish Date </label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                defaultValue="2010-10-10"
              />

              <label htmlFor="releaseDate"> Release Date </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                defaultValue="2010-10-10"
              />

              <label htmlFor="isFeatured"> Is Featured </label>
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                // defaultChecked=""
                value={selectedProduct.PrintedBooks.is_featured || ""}
                onChange={changePrintBookIsFeatured}
              />

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

              <label htmlFor="sold"> Number Sold </label>
              <input
                type="number"
                min="0"
                id="sold"
                name="sold"
                defaultValue="0"
              />
            </div>
          )}

          {selectedType == "Audiobooks" && (
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
              {audioFilePath && (
                <audio src={AudioFileURL} alt={audioFilePath} />
              )}
              <input
                type="file"
                id="audioFile"
                name="audioFile"
                onChange={handleAudioUpload}
              />

              <label htmlFor="fileVolume"> File Volume, Mb </label>
              <input
                type="number"
                id="fileVolume"
                name="fileVolume"
                defaultValue="0"
                min="0"
              />
            </div>
          )}

          {selectedType == "Ebooks" && (
            <div className={styles.container}>
              <h1> E-Book options </h1>

              <label htmlFor="eBookExtention">E-Book File Extention </label>
              <select id="eBookExtention" name="eBookExtention">
                <option value="epub"> epub </option>
                <option value="fb2"> fb2 </option>
                <option value="cbr"> cbr </option>
                <option value="opf"> opf </option>
                <option value="mobi"> mobi </option>
                <option value="orb"> orb </option>
                <option value="ibooks"> ibooks </option>
                <option value="edt"> edt </option>
              </select>

              <label htmlFor="ebookFile"> eBook File </label>
              {audioFilePath && (
                <audio src={AudioFileURL} alt={audioFilePath} />
              )}
              <input
                type="file"
                id="ebookFile"
                name="ebookFile"
                onChange={handleEBookUpload}
              />

              <label htmlFor="fileVolume"> File Volume, Mb </label>
              <input
                type="number"
                min="0"
                id="fileVolume"
                name="fileVolume"
                defaultValue="0"
              />

              <label htmlFor="characters"> Characters Number </label>
              <input
                type="number"
                min="0"
                id="characters"
                name="characters"
                defaultValue="10000"
              />

              <label htmlFor="extra"> Extra Info </label>
              <input
                type="text"
                id="extra"
                name="extra"
                defaultValue="Some extra eBook info text"
              />
            </div>
          )}

          {selectedType == "CardBooks" && (
            <div className={styles.container}>
              <h1> Book2.0 options </h1>

              <label htmlFor="extra"> Extra Info </label>
              <input
                type="text"
                id="extra"
                name="extra"
                defaultValue="Some extra eBook info text"
              />
            </div>
          )}

          <button type="submit" className={styles.button}>
            Update Product
          </button>
        </form>
      )}
    </div>
  );
}

function Product() {
  const [selectedType, setSelectedType] = useState("PrintedBook");

  const [filePath, setFilePath] = useState("");
  const [fileURL, setFileURL] = useState("");

  const [videoFilePath, setVideoFilePath] = useState("");
  const [VideoFileURL, setVideoFileURL] = useState("");

  const [audioFilePath, setAudioFilePath] = useState("");
  const [AudioFileURL, setAudioFileURL] = useState("");

  const [eBookFilePath, setEBookFilePath] = useState("");
  const [eBookFileURL, setEBookFileURL] = useState("");

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

  async function handleEBookUpload(event) {
    event.preventDefault();

    const eBookFile = event.target.files[0];

    console.log(eBookFile);

    const { data, error } = await supabase.storage
      .from("eBooks")
      .upload(`/file_${eBookFile.name}`, eBookFile, {
        cacheControl: "3600",
        upsert: true,
      });

    data && setEBookFilePath(data.path);
    console.log("eBook file path ...", data.path);

    console.log("eBook file return info ...", JSON.stringify(data, null, 2));
    console.log("eBook file return error ...", JSON.stringify(error, null, 2));

    data.path && console.log(`${data.path} returned`);

    const publicUrl = supabase.storage
      .from("eBooks")
      .getPublicUrl(`${data.path}`).data.publicUrl;

    console.log(`${publicUrl} returned`);

    setEBookFileURL(publicUrl);
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

  async function setPrintedData() {
    const pages = selectedProduct.PrintedBooks.pages;
    const extra = selectedProduct.PrintedBooks.extra;
    const litForm = selectedProduct.PrintedBooks.litForm;
    const isPublished = selectedProduct.PrintedBooks.isPublished;
    const isFeatured = selectedProduct.PrintedBooks.isFeatured;
    const price = selectedProduct.PrintedBooks.price;
    const discount = selectedProduct.PrintedBooks.discount;
    const sold = selectedProduct.PrintedBooks.sold;
    const publishDate = selectedProduct.PrintedBooks.publishDate;
    const releaseDate = selectedProduct.PrintedBooks.releaseDate;
    const titleID = selectedProduct.id;
    const id = selectedProduct.PrintedBooks.id;

    const { data, error } = await supabase
      .from("PrintedBooks")
      .update({
        pages: pages,
        title_id: titleID,
        extra: extra,
        lit_form: litForm,
        is_published: isPublished,
        is_featured: isFeatured,
        price: price,
        discount: discount,
        sold: sold,
        publish_date: publishDate,
        release_date: releaseDate,
      })
      .eq("id", id)
      .select("*")
      .single();

    console.log("printed data ... ", data);
    console.log("printed data ... ", JSON.stringify(data, null, 2));
    console.log("printed error ... ", error);

    const printedBook_ID = data ? data.id : "no ID for me";

    console.log("printed Book ID ... ", printedBook_ID);

    // return printedBook_ID;
  }

  async function setAudioData() {
    // const hours = +target.hours.value;
    // const minutes = +target.minutes.value;
    // const seconds = +target.seconds.value;

    // const duration = hours * 3600 + minutes * 60 + seconds;
    // const extention = target.extention.value;
    // const fileVolume = target.fileVolume.value;

    // const audioURL = AudioFileURL;

    const duration = selectedProduct.Audiobooks.duration;
    const fileVolume = selectedProduct.Audiobooks.fileVolume;
    const audioURL = selectedProduct.Audiobooks.src;
    const titleID = selectedProduct.id;

    const isPublished = selectedProduct.Audiobooks.isPublished;
    const isFeatured = selectedProduct.Audiobooks.isFeatured;
    const price = selectedProduct.Audiobooks.price;
    const discount = selectedProduct.Audiobooks.discount;
    const sold = selectedProduct.Audiobooks.sold;
    const publishDate = selectedProduct.Audiobooks.publishDate;
    const releaseDate = selectedProduct.Audiobooks.releaseDate;

    const id = selectedProduct.Audiobooks.id;

    const { data, error } = await supabase
      .from("Audiobooks")
      .update({
        duration: duration,
        src: audioURL,
        file_volume: fileVolume,
        is_published: isPublished,
        is_featured: isFeatured,
        price: price,
        discount: discount,
        sold: sold,
        publish_date: publishDate,
        release_date: releaseDate,
        title_id: titleID,
      })
      .eq("id", id)
      .select("*")
      .single();

    console.log("audiobook data ... ", data);
    console.log("audiobook data ... ", JSON.stringify(data, null, 2));
    console.log("audiobook error ... ", error);

    const audioBook_ID = data ? data.id : "no ID for me";

    console.log("audio Book ID ... ", audioBook_ID);

    // return audioBook_ID;
  }

  async function setEBookData() {
    const eBookURL = selectedProduct.Ebooks.src;
    const fileVolume = selectedProduct.Ebooks.fileVolume;
    const characters = selectedProduct.Ebooks.characters;
    const extra = selectedProduct.Ebooks.extra;
    const isPublished = selectedProduct.Ebooks.isPublished;
    const isFeatured = selectedProduct.Ebooks.isFeatured;
    const price = selectedProduct.Ebooks.price;
    const discount = selectedProduct.Ebooks.discount;
    const sold = selectedProduct.Ebooks.sold;
    const publishDate = selectedProduct.Ebooks.publishDate;
    const releaseDate = selectedProduct.Ebooks.releaseDate;
    const titleID = selectedProduct.id;

    const id = selectedProduct.Ebooks.id;

    const { data, error } = await supabase
      .from("Ebooks")
      .update({
        src: eBookURL,
        title_id: titleID,
        file_volume: fileVolume,
        characters: characters,
        extra: extra,
        is_published: isPublished,
        is_featured: isFeatured,
        price: price,
        discount: discount,
        sold: sold,
        publish_date: publishDate,
        release_date: releaseDate,
      })
      .eq("id", id)
      .select()
      .single();

    console.log("ebook data ... ", data);
    console.log("ebook data ... ", JSON.stringify(data, null, 2));
    console.log("ebook error ... ", error);

    const eBook_ID = data ? data.id : "no ID for me";

    console.log("eBook ID ... ", eBook_ID);

    return eBook_ID;
  }

  async function setCardBookData() {
    const extra = selectedProduct.CardBooks.extra;
    const isPublished = selectedProduct.CardBooks.isPublished;
    const isFeatured = selectedProduct.CardBooks.isFeatured;
    const price = selectedProduct.CardBooks.price;
    const discount = selectedProduct.CardBooks.discount;
    const sold = selectedProduct.CardBooks.sold;
    const publishDate = selectedProduct.CardBooks.publishDate;
    const releaseDate = selectedProduct.CardBooks.releaseDate;

    const id = selectedProduct.CardBooks.id;
    const titleID = selectedProduct.id;

    const { data, error } = await supabase
      .from("CardBooks")
      .update({
        title_id: titleID,
        extra: extra,
        is_published: isPublished,
        is_featured: isFeatured,
        price: price,
        discount: discount,
        sold: sold,
        publish_date: publishDate,
        release_date: releaseDate,
      })
      .eq("id", id)
      .select()
      .single();

    console.log("cardBook data ... ", data);
    console.log("cardBook data ... ", JSON.stringify(data, null, 2));
    console.log("cardBook error ... ", error);

    const cardBook_ID = data ? data.id : "no ID for me";

    console.log("cardBook ID ... ", cardBook_ID);

    // return cardBook_ID;
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

  async function getTitleID(titleName) {
    const { data, error } = await supabase
      .from("Titles")
      .select("*")
      .eq("name", titleName)
      .single();

    if (error) {
      console.error("getTitleID ERROR ... ", JSON.stringify(error, null, 2));
      return 0;
    }

    if (data) {
      console.log("getTitleID Data ... ", JSON.stringify(data, null, 2));
      // return Object.keys(data).length && data.id
      return data.id;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    let submitSucessfull = true;

    const name = event.target.name.value;
    const description = event.target.description.value;
    const thesis = event.target.thesis.value;
    const ageRestriction = event.target.ageRestriction.value;

    // let title_id = await getTitleID(name);
    let title_id = selectedProduct.id;

    // if (!title_id) {
    //   console.log("trying to make a new Title!");

    //   const { data, error } = await supabase
    //     .from("Titles")
    //     .insert({
    //       name: name,
    //       description: description,
    //       thesis: thesis,
    //       trailer: VideoFileURL,
    //       age_restriction: ageRestriction,
    //     })
    //     .select("*");

    //   data && (title_id = await data[0].id);
    //   error && console.error("error is ...", error);
    // }

    if (selectedType == "PrintedBooks") {
      const printedBookID = await setPrintedData(event.target, title_id);
      console.log("printed Book ID ... ", printedBookID);
      printedBookID == "no ID for me" && (submitSucessfull = false);

      const coverID = await setCoverData(fileURL, printedBookID);
      console.log("Cover ID ... ", coverID);
      coverID == "no ID for me" && (submitSucessfull = false);

      const printedOptionsID = await setPrintOptionsData(
        event.target,
        printedBookID
      );
      console.log("Printed Options ID ... ", printedOptionsID);
      printedOptionsID == "no ID for me" && (submitSucessfull = false);

      const printSizeID = await setPrintSizeData(
        event.target,
        printedOptionsID
      );
      console.log("Print Size ID ... ", printSizeID);
      printSizeID == "no ID for me" && (submitSucessfull = false);
    }

    if (selectedType == "Audiobooks") {
      const audioBookID = await setAudioData(event.target, title_id);
      console.log("AudioBook ID ... ", audioBookID);
      audioBookID == "no ID for me" && (submitSucessfull = false);
    }

    if (selectedType == "Ebooks") {
      const eBookID = await setEBookData(event.target, title_id);
      console.log("Ebook ID ... ", eBookID);
      eBookID == "no ID for me" && (submitSucessfull = false);
    }

    if (selectedType == "CardBooks") {
      const cardBookID = await setCardBookData(event.target, title_id);
      console.log("CardBook ID ... ", cardBookID);
      cardBookID == "no ID for me" && (submitSucessfull = false);
    }
    // data && console.log("product data ... ", data);

    console.log("product id ... ", title_id);

    event.target.reset();

    // error
    //   ? alert(error)
    submitSucessfull == true
      ? alert(`Created New ${selectedType} Product with name ${name}`)
      : alert(`Creation FAILED for ${selectedType} Product with name ${name}`);

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

        <label htmlFor="trailer"> trailer </label>
        {videoFilePath && <video src={VideoFileURL} alt={videoFilePath} />}
        <input
          type="file"
          id="trailer"
          name="trailer"
          onChange={handleTrailerUpload}
        />

        <label htmlFor="ageRestriction"> Age Restriction </label>
        <input
          type="number"
          min="0"
          id="ageRestriction"
          name="ageRestriction"
          defaultValue="0"
        />

        <label htmlFor="isPublished"> Is Published </label>
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          defaultChecked="checked"
        />

        <label htmlFor="publishDate"> Publish Date </label>
        <input
          type="date"
          id="publishDate"
          name="publishDate"
          defaultValue="2010-10-10"
        />

        <label htmlFor="releaseDate"> Release Date </label>
        <input
          type="date"
          id="releaseDate"
          name="releaseDate"
          defaultValue="2010-10-10"
        />

        <label htmlFor="isFeatured"> Is Featured </label>
        <input
          type="checkbox"
          id="isFeatured"
          name="isFeatured"
          defaultChecked=""
        />

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

        <label htmlFor="sold"> Number Sold </label>
        <input type="number" min="0" id="sold" name="sold" defaultValue="0" />

        <label htmlFor="category"> Type </label>
        <select id="category" name="category" onChange={handleTypeChange}>
          <option value="PrintedBook"> Printed Book </option>
          <option value="Ebook"> e-Book </option>
          <option value="AudioBook"> Audio Book </option>
          <option value="CardBook"> Book 2.0 </option>
        </select>

        {selectedType == "PrintedBook" && (
          <div className={styles.container}>
            <h1> Printed Book options </h1>

            <label htmlFor="pages"> Pages </label>
            <input
              type="number"
              min="0"
              id="pages"
              name="pages"
              defaultValue="123"
            />

            <label htmlFor="extra"> Extra Info </label>
            <input
              type="text"
              id="extra"
              name="extra"
              defaultValue="Some extra info text"
            />

            <label htmlFor="litForm"> literature Form </label>
            <input
              type="text"
              id="litForm"
              name="litForm"
              defaultValue="Роман"
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

            <label htmlFor="fileVolume"> File Volume, Mb </label>
            <input
              type="number"
              id="fileVolume"
              name="fileVolume"
              defaultValue="0"
              min="0"
            />
          </div>
        )}

        {selectedType == "Ebook" && (
          <div className={styles.container}>
            <h1> E-Book options </h1>

            <label htmlFor="eBookExtention">E-Book File Extention </label>
            <select id="eBookExtention" name="eBookExtention">
              <option value="epub"> epub </option>
              <option value="fb2"> fb2 </option>
              <option value="cbr"> cbr </option>
              <option value="opf"> opf </option>
              <option value="mobi"> mobi </option>
              <option value="orb"> orb </option>
              <option value="ibooks"> ibooks </option>
              <option value="edt"> edt </option>
            </select>

            <label htmlFor="ebookFile"> eBook File </label>
            {audioFilePath && <audio src={AudioFileURL} alt={audioFilePath} />}
            <input
              type="file"
              id="ebookFile"
              name="ebookFile"
              onChange={handleEBookUpload}
            />

            <label htmlFor="fileVolume"> File Volume, Mb </label>
            <input
              type="number"
              min="0"
              id="fileVolume"
              name="fileVolume"
              defaultValue="0"
            />

            <label htmlFor="characters"> Characters Number </label>
            <input
              type="number"
              min="0"
              id="characters"
              name="characters"
              defaultValue="10000"
            />

            <label htmlFor="extra"> Extra Info </label>
            <input
              type="text"
              id="extra"
              name="extra"
              defaultValue="Some extra eBook info text"
            />
          </div>
        )}

        {selectedType == "CardBook" && (
          <div className={styles.container}>
            <h1> Book2.0 options </h1>

            <label htmlFor="extra"> Extra Info </label>
            <input
              type="text"
              id="extra"
              name="extra"
              defaultValue="Some extra eBook info text"
            />
          </div>
        )}

        <button type="submit" className={styles.button}>
          Add New Product
        </button>
      </form>

      <Nav />
    </div>
  );
}

export default function UpdateProductPage() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    get_session();
  }, []);

  return (
    <div className={styles.container}>
      {session ? (
        <div>
          <p> logged in as {user.email} </p>
          <Update />
        </div>
      ) : (
        <div> No User Session </div>
      )}
    </div>
  );
}
