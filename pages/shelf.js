import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { setOrGetCartCookie } from "@/utils/cartID";

import Nav from "@/components/nav";

function ShelfItem({ updateCart, cart, name, type, price }) {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const index = cart.findIndex(
      (item) => item.name == name && item.type == type
    );
    index !== -1 &&
      (console.log(
        `item index  for ${name} - ${type} is ${cart[index].number}`
      ),
      setNumber(cart[index].number));
  });

  return (
    <div key={name + type}>
      <span>
        {name} - {type} - {price}
      </span>

      <button
        className={styles.shelfButton}
        onClick={() => {
          setNumber(number - 1);
          updateCart(name, type, price, number - 1);
        }}
        disabled={number == 0}
      >
        -
      </button>
      <span> {number} </span>
      <button
        className={styles.shelfButton}
        onClick={() => {
          setNumber(number + 1);
          updateCart(name, type, price, number + 1);
        }}
      >
        +
      </button>
    </div>
  );
}

function ProductsShelf() {
  const [shelf, setShelf] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartID, setCartID] = useState("");
  const [total, setTotal] = useState(0);
  const [titles, setTitles] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  async function getCartFromDB(id) {
    const { data, error } = await supabase.from("Cart").select().eq("id", id);

    data &&
      console.log("DB cart fetch success ... ", JSON.stringify(data, null, 2));
    error &&
      console.log("DBcart fetch FAILED ... ", JSON.stringify(error, null, 2));

    // let itemList = []

    const itemList = data?.map((item) => {
      return {
        name: item.name,
        type: item.category,
        price: item.price,
        number: item.quantity,
      };
    });

    console.log("fetched item list ... ", JSON.stringify(itemList, null, 2));

    setCart([...itemList]);
  }

  async function addItemToDB(name, type, price, number) {
    const { data, error } = await supabase
      .from("Cart")
      .insert({
        id: cartID,
        name: name,
        category: type,
        price: price,
        quantity: number,
        summ: price * number,
      })
      .select();
    data &&
      console.log("DB insert success ... ", JSON.stringify(data, null, 2));
    error &&
      console.log("DB insert FAILED ... ", JSON.stringify(error, null, 2));
  }

  async function updateItemInDB(name, type, price, number) {
    const { data, error } = await supabase
      .from("Cart")
      .upsert({
        id: cartID,
        name: name,
        category: type,
        price: price,
        quantity: number,
        summ: price * number,
      })
      .select();
    data &&
      console.log("DB update success ... ", JSON.stringify(data, null, 2));
    error &&
      console.log("DB update FAILED ... ", JSON.stringify(error, null, 2));
  }

  async function deleteItemInDB(name, type) {
    const { error } = await supabase
      .from("Cart")
      .delete()
      .eq("id", cartID)
      .eq("name", name)
      .eq("category", type);
    !error &&
      console.log(
        "DB item delete success ... ",
        JSON.stringify(error, null, 2)
      );
    error &&
      console.log(
        "DB item delete update FAILED ... ",
        JSON.stringify(error, null, 2)
      );
  }

  function getCartIndex(name, type) {
    const index = cart.findIndex(
      (item) => item?.name == name && item?.type == type
    );
    return index;
  }

  function updateCart(name, type, price, number) {
    const index = getCartIndex(name, type);
    // console.log("index is...", index);

    let list = [...cart];

    index == -1 &&
      //  добавление нового пункта корзины
      (setCart([
        ...cart.filter((item) => item.number !== 0),
        { name: name, type: type, price: price, number: number },
      ]),
      addItemToDB(name, type, price, number));

    index !== -1 &&
      //  редактирование существующего пункта корзины
      ((list[index] = { name: name, type: type, price: price, number: number }),
      (list = list.filter((item) => item.number !== 0)),
      setCart([...list]),
      number == 0
        ? deleteItemInDB(name, type)
        : updateItemInDB(name, type, price, number));
  }

  function updateTotal() {
    let summ = 0;
    cart?.forEach((item) => {
      summ += item.price * item.number;
    });
    setTotal(summ);
  }

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
            type: "PrintBook",
            price: item.PrintedBooks.price,
          },
        ]);

      item.Audiobooks &&
        (shelfItems = [
          ...shelfItems,
          { name: item.name, type: "AudioBook", price: item.Audiobooks.price },
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

  useEffect(() => {
    setCartID(setOrGetCartCookie());
    getTitles();

    getCartFromDB(setOrGetCartCookie());
  }, []);

  useEffect(() => {
    updateTotal();
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
        <pre> {JSON.stringify(cart, null, 2)}</pre>
        <div>total price {total} </div>
        <div>cart ID: {cartID} </div>
      </div>
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
