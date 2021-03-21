import React, { Component } from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import "bootstrap";
import "startbootstrap-sb-admin-2/css/sb-admin-2.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "./App.css";

import api from "./api";
import routes from "./routes";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CloudatCostLogin from "./components/CloudatCostLogin";
import CloudatCostMiner from "./components/CloudatCostMiner";

type AppProps = {};
type AppState = {
  cacUser?: CloudatCostSettingsResponse;
};

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      cacUser: null,
    };
    this.handleCacLogin = this.handleCacLogin.bind(this);
  }

  handleCacLogin(user: CloudatCostSettingsResponse) {
    this.setState({
      cacUser: user,
    });
  }

  render() {
    return (
      <Router>
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
            <meta name="description" content="" />
            <meta name="author" content="" />
            <title>C@C Panel Helper</title>
            <link
              href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
              rel="stylesheet"
            />
          </head>
          <body id="page-top">
            <div id="wrapper">
              <Sidebar />
              <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                  <Navbar user={this.state.cacUser} />
                  <div className="container-fluid">
                    {this.state.cacUser === null && (
                      <CloudatCostLogin onLoginValid={this.handleCacLogin} />
                    )}
                    <Switch>
                      <Route
                        path={routes.cloudatcostminer}
                        component={CloudatCostMiner}
                      />
                    </Switch>
                  </div>
                </div>
                <Footer />
              </div>
            </div>
            <a className="scroll-to-top rounded" href="#page-top">
              <i className="fas fa-angle-up"></i>
            </a>
          </body>
        </html>
      </Router>
    );
  }
}

export default App;
