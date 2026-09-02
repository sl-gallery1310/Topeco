"use client";

/** Rouvre le bandeau cookies depuis le pied de page (exigence CNIL : choix révocable). */
export default function ReopenCookies() {
  return (
    <a
      href="#cookies"
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("topeco:cookies:open"));
      }}
    >
      Gestion des cookies
    </a>
  );
}
