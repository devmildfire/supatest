import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";
import { useState } from "react";

export default function LoginPage() {
  const [currentSession, setCurrentSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const email = event.target.email.value;
    // console.log(email);
    // await supabase.auth.signIn({ email });
    // await supabase.auth.signInWithPassword()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: "0892387639",
    });

    // console.log(data);
    // console.log(error);

    // const user = JSON.stringify(await supabase.auth.getUser(), null, 2);
    // const session = JSON.stringify(await supabase.auth.getSession(), null, 2);
    const user = await supabase.auth.getUser();
    const session = await supabase.auth.getSession();
    setCurrentSession(session);
    setCurrentUser(user);

    // console.log(supabase.auth.user());
    // console.log(user);
    // console.log(session);

    console.log(currentSession);
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
        <button type="submit"> Log In </button>
      </form>
      <div>
        {currentSession && (
          <div>
            <p>you are logged in as {currentSession.data.session.user.email}</p>
            <pre> {JSON.stringify(currentUser.data.user, null, 2)} </pre>\
          </div>
        )}
      </div>
    </div>
  );
}
