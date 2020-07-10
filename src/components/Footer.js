import React from "react";

function Footer() {
  return (
    <footer className="pt-5">
      <div className="container text-center">
        <p>&copy; Chatalone {new Date().getFullYear()}.</p>
      </div>
    </footer>
  );
}

export default Footer;
