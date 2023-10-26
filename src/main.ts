import * as core from '@actions/core'
import {versionSearch} from './version-search'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug(`Processing inputs ...`)

    const token: string = core.getInput('token')
    const org: string = core.getInput('org')
    const packageName: string = core.getInput('packageName')
    const packageVersion: string = core.getInput('packageVersion')
    const ifExistsErrorDeleteOrNothing = core.getInput(
      'ifExistsErrorDeleteOrNothing'
    )

    if (
      ifExistsErrorDeleteOrNothing !== 'error' &&
      ifExistsErrorDeleteOrNothing !== 'delete' &&
      ifExistsErrorDeleteOrNothing !== 'nothing'
    ) {
      throw new Error(
        `ifExistsErrorDeleteOrNothing (${ifExistsErrorDeleteOrNothing}) must be "error", "delete", or "nothing"`
      )
    }
    const params = {
      token,
      org,
      packageName,
      packageVersion,
      ifExistsErrorDeleteOrNothing: ifExistsErrorDeleteOrNothing as
        | 'error'
        | 'delete'
        | 'nothing'
    }

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await versionSearch(params)
    core.debug(new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
    throw error
  }
}
