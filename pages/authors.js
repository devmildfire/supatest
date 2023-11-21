import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// import Link from "next/link";
import Nav from "@/components/nav";

function Authors() {
  // const [fileURL, setFileURL] = useState("");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();

    const name = event.target.name.value;
    event.target.reset();

    const { data, error } = await supabase
      .from("Authors")
      .insert({
        name: name,
      })
      .select("*")
      .single();

    const author_id = await data.id;

    console.log("author data ... ", data);

    console.log("author id ... ", author_id);

    error ? alert(error) : alert(`Added New Author with name ${name}`);
    router.reload();
  }

  return (
    <div className={styles.container}>
      <h1> Add Author </h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="name"> title </label>
        <input type="text" id="name" name="name" defaultValue="Hank Moody" />

        <button type="submit" className={styles.button}>
          Add New Author
        </button>
      </form>
    </div>
  );
}

export default function AuthorsPage() {
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
          <Authors />
        </div>
      ) : (
        <div> No User Session </div>
      )}
      <Nav />
    </div>
  );
}
