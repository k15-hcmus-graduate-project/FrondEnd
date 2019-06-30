// External dependencies
import { connect } from "react-redux";
import Actions from "../../duck/actions";
import AdminAddStore from "./AdminAddStore";

const mapStateToProps = state => state.admin.AdminAddStore;

const mapDispatchToProps = dispatch => ({
    updateForm: newFormObj => {
        dispatch(Actions.updateAddStoreForm(newFormObj));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AdminAddStore);
