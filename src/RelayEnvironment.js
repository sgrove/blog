/** RelayEnvironment.js */
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store
} from "relay-runtime";
import { SubscriptionClient } from "onegraph-subscription-client";
import { auth } from "./Config";

class AuthError extends Error {
  constructor({ message, service, errors }) {
    super(message);
    this.name = "AuthError";
    this.message = message;
    this.service = service;
    this.errors = errors;
  }
}

class QueryError extends Error {
  constructor({ message, errors, extensions }) {
    super(message);
    this.name = "QueryError";
    this.message = message;
    this.errors = errors;
    this.extensions = extensions;
  }
}

async function fetchGraphQL(operationKind, text, variables) {
  const response = await fetch(
    `https://serve.onegraph.io/graphql?app_id=${auth.appId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...auth.authHeaders()
      },
      body: JSON.stringify({
        query: text,
        variables
      })
    }
  );

  // Get the response as JSON
  const res = await response.json();

  // Relay does not support partial-success queries,
  // so we forward errors to query components
  if (operationKind === "query" && (res.errors || []).length > 0) {
    const needsLoginService = auth.findMissingAuthServices(res.errors)[0];

    if (needsLoginService) {
      throw new AuthError({
        service: needsLoginService,
        message: `You must log into ${needsLoginService}`,
        errors: res.errors
      });
    } else {
      throw new QueryError({
        message: res.errors?.[0]?.message,
        errors: res.errors,
        extensions: res.extensions
      });
    }
  }
  return res;
}

// Relay passes a "params" object with the query name and text. So we define a helper function
// to call our fetchGraphQL utility with params.text.
async function fetchRelay(params, variables) {
  return fetchGraphQL(params.operationKind, params.text, variables);
}

const subscriptionClient = new SubscriptionClient(auth.appId, {
  oneGraphAuth: auth,
  reconnect: true,
  lazy: true,
  host: 'serve.onegraph.io'
});

const subscribe = (request, variables) => {
  const subscribeObservable = subscriptionClient.request({
    query: request.text,
    operationName: request.name,
    variables
  });
  // Important: Convert subscriptions-transport-ws observable type to Relay's
  return Observable.from(subscribeObservable);
};

// Export a singleton instance of Relay Environment configured with our network function:
export default new Environment({
  network: Network.create(fetchRelay, subscribe),
  store: new Store(new RecordSource())
});