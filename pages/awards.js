import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Nav from "@/components/nav";

function Award() {
  const [fileURL, setFileURL] = useState("");
  const router = useRouter();

  async function handleImageUpload(event) {
    event.preventDefault();
    // setFile(event.target.files[0]);
    const file = event.target.files[0];

    // console.log("setting file");
    console.log(file);

    const { data, error } = await supabase.storage
      .from("awards")
      .upload(`award_${file.name}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    console.log("file return info ...", JSON.stringify(data, null, 2));
    console.log("file return error ...", JSON.stringify(error, null, 2));

    data.path && console.log(`${data.path} returned`);

    const publicUrl = supabase.storage
      .from("awards")
      .getPublicUrl(`${data.path}`).data.publicUrl;

    console.log(`${publicUrl} returned`);

    setFileURL(publicUrl);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const title = event.target.title.value;
    event.target.reset();

    const { data, error } = await supabase
      .from("Awards")
      .insert({
        title: title,
        source: fileURL,
      })
      .select("*");

    const award_id = await data[0].id;

    console.log("award data ... ", data);

    console.log("award id ... ", award_id);

    error ? alert(error) : alert(`Created New Award with name ${title}`);
    router.reload();
  }

  return (
    <div className={styles.container}>
      <h1> Add Award </h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="title"> title </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue="NewAwardTitle"
        />

        <label htmlFor="image"> Image </label>
        {fileURL && <img src={fileURL} alt={fileURL} />}
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleImageUpload}
        />

        <button type="submit" className={styles.button}>
          Add New Award
        </button>
      </form>
    </div>
  );
}

function ProductsAwards() {
  const [productsList, setProductsList] = useState([]);

  const get_products = async () => {
    try {
      const { data, error } = await supabase
        .from("Products")
        .select(`id, name, category, ProductsAwards(*, Awards(*))`)
        .order("id", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setProductsList(data);
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // console.log(JSON.stringify(productsList, null, 2));

  // console.log(JSON.stringify(data, null, 2));

  useEffect(() => {
    get_products();
  }, []);

  // const myObj = get_products();
  // console.log(myObj);

  return (
    <div className={styles.container}>
      <h1> Products with Awards </h1>

      {productsList.map((item) => {
        return (
          item.ProductsAwards.length > 0 && (
            <div key={item.id}>
              <p className={styles.awardsContainer}>
                {item.id} - {item.name} - {item.category}
              </p>

              <div className={styles.awardsContainer}>
                {item.ProductsAwards.map((productAward) => {
                  return (
                    <div key={productAward.AwardID} className={styles.award}>
                      {productAward.Awards.title}
                    </div>
                  );
                })}
              </div>

              {/* {JSON.stringify(item.ProductsAwards, null, 2)} */}
              {/* {JSON.parse(JSON.stringify(item.ProductsAwards, null, 2)).length} */}
            </div>
          )
        );
      })}

      {/* {productsList && <p> {myObj} </p>} */}

      {/* {Array.from(productsList).map((item) => {
        <p key={item.id}> {item.id} </p>;
      })} */}

      {/* <form onSubmit={handleSubmit} className={styles.form}></form> */}
    </div>
  );
}

function ManageAwards() {
  const [productsList, setProductsList] = useState([]);
  const [awardsList, setAwardsList] = useState([]);
  const [productsAwardsList, setProductsAwardsList] = useState([]);

  const [product, setProduct] = useState(null);
  const [award, setAward] = useState(null);

  const [awardLegal, setAwardLegal] = useState(false);

  const router = useRouter();

  async function getProdList() {
    const supaProds = await supabase
      .from("Products")
      .select(`id, name, category`)
      .order("id", { ascending: true });

    supaProds.error && console.error(supaProds.error);
    supaProds.data &&
      (setProductsList(supaProds.data),
      console.log(JSON.stringify(supaProds.data, null, 2)));
  }

  async function getAwardList() {
    const supaAwards = await supabase
      .from("Awards")
      .select(`id, title, source`)
      .order("id", { ascending: true });

    supaAwards.error && console.error(supaAwards.error);
    supaAwards.data &&
      (setAwardsList(supaAwards.data),
      console.log(JSON.stringify(supaAwards.data, null, 2)));
  }

  async function getProdAwardList() {
    const supaProdAwards = await supabase.from("ProductsAwards").select();

    supaProdAwards.error && console.error(supaProdAwards.error);
    supaProdAwards.data &&
      (setProductsAwardsList(supaProdAwards.data),
      console.log(JSON.stringify(supaProdAwards.data, null, 2)));
  }

  useEffect(() => {
    getProdList();
    getAwardList();
    getProdAwardList();
  }, []);

  function handleAwardChange(event) {
    const awardFromChange = event.target.value;
    setAward(awardFromChange);
    console.log(
      "current product-award pair ids are ...",
      product,
      awardFromChange
    );
    getAwardLegality(product, awardFromChange);
  }

  function handleProdChange(event) {
    const productFromChange = event.target.value;
    setProduct(productFromChange);
    console.log(
      "current product-award pair ids are ...",
      productFromChange,
      award
    );
    getAwardLegality(productFromChange, award);
  }

  function getAwardLegality(prod, aw) {
    let isLegal = true;

    productsAwardsList.map((prodAward) => {
      prodAward.ProductID == prod &&
        prodAward.AwardID == aw &&
        (isLegal = false);
    });

    console.log("current combination legality is on the whole ... ", isLegal);
    setAwardLegal(isLegal);
  }

  async function addAward(event) {
    event.preventDefault();
    const supaAwardData = await supabase.from("ProductsAwards").select();

    supaAwardData.error && console.error(supaAwardData.error);
    supaAwardData.data && console.log(JSON.stringify(supaAwardData, null, 2));

    const { data, error } = await supabase
      .from("ProductsAwards")
      .insert({ ProductID: product, AwardID: award })
      .select();

    console.log("insert error ... ", JSON.stringify(error, null, 2));
    console.log("insert data ... ", JSON.stringify(data, null, 2));

    let prodName;
    let awardName;

    !error &&
      ((prodName = await getProdNameByID(product)),
      (awardName = await getAwardNameByID(award))) &&
      confirm(` Sucessfuly added ${awardName} to product ${prodName} `) &&
      router.reload();
  }

  async function getProdNameByID(id) {
    const prodData = await supabase
      .from("Products")
      .select("name")
      .eq("id", id)
      .single();

    let prodName;

    prodData.error && console.error("could not retrieve name");
    prodData.data && (prodName = prodData.data.name);

    return prodName;
  }

  async function getAwardNameByID(id) {
    const awardData = await supabase
      .from("Awards")
      .select("title")
      .eq("id", id)
      .single();

    let awardName;

    awardData.error && console.error("could not retrieve name");
    awardData.data && (awardName = awardData.data.title);

    return awardName;
  }

  async function removeAward(event) {
    event.preventDefault();
    const supaAwardData = await supabase.from("ProductsAwards").select();

    supaAwardData.error && console.error(supaAwardData.error);
    supaAwardData.data && console.log(JSON.stringify(supaAwardData, null, 2));

    const { error } = await supabase
      .from("ProductsAwards")
      .delete()
      .eq("ProductID", product)
      .eq("AwardID", award);

    console.log("delete error ... ", JSON.stringify(error, null, 2));

    let prodName;
    let awardName;

    !error &&
      ((prodName = await getProdNameByID(product)),
      (awardName = await getAwardNameByID(award))) &&
      confirm(` Sucessfuly removed ${awardName} from product ${prodName} `) &&
      router.reload();

    // router.reload();
  }

  return (
    <div className={styles.container}>
      <h1> Manage Awards </h1>
      <div>
        <form className={styles.container}>
          <select
            id="products"
            name="products"
            defaultValue="-- select Product --"
            onChange={handleProdChange}
          >
            <option disabled value="-- select Product --">
              -- select Product --
            </option>
            {productsList.map((product) => (
              <option key={product.id} value={product.id}>
                {product.id} - {product.name} - {product.category}
              </option>
            ))}
          </select>
          <select
            id="awards"
            name="awards"
            defaultValue="-- select Award --"
            onChange={handleAwardChange}
          >
            <option disabled value="-- select Award --">
              -- select Award --
            </option>
            {awardsList.map((award) => (
              <option key={award.id} value={award.id}>
                {award.title}
              </option>
            ))}
          </select>

          {awardLegal && (
            <button className={styles.button} onClick={addAward}>
              Add Award to Product
            </button>
          )}
          {!awardLegal && (
            <button className={styles.button} onClick={removeAward}>
              Remove Award from Product
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AddAwardPage() {
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
          <Award />
          <ProductsAwards />
          <ManageAwards />
        </div>
      ) : (
        <div> No User Session </div>
      )}
      <Nav />
    </div>
  );
}
