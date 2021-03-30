import { Component } from "react";
import { version } from "../../package.json";

class Footer extends Component {
  render() {
    return (
      <footer className="sticky-footer bg-white">
        <div className="container my-auto">
          <div className="copyright text-center my-auto">
            <span>Copyright &copy; C@C Panel Helper V{version}</span>
          </div>
        </div>
      </footer>
    );
  }
}
export default Footer;
