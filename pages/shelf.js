import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// import Link from "next/link";
import Nav from "@/components/nav";

function ShelfItem({ updateCart, cart, name, type, price }) {
  const [number, setNumber] = useState(0);

  // useEffect(() => {
  //   console.log(`number is now ${number} for ${name} - ${type}`);
  //   // updateCart(name, type, number);
  // }, [number]);

  return (
    <div key={name + type}>
      <span>
        {name} - {type} - {price}
      </span>

      <button
        onClick={() => {
          setNumber(number - 1);
          updateCart(name, type, number - 1);
        }}
        disabled={number == 0}
      >
        remove
      </button>
      <span> {number} </span>
      <button
        onClick={() => {
          setNumber(number + 1);
          updateCart(name, type, number + 1);
        }}
      >
        add
      </button>
    </div>
  );
}

function ProductsShelf() {
  const [shelf, setShelf] = useState([]);
  const [cart, setCart] = useState([]);
  const [titles, setTitles] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  function getCartIndex(name, type) {
    const index = cart.findIndex(
      (item) => item?.name == name && item?.type == type
    );
    return index;
  }

  function updateCart(name, type, number) {
    const index = getCartIndex(name, type);
    // console.log("index is...", index);

    let list = [...cart];
    // console.log("list is...", JSON.stringify(list, null, 2));

    index == -1 &&
      setCart([
        ...cart.filter((item) => item.number !== 0),
        { name: name, type: type, number: number },
      ]);

    index !== -1 &&
      ((list[index] = { name: name, type: type, number: number }),
      (list = list.filter((item) => item.number !== 0)),
      setCart([...list]));

    // console.log(
    //   `updated cart with an item ${JSON.stringify([...cart], null, 2)}`
    // );
  }

  // async function cartItemToBase() {
  //   const {data, error} = await supabase
  //     .from("Cart")
  //     .inser
  // }

  async function getTitles() {
    let shelfItems = [];

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

    data && setTitles(data);
    // console.log("all titles data", JSON.stringify(data, null, 2))

    error && console.log(JSON.stringify(error, null, 2));

    data?.map((item) => {
      item.PrintedBooks &&
        (shelfItems = [
          ...shelfItems,
          {
            name: item.name,
            type: "PrintedBook",
            price: item.PrintedBooks.price,
          },
        ]);

      item.Audiobooks &&
        (shelfItems = [
          ...shelfItems,
          { name: item.name, type: "Audiobook", price: item.Audiobooks.price },
        ]);

      item.Ebooks &&
        (shelfItems = [
          ...shelfItems,
          { name: item.name, type: "EBook", price: item.Ebooks.price },
        ]);

      item.CardBooks &&
        (shelfItems = [
          ...shelfItems,
          { name: item.name, type: "Book2.0", price: item.CardBooks.price },
        ]);
    });

    setShelf([...shelfItems]);

    // getShelf(data);
    // shelf &&
    //   console.log("all shelf items are ...", JSON.stringify(shelf, null, 2));
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
    getTitles();
    console.log(JSON.stringify(cart, null, 2));
  }, [cart]);

  return (
    <div className={styles.container}>
      <h1> Products </h1>

      <ul id="productsList">
        {shelf.map((book, index) => {
          return (
            // <div key={index + book.name + book.type}>
            <ShelfItem
              key={index + book.name}
              cart={cart}
              updateCart={updateCart}
              name={book.name}
              type={book.type}
              price={book.price}
            />
            // </div>
          );
        })}
      </ul>

      <div className={styles.container}>
        <pre> {JSON.stringify(shelf, null, 2)}</pre>
      </div>

      {/* {selectedProduct && (
        <button
          className={styles.button}
          onClick={() => {
            deleteProduct(selectedProduct);
          }}
        >
          Delete Product
        </button>
      )} */}
    </div>
  );
}

export default function ProductsShelfPage() {
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

    // console.log(JSON.stringify(shelf, null, 2));
  }, []);

  return (
    <div className={styles.container}>
      {session ? (
        <div>
          <p> logged in as {user.email} </p>
          <ProductsShelf />
        </div>
      ) : (
        <div> No User Session </div>
      )}
      <Nav />
    </div>
  );
}
