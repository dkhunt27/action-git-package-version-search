import {getOctokit} from '@actions/github'
import {
  setOutput,
  info as logInfo,
  warning as logWarn,
  error as logError
} from '@actions/core'
import {get as _get} from 'lodash'

/**
 * Wait for a number of milliseconds.
 * @param milliseconds The number of milliseconds to wait.
 * @returns {Promise<string>} Resolves with 'done!' after the wait is over.
 */
export async function versionSearch(params: {
  token: string
  org: string
  packageName: string
  packageVersion: string
  errorIfExists: boolean
}): Promise<boolean> {
  const {token, org, packageName, packageVersion, errorIfExists} = params
  let packageVersionExist = false

  let logKey = JSON.stringify({org, packageName})

  logInfo(`Searching for package version: ${logKey}`)

  const github = getOctokit(token).rest

  try {
    logInfo(`Getting list of published versions`)

    const results =
      await github.packages.getAllPackageVersionsForPackageOwnedByOrg({
        package_type: 'npm',
        package_name: packageName,
        org
      })

    if (!results) {
      throw new Error('results must exist')
    }

    if (!results.data) {
      throw new Error('results.data must exist')
    }

    logInfo(`Checking if version exist in published versions`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = results.data.find((item: any) => item.name === packageVersion)

    packageVersionExist = !!found

    if (packageVersionExist) {
      logInfo(`Package version already exists`)

      if (errorIfExists) {
        logKey = JSON.stringify({org, packageName, packageVersion})
        throw new Error(`Package version exists: ${logKey}`)
      }
    } else {
      logInfo(`New version does not exist in published versions`)
    }
  } catch (err) {
    const status = _get(err, 'status')

    switch (status as never) {
      case 404:
        logKey = JSON.stringify({org, packageName})
        logInfo(`There are NO published versions for this package: ${logKey}`)
        packageVersionExist = false
        break
      case 401:
        logKey = JSON.stringify({org, tokenFirst4: token.substring(0, 4)})
        logError(
          `Unauthorized to access git packages. Check your token and org: ${logKey}`
        )
        throw err
      default:
        // unhandled status
        logWarn(`Unhandled status: ${status}`)
        logError(`err: ${JSON.stringify(err)}`)
        throw err
    }
  }

  setOutput('PackageVersionExist', packageVersionExist)
  return packageVersionExist
}
