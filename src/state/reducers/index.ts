import { combineReducers } from 'redux'
import cellsReducer from './cellsReducer'

const reducers = combineReducers({
  cells: cellsReducer,
})

export default reducers

export type Rootstate = ReturnType<typeof reducers>
