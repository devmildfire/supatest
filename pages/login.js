import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// import { hasCookie, setCookie, getCookie } from "cookies-next";
// import { v4 as uuidv4 } from "uuid";
import { setOrGetCartCookie } from "@/utils/cartID";
import Nav from "@/components/nav";

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
      <form onSubmit={handleSubmit} className={styles.form}>
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
        <button type="submit" className={styles.button}>
          Log In
        </button>
      </form>
      {/* <pre> {JSON.stringify(session, null, 2)} </pre> */}
    </div>
  );
}

function SignUp() {
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    console.log("data from sign up ... ", data);
    console.log("error from sign up ...", error);

    router.reload();
  }

  return (
    <div className={styles.container}>
      <h1> Sign Up </h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email"> Email </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue="youremail@example.com"
        />
        <label htmlFor="password"> Password </label>
        <input type="password" id="password" name="password" defaultValue="" />
        <button type="submit" className={styles.button}>
          Sign Up
        </button>
      </form>
      {/* <pre> {JSON.stringify(session, null, 2)} </pre> */}
    </div>
  );
}

function SessionInfo({ session }) {
  // console.log("session is...", session);
  const [cartID, setCartID] = useState("");

  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();

    const { error } = await supabase.auth.signOut();

    console.log("Logging out ...  ", error);

    router.reload();
  }

  useEffect(() => {
    setCartID(setOrGetCartCookie());
  }, []);

  return (
    // <div className={styles.container}>{JSON.stringify(session, null, 2)}</div>
    <div className={styles.container}>
      {" "}
      currently logged in as {session.user.email}
      {/* <h1> Log Out </h1> */}
      <h1> current cart ID : {cartID} </h1>
      <form onSubmit={handleSubmit}>
        <button type="submit" className={styles.button}>
          Log Out
        </button>
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

      {session ? (
        <SessionInfo session={session} />
      ) : (
        <div>
          <Login />
          <SignUp />
        </div>
      )}

      <Nav />
    </div>
  );
}
