import supabase from "@/utils/supabase";
import styles from "../styles/Home.module.css";

// "*, Audiobooks( * ), Ebooks ( * ), PrintedBooks ( *, options:PrintOptions ( *, size:PrintSize( * ) ), cover:PrintedCover( * ) ), Awards ( * ) "
export async function getServerSideProps({ params }) {
  const { data: product, error } = await supabase
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
    .eq("id", params.id)
    .single();

  if (error) {
    throw new Error(error);
  }

  return {
    props: {
      product,
    },
  };
}

export default function ProductPage({ product }) {
  // console.log(product);
  return (
    <div className={styles.container}>
      <h1> {product.name} </h1>
      <p> {product.category} </p>
      <p> {product.price} </p>
      <pre> {JSON.stringify(product, null, 2)} </pre>
      <div className={styles.container}>
        <Link href="/login">Login</Link>
        <Link href="/awards">Add / Remove Awards</Link>
        <Link href="/add">Add Products</Link>
        <Link href="/deleteProduct">Delete Products</Link>
      </div>
    </div>
  );
}
