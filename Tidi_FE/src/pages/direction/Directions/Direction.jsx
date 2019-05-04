import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./Direction.scss";
import WebService from "../../../services/WebService";
import Map from "./Map.jsx";
import { here } from "../../../config/constants";
import AuthService from "../../../services/AuthService";
import { ACTIVE_TYPE } from "../../../config/constants";
import { withCommas } from "../../../helpers/lib";
import { ROUTE_NAME } from "../../../routes/main.routing";

class Direction extends Component {
    static propTypes = {
        fetchOrders: PropTypes.func,
        orders: PropTypes.array
    };

    constructor(props) {
        super(props);
    }

    componentWillMount = () => {
        // this.fetchOrders();
    };
    componentDidMount = () => {
        // var platform = new window.H.service.Platform({
        //     app_id: "APP_ID_HERE",
        //     app_code: "APP_CODE_HERE"
        // });
    };
    // fetchOrders = () => {
    //     WebService.getAllOrders(AuthService.getTokenUnsafe(), 1000, 0, {}).then(res => {
    //         const result = JSON.parse(res);
    //         if (result.status && result.status === ACTIVE_TYPE.TRUE) {
    //             this.props.fetchOrders(result.orders.reverse());
    //         }
    //     });
    // };
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
                                    <h2>Directions</h2>
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
                                    <div className="regular-page-text App">
                                        <Map app_id={here.app_id} app_code={here.app_code} lat="42.345978" lng="-83.0405" zoom="12" />
                                        {/* <h3>Order list</h3>
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
                                        </table> */}
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

export default Direction;
