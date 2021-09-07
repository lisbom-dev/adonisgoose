import test from 'japa'
import { fs, setupApplication, toNewlineArray } from '../../test-helpers'
import { join } from 'path'
import MakeSchema from '../../commands/MakeSchema'
import { Kernel } from '@adonisjs/core/build/standalone'
import { Filesystem } from '@poppinss/dev-utils'
const templatesFs = new Filesystem(join(__dirname, '..', '..', 'templates'))

test.group('MakeSchema', (group) => {
  group.afterEach(async () => {
    delete process.env.ADONIS_ACE_CWD
    await fs.cleanup()
  })

  test('make a schema inside the default directory', async (assert) => {
    const app = await setupApplication()

    const makeSchema = new MakeSchema(app, new Kernel(app))
    makeSchema.name = 'user'
    await makeSchema.run()

    const userSchema = await fs.get('app/Schemas/User.ts')
    const userInterface = await fs.get('contracts/interfaces/IUser.ts')
    const schemaTemplate = await templatesFs.get('schema.txt')
    const interfaceTemplate = await templatesFs.get('interface.txt')
    assert.deepEqual(
      toNewlineArray(userSchema),
      toNewlineArray(schemaTemplate.replace(/{{ filename }}/g, 'User'))
    )
    assert.deepEqual(
      toNewlineArray(userInterface),
      toNewlineArray(interfaceTemplate.replace(/{{ filename }}/g, 'IUser'))
    )
  })
})
