import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/shopifyapp/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: Boolean(login) });
};

export default function App() {
  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Accept Bitcoin in Shopify with BTCPay Server</h1>
        <p className={styles.text}>
          Add Bitcoin as a payment option to your store with{" "}
          <a
            href="https://btcpayserver.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3498db", textDecoration: "underline" }}
          >
            BTCPay Server
          </a>
          . It's free, simple, secure, and puts you in full control.
        </p>

        <ul className={styles.list}>
          <li>
            <strong>Zero fees: </strong> Enjoy a payment gateway with no fees. Yes, You saw that right. Zero fees!
          </li>
          <li>
            <strong>No middlemen: </strong> Say goodbye to intermediaries and tedious paperwork, and get your money directly in your wallet
          </li>
          <li>
            <strong>Community-driven support: </strong> Get responsive assistance from our dedicated community
          </li>
        </ul>
        <div>
          <a className={styles.button} 
          target="_blank"
          href="https://docs.btcpayserver.org/Shopify/">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
