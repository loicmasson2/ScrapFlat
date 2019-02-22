import React from 'react';
import { Link } from 'gatsby';
import { graphql } from 'gatsby';
import { deepMerge } from 'grommet/utils';
import ReactMapGL from 'react-map-gl';
import {
    Box,
    Button,
    Collapsible,
    Heading,
    Grommet,
    grommet,
    Layer,
    ResponsiveContext,
    Grid,
    Image,
    Text
} from 'grommet';
import { Notification } from 'grommet-icons';
//d2ue5ppt0wsjaa.cloudfront.net/640x427,fit/vuokraovimedia/images/154/868/873/057/15486887305760_original.jpg
//d2ue5ppt0wsjaa.cloudfront.net/108x81%2Cfit/vuokraovimedia/images/154/868/873/057/15486887305760_original.jpg

// import Image from '../components/image';
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

class IndexPage extends React.Component {
    state = {
        viewport: {
            latitude: 60.192059,
            longitude: 24.945831,
            zoom: 8
        },
        showSidebar: true
    };
    render() {
        const { showSidebar } = this.state;
        const flats = this.props.data.allDataJson.edges;
        return (
            <Grommet theme={theme} full>
                <ResponsiveContext.Consumer>
                    {size => (
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
                                <Box flex align="center" justify="center">
                                    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
                                    <ReactMapGL
                                        {...this.state.viewport}
                                        width="100%"
                                        height="100%"
                                        mapStyle="mapbox://styles/loicmasson/cjr81xe2o07l42so0vcxxw1pn"
                                        mapboxApiAccessToken="pk.eyJ1IjoibG9pY21hc3NvbiIsImEiOiJjanI4MXN4MWswMXZhNDNtbHN5dzZzanlsIn0.4fw0ARbOrTr88AHvIEaVyw"
                                        onViewportChange={viewport => this.setState({ viewport })}
                                    />
                                </Box>
                                {!showSidebar || size !== 'small' ? (
                                    <Collapsible direction="horizontal" open={showSidebar}>
                                        <Box flex overflow="auto" pad="xsmall">
                                            <Grid
                                                columns={{
                                                    count: 2,
                                                    size: 'small'
                                                }}
                                                align="center"
                                                alignContent="center"
                                                gap="small"
                                            >
                                                {flats.map(flat => (
                                                    <Box width="medium" elevation="small" height="medium" pad="small">
                                                        <Box height="medium" width="medium">
                                                            <Image fit="contain" src={flat.node.image} alt="test" />
                                                        </Box>
                                                        <Heading size="small" level="3">
                                                            <Link to={flat.node.link}>{flat.node.address}</Link>
                                                        </Heading>
                                                        <Text margin="small" size="large">
                                                            {flat.node.price}
                                                        </Text>
                                                    </Box>
                                                ))}
                                            </Grid>
                                        </Box>
                                    </Collapsible>
                                ) : (
                                    <Layer>
                                        <Box fill background="light-2" align="center" justify="center">
                                            sidebar
                                        </Box>
                                    </Layer>
                                )}
                            </Box>
                        </Box>
                    )}
                </ResponsiveContext.Consumer>
            </Grommet>
        );
    }
}

export const query = graphql`
    query IndexPage {
        site {
            siteMetadata {
                description
            }
        }
        allDataJson {
            edges {
                node {
                    availability
                    link
                    moreInfo {
                        moreInfo
                        hasSauna
                        hasKitchen
                        hasBathroom
                        hasBalcony
                    }
                    name
                    imageGallery
                    productInfo {
                        productInfo {
                            productId
                            basePrice
                            priceSpecification
                            sku
                            productName
                            description
                            geoCoordinates {
                                latitude
                                longitude
                                address {
                                    addressLocality
                                    addressRegion
                                    postalCode
                                    streetAddress
                                }
                            }
                            productRoomDescription
                            productRoomCount
                            productRentalType
                        }
                    }
                }
            }
        }
    }
`;

export default IndexPage;
