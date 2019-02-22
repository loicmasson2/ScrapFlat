import React from 'react';
import { graphql } from 'gatsby';
import { deepMerge } from 'grommet/utils';
import * as d3 from 'd3';
import { Box, Button, Heading, Grommet, grommet } from 'grommet';
import { Notification } from 'grommet-icons';
import SEO from '../components/seo';

const theme = deepMerge(grommet, {
    global: {
        colors: {
            accent: '#66FCF1',
            brand: '#1F2833', //https://visme.co/blog/website-color-schemes/ #12
            bg: '#eaf2e3'
        },
        font: {
            family: 'Oswald',
            size: '14px',
            height: '20px'
        }
    }
});

const LineChartStyle = {
    fill: 'none',
    stroke: 'steelblue',
    strokeWidth: '2px'
};

const AppBar = props => (
    <Box
        tag="header"
        direction="row"
        align="center"
        justify="between"
        background="brand"
        pad={{ left: 'medium', right: 'small', vertical: 'small' }}
        elevation="medium"
        style={{ zIndex: '1' }}
        {...props}
    />
);

const ScatterPlot = data => {
    // set the dimensions and margins of the graph
    let margin = {
            top: 40,
            right: 80,
            bottom: 200,
            left: 80
        },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let svg = d3
        .select('#scatterPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    let g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let minSize = d3.min(data, function(d) {
        return d.size;
    });
    // let maxSize = d3.max(data, function(d) {
    //     return d.size;
    // });
    let minPrice = d3.min(data, function(d) {
        return d.price;
    });
    // let maxPrice = d3.max(data, function(d) {
    //     return d.price;
    // });

    let x = d3
            .scaleLinear()
            .range([0, width])
            .domain([minSize, 100]),
        y = d3
            .scaleLinear()
            .range([height, 0])
            .domain([minPrice, 2000]);

    // Add the X Axis
    g.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    // Add the Y Axis
    g.append('g').call(d3.axisLeft(y));

    g.selectAll('.point')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return x(d.size);
        })
        .attr('cy', function(d) {
            return y(d.price);
        })
        .attr('r', 2)
        .style('fill', 'steelblue')
        .style('stroke', 'lightgray');
};

const LineChart = data => {
    // set the dimensions and margins of the graph
    let margin = {
            top: 40,
            right: 80,
            bottom: 200,
            left: 80
        },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let svg = d3
        .select('#lineChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let minSize = d3.min(data, function(d) {
        return d.size;
    });
    // let maxSize = d3.max(data, function(d) {
    //     return d.size;
    // });
    let minPrice = d3.min(data, function(d) {
        return d.price;
    });
    // let maxPrice = d3.max(data, function(d) {
    //     return d.price;
    // });
    data.forEach(function(d) {
        d.price = +d.price;
        d.size = +d.size;
    });
    let x = d3.scaleLinear().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    // define the line
    let valueline = d3
        .line()
        .x(function(d) {
            return x(d.size);
        })
        .y(function(d) {
            return y(d.price);
        });

    console.log(valueline);

    // Scale the range of the data
    x.domain(
        d3.extent(data, function(d) {
            return d.size;
        })
    );
    y.domain([
        0,
        d3.max(data, function(d) {
            return d.price;
        })
    ]);

    svg.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', valueline);

    // Add the X Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append('g').call(d3.axisLeft(y));
};

class DashboardPage extends React.Component {
    state = {
        viewport: {
            latitude: 60.192059,
            longitude: 24.945831,
            zoom: 8
        },
        showSidebar: true
    };
    render() {
        let filteredData;
        d3.json('/data.json').then(data => {
            filteredData = data.map(function(d, i) {
                if (d.productInfo) {
                    let product = d.productInfo.productInfo;
                    let split = d.name.split(' ');
                    let size = split[split.length - 2];

                    return {
                        title: product.productRoomDescription,
                        price: Number(product.basePrice),
                        date: d.availability,
                        nbr_rooms: d.moreInfo.nbrRooms,
                        description: product.description,
                        size: Number(size)
                    };
                } else {
                    console.log('ERROR');
                    console.log(d);
                }
            });
            ScatterPlot(filteredData);
            LineChart(filteredData);
        });

        return (
            <Grommet theme={theme} full>
                <Box fill>
                    <AppBar>
                        <Heading level="3" margin="none">
                            Scrap Flat
                        </Heading>
                        <Button
                            icon={<Notification />}
                            onClick={() => this.setState({ showSidebar: !this.state.showSidebar })}
                        />
                    </AppBar>
                    <Box direction="row" flex overflow={{ horizontal: 'hidden' }}>
                        <Box flex align="center" justify="center" id="goThere">
                            <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
                            <Box flex align="center" justify="center" id="scatterPlot" />
                            <Box flex align="center" justify="center" id="lineChart" style={LineChartStyle} />
                        </Box>
                    </Box>
                </Box>
            </Grommet>
        );
    }
}

export const query = graphql`
    query DashboardPage {
        site {
            siteMetadata {
                description
            }
        }
    }
`;

export default DashboardPage;
