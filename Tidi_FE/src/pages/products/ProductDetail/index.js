// External Dependencies
import { connect } from "react-redux";
import commonActions from "../../common/duck/actions";
import ProductDetail from "./ProductDetail";
import viewActions from "../duck/actions";

const mapStateToProps = state => ({
    ...state.products.ProductDetail,
    cart: state.common.Cart,
    decreaseViewer: state.products.decreaseViewer
});

const mapDispatchToProps = dispatch => ({
    updateCartProducts: products => {
        dispatch(commonActions.updateCartProduct(products));
    },
    decreaseViewerAct: (value: boolean) => {
        dispatch(viewActions.decreaseViewerAct(value));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProductDetail);
