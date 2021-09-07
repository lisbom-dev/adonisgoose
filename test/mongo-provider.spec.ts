import test from 'japa'
import { fs, setupApplication } from '../test-helpers'

test.group('Database Provider', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('register mongo provider', async (assert) => {
    const app = await setupApplication({}, ['../../providers/DatabaseProvider'])
  })
})
