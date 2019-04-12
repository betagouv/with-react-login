# with-react-login

React hoc component for rendering page only on user log success.

[![CircleCI](https://circleci.com/gh/betagouv/with-react-login/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/with-react-login/tree/master)
[![npm version](https://img.shields.io/npm/v/with-react-login.svg?style=flat-square)](https://npmjs.org/package/with-react-login)

## Basic Usage
Let's show an example in a redux-saga-data install, but it is compatible also with
redux-thunk-data or react-hooks-data or any kind of fetch system as long as you declare
dispatch and requestData action in the config of with-react-login.

You need to add first the data reducer in your root reducer:
You need to install a redux-saga setup with the watchDataActions and the data reducer,
don't forget to specify the url of your api here:

```javascript
import {
  applyMiddleware,
  combineReducers,
  createStore
} from 'redux'
import createSagaMiddleware from 'redux-saga'
import { all } from 'redux-saga/effects'
import { createData, watchDataActions } from 'redux-saga-data'

const sagaMiddleware = createSagaMiddleware()
const storeEnhancer = applyMiddleware(sagaMiddleware)

function* rootSaga() {
  yield all([
    watchDataActions({
      rootUrl: "https://myfoo.com",
    }),
  ])
}

const rootReducer = combineReducers({
  data: createData({ users: [] }),
})

const store = createStore(rootReducer, storeEnhancer)

sagaMiddleware.run(rootSaga)
```

Then you can use withLogin in your component:

```javascript

import { connect } from 'react-redux'
import withLogin from 'with-react-login'

const withConnectedLogin = compose(
  connect(),
  withLogin({
    currentUserApiPath: '/users/current',
    failRedirect: '/signin',
  })
)

const FooPage = () => {
  // withLogin passes a currentUser props
  const { currentUser } = this.props
  const { email } = currentUser || {}
  return (
    <div>
      I am connected with {email} !
    </div>
  )
}

export default compose(withConnectedLogin)(FooPage)
```

Depending on what returns GET 'https://myfoo.com/users/current':

  - if it is a 200 with { email: 'michel.momarx@youpi.fr' }, FooPage will be rendered,
  - if it is a 400, app will redirect to '/signin' page.

## Usage with config

### withLogin

| name | type | example | isRequired | default | description |
| -- | -- | -- | -- | -- | -- |
| currentUserApiPath | `string` |  | no | '/users/current' | apiPath that will be joined with your rootUrl to get the authenticated user from your auth server |
| failRedirect | `function` | See test | no | 'undefined' | function triggered after fail of your auth currentUserApiPath request saying. It should return a redirect path towards which react-router will history push. |
| currentUser | `object` |  | no | 'null' | object saying if withLogin needs to be rendered already with a currentUser. Useful when we want to do redux-persist login |
| requestData | `function` | See test | yes | requestData from fetch-normalize-data | action creator which will trigger the action to request '/users/current' |
| successRedirect | `function` | See test | no | 'undefined' | function triggered after success of your auth currentUserApiPath request saying. It should return a redirect path towards which react-router will history push. |
| isRequired | `boolean` | See test | no | 'true' | Boolean saying if the React WrappedComponent will need to wait a success from the currentUserApiPath to be rendered. |
