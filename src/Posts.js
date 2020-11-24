
/* Posts.js */
import React, {Suspense} from 'react';
import {ErrorBoundary} from "react-error-boundary";
import {useLazyLoadQuery} from 'react-relay/hooks';
import { auth } from './Config';
import {ErrorFallback, stringifyRelayData, LocationNote, updateFormVariables} from './utils';
import graphql from 'babel-plugin-relay/macro';
import {createPaginationContainer} from 'react-relay';
import Comment from './Comment'


export function PaginatedRepositoryIssues(props) {
  const {relay, repositoryForPaginatedIssues} = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const paginatedRepositoryIssuesUses = repositoryForPaginatedIssues?.posts?.edges?.map((item, idx) => <PaginatedIssuesCommentsContainer key={item?.post?.id || idx} issuesForPaginatedComments={item?.post} />);

  const loadMoreCount = 2;

  return (
    <div>
      <div className="data-box">
        <pre>{stringifyRelayData(repositoryForPaginatedIssues?.posts)}</pre>
        <h4>IssuesForPaginatedCommentsUses</h4>
        {issuesForPaginatedCommentsUses}
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
        {isLoading ? 'Loading more posts...' :  relay.hasMore() ? `Fetch ${loadMoreCount} more posts` : "All posts have been fetched"}
      </button>
    </div>
  );
}

export const PaginatedRepositoryIssuesContainer = createPaginationContainer(
  PaginatedRepositoryIssues,
  {
    repositoryForPaginatedIssues: graphql`fragment Posts_repositoryForPaginatedIssues on GitHubRepository @argumentDefinitions(count: {type: "Int", defaultValue: 10}, cursor: {type: "String"}, labels: {type: "[String!]"}, createdBy: {type: "String"}) {
  id
  posts: issues(first: $count, orderBy: {field: CREATED_AT, direction: DESC}, labels: $labels, filterBy: {createdBy: $createdBy}, after: $cursor) @connection(key: "Posts_repositoryForPaginatedIssues_posts") {
    edges {
      post: node {
        id
        number
        title
        url
        body
        ...Posts_issuesForPaginatedComments @arguments(count: $count, cursor: $cursor)
      }
    }
  }
  oneGraphId
}`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props?.repositoryForPaginatedIssues?.posts;
    },
    getVariables(props, pagination, fragmentVariables) {
      const {count, cursor} = pagination;
      return {...fragmentVariables, count: count, cursor: cursor, oneGraphId: props?.repositoryForPaginatedIssues?.oneGraphId};
    },
    query: graphql`query Posts_PaginatedRepositoryIssuesContainerQuery($oneGraphId: ID!, $labels: [String!] = ["Publish"], $createdBy: String = "sgrove", $count: Int = 10, $cursor: String) {
  oneGraphNode(oneGraphId: $oneGraphId) {
    oneGraphId
    ...Posts_repositoryForPaginatedIssues @arguments(count: $count, cursor: $cursor, labels: $labels, createdBy: $createdBy)
  }
}`
  }
);

export function PaginatedIssuesComments(props) {
  const {relay, issuesForPaginatedComments} = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const commentUses = issuesForPaginatedComments?.comments?.edges?.map((item, idx) => <Comment key={item?.node?.id || idx} comment={item?.node} />);

  const loadMoreCount = 2;

  return (
    <div>
      <div className="data-box">
        <pre>{stringifyRelayData(issuesForPaginatedComments?.comments)}</pre>
        <h4>CommentUses</h4>
        {commentUses}
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
        {isLoading ? 'Loading more comments...' :  relay.hasMore() ? `Fetch ${loadMoreCount} more comments` : "All comments have been fetched"}
      </button>
    </div>
  );
}

