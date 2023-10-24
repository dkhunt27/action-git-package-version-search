# action-git-package-version-search

Git action that searches for a published version of a package

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
  errorIfExists:
    description: 'If package exists, throw error'
    required: true
    type: boolean
```

## Usage

- Add to your git action
  
```yaml
      - name: Assert git package does not already exist
        uses: dkhunt27/git-package-version-search
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          org: my-org
          packageName: my-package
          packageVersion: 0.45.2
          errorIfExists: true
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