import React from 'react'
import { shallow } from 'enzyme'

import { DragDropContextApp } from '../../App'

describe('<DragDropContextApp />', () => {

  it('renders without exploding', () => {
    expect(shallow(<DragDropContextApp />)).toHaveLength(1)
  })
})
