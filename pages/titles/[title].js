import supabase from "@/utils/supabase";
import styles from "../../styles/Home.module.css";
import { useState, useEffect } from "react";

export async function getServerSideProps({ params }) {
  // const { sessionData, sessionError } = await supabase.auth.getSession();

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

  if (error) {
    throw new Error(error);
  }

  // console.log(await sessionData);

  return {
    props: {
      products,
    },
  };
}

export default function ProductPage({ products }) {
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

  // console.log(products);
  return (
    <div className={styles.container}>
      <pre> {JSON.stringify(session, null, 2)} </pre>
      <pre> {JSON.stringify(products, null, 2)} </pre>
    </div>
  );
}
