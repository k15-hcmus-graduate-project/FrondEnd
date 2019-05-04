// External Dependencies
import { connect } from "react-redux";
import Actions from "../duck/actions";
import Direction from "./Direction";

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
)(Direction);
