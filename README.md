# with-react-login

React hoc component for rendering page only on user log success.

[![CircleCI](https://circleci.com/gh/betagouv/with-react-login/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/with-react-login/tree/master)
[![npm version](https://img.shields.io/npm/v/with-react-login.svg?style=flat-square)](https://npmjs.org/package/with-react-login)

## Basic Usage

### Using redux-saga-data

See first the store install process in [redux-thunk-data](https://github.com/betagouv/redux-saga-data).

Then you can declare a login component like this:

```javascript

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import withLogin from 'with-react-login'

const withConnectedLogin = compose(
  withRouter,
  withLogin({
    currentUserApiPath: '/users/current',
    handleFail: (state, action, { history }) => history.push('/signin'),
    withDispatcher: connect(),
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

export default withConnectedLogin(FooPage)
```

Depending on what returns GET 'https://myfoo.com/users/current':

  - if it is a 200 with { email: 'michel.momarx@youpi.fr' }, FooPage will be rendered,
  - if it is a 400, app will redirect to '/signin' page.

### Using redux-thunk-data

Like above, see the install process in [redux-thunk-data](https://github.com/betagouv/redux-thunk-data).

Then you need just to slightly change setup:

```javascript

import { connect } from 'react-redux'
import { requestData } from 'redux-thunk-data'
import { compose } from 'redux'
import withLogin from 'with-react-login'

const withConnectedLogin = compose(
  withRouter,
  withLogin({
    currentUserApiPath: '/users/current',
    handleFail: (state, action, { history }) => history.push('/signin'),
    requestData,
    withDispatcher: connect()
  })
)
...
```

### Using react-hook-data

See [redux-hook-data](https://github.com/betagouv/redux-hook-data), but this is the same principle.

```javascript
import { DataContext } from 'react-hook-data'
import withLogin from 'with-react-login'

const withConnectedLogin = withLogin({
  currentUserApiPath: '/users/current',
  handleFail: (state, action, { history }) => history.push('/signin'),
  withDispatcher: DataContext
})
```

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
