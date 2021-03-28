import React, { Component } from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import "bootstrap";
import "startbootstrap-sb-admin-2/css/sb-admin-2.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "./App.css";

import CloudatCostClient from "./apis/cloudatcost";
import { SettingsResponse } from "./apis/cloudatcost";
import CloudatCocksClient from "./apis/cloudatcocks";
import routes from "./routes";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CloudatCostLogin from "./components/CloudatCostLogin";
import CloudatCostMiner from "./components/CloudatCostMiner";
import CloudatCostVM from "./components/CloudatCostVM";
import Settings from "./components/Settings";

type AppProps = {};
type AppState = {
  cacUser?: SettingsResponse;
  cacClient?: CloudatCostClient;
  cacMineClient?: CloudatCocksClient;
};

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      cacUser: undefined,
      cacClient: undefined,
      cacMineClient: undefined,
    };
    this.handleCacLogin = this.handleCacLogin.bind(this);
  }

  handleCacLogin(client: CloudatCostClient) {
    // save client
    this.setState({
      cacClient: client,
    });
    // get user info
    client.getSettings().then((settings) => {
      this.setState({
        cacUser: settings,
      });
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
                    {this.state.cacClient === undefined && (
                      <CloudatCostLogin onLoginValid={this.handleCacLogin} />
                    )}
                    <Switch>
                      <Route
                        path={routes.cloudatcostminer}
                        render={(props) => (
                          <CloudatCostMiner
                            {...props}
                            cloudatCostClient={this.state.cacClient}
                          />
                        )}
                      />
                      <Route
                        path={routes.cloudatcostvm}
                        render={(props) => (
                          <CloudatCostVM
                            {...props}
                            cloudatCostClient={this.state.cacClient}
                          />
                        )}
                      />
                      <Route path={routes.settings} component={Settings} />
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
