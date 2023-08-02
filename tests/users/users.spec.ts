import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'

test.group('User', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
  test('it should create an user', async ({ assert, client }) => {
    const userPayload = {
      email: 'test@example.com',
      username: 'test',
      password: 'test',
      avatar: 'https://iamges.com/images/1',
    }
    const response = await client.post('/users').json(userPayload)

    const { password, avatar, ...expected } = userPayload

    response.assertStatus(201)
    response.assertBodyContains({ user: expected })
    assert.notExists(response.body().user.password, 'Password defined')
  })

  test('it should return 409 when email is already in use', async ({ assert, client }) => {
    const { email } = await UserFactory.create()
    const response = await client.post('/users').json({
      email,
      username: 'test',
      password: 'test',
    })
    response.assertStatus(409)
  })

  test('it should return 409 when username is already in use', async ({ assert, client }) => {
    const { username } = await UserFactory.create()
    const response = await client.post('/users').json({
      username,
      email: 'test@example.com',
      password: 'test',
    })
    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
  })

  test('it should return 422 when required data is not provided', async ({ assert, client }) => {
    const response = await client.post('/users').json({})
    assert.equal(response.body().code, 'BAD_REQUEST')
    response.assertStatus(422)
  })
})
