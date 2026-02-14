import { Link } from "react-router-dom";
import "../styles/guest.css";
import logo from "../assets/img/landing/logo.png";

function GuestNavbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <img src={logo} alt="ILPS Logo" />
      </div>

      <ul className="nav-links">
        <li><a href="#hero">Home</a></li>
        <li><a href="#subjects">Subjects</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#how">How It Works</a></li>
        <li><a href="#stats">Stats</a></li>
      </ul>

      <Link to="/auth/sign-in" className="glow-btn nav-btn">
        Sign In
      </Link>
    </nav>
  );
}

export default GuestNavbar;