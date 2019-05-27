import React, { Component } from "react";
import { here } from "../../../config/constants";
import _ from "lodash";
import WebService from "../../../services/WebService";
// import WebService from "../../../services/WebService";
class Map extends Component<State> {
    map;
    layer;
    bubble;
    marker;
    platform;
    current_location;
    MAX_DIS = 100; // m
    themes = [
        "normal.day",
        "normal.day.grey",
        "normal.day.transit",
        "normal.night",
        "normal.night.grey",
        "reduced.night",
        "reduced.day",
        "pedestrian.day",
        "pedestrian.night"
    ];
    events;
    behavior;
    ui;
    nearestStore;
    image = "https://img.icons8.com/color/48/000000/marker.png";

    constructor(props: any) {
        super(props);
        this.platform = null;
        this.map = null;

        const { lat, lng, zoom } = this.props;
        this.state = {
            userLocation: [],
            dropdownOpen: false,
            app_id: here.app_id,
            app_code: here.app_code,
            center: {
                lat: lat ? lat : 0,
                lng: lng ? lng : 0
            },
            useCIT: true,
            useHTTPS: true,
            zoom: zoom,
            theme: this.themes[1],
            stores: []
        };
    }
    // TODO: Add theme selection discussed later HERE
    componentWillMount = () => {
        const { lat, lng, zoom } = this.props;
        this.setState({
            center: {
                lat: lat ? lat : 0,
                lng: lng ? lng : 0
            },
            zoom: zoom
        });
    };

    componentDidMount = () => {
        this.drawMap();
    };

    componentWillReceiveProps = nextProps => {
        this.setState({
            center: {
                lat: nextProps.lat,
                lng: nextProps.lng
            }
        });
        // document.getElementById("here-map").innerHTML = "";
    };

    prepareLayout = () => {
        this.platform = new window.H.service.Platform(this.state);
        // create layer to draw map
        var pixelRatio = window.devicePixelRatio || 1;
        this.layer = this.platform.createDefaultLayers({
            tileSize: pixelRatio === 1 ? 256 : 512,
            ppi: pixelRatio === 1 ? undefined : 320
        });
        // get div container to where to draw
        var container = document.getElementById("here-map");
        //crate map with layer & container created
        this.map = new window.H.Map(container, this.layer.normal.map, {
            center: this.state.center,
            zoom: this.state.zoom,
            pixelRatio: pixelRatio
        });
        let mapTileService = this.platform.getMapTileService({
                type: "base"
            }),
            vietnameseMapLayer = mapTileService.createTileLayer("maptile", this.themes[0], pixelRatio === 1 ? 256 : 512, "png8", {
                lg: "vie",
                ppi: pixelRatio === 1 ? undefined : 320
            });

        this.map.setBaseLayer(vietnameseMapLayer);
        this.events = new window.H.mapevents.MapEvents(this.map);
        this.behavior = new window.H.mapevents.Behavior(this.events);
        this.ui = window.H.ui.UI.createDefault(this.map, this.layer, "zh-CN");
    };

    drawMap = () => {
        this.prepareLayout();
        const { lat, lng } = this.state.center;
        var parisMarker = new window.H.map.Marker({ lat: lat, lng: lng });
        this.map.addObject(parisMarker);
        this.geocode();
        this.findNearestMarker();
    };
    // map to nearest store
    geocode = () => {
        const addresses = this.props.address;
        if (addresses) {
            _.map(addresses, (item, index) => {
                const { address } = item;
                let geocoder = this.platform.getGeocodingService();
                let geocodingParameters = {
                    searchText: address,
                    jsonattributes: 1
                };
                geocoder.geocode(
                    geocodingParameters,
                    result => {
                        var locations = result.response.view[0].result;
                        this.addLocationsToMap(locations[0], item.id, index);
                    },
                    error => {
                        console.log("Error when geocode address");
                    }
                );
            });
        }
    };

