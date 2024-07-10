import React, { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Td, Th } from "@strapi/design-system";
import {
  Box,
  Typography,
  Checkbox,
  Loader,
  Alert,
  Link,
  Flex,
  IconButton,
} from "@strapi/design-system";

import { Trash, Pencil, Plus } from "@strapi/icons";

import { useFetchClient } from "@strapi/helper-plugin";
import ConfirmationDialog from "./ConfirmationDialog";
import BulkActions from "./BulkActions";
import { useIntl } from "react-intl";
import getTrad from "../utils/getTrad";

const COL_COUNT = 5;

const Repo = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [alert, setAlert] = useState(undefined);
  const [deletingRepo, setDeletingRepo] = useState(undefined);
  const { formatMessage } = useIntl();
  const showAlert = (alert) => {
    setAlert(alert);
    setTimeout(() => {
      setAlert(undefined);
    }, 5000);
  };

  const client = useFetchClient();

  const createProject = (repo) => {
    client
      .post("/github-projects/project", repo)
      .then((response) => {
        setRepos(
          repos.map((item) =>
            item.id !== repo.id
              ? item
              : {
                  ...item,
                  projectId: response.data.id,
                },
          ),
        );
        showAlert({
          title: "Project created",
          message: `Successfully created project ${response.data.title}`,
          variant: "success",
        });
      })
      .catch((error) => {
        showAlert({
          title: "An error occurred",
          message: error.toString(),
          variant: "danger",
        });
      });
  };

  const deleteProject = (repo) => {
    const { projectId } = repo;
    client
      .del(`/github-projects/project/${projectId}`)
      .then((response) => {
        setRepos(
          repos.map((item) =>
            item.id !== repo.id
              ? item
              : {
                  ...item,
                  projectId: null,
                },
          ),
        );
        showAlert({
          title: "Project deleted",
          message: `Successfully deleted project ${response.data.title}`,
          variant: "success",
        });
      })
      .catch((error) => {
        showAlert({
          title: "An error occurred",
          message: error.toString(),
          variant: "danger",
        });
      });
  };

  const createAll = (reposToBecomeProjects) => {
    client
      .post("/github-projects/projects", {
        repos: reposToBecomeProjects,
      })
      .then((response) => {
        setRepos(
          repos.map((repo) => {
            const relatedProjectJustCreated = response.data.find(
              (project) => Number(project.repositoryId) === Number(repo.id),
            );
            return !repo.projectId && relatedProjectJustCreated
              ? {
                  ...repo,
                  projectId: relatedProjectJustCreated.id,
                }
              : repo;
          }),
        );
        showAlert({
          title: "Projects created",
          message: `Successfully created ${response.data.length} projects`,
          variant: "success",
        });
      })
      .catch((error) => {
        showAlert({
          title: "An error occurred",
          message: error.toString(),
          variant: "danger",
        });
      })
      .finally(() => {
        setSelectedRepos([]);
      });
  };

  const deleteAll = (projectIds) => {
    client
      .del("/github-projects/projects", {
        params: {
          projectIds,
        },
      })
      .then((response) => {
        setRepos(
          repos.map((repo) => {
            const relatedProjectJustDeleted = response.data.find(
              (project) => Number(project.repositoryId) === Number(repo.id),
            );
            return repo.projectId && relatedProjectJustDeleted
              ? {
                  ...repo,
                  projectId: null,
                }
              : repo;
          }),
        );
        showAlert({
          title: "Projects deleted",
          message: `Successfully deleted ${response.data.length} projects`,
          variant: "success",
        });
      })
      .catch((error) => {
        showAlert({
          title: "An error occurred",
          message:
            "At least one project wasn't correctly deleted. Please check and retry ",
          variant: "danger",
        });
      })
      .finally(() => {
        setSelectedRepos([]);
      });
  };

  useEffect(() => {
    setLoading(true);

    client
      .get("/github-projects/repos")
      .then((response) => setRepos(response.data))
      .catch((error) =>
        showAlert({
          title: "Error fetching repositories",
          message: error.toString(),
          variant: "danger",
        }),
      );

    setLoading(false);
  }, []);

  if (loading) return <Loader>Loading content...</Loader>;

  // we do have some repositories
  console.log(repos);

  const allChecked = selectedRepos.length === repos.length;

  // some repos selected, but not all
  const isIndeterminate = selectedRepos.length > 0 && !allChecked;

  return (
    <Box padding={8} background="neutral100">
      {deletingRepo && (
        <ConfirmationDialog
          message={"Are you sure you want to delete this project?"}
          onClose={() => {
            setDeletingRepo(undefined);
          }}
          onConfirm={() => deleteProject(deletingRepo)}
        />
      )}

      {alert && (
        <div style={{ position: "absolute", top: 0, left: "14%", zIndex: 10 }}>
          <Alert
            closeLabel={"Close alert"}
            title={alert.title}
            variant={alert.variant}
          >
            {alert.message}
          </Alert>
        </div>
      )}
      {selectedRepos.length > 0 && (
        <BulkActions
          selectedRepos={selectedRepos.map((repoId) =>
            repos.find((repo) => repo.id === repoId),
          )}
          bulkCreateAction={createAll}
          bulkDeleteAction={deleteAll}
        />
      )}
      <Table colCount={COL_COUNT} rowCount={repos.length}>
        {repos.length > 0 && (
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  aria-label="Select all entries"
                  value={allChecked}
                  indeterminate={isIndeterminate}
                  onValueChange={(value) =>
                    value
                      ? setSelectedRepos(repos.map((repo) => repo.id))
                      : setSelectedRepos([])
                  }
                />
              </Th>
              <Th>
                <Typography variant="sigma">
                  {formatMessage({
                    id: getTrad("repo.name"),
                    defaultMessage: "Name",
                  })}
                </Typography>
              </Th>
              <Th>
                <Typography variant="sigma">
                  {" "}
                  {formatMessage({
                    id: getTrad("repo.description"),
                    defaultMessage: "Description",
                  })}
                </Typography>
              </Th>
              <Th>
                <Typography variant="sigma">
                  {" "}
                  {formatMessage({
                    id: getTrad("repo.url"),
                    defaultMessage: "Url",
                  })}
                </Typography>
              </Th>
              <Th>
                <Typography variant="sigma">
                  {" "}
                  {formatMessage({
                    id: getTrad("repo.actions"),
                    defaultMessage: "Actions",
                  })}
                </Typography>
              </Th>
            </Tr>
          </Thead>
        )}

        <Tbody>
          {repos.map((repo) => {
            const { id, name, shortDescription, url, projectId } = repo;
            return (
              <Tr key={id}>
                <Td>
                  <Checkbox
                    aria-label={`Select ${id}`}
                    value={selectedRepos.includes(id)}
                    onValueChange={(value) => {
                      const newSelectedReopos = value
                        ? [...selectedRepos, id]
                        : selectedRepos.filter((item) => item !== id);
                      setSelectedRepos(newSelectedReopos);
                    }}
                  />
                </Td>
                <Td>
                  <Typography textColor="neutral800">{name}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {shortDescription}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    <Link href={url} isExternal>
                      {url}
                    </Link>
                  </Typography>
                </Td>
                <Td>
                  {projectId ? (
                    <Flex>
                      <Link
                        to={`/content-manager/collection-types/plugin::github-projects.project/${projectId}`}
                      >
                        <IconButton
                          onClick={() => console.log("edit")}
                          label="Edit"
                          borderWidth={0}
                        >
                          <Pencil />
                        </IconButton>
                      </Link>
                      <Box paddingLeft={1}>
                        <IconButton
                          // onClick={() => deleteProject(repo)}
                          onClick={() => setDeletingRepo(repo)}
                          label="Delete"
                          borderWidth={0}
                        >
                          <Trash />
                        </IconButton>
                      </Box>
                    </Flex>
                  ) : (
                    <IconButton
                      onClick={() => createProject(repo)}
                      label="Add"
                      borderWidth={0}
                    >
                      <Plus />
                    </IconButton>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {deletingRepo && (
        <ConfirmationDialog
          visible={!!deletingRepo}
          message="Are you sure you want to delete this project?"
          onClose={() => setDeletingRepo(undefined)}
          onConfirm={() => deleteProject(deletingRepo)}
        />
      )}
    </Box>
  );
};

export default Repo;
