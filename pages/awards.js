import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";

function Award() {
  const [fileURL, setFileURL] = useState("");

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
    // console.log("error from login ...", error);

    error ? alert(error) : alert(`Created New Award with name ${title}`);

    // router.reload();
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
        </div>
      ) : (
        <div> No User Session </div>
      )}
    </div>
  );
}
