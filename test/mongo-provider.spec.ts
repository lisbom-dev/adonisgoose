import test from 'japa'
import { fs } from '../test-helpers'

test.group('Database Provider', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })
})
