import { connect } from "react-redux";
import AdminNavBar from "./AdminNavBar";

const mapStateToProps = state => state.admin.AdminNavBar;

export default connect(mapStateToProps)(AdminNavBar);
