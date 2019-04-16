import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { setEmptySpace, setOutputRecipe, setShape, setFurnaceVariant, setGroup, setFurnaceData } from '../actions'

import DebouncedInput from './DebouncedInput'
import NumericInput from 'react-numeric-input'

import {
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  OverlayTrigger,
  Panel,
  Row,
  Tooltip
} from 'react-bootstrap'

import infoCircle from '../assets/info-circle.png'
import RecipeNames from '../resources/recipe-names.json'

class Options extends Component {
  constructor (props) {
    super(props)

    this.toggleShape = this.toggleShape.bind(this)
    this.toggleVariant = this.toggleVariant.bind(this)
    this.toggleEmptySpace = this.toggleEmptySpace.bind(this)
    this.setOutput = this.setOutput.bind(this)
    this.setGroup = this.setGroup.bind(this)
    this.setTemplate = this.setTemplate.bind(this)
  }

  toggleShape (e) {
    const { dispatch } = this.props

    dispatch(setShape(e.target.checked ? 'shapeless' : 'shaped'))
  }

  toggleVariant (key) {
    const { dispatch } = this.props
    const furnaceVariant = this.props.furnaceVariant.slice(0)

    if (furnaceVariant.indexOf(key) === -1) {
      // add the key
      furnaceVariant.push(key)
    } else {
      // remove the key
      furnaceVariant.splice(furnaceVariant.indexOf(key), 1)
    }

    dispatch(setFurnaceVariant(furnaceVariant))
  }

  toggleEmptySpace (e) {
    const { dispatch } = this.props

    dispatch(setEmptySpace(!e.target.checked))
  }

  setOutput (e) {
    const { dispatch } = this.props

    dispatch(setOutputRecipe(e.target.value))
  }

  setGroup (value) {
    const { dispatch } = this.props

    dispatch(setGroup(value))
  }

  setTemplate (e) {
    const { dispatch } = this.props

    let xp = 0.1
    let time = 200

    switch (e.target.value) {
      case 'kelp': time = 100; break
      case 'quartz': xp = 0.2; time = 100; break
      case 'dye': break
      case 'charcoal': xp = 0.15; break
      case 'food': xp = 0.35; time = 100; break
      case 'iron': xp = 0.7; time = 100; break
      case 'lapis': xp = 0.2; break
      case 'gold': xp = 1; time = 100; break
      case 'brick': xp = 0.3; break
      case 'redstone': xp = 0.7; break
      case 'diamond': xp = 1; break
      default: break
    }

    dispatch(setFurnaceData('experience', xp))
    dispatch(setFurnaceData('cookingTime', time))

    e.target.value = '-'
  }

