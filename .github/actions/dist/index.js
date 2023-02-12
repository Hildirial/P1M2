const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('github-token');
    const octokit = github.getOctokit(token);

    // Get the labels attached to the issue
    const labels = await octokit.rest.issues.listLabelsOnIssue({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number
    });

    // Check if the "bug" label is attached to the issue
    const bugLabel = labels.data.find(label => label.name === 'bug');
    if (!bugLabel) {
      core.info('The "bug" label is not attached to this issue. Skipping adding it to the "Bugs" project');
      return;
    }

    // Get the ID of the "Bugs" project
    const projects = await octokit.rest.projects.listForRepo({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo
    });
    const bugsProject = projects.data.find(project => project.name === 'Bugs');
    if (!bugsProject) {
      core.warning('The "Bugs" project was not found. Cannot add issue to project');
      return;
    }

    // Add the issue to the "Bugs" project
    await octokit.rest.projects.createCard({
      column_id: bugsProject.columns[0].id,
      content_id: github.context.issue.number,
      content_type: 'Issue'
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();