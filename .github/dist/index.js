const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('github-token');
    const octokit = new github.getOctokit(token);

    // Get the issue information
    const issue = github.context.payload.issue;
    const issueNumber = issue.number;
    const owner = github.context.payload.repository.owner.login;
    const repo = github.context.payload.repository.name;

    // Add the issue to the project
    const projectUrl = core.getInput('project-url');
    const projectId = projectUrl.split('/').pop();
    const { data: columns } = await octokit.projects.listColumns({
      project_id: projectId
    });
    const columnId = columns.find(column => column.name === 'To do').id;
    await octokit.projects.createCard({
      column_id: columnId,
      content_id: issue.id,
      content_type: 'Issue'
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
