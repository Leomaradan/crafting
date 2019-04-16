import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setFirstEmptyCraftingSlot } from '../actions'

import { Panel } from 'react-bootstrap'
import DebouncedInput from './DebouncedInput'

import Ingredient from './ingredient/Ingredient'
import IngredientClass from '../classes/Ingredient'
import Tag from '../classes/Tag'

// get the items from the JSON file
import getTextures from 'minecraft-textures'

import './Ingredients.css'

const IngredientItems = getTextures('1.14').items

class Ingredients extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: ''
    }
  }

  render () {
    const { search } = this.state
    const { dispatch, tags } = this.props

    // convert the items to the class
    const ingredients = IngredientItems.map((ingredient) => new IngredientClass(ingredient.id, ingredient.readable, ingredient.texture))

    Object.keys(tags).forEach((id) => {
      if (tags[id].readonly) {
        ingredients.push(new Tag(id))
      }
    })

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Ingredients
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <span className='search-box'>
            <p>Search Items:</p>
            <DebouncedInput attributes={{ className: 'form-control' }} debounced={(input) => this.setState({ search: input })} />
          </span>
          <div className='ingredients'>
            {ingredients.map((ingredient, index) => {
              const visible = ingredient.id.indexOf(search) !== -1 || ingredient.readable.indexOf(search) !== -1
              return visible ? (
                <div
                  key={index}
                  onDoubleClick={() => dispatch(setFirstEmptyCraftingSlot(ingredient))}
                >
                  <Ingredient ingredient={ingredient} size='normal' minecraftTag={ingredient.tag !== undefined} />
                </div>
              ) : null
            })}
          </div>
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    tags: store.Data.tags
  }
})(Ingredients)
