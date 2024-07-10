"use strict";

const markdownit = require("markdown-it");
// import md from "markdown-it";
// import markdownit from "markdown-it";
const md = markdownit();

module.exports = ({ strapi }) => ({
  getProjectForRepo: async (repo) => {
    const { id } = repo;
    const matchingProjects = await strapi.entityService.findMany(
      "plugin::github-projects.project",
      {
        filters: {
          repositoryId: id,
        },
      },
    );
    if (matchingProjects.length === 1) {
      return matchingProjects[0].id;
    }
    return null;
  },

  getPublicRepos: async () => {
    const result = await fetch("https://api.github.com/user/repos", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      type: "public",
    });
    const data = await result.json();

    // id, name, shortDescription, url, longDescription
    return Promise.all(
      data.map(async (item) => {
        const { id, name, description, html_url, owner, default_branch } = item;
        const readmeUrl = `https://raw.githubusercontent.com/${owner.login}/${name}/${default_branch}/README.md`;
        const readmeResult = await fetch(readmeUrl);
        const longDescription =
          readmeResult.status !== 404
            ? md.render(await readmeResult.text()).replaceAll("\n", "<br />")
            : "";

        const repo = {
          id,
          name,
          shortDescription: description,
          url: html_url,
          longDescription,
        };
        // Add some logic to search for an existing project for the current repo
        const relatedProjectId = await strapi
          .plugin("github-projects")
          .service("getReposService")
          .getProjectForRepo(repo);
        return {
          ...repo,
          projectId: relatedProjectId,
        };
      }),
    );
  },
});
