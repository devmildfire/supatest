// import Image from "next/image";
// import { Inter } from "next/font/google";
import styles from "../styles/Home.module.css";
import supabase from "../utils/supabase";

export async function getStaticProps() {
  const { data: products, error } = await supabase.from("Products").select("*");

  // console.log(products);

  if (error) {
    throw new Error(error);
  }

  return {
    props: {
      products,
    },
  };
}

export default function Home({ products }) {
  return (
    <div className={styles.container}>
      <h1>Hello!</h1>
      <div className={styles.container}>
        <Link href="/login">Login</Link>
        <Link href="/awards">Add / Remove Awards</Link>
        <Link href="/add">Add Products</Link>
        <Link href="/deleteProduct">Delete Products</Link>
      </div>
      <pre> {JSON.stringify(products, null, 2)} </pre>
    </div>
  );
}
