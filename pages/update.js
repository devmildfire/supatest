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

  async function handleSubmit(event) {
    event.preventDefault();

    let submitSucessfull = true;

    const name = selectedProduct.name;
    const description = selectedProduct.description;
    const thesis = selectedProduct.thesis;
    const trailer = selectedProduct.trailer;
    const ageRestriction = selectedProduct.age_restriction;

    // let title_id = await getTitleID(name);
    let title_id = selectedProduct.id;

    console.log(`trying to update a Title ${title_id} !`);

    const { data, error } = await supabase
      .from("Titles")
      .update({
        name: name,
        description: description,
        thesis: thesis,
        trailer: trailer,
        age_restriction: ageRestriction,
      })
      .eq("id", title_id)
      .select()
      .single();

    data && (title_id = await data.id);
    error && console.error("error is ...", error);

    if (selectedType == "PrintedBooks") {
      // const printedBookID = await setPrintedData(event.target, title_id);
      const result = await setPrintedData();
      console.log(result);

      // console.log("printed Book ID ... ", printedBookID);
      // printedBookID == "no ID for me" && (submitSucessfull = false);

      // const coverID = await setCoverData(fileURL, printedBookID);
      // console.log("Cover ID ... ", coverID);
      // coverID == "no ID for me" && (submitSucessfull = false);

      // const printedOptionsID = await setPrintOptionsData(
      //   event.target,
      //   printedBookID
      // );
      // console.log("Printed Options ID ... ", printedOptionsID);
      // printedOptionsID == "no ID for me" && (submitSucessfull = false);

      // const printSizeID = await setPrintSizeData(
      //   event.target,
      //   printedOptionsID
      // );
      // console.log("Print Size ID ... ", printSizeID);
      // printSizeID == "no ID for me" && (submitSucessfull = false);
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

  async function setPrintedData() {
    const pages = selectedProduct.PrintedBooks.pages;
    const extra = selectedProduct.PrintedBooks.extra;
    const litForm = selectedProduct.PrintedBooks.lit_form;
    const isPublished = selectedProduct.PrintedBooks.is_published;
    const isFeatured = selectedProduct.PrintedBooks.is_featured;
    const price = selectedProduct.PrintedBooks.price;
    const discount = selectedProduct.PrintedBooks.discount;
    const sold = selectedProduct.PrintedBooks.sold;
    const publishDate = selectedProduct.PrintedBooks.publish_date;
    const releaseDate = selectedProduct.PrintedBooks.release_date;
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

    return data ? data : error;
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
    const audiobookObj = {
      ...selectedProduct.Audiobooks,
      src: publicUrl,
    };
    setSelectedProduct({ ...selectedProduct, Audiobooks: audiobookObj });
  }

  async function getProducts() {
    const { data, error } = await supabase
      .from("Titles")
      .select(
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
      )
      .order("id", { ascending: true });

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

  function changePrintBookPages(event) {
    console.log("change pages ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      pages: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookExtra(event) {
    console.log("change extra ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      extra: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookLitForm(event) {
    console.log("change lit form ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      lit_form: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookBindings(event) {
    console.log("change bindings ...", event.target.value);

    const optionsObj = {
      ...selectedProduct.PrintedBooks.options[0],
      bindings: event.target.value,
    };

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      options: [optionsObj],
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookCover(event) {
    console.log("change cover ...", event.target.value);

    const optionsObj = {
      ...selectedProduct.PrintedBooks.options[0],
      cover: event.target.value,
    };

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      options: [optionsObj],
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookPaper(event) {
    console.log("change paper ...", event.target.value);

    const optionsObj = {
      ...selectedProduct.PrintedBooks.options[0],
      paper: event.target.value,
    };

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      options: [optionsObj],
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookIllustrations(event) {
    console.log("change illustrations ...", event.target.value);

    const optionsObj = {
      ...selectedProduct.PrintedBooks.options[0],
      illustrations: event.target.value,
    };

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      options: [optionsObj],
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookHeight(event) {
    console.log("change height ...", event.target.value);

    const sizeObj = {
      ...selectedProduct.PrintedBooks.options[0].size[0],
      height: event.target.value,
    };

    const optionsObj = {
      ...selectedProduct.PrintedBooks.options[0],
      size: [sizeObj],
    };

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      options: [optionsObj],
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookWidth(event) {
    console.log("change width ...", event.target.value);

    const sizeObj = {
      ...selectedProduct.PrintedBooks.options[0].size[0],
      width: event.target.value,
    };

    const optionsObj = {
      ...selectedProduct.PrintedBooks.options[0],
      size: [sizeObj],
    };

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      options: [optionsObj],
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookPublishDate(event) {
    console.log("change publish date ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      publish_date: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookReleaseDate(event) {
    console.log("change release date ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      release_date: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookPrice(event) {
    console.log("change price ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      price: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookDiscount(event) {
    console.log("change discount ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      discount: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function changePrintBookSold(event) {
    console.log("change sold ...", event.target.value);

    const printedBookObj = {
      ...selectedProduct.PrintedBooks,
      sold: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      PrintedBooks: printedBookObj,
    });
  }

  function getWholeHours(duration) {
    return Math.floor(duration / 3600);
  }

  function getWholeMinutes(duration) {
    const minutes = Math.floor(
      (duration - getWholeHours(duration) * 3600) / 60
    );
    return minutes;
  }

  function getSeconds(duration) {
    const seconds =
      duration -
      getWholeHours(duration) * 3600 -
      getWholeMinutes(duration) * 60;
    return seconds;
  }

  function changeAudiobooksDuration(event) {
    const hours = +document.getElementById("hours").value;
    const minutes = +document.getElementById("minutes").value;
    const seconds = +document.getElementById("seconds").value;

    const duration = 3600 * hours + 60 * minutes + seconds;

    const AudiobookObj = {
      ...selectedProduct.Audiobooks,
      duration: duration,
    };

    setSelectedProduct({
      ...selectedProduct,
      Audiobooks: AudiobookObj,
    });
  }

  function changeAudiobooksFileVolume(event) {
    console.log("change file volume ...", event.target.value);

    const audiobookObj = {
      ...selectedProduct.Audiobooks,
      file_volume: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      Audiobooks: audiobookObj,
    });
  }

  function changeAudiobookPublishDate(event) {
    console.log("change publish date ...", event.target.value);

    const audiobookObj = {
      ...selectedProduct.Audiobooks,
      publish_date: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      Audiobooks: audiobookObj,
    });
  }

  function changeAudiobookReleaseDate(event) {
    console.log("change release date ...", event.target.value);

    const audiobookObj = {
      ...selectedProduct.Audiobooks,
      release_date: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      Audiobooks: audiobookObj,
    });
  }

  function changeAudiobookPrice(event) {
    console.log("change price ...", event.target.value);

    const audiobookObj = {
      ...selectedProduct.Audiobooks,
      price: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      Audiobooks: audiobookObj,
    });
  }

  function changeAudiobookDiscount(event) {
    console.log("change discount ...", event.target.value);

    const audiobookObj = {
      ...selectedProduct.Audiobooks,
      discount: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      Audiobooks: audiobookObj,
    });
  }

  function changeAudiobookSold(event) {
    console.log("change sold ...", event.target.value);

    const audiobookObj = {
      ...selectedProduct.Audiobooks,
      sold: event.target.value,
    };

    setSelectedProduct({
      ...selectedProduct,
      Audiobooks: audiobookObj,
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
        <form onSubmit={handleSubmit} className={styles.form}>
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
                // defaultValue="123"
                value={selectedProduct.PrintedBooks.pages || ""}
                onChange={changePrintBookPages}
              />

              <label htmlFor="extra"> Extra Info </label>
              <input
                type="text"
                id="extra"
                name="extra"
                // defaultValue="Some extra info text"
                value={selectedProduct.PrintedBooks.extra || ""}
                onChange={changePrintBookExtra}
              />

              <label htmlFor="litForm"> literature Form </label>
              <input
                type="text"
                id="litForm"
                name="litForm"
                // defaultValue="Роман"
                value={selectedProduct.PrintedBooks.lit_form || ""}
                onChange={changePrintBookLitForm}
              />

              <label htmlFor="bindings"> Bindings </label>
              <input
                type="text"
                id="bindings"
                name="bindings"
                // defaultValue="HardCore!"
                value={selectedProduct.PrintedBooks.options[0].bindings || ""}
                onChange={changePrintBookBindings}
              />

              <label htmlFor="coverType"> CoverType </label>
              <input
                type="text"
                id="coverType"
                name="coverType"
                // defaultValue="DisCover!"
                value={selectedProduct.PrintedBooks.options[0].cover || ""}
                onChange={changePrintBookCover}
              />

              <label htmlFor="paper"> Paper </label>
              <input
                type="text"
                id="paper"
                name="paper"
                // defaultValue="TwoPly"
                value={selectedProduct.PrintedBooks.options[0].paper || ""}
                onChange={changePrintBookPaper}
              />

              <label htmlFor="illustrations"> Illustrations </label>
              <input
                type="text"
                id="illustrations"
                name="illustrations"
                // defaultValue="Dazzling!"
                value={
                  selectedProduct.PrintedBooks.options[0].illustrations || ""
                }
                onChange={changePrintBookIllustrations}
              />

              <label htmlFor="width"> Width </label>
              <input
                type="number"
                id="width"
                name="width"
                // defaultValue="42"
                value={
                  selectedProduct.PrintedBooks.options[0].size[0].width || ""
                }
                onChange={changePrintBookWidth}
              />

              <label htmlFor="height"> Height </label>
              <input
                type="number"
                id="height"
                name="height"
                // defaultValue="42"
                value={
                  selectedProduct.PrintedBooks.options[0].size[0].height || ""
                }
                onChange={changePrintBookHeight}
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
                // defaultValue="2010-10-10"
                value={selectedProduct.PrintedBooks.publish_date || ""}
                onChange={changePrintBookPublishDate}
              />

              <label htmlFor="releaseDate"> Release Date </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                // defaultValue="2010-10-10"
                value={selectedProduct.PrintedBooks.release_date || ""}
                onChange={changePrintBookReleaseDate}
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
                // defaultValue="150"
                value={selectedProduct.PrintedBooks.price || ""}
                onChange={changePrintBookPrice}
              />

              <label htmlFor="discount"> Discount </label>
              <input
                type="number"
                min="0"
                id="discount"
                name="discount"
                // defaultValue="0"
                value={selectedProduct.PrintedBooks.discount || ""}
                onChange={changePrintBookDiscount}
              />

              <label htmlFor="sold"> Number Sold </label>
              <input
                type="number"
                min="0"
                id="sold"
                name="sold"
                // defaultValue="0"
                value={selectedProduct.PrintedBooks.sold || ""}
                onChange={changePrintBookSold}
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
                  // defaultValue="0"
                  min="0"
                  value={
                    getWholeHours(selectedProduct.Audiobooks.duration) || ""
                  }
                  onChange={changeAudiobooksDuration}
                />

                <label htmlFor="minutes"> Minutes </label>
                <input
                  type="number"
                  id="minutes"
                  name="minutes"
                  // defaultValue="0"
                  min="0"
                  max="59"
                  value={
                    getWholeMinutes(selectedProduct.Audiobooks.duration) || ""
                  }
                  onChange={changeAudiobooksDuration}
                />

                <label htmlFor="seconds"> Seconds </label>
                <input
                  type="number"
                  id="seconds"
                  name="seconds"
                  defaultValue="0"
                  min="0"
                  max="59"
                  value={getSeconds(selectedProduct.Audiobooks.duration) || ""}
                  onChange={changeAudiobooksDuration}
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
                // defaultValue="0"
                min="0"
                value={selectedProduct.Audiobooks.file_volume || ""}
                onChange={changeAudiobooksFileVolume}
              />

              <label htmlFor="isPublished"> Is Published </label>
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                // defaultChecked="checked"
                value={selectedProduct.Audiobooks.is_published || ""}
                onChange={changePrintBookIsPublished}
              />

              <label htmlFor="publishDate"> Publish Date </label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                // defaultValue="2010-10-10"
                value={selectedProduct.PrintedBooks.publish_date || ""}
                onChange={changePrintBookPublishDate}
              />

              <label htmlFor="releaseDate"> Release Date </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                // defaultValue="2010-10-10"
                value={selectedProduct.PrintedBooks.release_date || ""}
                onChange={changePrintBookReleaseDate}
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
                // defaultValue="150"
                value={selectedProduct.PrintedBooks.price || ""}
                onChange={changePrintBookPrice}
              />

              <label htmlFor="discount"> Discount </label>
              <input
                type="number"
                min="0"
                id="discount"
                name="discount"
                // defaultValue="0"
                value={selectedProduct.PrintedBooks.discount || ""}
                onChange={changePrintBookDiscount}
              />

              <label htmlFor="sold"> Number Sold </label>
              <input
                type="number"
                min="0"
                id="sold"
                name="sold"
                // defaultValue="0"
                value={selectedProduct.PrintedBooks.sold || ""}
                onChange={changePrintBookSold}
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
