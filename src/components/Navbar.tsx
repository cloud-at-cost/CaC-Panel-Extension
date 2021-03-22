import { Component } from "react";
import { Link } from "react-router-dom";
import routes from "../routes";

type NavbarProps = {
  user?: CloudatCostSettingsResponse;
};

class Navbar extends Component<NavbarProps> {
  render() {
    return (
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        {/*
				<button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
					<i className="fa fa-bars"></i>
				</button>
				  */}
        <ul className="navbar-nav ml-auto">
          <li className="nav-item dropdown no-arrow">
            <div>
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="userDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {this.props.user && (
                  <span className="mr-2 d-lg-inline text-gray-600 small">
                    Hi {this.props.user.name}
                  </span>
                )}
                <i className="fas fa-cog"></i>
              </a>
              <div
                className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                aria-labelledby="userDropdown"
              >
                <Link className="dropdown-item" to={routes.settings}>
                  <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                  Settings
                </Link>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    );
  }
}
export default Navbar;
