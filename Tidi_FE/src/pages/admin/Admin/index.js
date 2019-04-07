// External denpendencies
import { connect } from "react-redux";
import Admin from "./Admin";

const mapStateToProps = state => state.admin.Admin;

export default connect(mapStateToProps)(Admin);
