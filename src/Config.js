/* Config.js */
import OneGraphAuth from "onegraph-auth";

const APP_ID = "af3246eb-92a6-4dc6-ac78-e1b3d0c31212"

export const auth = new OneGraphAuth({
  appId: APP_ID,oneGraphOrigin: 'https://serve.onegraph.io/'
});