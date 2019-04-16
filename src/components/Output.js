/* global Blob */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Panel } from 'react-bootstrap'

import JSZip from 'jszip'

import { saveAs } from 'file-saver'

import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/light'
import codeStyle from 'react-syntax-highlighter/languages/hljs/json'
import defaultStyle from 'react-syntax-highlighter/styles/hljs/default-style'

import CraftingGenerator from '../classes/CraftingGenerator'
import RecipeNames from '../resources/recipe-names.json'

import './Output.css'

// register the language
registerLanguage('json', codeStyle)

class Output extends Component {
  constructor (props) {
    super(props)

    this.generateCraftingName = this.generateCraftingName.bind(this)
    this.generateCrafting = this.generateCrafting.bind(this)
    this.generateTags = this.generateTags.bind(this)
    this.generateDatapack = this.generateDatapack.bind(this)
  }

  generateCraftingName () {
    const { output, outputRecipe } = this.props
    let fileSaveName
    if (outputRecipe === 'auto') {
      fileSaveName = 'crafting_recipe.json'
    } else {
      fileSaveName = outputRecipe + '.json'
    }

    // check if the output is populated and the output is recipe
    if (output.isPopulated() && outputRecipe === 'auto') {
      // remove the minecraft: and any trailing
      let name = output.id.match(/minecraft:(\w+)(:\d+)?/)[1]
      // if the recipe is in the recipe names
      if (RecipeNames.names.indexOf(name) !== -1) {
        fileSaveName = name + '.json'
      }
    }
    return fileSaveName
  }

  generateCrafting () {
    const { input, output, group, furnace, stonecutter, emptySpace, shape, tab, tags, furnaceVariant } = this.props
    let json, generator
    if (tab === 'crafting') {
      generator = new CraftingGenerator(input, output, tags, { group })
      if (shape === 'shapeless') {
        json = generator.shapeless()
      } else {
        json = generator.shaped(emptySpace)
      }
    } else if (tab === 'furnace') {
      generator = new CraftingGenerator(furnace.input, output, tags, { group })
      if (furnaceVariant.length > 1) {
        json = []
        furnaceVariant.forEach(variant => {
          json.push(generator.smelting(furnace.cookingTime, furnace.experience, variant))
        })
      } else {
        json = generator.smelting(furnace.cookingTime, furnace.experience, furnaceVariant[0])
      }
    } else if (tab === 'stonecutter') {
      generator = new CraftingGenerator(stonecutter.input, output, tags, { group })
      json = generator.stonecutting()
    }

    if (json.result && json.result.item) {
      json.result.count = output.count
    }
    return json
  }

  generateTags () {
    let { tags = [] } = this.props
    const downloadableTags = Object.keys(tags)
      .filter(tag => tags[tag].asTag)
      .filter(tag => tags[tag].namespace !== 'minecraft') // ignore minecraft ones

    return downloadableTags.map((tag) => ({
      namespace: tags[tag].namespace,
      name: tags[tag].name,
      data: {
        replace: false,
        values: tags[tag].items.map((item) => item.id)
      }
    }))
  }

  generateDatapack () {
    const craftingRecipe = this.generateCrafting()
    const craftingName = this.generateCraftingName()
    const tags = this.generateTags()

    let zip = new JSZip()
    // add the pack file
    zip.file('pack.mcmeta', JSON.stringify({
      pack: {
        pack_format: 1,
        description: 'Generated with TheDestruc7i0n\'s crafting generator: https://crafting.thedestruc7i0n.ca'
      }
    }))
    if (craftingRecipe.length !== undefined) {
      craftingRecipe.forEach(recipe => {
        let recipeName = recipe.type !== 'smelting' ? craftingName.substr(0, craftingName.length - 5) + '_from_' + recipe.type + '.json' : craftingName
        zip.file(`data/crafting/recipes/${recipeName}`, JSON.stringify(recipe, null, 4))
      })
    } else {
      // add the crafting recipe
      zip.file(`data/crafting/recipes/${craftingName}`, JSON.stringify(craftingRecipe, null, 4))
    }

    // add all the tags
    tags.forEach(({ namespace, name, data }) => {
      zip.file(`data/${namespace}/tags/items/${name}.json`, JSON.stringify(data, null, 4))
    })
    // generate and download
    zip.generateAsync({ type: 'blob' })
      .then((content) => saveAs(content, `datapack.zip`))
  }

  render () {
    const fileSaveName = this.generateCraftingName()
    const json = this.generateCrafting()

    let toCopy
    let blob = null

    if (json.length === undefined) {
      toCopy = [JSON.stringify(json, null, 4)]
      blob = new Blob([toCopy], { type: 'text/plain;charset=utf-8' })
    } else {
      toCopy = []
      json.forEach(recipe => {
        toCopy.push(JSON.stringify(recipe, null, 4))
      })
    }

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            JSON
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          {toCopy.map((copy, index) => <SyntaxHighlighter key={index}
            style={defaultStyle}
          >{copy}</SyntaxHighlighter>
          )}
          {blob != null ? <Button
            onClick={() => saveAs(blob, fileSaveName)}
            className='download-button'
            bsStyle='primary'
            block
          >Download <code>{fileSaveName}</code></Button> : null}
          <Button
            onClick={() => this.generateDatapack()}
            className='download-button'
            bsStyle='primary'
            block
          >Download <code>datapack.zip</code></Button>
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    input: store.Data.crafting,
    output: store.Data.output,
    group: store.Data.group,
    furnace: store.Data.furnace,
    stonecutter: store.Data.stonecutter,
    tags: store.Data.tags,

    tab: store.Options.tab,
    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe,
    furnaceVariant: store.Options.furnaceVariant
  }
})(Output)
