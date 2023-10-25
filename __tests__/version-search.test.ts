import * as github from '@actions/github'
import {versionSearch} from '../src/version-search'

describe('version-search.ts', () => {
  let getAllPackageVersionsForPackageOwnedByOrgMock = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockData: any
  const getOctokitMock = jest.spyOn(github, 'getOctokit')

  beforeEach(() => {
    getAllPackageVersionsForPackageOwnedByOrgMock = jest.fn()
    mockData = {
      status: 200,
      url: 'https://api.github.com/orgs/SomeOrg/packages/npm/SomePackage/versions',
      headers: {
        some: 'headers'
      },
      data: [
        {
          id: 138688012,
          name: '0.84.0',
          url: 'https://api.github.com/orgs/SomeOrg/packages/npm/SomePackage/versions/138688012',
          package_html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/package/SomePackage',
          created_at: '2023-10-18T14:33:27Z',
          updated_at: '2023-10-18T14:33:27Z',
          html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/SomePackage/138688012',
          metadata: {}
        },
        {
          id: 82940941,
          name: '0.61.1',
          url: 'https://api.github.com/orgs/SomeOrg/packages/npm/SomePackage/versions/82940941',
          package_html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/package/SomePackage',
          created_at: '2023-04-04T19:11:18Z',
          updated_at: '2023-04-04T19:11:18Z',
          html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/SomePackage/82940941',
          metadata: {}
        },
        {
          id: 82651893,
          name: '0.60.1',
          url: 'https://api.github.com/orgs/SomeOrg/packages/npm/SomePackage/versions/82651893',
          package_html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/package/SomePackage',
          created_at: '2023-04-03T22:19:52Z',
          updated_at: '2023-04-03T22:19:52Z',
          html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/SomePackage/82651893',
          metadata: {}
        },
        {
          id: 71464256,
          name: '0.54.0',
          url: 'https://api.github.com/orgs/SomeOrg/packages/npm/SomePackage/versions/71464256',
          package_html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/package/SomePackage',
          created_at: '2023-02-17T20:44:45Z',
          updated_at: '2023-02-17T20:44:45Z',
          html_url:
            'https://github.com/orgs/SomeOrg/packages/npm/SomePackage/71464256',
          metadata: {}
        }
      ]
    }

    getOctokitMock.mockImplementation(() => {
      return {
        rest: {
          packages: {
            getAllPackageVersionsForPackageOwnedByOrg:
              getAllPackageVersionsForPackageOwnedByOrgMock
          }
        }
      } as never
    })
  })

  it('when package found and version not found, should return true', async () => {
    getAllPackageVersionsForPackageOwnedByOrgMock.mockResolvedValue(mockData)

    const params = {
      token: 'someToken',
      org: 'SomeOrg',
      packageName: 'SomePackage',
      packageVersion: '0.61.1',
      errorIfExists: false
    }
    const actual = await versionSearch(params)
    expect(actual).toBe(true)
  })

  it('when package found and version not found and errorIfExists, should throw error', async () => {
    getAllPackageVersionsForPackageOwnedByOrgMock.mockResolvedValue(mockData)

    const params = {
      token: 'someToken',
      org: 'SomeOrg',
      packageName: 'SomePackage',
      packageVersion: '0.61.1',
      errorIfExists: true
    }

    await expect(async () => versionSearch(params)).rejects.toThrow(
      'Package version exists'
    )
  })

  it('when package found but version not found, should return false', async () => {
    getAllPackageVersionsForPackageOwnedByOrgMock.mockResolvedValue(mockData)

    const params = {
      token: 'someToken',
      org: 'SomeOrg',
      packageName: 'SomePackage',
      packageVersion: '0.0.0',
      errorIfExists: false
    }
    const actual = await versionSearch(params)
    expect(actual).toBe(false)
  })

  it('when package not found, should return false', async () => {
    getAllPackageVersionsForPackageOwnedByOrgMock.mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw {status: 404, message: 'Http Error: Not Found'}
    })

    const params = {
      token: 'someToken',
      org: 'nonExistentOrg',
      packageName: 'nonExistentPackage',
      packageVersion: '0.0.0',
      errorIfExists: false
    }
    const actual = await versionSearch(params)
    expect(actual).toBe(false)
  })

  it('when token is bad, should return error', async () => {
    getAllPackageVersionsForPackageOwnedByOrgMock.mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw {status: 401, message: 'Http Error: Bad credentials'}
    })

    const params = {
      token: 'someToken',
      org: 'SomeOrg',
      packageName: 'SomePackage',
      packageVersion: '0.0.0',
      errorIfExists: false
    }
    await expect(async () => versionSearch(params)).rejects.toEqual({
      message: 'Http Error: Bad credentials',
      status: 401
    })
  })
})
