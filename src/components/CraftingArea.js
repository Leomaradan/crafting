import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { setTab } from '../actions'
import { Panel, Tabs, Tab } from 'react-bootstrap'
import { invert, upperFirst } from 'lodash'

import CraftingGrid from './crafting/CraftingGrid'

import './CraftingArea.css'

class CraftingArea extends Component {
  constructor (props) {
    super(props)

    this.keyMapping = {
      1: 'crafting',
      2: 'furnace',
      3: 'stonecutter'
    }
  }

  render () {
    const { dispatch, crafting, furnace, stonecutter, output, tab } = this.props
    const selectedTab = parseInt(invert(this.keyMapping)[tab], 10) // grab the selected tab index

    const craftingGrid = crafting.map((key, index) => {
      return (
        <CraftingGrid key={index} index={index} ingredient={key} size='normal' type='crafting' />
      )
    })

    const furnaceGrid = <Fragment>
      <CraftingGrid index={0} ingredient={furnace.input} size='furnace' type='furnace' />
      <div className='flame' />
      <CraftingGrid index={0} ingredient={null} size='furnace' type='furnace' disabled />
    </Fragment>

    const stonecutterGrid = <CraftingGrid index={0} ingredient={stonecutter.input} size='stonecutter' type='stonecutter' />

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Crafting Area
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Tabs
            activeKey={selectedTab}
            animation={false}
            onSelect={(key) => dispatch(setTab(this.keyMapping[key]))}
            id='selected-tab'>
            <Tab eventKey={1} title='Crafting' />
            <Tab eventKey={2} title='Furnace' />
            <Tab eventKey={3} title='Stonecutter' />
          </Tabs>
          <div className='crafting-holder'>
            <div className='crafting clearfix'>
              <div className='recipe'>
                <h6>{upperFirst(tab)}</h6>
                <div id='crafting-table'>
                  { tab === 'crafting' ? craftingGrid : null }
                  { tab === 'furnace' ? furnaceGrid : null }
                  { tab === 'stonecutter' ? stonecutterGrid : null }
                </div>
              </div>
              <div className='arrow' />
              <div className='crafting-table-output'>
                <CraftingGrid ingredient={output} size='large' />
              </div>
            </div>
          </div>
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    tab: store.Options.tab,
    crafting: store.Data.crafting,
    furnace: store.Data.furnace,
    stonecutter: store.Data.stonecutter,
    output: store.Data.output
  }
})(CraftingArea)
