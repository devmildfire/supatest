import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// import Link from "next/link";
import Nav from "@/components/nav";

function Authors() {
  // const [fileURL, setFileURL] = useState("");
  const router = useRouter();
  const [canAdd, setCanAdd] = useState(true);

  async function handleAuthorChange() {
    const currentAuthor = document.getElementById("name").value;

    const { data, error } = await supabase
      .from("Authors")
      .select("*")
      .eq("name", currentAuthor);

    data.length > 0 ? setCanAdd(false) : setCanAdd(true);
  }

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

    let author_id;

    data && data.length > 0 && (author_id = data.id);

    console.log("author data ... ", data);

    console.log("author id ... ", author_id);

    data
      ? alert(`Added New Author with name ${name}`)
      : alert("Add failed - no data");
    router.reload();
  }

  useEffect(() => {
    handleAuthorChange();
  }, []);

  return (
    <div className={styles.container}>
      <h1> Add Author </h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="name"> Name </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue="Hank Moody"
          onChange={handleAuthorChange}
        />

        {canAdd ? (
          <button type="submit" className={styles.button}>
            Add New Author
          </button>
        ) : (
          <p> Allready have this author </p>
        )}
      </form>
    </div>
  );
}

function AuthorsList() {
  const [authors, setAuthors] = useState(null);

  async function getAuthors() {
    const { data, error } = await supabase.from("Authors").select("*");

    data && console.log("authors data ... ", data);
    error && alert(error);

    data && setAuthors(data);
  }

  async function deleteAuthor(id, name) {
    const { error } = await supabase.from("Authors").delete().eq("id", id);
    !error && alert(`deleted author ${name}`);

    getAuthors();
  }

  useEffect(() => {
    getAuthors();
  }, []);

  return (
    <div className={styles.container}>
      {authors?.map((author) => (
        <div key={author.id}>
          <span>
            {author.id} - {author.name}
          </span>
          {"  "}
          <button
            className={styles.button}
            onClick={() => {
              deleteAuthor(author.id, author.name);
            }}
          >
            {" "}
            delete{" "}
          </button>
        </div>
      ))}
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
          <AuthorsList />
        </div>
      ) : (
        <div> No User Session </div>
      )}
      <Nav />
    </div>
  );
}
