import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./Order.scss";
import WebService from "../../../services/WebService";
import AuthService from "../../../services/AuthService";
import { ACTIVE_TYPE } from "../../../config/constants";
import { withCommas } from "../../../helpers/lib";
import { ROUTE_NAME } from "../../../routes/main.routing";
class Order extends Component {
    static propTypes = {
        fetchOrders: PropTypes.func,
        orders: PropTypes.array
    };

    componentWillMount = () => {
        this.fetchOrders();
    };

    fetchOrders = () => {
        WebService.getAllOrders(AuthService.getTokenUnsafe(), 1000, 0, {}).then(res => {
            const result = JSON.parse(res);
            if (result.status && result.status === ACTIVE_TYPE.TRUE) {
                this.props.fetchOrders(result.orders.reverse());
            }
        });
    };

    generateTableRows = orders => {
        return orders
            .map((order, idx) => {
                console.log(order);
                return (
                    <tr key={idx}>
                        <td>{order.date}</td>
                        <td>{withCommas(order.total)} ₫</td>
                        <td>{order.status}</td>
                        <td>
                            <Link to={ROUTE_NAME.ORDER_DETAIL + "/" + order.id}>Details</Link>
                        </td>
                    </tr>
                );
            })
            .reverse();
    };

    render = () => {
        return (
            <div>
                <div className="breadcumb_area bg-img" style={{ backgroundImage: "url(/img/bg-img/breadcumb.jpg)" }}>
                    <div className="container h-100">
                        <div className="row h-100 align-items-center">
                            <div className="col-12">
                                <div className="page-title text-center">
                                    <h2>Orders</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- ##### Breadcumb Area End ##### --> */}

                {/* <!-- ##### Order Grid Area Start ##### --> */}
                <section className="shop_grid_area">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-10">
                                <div className="regular-page-content-wrapper section-padding-80">
                                    <div className="regular-page-text">
                                        <h3>Order list</h3>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Date</th>
                                                    <th scope="col">Total</th>
                                                    <th scope="col">Status</th>
                                                    <th scope="col" />
                                                </tr>
                                            </thead>
                                            <tbody>{this.generateTableRows(this.props.orders)}</tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    };
}

export default Order;