  render () {
    const { dispatch, emptySpace, shape, outputRecipe, tab, furnace, furnaceVariant } = this.props

    const shapelessTooltip = (
      <Tooltip id='shapeless'>This will allow the items to be placed in anywhere in the crafting table to get the
        output.</Tooltip>
    )

    const furnaceVariantTooltip = (
      <Tooltip id='furnaceVariant'>This will indicate which furnace recipe variation will be used. Blast Furnace and Smoker are 2x quicker, and Campfire cooking is 3x slower</Tooltip>
    )

    const shapelessCheckbox = (
      <FormGroup controlId='shapeless'>
        <Checkbox
          inline
          checked={shape === 'shapeless'}
          onChange={this.toggleShape}
        >
          Shapeless?{' '}
          <OverlayTrigger placement='bottom' overlay={shapelessTooltip}>
            <img className='inline' src={infoCircle} alt='info' />
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    const furnaceCheckbox = (
      <FormGroup controlId='furnaceType'>
        <Checkbox
          checked={furnaceVariant.indexOf('smelting') !== -1}
          onChange={() => this.toggleVariant('smelting')}
        >
        Furnace?{' '}
        </Checkbox>
        <Checkbox
          checked={furnaceVariant.indexOf('blasting') !== -1}
          onChange={() => this.toggleVariant('blasting')}
        >
        Blast Furnace?{' '}
        </Checkbox>
        <Checkbox
          checked={furnaceVariant.indexOf('campfire_cooking') !== -1}
          onChange={() => this.toggleVariant('campfire_cooking')}
        >
        Campfire cooking?{' '}
        </Checkbox>
        <Checkbox
          checked={furnaceVariant.indexOf('smoking') !== -1}
          onChange={() => this.toggleVariant('smoking')}
        >
        Smoking?{' '}
          <OverlayTrigger placement='bottom' overlay={furnaceVariantTooltip}>
            <img className='inline' src={infoCircle} alt='info' />
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    const removeEmptySpaceTooltip = (
      <Tooltip id='removeEmptySpace'>
        <strong>If this is checked</strong>, the generator will ensure that the item will be placed exactly where placed
        in the crafting table above.
        <br />
        <strong>If this isn't checked</strong>, the generator will make the recipe be able to be placed anywhere in the
        table. (Useful for 2x2 crafting)
      </Tooltip>
    )

    const removeEmptySpaceCheckbox = (
      <FormGroup controlId='emptySpace'>
        <Checkbox
          inline
          checked={!emptySpace}
          onChange={this.toggleEmptySpace}
        >
          Exactly where placed?{' '}
          <OverlayTrigger placement='bottom' overlay={removeEmptySpaceTooltip}>
            <img className='inline' src={infoCircle} alt='info' />
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    let customOptions
    if (tab === 'crafting') {
      customOptions = (
        <Fragment>
          <legend><h5>Crafting Options</h5></legend>
          <Row>
            <Col md={4}>
              {shapelessCheckbox}
            </Col>
            <Col md={8}>
              {shape === 'shaped' ? removeEmptySpaceCheckbox : null}
            </Col>
          </Row>
        </Fragment>
      )
    } else if (tab === 'furnace') {
      customOptions = (
        <Fragment>
          <legend><h5>Template</h5></legend>
          <Row>
            <Col md={12}>
              <FormControl
                componentClass='select'
                placeholder='select'
                defaultValue='-'
                onChange={this.setTemplate}
              >
                <option value='-'>---- Select a template ----</option>
                <option value='kelp'>Kelp (Xp: 0.1, Time: 100)</option>
                <option value='quartz'>Quartz ore (Xp: 0.2, Time: 100)</option>
                <option value='dye'>Glazed Terracotta, Dye, Stone (Xp: 0.1, Time: 200)</option>
                <option value='charcoal'>Charcoal, Sponge (Xp: 0.15, Time: 200)</option>
                <option value='food'>Food (Xp: 0.35, Time: 100)</option>
                <option value='iron'>Iron ore (Xp: 0.7, Time: 100)</option>
                <option value='lapis'>Lapis ore (Xp: 0.2, Time: 200)</option>
                <option value='gold'>Gold ore (Xp: 1, Time: 100)</option>
                <option value='brick'>Brick (Xp: 0.3, Time: 200)</option>
                <option value='redstone'>Redstone Ore (Xp: 0.7, Time: 200)</option>
                <option value='diamond'>Diamond & Emerald Ore (Xp: 1, Time: 200)</option>
              </FormControl>
            </Col>
          </Row>
          <legend><h5>Furnace Options</h5></legend>
          <Row>
            <Col md={2}>
              <ControlLabel style={{ fontSize: '12px' }}>Experience:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <NumericInput
                className='form-control'
                min={0}
                precision={1}
                step={1}
                value={furnace.experience}
                onChange={(v) => dispatch(setFurnaceData('experience', v))}
                placeholder='Enter amount'
              />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px', margin: '5px 0 5px 0' }}>
                The output experience.
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <ControlLabel>Crafting Time:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <NumericInput
                className='form-control'
                min={0}
                value={furnace.cookingTime}
                onChange={(v) => dispatch(setFurnaceData('cookingTime', v))}
                placeholder='Enter amount'
              />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px', margin: '5px 0 5px 0' }}>
                The cook time in ticks.
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <ControlLabel>Variant</ControlLabel>
            </Col>
            <Col md={10}>
              {furnaceCheckbox}
            </Col>
          </Row>
        </Fragment>
      )
    }

    return (
      <Panel defaultExpanded>
        <Panel.Heading>
          <Panel.Title toggle>
            Options
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible>
          {customOptions}
          <legend><h5>Default Options</h5></legend>
          <Row>
            <Col md={2}>
              <ControlLabel>Output Recipe:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <FormControl
                componentClass='select'
                placeholder='select'
                value={outputRecipe}
                onChange={this.setOutput}
              >
                <option value='auto' key={-1}>Auto</option>
                {RecipeNames.names.map((name, index) => {
                  let nameParts = name.split('_')
                  let namePartsUppercase = nameParts.map((name) => name.charAt(0).toUpperCase() + name.slice(1))
                  let nameReadable = namePartsUppercase.join(' ')
                  return (
                    <option value={name} key={index}>{nameReadable}</option>
                  )
                })}
              </FormControl>
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px' }}>
                When <code>Auto</code> is selected, the file name will be taken based off of the item name if possible,
                otherwise the name will be{' '}
                <code>crafting_recipe.json</code>
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <ControlLabel>Group:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <DebouncedInput debounced={this.setGroup} attributes={{ className: 'form-control' }} />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px' }}>This will group items in the recipe book.{' '}
                <a href='https://github.com/skylinerw/guides/blob/master/java/recipes.md#groups' target='_blank' rel='noopener noreferrer'>
                  Click here for a short explanation.
                </a>
              </p>
            </Col>
          </Row>
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    shape: store.Options.shape,
    furnaceVariant: store.Options.furnaceVariant,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe,
    tab: store.Options.tab,
    furnace: store.Data.furnace
  }
})(Options)
