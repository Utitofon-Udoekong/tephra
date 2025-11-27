import { getSessionFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionFromEvent(event)
  
  if (!user) {
    return {
      authenticated: false,
      user: null,
    }
  }
  
  return {
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  }
})

