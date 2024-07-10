"use strict";

module.exports = ({ strapi }) => ({
  create: async (ctx) => {
    // create the new Project
    const repo = ctx.request.body;
    const newProject = await strapi
      .plugin("github-projects")
      .service("projectService")
      .create(repo, ctx.state.user.id);
    return newProject;
  },
  delete: async (ctx) => {
    const projectId = ctx.params.id;
    const deletedProject = await strapi
      .plugin("github-projects")
      .service("projectService")
      .delete(projectId);
    return deletedProject;
  },
  createAll: async (ctx) => {
    // create the new Project
    const { repos } = ctx.request.body;
    const createProjects = await strapi
      .plugin("github-projects")
      .service("projectService")
      .createAll(repos, ctx.state.user.id);
    return createProjects;
  },
  deleteAll: async (ctx) => {
    const { projectIds } = ctx.query;
    const deleteProjects = await strapi
      .plugin("github-projects")
      .service("projectService")
      .deleteAll(projectIds);
    return deleteProjects;
  },
  find: async (ctx) => {
    return await strapi
      .plugin("github-projects")
      .service("projectService")
      .find(ctx.query);
  },
  findOne: async (ctx) => {
    const projectId = ctx.params.id;
    return await strapi
      .plugin("github-projects")
      .service("projectService")
      .findOne(projectId, ctx.query);
  },
});
