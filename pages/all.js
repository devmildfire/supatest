import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import Nav from "@/components/nav";

export default function AllProductsPage() {
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState(null);
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

  const get_products = async () => {
    try {
      const { data: products, error } = await supabase.from("Products").select(
        `
        id,
        name,
        category,
        price,
        discount,
        sold,
        isFeatured,
        isPublished,
        releaseDate,
        publishDate,
        Audiobooks ( * ),
        Ebooks ( * ),
        PrintedBooks ( *,
          options:PrintOptions ( *,
            size:PrintSize( * )
          ),
          cover:PrintedCover( * )
        ),
        ProductsAwards ( *,  awards: Awards(*) )
        `
      );

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
    get_products();
  }, []);

  // console.log(products);
  return (
    <div className={styles.container}>
      {session ? (
        <div className={styles.container}>
          <p> logged in as {user.email} </p>
          <pre> {products && JSON.stringify(products, null, 2)} </pre>
        </div>
      ) : (
        <div> No User Session </div>
      )}
      <Nav />
    </div>
  );
}
