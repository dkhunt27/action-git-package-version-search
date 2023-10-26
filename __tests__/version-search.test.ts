import * as github from '@actions/github'
import {versionSearch} from '../src/version-search'

describe('version-search.ts', () => {
  let getAllPackageVersionsForPackageOwnedByOrgMock = jest.fn()
  let deletePackageVersionForOrgMock = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockData: any
  const getOctokitMock = jest.spyOn(github, 'getOctokit')
  let params: {
    token: string
    org: string
    packageName: string
    packageVersion: string
    ifExistsErrorDeleteOrNothing: 'error' | 'delete' | 'nothing'
  }

  beforeEach(() => {
    getAllPackageVersionsForPackageOwnedByOrgMock = jest.fn()
    deletePackageVersionForOrgMock = jest.fn()

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
            deletePackageVersionForOrg: deletePackageVersionForOrgMock,
            getAllPackageVersionsForPackageOwnedByOrg:
              getAllPackageVersionsForPackageOwnedByOrgMock
          }
        }
      } as never
    })
  })

  describe('when token is bad', () => {
    beforeEach(() => {
      getAllPackageVersionsForPackageOwnedByOrgMock.mockImplementation(() => {
        // eslint-disable-next-line no-throw-literal
        throw {status: 401, message: 'Http Error: Bad credentials'}
      })

      params = {
        token: 'someToken',
        org: 'nonExistentOrg',
        packageName: 'nonExistentPackage',
        packageVersion: '0.0.0',
        ifExistsErrorDeleteOrNothing: 'nothing'
      }
    })

    it('should return {packageVersionExisted: false, packageVersionDeleted: false}', async () => {
      await expect(async () => versionSearch(params)).rejects.toEqual({
        message: 'Http Error: Bad credentials',
        status: 401
      })

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('when package not found', () => {
    beforeEach(() => {
      getAllPackageVersionsForPackageOwnedByOrgMock.mockImplementation(() => {
        // eslint-disable-next-line no-throw-literal
        throw {status: 404, message: 'Http Error: Not Found'}
      })

      params = {
        token: 'someToken',
        org: 'nonExistentOrg',
        packageName: 'nonExistentPackage',
        packageVersion: '0.0.0',
        ifExistsErrorDeleteOrNothing: 'nothing'
      }
    })

    it('should return {packageVersionExisted: false, packageVersionDeleted: false}', async () => {
      const actual = await versionSearch(params)
      expect(actual).toStrictEqual({
        packageVersionExisted: false,
        packageVersionDeleted: false
      })

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('when package found but version not found', () => {
    beforeEach(() => {
      getAllPackageVersionsForPackageOwnedByOrgMock.mockResolvedValue(mockData)

      params = {
        token: 'someToken',
        org: 'SomeOrg',
        packageName: 'SomePackage',
        packageVersion: '0.99.99',
        ifExistsErrorDeleteOrNothing: 'nothing'
      }
    })

    it('and ifExistsErrorDeleteOrNothing is nothing, should return {packageVersionExisted: false, packageVersionDeleted: false}', async () => {
      params.ifExistsErrorDeleteOrNothing = 'nothing'

      const actual = await versionSearch(params)
      expect(actual).toStrictEqual({
        packageVersionExisted: false,
        packageVersionDeleted: false
      })

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(0)
    })

    it('and ifExistsErrorDeleteOrNothing is error, should return {packageVersionExisted: false, packageVersionDeleted: false}', async () => {
      params.ifExistsErrorDeleteOrNothing = 'error'

      const actual = await versionSearch(params)
      expect(actual).toStrictEqual({
        packageVersionExisted: false,
        packageVersionDeleted: false
      })

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(0)
    })

    it('and ifExistsErrorDeleteOrNothing is delete, should return {packageVersionExisted: false, packageVersionDeleted: false}', async () => {
      params.ifExistsErrorDeleteOrNothing = 'delete'

      const actual = await versionSearch(params)
      expect(actual).toStrictEqual({
        packageVersionExisted: false,
        packageVersionDeleted: false
      })

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('when package found and version found', () => {
    beforeEach(() => {
      getAllPackageVersionsForPackageOwnedByOrgMock.mockResolvedValue(mockData)

      params = {
        token: 'someToken',
        org: 'SomeOrg',
        packageName: 'SomePackage',
        packageVersion: '0.60.1',
        ifExistsErrorDeleteOrNothing: 'nothing'
      }
    })

    it('and ifExistsErrorDeleteOrNothing is nothing, should return {packageVersionExisted: true, packageVersionDeleted: false}', async () => {
      params.ifExistsErrorDeleteOrNothing = 'nothing'

      const actual = await versionSearch(params)
      expect(actual).toStrictEqual({
        packageVersionExisted: true,
        packageVersionDeleted: false
      })

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(0)
    })

    it('and ifExistsErrorDeleteOrNothing is error, should throw error', async () => {
      params.ifExistsErrorDeleteOrNothing = 'error'

      await expect(async () => versionSearch(params)).rejects.toThrow(
        'Package version exists'
      )

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(0)
    })

    it('and ifExistsErrorDeleteOrNothing is delete, should return {packageVersionExisted: true, packageVersionDeleted: true}', async () => {
      params.ifExistsErrorDeleteOrNothing = 'delete'

      const actual = await versionSearch(params)
      expect(actual).toStrictEqual({
        packageVersionExisted: true,
        packageVersionDeleted: true
      })

      expect(
        getAllPackageVersionsForPackageOwnedByOrgMock
      ).toHaveBeenCalledTimes(1)
      expect(deletePackageVersionForOrgMock).toHaveBeenCalledTimes(1)
    })
  })
})
