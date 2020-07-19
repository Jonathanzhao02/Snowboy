# Contributing
When contributing, please discuss the changes before opening a pull request.
Otherwise, feel free to tackle any open issues. Just comment on it if you want to claim it.

If you are unfamiliar with the Github workflow, please feel free to contact me directly! The contributor team is just me and you right now, Hunter, so yeah, go ahead!

## Pull Requests
Be sure to detail any changes in the CHANGELOG.md so that we can keep all our code maintained and mergeable with each other.
Read up on semantic versioning (vx.x.x) to figure out how to properly version your change. <b>For now, since we're in pre-alpha, it will remain at version 0.x.x.</b>
Maybe small bug fixes or changes do not have to be too detailed, but it is incredibly important refactorings and renamings are detailed extensively.

For the sake of being able to match PRs to versions easily, please include the PR number in the version in CHANGELOG.md (i.e. v0.6.9 (PR #420)).
If you forget a few small fixes and make multile pull requests that are all accepted, go ahead and simply add all relevant PR versions to the version number.

Even if you have the power to, try not to commit directly to the repository and always open a pull request so that we can always track and review changes.
To do this without forking the repo, you can create another branch called 'dev' or something and commit there, then open a pull request when it is ready to merge.

## Running the Bot
Running the bot requires a variety of different keys. Most notably, a <b>Youtube API key</b>, a <b>Google Search API key</b>, a <b>Wit.ai API key</b>, and a <b>Discord bot token</b>.
Moreover, to create the database the bot uses, `db/snowboy.db`, you must have `sqlite3` installed and create the database using the following command in a folder named `db`:
```bash
sqlite3 snowboy.db
```
This will create the empty database for `keyv` to use.

## Code of Conduct
Don't get overly defensive over your code, and don't be rude.

## IMPORTANT!
Please be sure when you fork this repository, the fork remains private! This is currently <b>not</b> an open-source project.

Thank you!
