import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// import Link from "next/link";
import Nav from "@/components/nav";

function RemoveProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  async function getProducts() {
    const { data, error } = await supabase.from("Titles").select(
      `
        *,
        AuthorsList: Titles_Authors ( Author : Authors(*)),
        Photos( * ),
        CardBooks ( * ),
        Audiobooks ( * ),
        Ebooks ( * ),
        PrintedBooks ( *,
          options:PrintOptions ( *,
            size:PrintSize( * )
          ),
          cover:PrintedCover( * )
        ),
        TitlesAwards ( *, awards: Awards(*) )
      `
    );

    data &&
      (setProducts(data),
      console.log("all products data", JSON.stringify(data, null, 2)));
    error && console.log(JSON.stringify(error, null, 2));
  }

  async function deleteProduct(selProdObj) {
    const SelectedProductID = +selProdObj.id;
    const SelectedProductTable = selProdObj.type;

    const { error } = await supabase
      .from(SelectedProductTable)
      .delete()
      .eq("id", SelectedProductID);

    error && console.log(JSON.stringify(error, null, 2));
    !error &&
      alert(
        `Product from ${SelectedProductTable} with ID ${SelectedProductID} DELETED`
      );

    router.reload();
  }

  function changeProduct() {
    const SelectedProductObject = JSON.parse(
      document.getElementById("productSelect").value
    );

    console.log("selected object ... ", SelectedProductObject);
    setSelectedProduct(SelectedProductObject);
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className={styles.container}>
      <h1> Delete Product </h1>

      <select onChange={changeProduct} id="productSelect">
        <option disabled selected value="false">
          -- select Product --
        </option>

        {products.map((title) => {
          const optionValues = [
            {
              type: "Audiobooks",
              id: title.Audiobooks ? title.Audiobooks.id : 0,
            },
            {
              type: "Ebooks",
              id: title.Ebooks ? title.Ebooks.id : 0,
            },
            {
              type: "PrintedBooks",
              id: title.PrintedBooks ? title.PrintedBooks.id : 0,
            },
            {
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
                <option value={audioString}>{title.name} - Audiobok</option>
              )}
              {title.Ebooks && (
                <option value={ebooktring}>{title.name} - eBook</option>
              )}
              {title.PrintedBooks && (
                <option value={printedString}>
                  {title.name} - printed book
                </option>
              )}
              {title.CardBooks && (
                <option value={cardString}>{title.name} - book 2.0</option>
              )}
            </>
          );
        })}
      </select>

      <div className={styles.container}>
        <pre> {JSON.stringify(selectedProduct, null, 2)}</pre>
      </div>

      {selectedProduct && (
        <button
          className={styles.button}
          onClick={() => {
            deleteProduct(selectedProduct);
          }}
        >
          Delete Product
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
