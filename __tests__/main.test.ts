/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as main from '../src/main'
import * as version from '../src/version-search'
import * as core from '@actions/core'

// Mock the action's entrypoint
const versionSearchMock = jest
  .spyOn(version, 'versionSearch')
  .mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput')
const getBooleanInputMock = jest.spyOn(core, 'getBooleanInput')

describe('main', () => {
  it('calls run when imported', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'someToken'
        case 'org':
          return 'packageName'
        case 'packageName':
          return 'someToken'
        case 'packageVersion':
          return 'someToken'
        default:
          throw Error(`Unhandled getInputMock: ${name}`)
      }
    })
    getBooleanInputMock.mockImplementation((name: string): boolean => {
      switch (name) {
        case 'errorIfExists':
          return false
        default:
          throw Error(`Unhandled getBooleanInputMock: ${name}`)
      }
    })

    main.run()
    expect(versionSearchMock).toHaveBeenCalled()
  })
})
