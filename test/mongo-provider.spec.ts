import test from 'japa'
import { fs, setupApplication } from '../test-helpers'

test.group('Database Provider', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })
  test('register database provider', async (assert) => {
    const app = await setupApplication(
      {
        url: `mongodb://localhost:27017/tests`,
      },
      ['../../providers/MongoProvider']
    )
    assert.isDefined(app.container.use('CuC/AdonisGoose'))
  })
})
