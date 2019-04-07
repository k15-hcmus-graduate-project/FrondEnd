// External Dependencies
import { connect } from "react-redux";
import Actions from "../duck/actions";
import Orders from "./Orders";

const mapStateToProps = state => ({
    ...state.orders.Orders
});

const mapDispatchToProps = dispatch => ({
    fetchOrders: orders => {
        dispatch(Actions.fetchOrders(orders));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Orders);
