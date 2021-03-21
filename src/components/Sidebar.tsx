import { Component } from "react";
import { Link } from "react-router-dom";
import routes from "../routes";

class Sidebar extends Component {
  render() {
    return (
      <ul
        className="navbar-nav bg-gradient-dark sidebar sidebar-dark accordion"
        id="accordionSidebar"
      >
        <a className="sidebar-brand d-flex align-items-center justify-content-center">
          <div className="sidebar-brand-icon">
            <img src={chrome.runtime.getURL("cac_logo.png")} />
          </div>
          <div className="sidebar-brand-text mx-3">C@C Panel Helper</div>
        </a>
        <hr className="sidebar-divider my-0" />
        <li className="nav-item">
          <Link className="nav-link" to={routes.home}>
            <i className="fas fa-fw fa-home"></i>
            <span>Home</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={routes.cloudatcostminer}>
            <i className="fab fa-fw fa-bitcoin"></i>
            <span>Miners</span>
          </Link>
        </li>
      </ul>
    );
  }
}
export default Sidebar;
