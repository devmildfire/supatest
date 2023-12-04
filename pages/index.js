import styles from "../styles/Home.module.css";
import supabase from "../utils/supabase";
// import Link from "next/link";
import Nav from "@/components/nav";

export async function getStaticProps() {
  const { data: Titles, error } = await supabase
    .from("Titles")
    .select(
      "*,AuthorsList: Titles_Authors ( Author : Authors(*)), PrintedBooks(*), Audiobooks(*), Ebooks(*), CardBooks(*)"
    );

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
      <Nav />
    </div>
  );
}
