// Stylesheets
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { ROUTE_NAME } from "../../../routes/main.routing";
import { Alert } from "reactstrap";
import { Parse, client } from "../../../helpers/parse";
import "./HomePage.scss";
import WebService from "../../../services/WebService";
import storeService from "../../../services/StorageService.js";

const sleep = ms => new Promise(r => setTimeout(() => r(), ms));

class HomePage extends Component {
    subscription;

    constructor(props: any) {
        super(props);
        this.state = { userCount: 0, updateParse: true };
    }

    componentWillMount = () => {
        console.log("will mount");
    };

    componentDidMount = async () => {
        await sleep(2000);

        if (storeService.getUserCount()) {
            this.setState({ updateParse: false });
        } else {
            storeService.setUserCount();
            this.setState({ updateParse: true });
        }

        let parseQuery = new Parse.Query("Connector");
        this.subscription = client.subscribe(parseQuery); // subcribe client parse

        if (this.state.updateParse === true) {
            await this.changeUser(1);
        }

        this.subscription.on("update", object => {
            console.log("update count user");
            this.setState({ userCount: parseInt(object.get("count"), 10) });
        });

        parseQuery.first().then(res => {
            if (res.get("count")) this.setState({ userCount: parseInt(res.get("count"), 10) });
        });

        window.addEventListener("beforeunload", async ev => {
            console.log("reunload");
            ev.preventDefault();
            storeService.removeUserCount();
            await WebService.changeUserConnect(0);
            await sleep(1600);
        });
    };

    changeUser = option => {
        var parseQuery = new Parse.Query("Connector");
        parseQuery
            .first()
            .then(object => {
                option === 0
                    ? object.set("count", parseInt(object.get("count"), 10) - 1)
                    : object.set("count", parseInt(object.get("count"), 10) + 1);
                object
                    .save()
                    .then(res => {
                        console.log("saved");
                    })
                    .catch(err => {
                        console.log("cannot connect to parse: ", err);
                    });
            })
            .catch(err => {
                console.log("cannot connect to parse: ", err);
            });
    };

    render = () => {
        return (
            <>
                <section className="welcome_area bg-img background-overlay" style={{ backgroundImage: "url(/img/bg-img/bg-1.jpg)" }}>
                    <div className="container h-100">
                        {this.state.userCount > 0 && (
                            <Alert className="alertWatching" color="light">
                                {this.state.userCount} people are visiting this site with you.
                            </Alert>
                        )}
                        <div className="row h-100 align-items-center">
                            <div className="col-12">
                                <div className="hero-content">
                                    <h6>asoss</h6>
                                    <h2>New Collection</h2>
                                    <Link to={ROUTE_NAME.PRODUCTS} className="btn essence-btn">
                                        view collection
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* <!-- ##### Top Catagory Area Start ##### --> */}
                <div className="top_catagory_area section-padding-80 clearfix">
                    <div className="container">
                        <div className="row justify-content-center">
                            {/* <!-- Single Catagory --> */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div
                                    className="single_catagory_area d-flex align-items-center justify-content-center bg-img"
                                    style={{ backgroundImage: "url(/img/bg-img/bg-2.jpg)" }}
                                >
                                    <div className="catagory-content">
                                        <Link to={`${ROUTE_NAME.PRODUCTS}?ind=7`}>Clothing</Link>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Single Catagory --> */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div
                                    className="single_catagory_area d-flex align-items-center justify-content-center bg-img"
                                    style={{ backgroundImage: "url(/img/bg-img/bg-3.jpg)" }}
                                >
                                    <div className="catagory-content">
                                        <Link to={`${ROUTE_NAME.PRODUCTS}?ind=6`}>Shoes</Link>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Single Catagory --> */}
                            <div className="col-12 col-sm-6 col-md-4">
                                <div
                                    className="single_catagory_area d-flex align-items-center justify-content-center bg-img"
                                    style={{ backgroundImage: "url(/img/bg-img/bg-4.jpg)" }}
                                >
                                    <div className="catagory-content">
                                        {" "}
                                        <Link to={`${ROUTE_NAME.PRODUCTS}?ind=4`}>Accessories</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- ##### Top Catagory Area End ##### --> */}
                {/* <!-- ##### CTA Area Start ##### --> */}
                <div className="cta-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div
                                    className="cta-content bg-img background-overlay"
                                    style={{ backgroundImage: "url(/img/bg-img/bg-5.jpg)" }}
                                >
                                    <div className="h-100 d-flex align-items-center justify-content-end">
                                        <div className="cta--text">
                                            <h6>-60%</h6>
                                            <h2>Global Sale</h2>
                                            <Link className="btn essence-btn" to={`${ROUTE_NAME.PRODUCTS}`}>
                                                Buy Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- ##### CTA Area End ##### --> */}
                {/* <!-- ##### Brands Area Start ##### --> */}
                <div className="brands-area d-flex align-items-center justify-content-between">
                    {/* <!-- Brand Logo --> */}
                    <div className="single-brands-logo">
                        <img src="img/core-img/brand1.png" alt="" />
                    </div>
                    {/* <!-- Brand Logo --> */}
                    <div className="single-brands-logo">
                        <img src="img/core-img/brand2.png" alt="" />
                    </div>
                    {/* <!-- Brand Logo --> */}
                    <div className="single-brands-logo">
                        <img src="img/core-img/brand3.png" alt="" />
                    </div>
                    {/* <!-- Brand Logo --> */}
                    <div className="single-brands-logo">
                        <img src="img/core-img/brand4.png" alt="" />
                    </div>
                    {/* <!-- Brand Logo --> */}
                    <div className="single-brands-logo">
                        <img src="img/core-img/brand5.png" alt="" />
                    </div>
                    {/* <!-- Brand Logo --> */}
                    <div className="single-brands-logo">
                        <img src="img/core-img/brand6.png" alt="" />
                    </div>
                </div>
                {/* <!-- ##### Brands Area End ##### --> */}
            </>
        );
    };
}

export default HomePage;