export const PaginatedIssuesCommentsContainer = createPaginationContainer(
  PaginatedIssuesComments,
  {
    issuesForPaginatedComments: graphql`fragment Posts_issuesForPaginatedComments on GitHubIssue @argumentDefinitions(count: {type: "Int", defaultValue: 10}, cursor: {type: "String"}) {
  id
  comments(first: $count, after: $cursor) @connection(key: "Posts_issuesForPaginatedComments_comments") {
    edges {
      node {
        ...Comment_fragment
      }
    }
  }
  oneGraphId
}`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props?.issuesForPaginatedComments?.comments;
    },
    getVariables(props, pagination, fragmentVariables) {
      const {count, cursor} = pagination;
      return {...fragmentVariables, count: count, cursor: cursor, oneGraphId: props?.issuesForPaginatedComments?.oneGraphId};
    },
    query: graphql`query Posts_PaginatedIssuesCommentsContainerQuery($oneGraphId: ID!, $count: Int = 10, $cursor: String) {
  oneGraphNode(oneGraphId: $oneGraphId) {
    oneGraphId
    ...Posts_issuesForPaginatedComments @arguments(count: $count, cursor: $cursor)
  }
}`
  }
);

const POSTS_QUERY = graphql`
  query PostsQuery($name: String = "essay.dev", $owner: String = "onegraph", $labels: [String!] = ["Publish"], $createdBy: String = "sgrove") {
    gitHub {
      repository(name: $name, owner: $owner) {
        ...Posts_repositoryForPaginatedIssues @arguments(labels: $labels, createdBy: $createdBy)
      }
    }
  }
`;

export function PostsQuery(props) {
  const data = useLazyLoadQuery(POSTS_QUERY, props,
  {
    // Try to render from the store if we have some data available, but also refresh from the network
    fetchPolicy: "store-and-network",
    // Refetch the query if we've logged in/out of any service
    fetchKey: auth.accessToken()?.accessToken,
  });

  const dataEl = data ? (
    <div className="data-box">
      <h3>Data for Posts <LocationNote location={'Posts.js:<PostsQuery>'} /></h3>
      <pre>{stringifyRelayData(data)}</pre>
    </div>
  ) : null;

  const paginatedRepositoryIssuesUses = <PaginatedRepositoryIssuesContainer  repositoryForPaginatedIssues={data?.gitHub?.repository} />;

  return (
    <div>
      {dataEl}
      <h4>PaginatedRepositoryIssuesUses</h4>
      {paginatedRepositoryIssuesUses}
    </div>
  );
}

export default function PostsQueryForm(props) {
  const [queryVariables, setQueryVariables] = React.useState({...props});
  const [formVariables, setFormVariables] = React.useState({});
  const [hasError, setHasError] = React.useState(false);

  const formEl = (
  <form onSubmit={event => { event.preventDefault(); setQueryVariables({ ...formVariables }) }}>
    <label htmlFor="name">name</label><input id="name" type="text" onChange={updateFormVariables(setFormVariables, ["name"], (value) => value)} />
    <label htmlFor="owner">owner</label><input id="owner" type="text" onChange={updateFormVariables(setFormVariables, ["owner"], (value) => value)} />
    <label htmlFor="labels-0">labels</label><input id="labels-0" type="text" onChange={updateFormVariables(setFormVariables, ["labels",0], (value) => value)} />
    <label htmlFor="createdBy">createdBy</label><input id="createdBy" type="text" onChange={updateFormVariables(setFormVariables, ["createdBy"], (value) => value)} />
    <input type="submit" />
  </form>
  );

  /** If there's an error in the query component (Missing authentication, missing variable, CORS error, etc.)
      we'll let the ErrorBoundary handle the 'try again' action */
  const actionButtonEl = hasError ? null : (
    <button onClick={() => setQueryVariables({ ...formVariables })}>
      Run PostsQuery
    </button>
  );

  return (
    <div>
      <h3>Posts</h3>
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
        <Suspense fallback={"Loading PostsQuery..."}>
          <PostsQuery {...queryVariables} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
