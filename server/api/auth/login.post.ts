import { authenticateUser, createToken, setAuthCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { username, password } = body
  
  // Validate input
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Username and password are required',
    })
  }
  
  // Authenticate user
  const user = await authenticateUser(username, password)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid username or password',
    })
  }
  
  // Create token and set cookie
  const token = await createToken(user)
  setAuthCookie(event, token)
  
  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  }
})

