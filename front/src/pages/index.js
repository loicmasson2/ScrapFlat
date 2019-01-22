import React from 'react'
import { Link } from 'gatsby'
import { graphql } from 'gatsby'
import { deepMerge } from 'grommet/utils'
import {
  Box,
  Button,
  Collapsible,
  Heading,
  Grommet,
  grommet,
  Layer,
  ResponsiveContext,
} from 'grommet'
import { FormClose, Notification } from 'grommet-icons'

import Image from '../components/image'
import SEO from '../components/seo'

const theme = deepMerge(grommet, {
  global: {
    colors: {
      accent: '#66FCF1',
      brand: '#1F2833', //https://visme.co/blog/website-color-schemes/ #12
    },
    font: {
      family: 'Oswald',
      size: '14px',
      height: '20px',
    },
  },
})

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
)

class IndexPage extends React.Component {
  state = {
    showSidebar: false,
  }
  render() {
    const { showSidebar } = this.state
    const flat = this.props.data.allDataJson
    console.log(flat)
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
                  onClick={() =>
                    this.setState({ showSidebar: !this.state.showSidebar })
                  }
                />
              </AppBar>
              <Box direction="row" flex overflow={{ horizontal: 'hidden' }}>
                <Box flex align="center" justify="center">
                  <SEO
                    title="Home"
                    keywords={[`gatsby`, `application`, `react`]}
                  />
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
                    <Box
                      flex
                      width="medium"
                      background="light-2"
                      elevation="small"
                      align="center"
                      justify="center"
                    >
                      sidebar
                    </Box>
                  </Collapsible>
                ) : (
                  <Layer>
                    <Box
                      fill
                      background="light-2"
                      align="center"
                      justify="center"
                    >
                      sidebar
                    </Box>
                  </Layer>
                )}
              </Box>
            </Box>
          )}
        </ResponsiveContext.Consumer>
      </Grommet>
    )
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
          name
        }
      }
    }
  }
`

export default IndexPage
