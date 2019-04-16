import React, { Component } from 'react'
import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { addDefaultTag } from './actions'

import { DragDropContext } from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch'

import 'babel-polyfill'

import { debounce } from 'lodash'

import Navbar from './components/Navbar'
import HelpAlert from './components/HelpAlert'
import CraftingTable from './components/CraftingArea'
import Ingredients from './components/Ingredients'
import Options from './components/Options'
import Output from './components/Output'
import CraftingModal from './components/crafting/CraftingModal'
import Tags from './components/tags/Tags'

import IngredientDragLayer from './components/ingredient/IngredientDragLayer'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPatreon } from '@fortawesome/free-brands-svg-icons/faPatreon'

import IngredientClass from './classes/Ingredient'

// get the items from the JSON file
import getTextures from 'minecraft-textures'
import ResourcesTags from './resources/tags'

import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

import './assets/arrow.png'
import './assets/Minecraft.woff'

const IngredientItems = getTextures('1.14').items
const IngredientTags = ResourcesTags.tags

library.add(faPatreon)

export class App extends Component {
  constructor (props) {
    super(props)

    this.handleResize = this.handleResize.bind(this)
  }

  // bad hack, remove sometime
  handleResize () {
    return debounce(() => this.forceUpdate(), 100)
  }

  componentDidMount () {
    window.addEventListener('resize', this.handleResize())
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize())
  }
  // end bad hack

  render () {
    const isMobile = window.matchMedia && window.matchMedia('only screen and (max-width: 992px)').matches
    const { dispatch } = this.props

    /*
      Initialize default tags
    */
    const ingredients = IngredientItems.map((ingredient) => new IngredientClass(ingredient.id, ingredient.readable, ingredient.texture))

    IngredientTags.forEach(tag => {
      const ingredient = ingredients.filter(i => i.id === tag.item)
      if (ingredient.length === 1) {
        const items = tag.items.map(item => {
          const filter = ingredients.filter(i => i.id === item)
          if (filter.length === 1) {
            return filter[0]
          }
          return null
        })

        dispatch(addDefaultTag(items, tag.id))
      }
    })

    return (
      <div className='container'>
        <Navbar />
        <IngredientDragLayer />
        <Row>
          <Col md={12}>
            <HelpAlert />
          </Col>
          <Col md={6} sm={12}>
            <CraftingTable />
            { isMobile ? <Ingredients /> : null }
            <Tags />
            <Options />
            <Output />
          </Col>
          <Col md={6} sm={12} className='pull-right'>
            { !isMobile ? <Ingredients /> : null }
          </Col>
        </Row>
        <CraftingModal />
      </div>
    )
  }
}

export const DragDropContextApp = DragDropContext(MultiBackend(HTML5toTouch))(App)

export default connect()(DragDropContextApp)
