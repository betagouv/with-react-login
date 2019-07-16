import { createSelector } from 'reselect'

import currentUserUUID from './currentUserUUID'

export const selectCurrentUser = createSelector(
  state => state.data.users,
  users => users.find(user => user &&
    user.currentUserUUID === currentUserUUID)
)

export default selectCurrentUser
