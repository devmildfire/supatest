import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Nav from "@/components/nav";

function RemoveProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  async function getProducts() {
    const { data, error } = await supabase.from("Titles").select(
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
        ProductsAwards ( *, awards: Awards(*) )
        `
    );

    data && (setProducts(data), console.log(JSON.stringify(data, null, 2)));
    error && console.log(JSON.stringify(error, null, 2));
  }

  async function deleteProduct() {
    const SelectedProductID = document.getElementById("productSelect").value;
    const { error } = await supabase
      .from("Titles")
      .delete()
      .eq("id", SelectedProductID);

    error && console.log(JSON.stringify(error, null, 2));
    !error && alert(`Product with ID ${SelectedProductID} DELETED`);

    router.reload();
  }

  function changeProduct() {
    const SelectedProductID = document.getElementById("productSelect").value;
    console.log(SelectedProductID);
    setSelectedProduct(products.find((o) => o.id == SelectedProductID));
    console.log(selectedProduct);
  }

  useEffect(() => {
    getProducts();
    // changeProduct();
    // console.log(JSON.stringify(products, null, 2));
  }, []);

  return (
    <div className={styles.container}>
      <h1> Delete Product </h1>

      <select onChange={changeProduct} id="productSelect">
        <option disabled selected value="false">
          -- select Product --
        </option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.id} - {product.name} - {product.category}
          </option>
        ))}
      </select>

      <div className={styles.container}>
        <pre> {JSON.stringify(selectedProduct, null, 2)}</pre>
      </div>

      {selectedProduct && (
        <button className={styles.button} onClick={deleteProduct}>
          {" "}
          Delete Product{" "}
        </button>
      )}
    </div>
  );
}

export default function RemoveProductPage({ products }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  //   const [products, setProducts] = useState(null);

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

    console.log(JSON.stringify(products, null, 2));
  }, []);

  return (
    <div className={styles.container}>
      {session ? (
        <div>
          <p> logged in as {user.email} </p>
          <RemoveProduct />
        </div>
      ) : (
        <div> No User Session </div>
      )}
      <Nav />
    </div>
  );
}
