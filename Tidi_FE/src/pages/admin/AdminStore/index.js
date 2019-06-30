// External dependencies
import { connect } from "react-redux";
import Actions from "../duck/actions";
import commonActions from "../../common/duck/actions";
import AdminStore from "./AdminStore";

const mapStateToProps = state => ({
    ...state.admin.AdminProduct,
    ...state.admin.AdminAddStore,
    ...state.admin.AdminFilter
});

const mapDispatchToProps = dispatch => ({
    setFormData: newData => dispatch(Actions.updateAddStoreForm(newData)),
    fetchProducts: products => dispatch(Actions.fetchProducts(products)),
    changePageInfo: pageInfo => dispatch(commonActions.changePageInfo(pageInfo)),
    updateFilter: query => dispatch(Actions.updateFilter(query)),
    updateForm: newFormObj => {
        dispatch(Actions.updateAddProductForm(newFormObj));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AdminStore);
