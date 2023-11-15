import supabase from "@/utils/supabase";
import styles from "../../styles/Home.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/nav";

export async function getServerSideProps({ params }) {
  return {
    props: {
      params,
    },
  };
}

export default function ProductPage({ params }) {
  const [session, setSession] = useState(null);
  const [titles, setTitles] = useState(null);
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

  const get_titles = async () => {
    try {
      const { data: Titles, error } = await supabase
        .from("Titles")
        .select(
          `
          name,
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
        .eq("name", params.title);
      // .eq("name", "Awesome Title");

      if (error) {
        console.error(error);
      } else {
        setTitles(Titles);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    get_session();
    get_titles();
  }, []);

  // console.log(products);
  return (
    <div className={styles.container}>
      {session ? (
        <div>
          <p> logged in as {user.email} </p>
          {/* <pre> {JSON.stringify(session, null, 2)} </pre> */}
          <pre> {titles && JSON.stringify(titles, null, 2)} </pre>
        </div>
      ) : (
        <div> No User Session </div>
      )}
      <Nav />
    </div>
  );
}
