import React, { useState } from "react";
import { Box, Flex, Typography } from "@strapi/design-system";
import { Button } from "@strapi/design-system/Button";
import ConfirmationDialog from "./ConfirmationDialog";

const BulkAction = ({ selectedRepos, bulkCreateAction, bulkDeleteAction }) => {
  const reposWithoutProjects = selectedRepos.filter((repo) => !repo.projectId);
  const reposWithProjects = selectedRepos.filter((repo) => repo.projectId);
  const projectsToBeCreated = reposWithoutProjects.length;
  const projectsToBeDeleted = reposWithProjects.length;
  const projectIdsToDelete = reposWithProjects.map((repo) => repo.projectId);
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <Box paddingBottom={4}>
      <Flex>
        <Typography>{`You have ${projectsToBeCreated} projects to generate and ${projectsToBeDeleted} to delete`}</Typography>
        {projectsToBeCreated > 0 && (
          <Box paddingLeft={2}>
            <Button
              size={"S"}
              variant={"success-light"}
              onClick={() => bulkCreateAction(reposWithoutProjects)}
            >
              {`Create ${projectsToBeCreated} project(s)`}
            </Button>
          </Box>
        )}
        {projectsToBeDeleted > 0 && (
          <Box paddingLeft={2}>
            <Button
              size={"S"}
              variant={"danger-light"}
              onClick={() => setDialogVisible(true)}
            >
              {`Delete ${projectsToBeDeleted} project(s)`}
            </Button>
          </Box>
        )}
      </Flex>
      <ConfirmationDialog
        visible={dialogVisible}
        message={"Are you sure you want to delete these projects?"}
        onClose={() => setDialogVisible(false)}
        onConfirm={() => {
          bulkDeleteAction(projectIdsToDelete);
          setDialogVisible(false);
        }}
      />
    </Box>
  );
};

export default BulkAction;
