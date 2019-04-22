import { requestData as defaultRequestData } from 'fetch-normalize-data'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import { resolveCurrentUser } from './resolveCurrentUser'

export const withLogin = (config = {}) => WrappedComponent => {
  const {
    failRedirect,
    successRedirect,
    withDispatcher
  } = config

  const isRequired = typeof config.isRequired === 'undefined'
    ? true
    : config.isRequired
  const currentUserApiPath = config.currentUserApiPath || "/users/current"
  const requestData = config.requestData || defaultRequestData

  if (!withDispatcher) {
    throw Error('You need to define a withDispatcher hoc passing a dispatch function')
  }

  class _withLogin extends PureComponent {
    constructor(props) {
      super(props)
      const { initialCurrentUser } = props
      this.state = {
        canRenderChildren: false,
        currentUser: initialCurrentUser
      }
    }

    componentDidMount = () => {
      const { dispatch, history, location } = this.props
      const { canRenderChildren, currentUser } = this.state

      // we are logged already, so it is already cool:
      // we can render children
      if (currentUser !== null && !canRenderChildren) {
        this.setState({ canRenderChildren: true })
      }

      dispatch(
        requestData({
          apiPath: currentUserApiPath,
          handleFail: () => {
            if (failRedirect) {
              let computedFailRedirect = failRedirect
              if (typeof failRedirect === 'function') {
                computedFailRedirect = failRedirect(this.props)
              }
              if (computedFailRedirect === location.pathname) {
                return
              }
              history.push(computedFailRedirect)
              return
            }
            // if the login failed and we have no failRedirect and that the login
            // is not required we can still render what
            // is in the page
            if (!isRequired) {
              this.setState({ canRenderChildren: true })
            }
          },
          handleSuccess: (state, action) => {
            const { payload: { datum } } = action

            if (successRedirect) {
              let computedSuccessRedirect = successRedirect
              if (typeof successRedirect === 'function') {
                computedSuccessRedirect = successRedirect(this.props)
              }
              if (computedSuccessRedirect === location.pathname) {
                return
              }
              history.push(computedSuccessRedirect)
              return
            }

            this.setState({
              canRenderChildren: true,
              currentUser: resolveCurrentUser(datum)
            })
          },
          resolve: resolveCurrentUser
        }))
    }

    render() {
      const { canRenderChildren, currentUser } = this.state

      if (
        !canRenderChildren ||
        (isRequired && !currentUser)
      ) {
        return null
      }

      return (
        <WrappedComponent
          {...this.props}
          currentUser={currentUser}
        />
      )
    }
  }

  _withLogin.defaultProps = {
    initialCurrentUser: null
  }

  _withLogin.propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape().isRequired,
    initialCurrentUser: PropTypes.shape(),
    location: PropTypes.shape().isRequired,
  }

  return withRouter(withDispatcher(_withLogin))
}

export default withLogin
