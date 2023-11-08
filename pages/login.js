import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function Login() {
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    console.log("data from login ... ", data);
    console.log("error from login ...", error);

    router.reload();
  }

  return (
    <div className={styles.container}>
      <h1> Login </h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email"> Email </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue="mildfirey@yandex.ru"
        />
        <label htmlFor="password"> Password </label>
        <input
          type="password"
          id="password"
          name="password"
          defaultValue="0892387639"
        />
        <button type="submit"> Log In </button>
      </form>
      {/* <pre> {JSON.stringify(session, null, 2)} </pre> */}
    </div>
  );
}

function SessionInfo({ session }) {
  // console.log("session is...", session);

  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();

    const { error } = await supabase.auth.signOut();

    console.log("Logging out ...  ", error);

    router.reload();
  }

  return (
    // <div className={styles.container}>{JSON.stringify(session, null, 2)}</div>
    <div className={styles.container}>
      {" "}
      currently logged in as {session.user.email}
      {/* <h1> Log Out </h1> */}
      <form onSubmit={handleSubmit}>
        <button type="submit"> Log Out </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
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
      <h1>Session</h1>
      {/* <pre> {JSON.stringify(session, null, 2)} </pre> */}

      {session ? <SessionInfo session={session} /> : <Login />}

      {/* {!session && <Login />} */}
    </div>
  );
}

// <div className={styles.container}>
//   <div>
//     {session ? (
//       <div>
//         <p>you are logged in as {session.data.session.user.email}</p>
//         <pre> {JSON.stringify(user.data.user, null, 2)} </pre>\
//       </div>
//     ) : (
//       <Login />
//     )}
//   </div>
// </div>
