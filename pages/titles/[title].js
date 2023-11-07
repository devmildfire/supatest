import supabase from "@/utils/supabase";
import styles from "../../styles/Home.module.css";

export async function getServerSideProps({ params }) {
  const { data: products, error } = await supabase
    .from("Products")
    .select(
      `
      id, 
      name, 
      category,
      Audiobooks ( * ),
      Ebooks ( * ),
      PrintedBooks ( *, 
        options:PrintOptions ( *, 
          size:PrintSize( * )
        ),
        cover:PrintedCover( * )
      ),
      Awards ( * ) 
      `
    )
    .eq("name", params.title);

  if (error) {
    throw new Error(error);
  }

  return {
    props: {
      products,
    },
  };
}

export default function ProductPage({ products }) {
  // console.log(products);
  return (
    <div className={styles.container}>
      <pre> {JSON.stringify(products, null, 2)} </pre>
    </div>
  );
}
