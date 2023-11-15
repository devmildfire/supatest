import styles from "../styles/Home.module.css";
import supabase from "../utils/supabase";
import Link from "next/link";

export async function getStaticProps() {
  const { data: Titles, error } = await supabase.from("Titles").select("*");

  // console.log(products);

  if (error) {
    throw new Error(error);
  }

  return {
    props: {
      Titles,
    },
  };
}

export default function Home({ Titles }) {
  return (
    <div className={styles.container}>
      <h1>Hello!</h1>
      <pre> {JSON.stringify(Titles, null, 2)} </pre>
      <div className={styles.container}>
        <Link href="/login">Login</Link>
        <Link href="/awards">Add / Remove Awards</Link>
        <Link href="/add">Add Products</Link>
        <Link href="/deleteProduct">Delete Products</Link>
      </div>
    </div>
  );
}