    addLocationsToMap = (location, id, index) => {
        let group = new window.H.map.Group();
        let position = {};
        position = {
            lat: location.location.displayPosition.latitude,
            lng: location.location.displayPosition.longitude
        };
        var myIcon = new window.H.map.Icon(this.image);
        const html = "<div> Chi nhánh " + location.location.address.label + "</div>";
        this.marker = new window.H.map.Marker(position, { icon: myIcon });
        this.marker.setData(html);
        this.marker.draggable = true;

        group.addObject(this.marker);
        this.map.addObject(group);
        this.map.setCenter(group.getBounds().getCenter());
        // distance to current position
        const distance = group
            .getObjects()[0]
            .getPosition()
            .distance(this.state.center);
        // update location for stores
        WebService.updateLocation(position, distance, id)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        //get info of store address when click map
        group.addEventListener(
            "tap",
            evt => {
                var bubble = new window.H.ui.InfoBubble(evt.target.getPosition(), {
                    content: evt.target.getData()
                });
                this.ui.addBubble(bubble);
            },
            false
        );
    };

    findNearestMarker = () => {
        WebService.getAllLocation()
            .then(res => {
                const stores = JSON.parse(res).addresses;
                let distance = stores[0].distance;
                this.nearestStore = stores[0];
                _.map(stores, item => {
                    if (item.distance < distance) {
                        distance = item.distance;
                        this.nearestStore = item;
                    }
                });
                this.calculateRouteFromAtoB();
            })
            .catch(err => {
                console.log(err);
            });
    };

    calculateRouteFromAtoB = () => {
        const position = JSON.parse(this.nearestStore.location);
        const point1 = this.state.center.lat + "," + this.state.center.lng;
        const point2 = position.lat + "," + position.lng;
        var router = this.platform.getRoutingService(),
            routeRequestParams = {
                mode: "fastest;car",
                representation: "display",
                waypoint0: point1,
                waypoint1: point2,
                routeattributes: "waypoints,summary,shape,legs",
                maneuverattributes: "direction,action"
            };

        router.calculateRoute(
            routeRequestParams,
            result => {
                var route = result.response.route[0];
                this.addRouteShapeToMap(route);
                this.addManueversToMap(route);
            },
            err => {
                alert("Ooops!");
            }
        );
    };
    addRouteShapeToMap = route => {
        var strip = new window.H.geo.Strip(),
            routeShape = route.shape,
            polyline;

        routeShape.forEach(point => {
            var parts = point.split(",");
            strip.pushLatLngAlt(parts[0], parts[1]);
        });

        polyline = new window.H.map.Polyline(strip, {
            style: {
                lineWidth: 4,
                strokeColor: "rgba(0, 128, 255, 0.7)"
            }
        });
        // Add the polyline to the map
        this.map.addObject(polyline);
        // And zoom to its bounding rectangle
        this.map.setViewBounds(polyline.getBounds(), true);
    };

    addManueversToMap = route => {
        var svgMarkup =
                '<svg width="18" height="18" ' +
                'xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="8" cy="8" r="8" ' +
                'fill="#1b468d" stroke="white" stroke-width="1"  />' +
                "</svg>",
            dotIcon = new window.H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } }),
            group = new window.H.map.Group(),
            i,
            j;

        // Add a marker for each maneuver
        for (i = 0; i < route.leg.length; i += 1) {
            for (j = 0; j < route.leg[i].maneuver.length; j += 1) {
                let maneuver = route.leg[i].maneuver[j];
                // Add a marker to the maneuvers group
                var marker = new window.H.map.Marker(
                    {
                        lat: maneuver.position.latitude,
                        lng: maneuver.position.longitude
                    },
                    { icon: dotIcon }
                );
                marker.instruction = maneuver.instruction;
                group.addObject(marker);
            }
        }
        group.addEventListener(
            "tap",
            evt => {
                this.map.setCenter(evt.target.getPosition());
                this.openBubble(evt.target.getPosition(), evt.target.instruction);
            },
            false
        );

        // Add the maneuvers group to the map
        this.map.addObject(group);
    };
    openBubble = (position, text) => {
        if (!this.bubble) {
            this.bubble = new window.H.ui.InfoBubble(
                position,
                // The FO property holds the province name.
                { content: text }
            );
            this.ui.addBubble(this.bubble);
        } else {
            this.bubble.setPosition(position);
            this.bubble.setContent(text);
            this.bubble.open();
        }
    };
    render = () => {
        const style = {
            width: "100%",
            height: "400px",
            background: "grey"
        };
        return (
            <div>
                <div id="here-map" style={style} />
            </div>
        );
    };
}
export default Map;
