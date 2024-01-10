import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
} from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'
import request from 'supertest'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('user can create transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new',
        amount: 500,
        type: 'credit',
      })
      .expect(201)

    // expect(200).toEqual(200)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new',
        amount: 500,
        type: 'credit',
      })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new',
        amount: 500,
      }),
    ])
  })

  it('should be able to get a specifc transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new',
        amount: 500,
        type: 'credit',
      })
      .expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionsResponse = await request(app.server)
      .get(`/transactions/${listTransactionsResponse.body.transactions[0].id}`)
      .set('Cookie', cookies)
      .expect(200)

    console.log('transactionsResponse', transactionsResponse.body)

    expect(listTransactionsResponse.body.transactions[0]).toEqual(
      transactionsResponse.body,
    )
  })

  it('should be able to get sumary transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new',
        amount: 500,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'new',
        amount: 500,
        type: 'credit',
      })

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'new',
        amount: 100,
        type: 'debit',
      })

    const getSumaryTransactionsResponse = await request(app.server)
      .get('/transactions/sumary')
      .set('Cookie', cookies)
      .expect(200)

    console.log(
      'getSumaryTransactionsResponse',
      getSumaryTransactionsResponse.body,
    )

    expect(getSumaryTransactionsResponse.body.sumary).toEqual({
      amount: 900,
    })
  })
})
