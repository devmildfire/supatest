import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function Nav() {
  return (
    <div className={styles.container}>
      <Link href="/login">Login</Link>
      <Link href="/all">All Products</Link>
      <Link href="/awards">Add / Remove Awards</Link>
      <Link href="/add">Add Products</Link>
      <Link href="/deleteProduct">Delete Products</Link>
    </div>
  );
}
