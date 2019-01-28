import React from 'react';
import { Link } from 'gatsby';
import { graphql } from 'gatsby';
import { deepMerge } from 'grommet/utils';
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
import { FormClose, Notification } from 'grommet-icons';
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
        showSidebar: true
    };
    render() {
        const { showSidebar } = this.state;
        const flats = this.props.data.allDataJson.edges;
        console.log(flats);
        return (
            <Grommet theme={theme} full>
                <ResponsiveContext.Consumer>
                    {size => (
                        <Box fill>
                            <AppBar>
                                <Heading level="3" margin="none">
                                    My App
                                </Heading>
                                <Button
                                    icon={<Notification />}
                                    onClick={() => this.setState({ showSidebar: !this.state.showSidebar })}
                                />
                            </AppBar>
                            <Box direction="row" flex overflow={{ horizontal: 'hidden' }}>
                                <Box flex align="center" justify="center">
                                    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
                                    <h1>Hi people</h1>
                                    <p>Welcome to your new Gatsby site.</p>
                                    <p>Now go build something great.</p>
                                    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
                                        <Image />
                                    </div>
                                    <Link to="/page-2/">Go to page 2</Link>
                                    <Button
                                        icon={<FormClose />}
                                        onClick={() => this.setState({ showSidebar: false })}
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
                                                            {flat.node.address}
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
                    address
                    availability
                    image
                    link
                    moreInfo
                    name
                    price
                }
            }
        }
    }
`;

export default IndexPage;
