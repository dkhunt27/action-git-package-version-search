# action-git-package-version-search

Git action that searches for a published version of a package and error if the package version exists, delete it if it exists, or do nothing and just report back if it existed or not.

## Inputs

```yaml
  token:
    description: 'Git token with read:packages access'
    required: true
  org:
    description: 'Git org for the package'
    required: true
  packageName:
    description: 'Name of the package'
    required: true
  packageVersion:
    description: 'Version of the package'
    required: true
  ifExistsErrorDeleteOrNothing:
    description: '"error": throw error if package exist; "delete": delete the package if exist; "nothing": do nothing if package exist'
    required: true
    type: string
```

## Outputs

```yaml
  PackageVersionExisted:
    description: 'true/false if package version existed or not'
  PackageVersionDeleted:
    description: 'true/false if package version was deleted or not'
```

## Usage

- Add to your git action
  
```yaml
      - name: Assert git package does not already exist
        uses: dkhunt27/action-git-package-version-search/v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          org: my-org
          packageName: my-package
          packageVersion: 0.45.2
          ifExistsErrorDeleteOrNothing: error
```

## Making changes and pushing releases

- make new branch and make changes
- `npm run all`
- `git commit/push changes`
- make PR back to main
- wait for pipelines to finish; then merge
- `git checkout main`
- `git pull`
- `git tag v1`
- `SKIP_HOOKS=true git push origin v1`
- in github, edit tag and save (this will push to marketplace)

## NPM Check

```bash
npm run npm:check
```