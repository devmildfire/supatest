import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";

// export async function getServerSideProps({ params }) {
//   return {
//     props: {
//       params,
//     },
//   };
// }

function Product() {
  // const router = useRouter();
  const [selectedType, setSelectedType] = useState("PrintedBook");
  // const [file, setFile] = useState([]);
  const [filePath, setFilePath] = useState("");

  function handleTypeChange(event) {
    const target = event.target;
    const value = target.value;
    // const name = target.name;

    console.log(value);

    setSelectedType(value);
    console.log(selectedType);
  }

  async function handleTrailerUpload(event) {
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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = event.target.name.value;
    const category = event.target.category.value;
    const price = event.target.price.value;
    const discount = event.target.discount.value;
    const trailer = filePath;
    event.target.reset();

    const { data, error } = await supabase
      .from("Products")
      .insert({
        name: name,
        category: category,
        price: price,
        discount: discount,
      })
      .select();

    const product_id = await data[0].id;

    if (selectedType == "PrintedBook") {
      const description = event.target.description.value;
      const thesis = event.target.thesis.value;
      const pages = event.target.pages.value;
      // const coverFile = event.target.trailer.files[0];
      // const coverFileInput = event.target.trailer;

      // console.log("cover File ... ", file);
      // const productID = event.target.discount.value;

      const { printed_data, printed_error } = await supabase
        .from("PrintedBooks")
        .insert({
          description: description,
          thesis: thesis,
          trailer: trailer,
          pages: pages,
          ProductID: product_id,
        })
        .select();

      console.log("printed data ... ", printed_data);
    }

    console.log("product data ... ", data);

    console.log("product id ... ", product_id);
    // console.log("error from login ...", error);

    error ? alert(error) : alert(`Created New Product with name ${name}`);

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
          <>
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

            {/* <label htmlFor="trailer"> trailer </label>
            <input type="file" min="0" id="trailer" name="trailer" /> */}
          </>
        )}

        <button type="submit" className={styles.button}>
          Add New Product
        </button>
      </form>
      {/* <form onSubmit={handleTrailerUpload} className={styles.form}> */}
      <label htmlFor="trailer"> trailer </label>
      <input
        type="file"
        id="trailer"
        name="trailer"
        onChange={handleTrailerUpload}
      />

      {/* <button type="submit" className={styles.button}>
          Add New Trailer
        </button> */}
      {/* </form> */}
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
