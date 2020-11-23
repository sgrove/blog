
/* FindMeOnGitHub.js */
import React, {Suspense} from 'react';
import {ErrorBoundary} from "react-error-boundary";
import {useLazyLoadQuery} from 'react-relay/hooks';
import { auth } from './Config';
import {ErrorFallback, stringifyRelayData} from './utils';
import graphql from 'babel-plugin-relay/macro';


export function PaginatedGithubRepositories(props) {
  const {relay, githubForPaginatedRepositories} = props;
  const [isLoading, setIsLoading] = React.useState(false);

  

  const loadMoreCount = 2;

  return (
    <div>
      <div className="data-box">
        <pre>{stringifyRelayData(githubForPaginatedRepositories?.repositories)}</pre>
        
      </div>
      <button
        className={isLoading ? "loading" : null}
        disabled={!relay.hasMore()}
        onClick={() => {
          if (!relay.isLoading()) {
            setIsLoading(true);
            relay.loadMore(loadMoreCount, (x) => {
              setIsLoading(false);
            });
          }
        }}>
        {isLoading ? 'Loading more repositories...' :  relay.hasMore() ? `Fetch ${loadMoreCount} more repositories` : "All repositories have been fetched"}
      </button>
    </div>
  );
}

export const PaginatedGithubRepositoriesContainer = createPaginationContainer(
  PaginatedGithubRepositories,
  {
    githubForPaginatedRepositories: graphql`fragment FindMeOnGitHub_githubForPaginatedRepositories on GitHubUser @argumentDefinitions(count: {type: "Int", defaultValue: 10}, cursor: {type: "String"}) {
  id
  repositories(first: $count, orderBy: {field: CREATED_AT, direction: DESC}, affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], after: $cursor) @connection(key: "FindMeOnGitHub_githubForPaginatedRepositories_repositories") {
    edges {
      node {
        id
        nameWithOwner
      }
    }
    totalCount
  }
  oneGraphId
}`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props?.githubForPaginatedRepositories?.repositories;
    },
    getVariables(props, pagination, fragmentVariables) {
      const {count, cursor} = pagination;
      return {...fragmentVariables, count: count, cursor: cursor, oneGraphId: props?.githubForPaginatedRepositories?.oneGraphId};
    },
    query: graphql`query FindMeOnGitHub_PaginatedGithubRepositoriesContainerQuery($oneGraphId: ID!, $count: Int = 10, $cursor: String) {
  oneGraphNode(oneGraphId: $oneGraphId) {
    oneGraphId
    ...FindMeOnGitHub_githubForPaginatedRepositories @arguments(count: $count, cursor: $cursor)
  }
}`
  }
);

const FIND_ME_ON_GIT_HUB_QUERY = graphql`
  query FindMeOnGitHub_Query {
    me {
      github {
        id
        login
        ...FindMeOnGitHub_githubForPaginatedRepositories @arguments
      }
    }
  }
`;

export function FindMeOnGitHubQuery(props) {
  const data = useLazyLoadQuery(FIND_ME_ON_GIT_HUB_QUERY, props,
  {
    // Try to render from the store if we have some data available, but also refresh from the network
    fetchPolicy: "store-and-network",
    // Refetch the query if we've logged in/out of any service
    fetchKey: auth.accessToken()?.accessToken,
  });

  const dataEl = data ? (
    <div className="data-box">
      <h3>Data for FindMeOnGitHub</h3>
      <pre>{stringifyRelayData(data)}</pre>
    </div>
  ) : null;

  const paginatedGithubRepositoriesUses = <PaginatedGithubRepositoriesContainer  githubForPaginatedRepositories={data?.me?.github} />;

  return (
    <div>
      {dataEl}
      <h4>PaginatedGithubRepositoriesUses</h4>
      {paginatedGithubRepositoriesUses}
    </div>
  );
}

export default function FindMeOnGitHubQueryForm(props) {
  const [queryVariables, setQueryVariables] = React.useState({...props});
  const [formVariables] = React.useState({});
  const [hasError, setHasError] = React.useState(false);

  const formEl = (
  <form onSubmit={event => { event.preventDefault(); setQueryVariables({ ...formVariables }) }}>
    
    <input type="submit" />
  </form>
  );

  /** If there's an error in the query component (Missing authentication, missing variable, CORS error, etc.)
      we'll let the ErrorBoundary handle the 'try again' action */
  const actionButtonEl = hasError ? null : (
    <button onClick={() => setQueryVariables({ ...formVariables })}>
      Run query: FindMeOnGitHubQuery
    </button>
  );

  return (
    <div>
      <h3>FindMeOnGitHub</h3>
      {formEl}
      {actionButtonEl}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // reset the state of your app so the error doesn't happen again
          console.log("Reset queryVariables to trigger query run");
          setHasError(false);
          setQueryVariables({ ...props, ...formVariables });
        }}
        onError={(err) => {
          setHasError(true);
          console.log("Error detected:", err);
        }}>
        <Suspense fallback={"Loading FindMeOnGitHubQuery..."}>
          <FindMeOnGitHubQuery {...queryVariables} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
