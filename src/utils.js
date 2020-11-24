/* utils.js */
import React from "react";
import { auth } from "./Config";

// This is a simple helper for first-time setup, feel free to delete
export function suggestCORSSetup(error, resetErrorBoundary) {
  if (
    error &&
    error.message &&
    (error.message.toLocaleLowerCase().match("cors origin") ||
      error.message.toLocaleLowerCase().match("not allowed") ||
      error.message.toLocaleLowerCase().match("failed to fetch"))
  ) {
    return (
      <div className="error-box">
        Make sure <strong>{window.location.origin}</strong> is in your CORS
        origins on the{" "}
        <a
          href={`http://localhost:3000/dashboard/app/${auth.appId}?add-cors-origin=${window.location.origin}`}
          target="_blank"
          rel="noopener noreferrer"
        >OneGraph dashboard for your app</a> and then refresh to try again.
      </div>
    );
  }
}

const suggestServiceLogin = (error, resetErrorBoundary) => {
  const needsLoginService = auth.findMissingAuthServices(error)[0];

  if (!needsLoginService) {
    return;
  }

  return (
    <button
      className="login-hint"
      onClick={async () => {
        if (!needsLoginService) {
          resetErrorBoundary();
        } else {
          await auth.login(needsLoginService);
          const loginSuccess = await auth.isLoggedIn(needsLoginService);
          if (loginSuccess) {
            console.log("Successfully logged into " + needsLoginService);
            resetErrorBoundary();
          } else {
            console.log("The user did not grant auth to " + needsLoginService);
          }
        }
      }}
    >
      {`Log in to ${needsLoginService}`}
    </button>
  );
};

export function ErrorFallback({ error, resetErrorBoundary }) {
  const explanation =
    // Detect if we haven't set up CORS yet. Feel free to delete this.
    suggestCORSSetup(error, resetErrorBoundary) ||
    // Detect if we need to log into a service to run the operation
    suggestServiceLogin(error, resetErrorBoundary) || (
      // else show the raw error
      <>
        <button onClick={() => resetErrorBoundary()}>
          Try again
        </button>
      </>
    );

  return (
    <div>
      <p>Something went wrong.</p>
      <div className="error-box">
        <pre>{error.toString()}</pre>
      </div>
      {explanation}
    </div>
  );
}

export const updateFormVariables = (setFormVariables, path, coerce) => {
  const setIn = (object, path, value) => {
    if (path.length === 1) {
      if (value === null) {
        delete object[path[0]]
      } else {
        object[path[0]] = value
      }
    } else {
      if ([undefined, null].indexOf(object[path[0]]) > -1) {
        object[path[0]] = (typeof path[1] === "number" ?  [] : {} )
      }
      setIn(object[path[0]], path.slice(1), value);
    }
    return object;
  };

  const formInputHandler = (event) => {
    // We parse the form input, coerce it to the correct type, and then update the form variables
    const rawValue = event.target.value;
    // We take a blank input to mean `null`
    const value = rawValue === '' ? null : rawValue;
    setFormVariables((oldFormVariables) => {
      const newValue = setIn(oldFormVariables, path, coerce(value));
      return { ...newValue };
    });
  };

  return formInputHandler;
};

// Cleans up data from Relay for human viewing
export function stringifyRelayData(data) {
  const helper = (oldObj) => {
    let obj;
    if (oldObj && typeof oldObj === "object") {
      obj = {};

      var allKeys = Object.keys(oldObj);
      for (var i = 0; i < allKeys.length; i++) {
        var k = allKeys[i];

        const isBadKey = k.startsWith("__")

        if (!isBadKey) {
          var value = oldObj[k];

          if (Array.isArray(value)) {
            value = value.map(helper);
          } else if (typeof value === "object") {
            value = helper(value);
          }

          obj[k] = value;
        }
      }
    }
    return obj ?? oldObj;
  };

  return JSON.stringify(helper(data), null, 2);
}

// Used to show which file contains an exported component
// for easier editing
export const LocationNote = ({location}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24">
      <title>Edit me at: {location}</title>
      <path d="M12 2c2.131 0 4 1.73 4 3.702 0 2.05-1.714 4.941-4 8.561-2.286-3.62-4-6.511-4-8.561C8 3.73 9.869 2 12 2zm0-2C8.852 0 6 2.553 6 5.702 6 8.85 8.602 12.609 12 18c3.398-5.391 6-9.15 6-12.298C18 2.553 15.149 0 12 0zm0 8a2 2 0 11-.001-3.999A2 2 0 0112 8zm8 12c0 2.209-3.581 4-8 4s-8-1.791-8-4c0-1.602 1.888-2.98 4.608-3.619l1.154 1.824c-.401.068-.806.135-1.178.242-3.312.949-3.453 2.109-.021 3.102 2.088.603 4.777.605 6.874-.001 3.619-1.047 3.164-2.275-.268-3.167-.296-.077-.621-.118-.936-.171l1.156-1.828C18.112 17.02 20 18.398 20 20z"></path>
    </svg>
  );
};
