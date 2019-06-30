// Stylesheets
import React, { Component } from "react";
import PropTypes from "prop-types";
import Pagination from "react-js-pagination";
import "./Paginator.scss";

class Paginator extends Component {
    static propTypes = {
        currentPage: PropTypes.number,
        pageSize: PropTypes.number,
        totalItems: PropTypes.number
    };

    render = () => {
        const { currentPage, pageSize, totalItems, handlePageChange } = this.props;
        return (
            <Pagination
                innerClass="pagination justify-content-center"
                itemClass="page-item"
                linkClass="page-link"
                activePage={currentPage}
                itemsCountPerPage={pageSize}
                totalItemsCount={totalItems}
                pageRangeDisplayed={5}
                onChange={newPageIndex => {
                    handlePageChange(newPageIndex);
                }}
            />
        );
    };
}

export default Paginator;
