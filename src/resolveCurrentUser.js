import { currentUserUUID } from './currentUserUUID'

export const resolveCurrentUser = userFromRequest => {
  if (!userFromRequest) {
    return null
  }
  return Object.assign({ currentUserUUID }, userFromRequest)
}

export default resolveCurrentUser
