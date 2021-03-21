import { Component } from "react";

class Footer extends Component {
  render() {
    return (
      <footer className="sticky-footer bg-white">
        <div className="container my-auto">
          <div className="copyright text-center my-auto">
            <span>
              Copyright &copy; C@C Panel Helper {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    );
  }
}
export default Footer;
