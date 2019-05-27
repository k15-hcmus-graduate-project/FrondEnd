import React, { Component } from "react";
// import _ from "lodash";
import PropTypes from "prop-types";
import "./Direction.scss";
import WebService from "../../../services/WebService";
import Loader from "../../common/Loader/Loader";
import Map from "./Map.jsx";
import { here } from "../../../config/constants";
// import AuthService from "../../../services/AuthService";
// import { ACTIVE_TYPE } from "../../../config/constants";
// import { withCommas } from "../../../helpers/lib";
// import { ROUTE_NAME } from "../../../routes/main.routing";
// import { Parse, client } from "../../../helpers/parse";

class Direction extends Component {
    static propTypes = {
        fetchOrders: PropTypes.func,
        orders: PropTypes.array
    };
    subscription;

    constructor(props) {
        super(props);
        this.state = {
            address: [],
            lat: 0,
            lng: 0
        };
    }

    componentWillMount = () => {
        // let parseAccount = new Parse.Query("accounts");
        // console.log(parseAccount);
        // this.subscription = client.subscribe(parseAccount);
        this.getCurrentLocation();
        this.getAllAddresses();
    };

    componentDidMount = () => {
        if (!this.state.address) {
            this.getAllAddresses();
        }
        setInterval(() => {
            const { lat, lng } = this.state;
            navigator.geolocation.getCurrentPosition(
                position => {
                    var m_lat = position.coords.latitude;
                    var m_lng = position.coords.longitude;
                    const distance = new window.H.geo.Point(m_lat, m_lng).distance(new window.H.geo.Point(lat, lng));
                    console.log("distance now: ", distance);
                    if (distance > 20) {
                        this.setState({
                            lat: m_lat,
                            lng: m_lng
                        });
                    }
                },
                () => {
                    alert("Geocoder failed");
                }
            );
        }, 3000);
    };

    getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                var m_lat = position.coords.latitude;
                var m_lng = position.coords.longitude;
                this.setState({
                    lat: m_lat,
                    lng: m_lng
                });
                console.log("my curent: ", this.state);
            },
            () => {
                alert("Geocoder failed");
            }
        );
    };

    componentWillReceiveProps = nextProps => {
        // this.getCurrentLocation();
    };
    getAllAddresses = () => {
        WebService.getAllLocation()
            .then(res => {
                const address = JSON.parse(res).addresses;
                this.setState({
                    address: address
                });
            })
            .catch(err => {
                console.log(err);
            });
    };

    render = () => {
        const { lat, lng, address } = this.state;
        if (lat === 0 && lng === 0)
            return (
                <div>
                    <Loader />
                </div>
            );
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
                                        <Map
                                            app_id={here.app_id}
                                            app_code={here.app_code}
                                            lat={lat}
                                            lng={lng}
                                            zoom="100"
                                            address={address}
                                            // accLocation={this.state.userLocation}
                                        />
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
