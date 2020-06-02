import { requestData as defaultRequestData } from 'fetch-normalize-data'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

import resolveCurrentUser from './resolveCurrentUser'


export default (config = {}) => WrappedComponent => {
  const {
    withDispatcher,
    ...requestDataConfig
  } = config
  const { handleFail, handleSuccess } = requestDataConfig
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
        canRenderChildren: typeof initialCurrentUser !== 'undefined',
        currentUser: initialCurrentUser
      }
    }

    componentDidMount = () => {
      const { dispatch } = this.props
      const { canRenderChildren, currentUser } = this.state

      // we are logged already, so it is already cool:
      // we can render children
      if (currentUser !== null && !canRenderChildren) {
        this.setState({ canRenderChildren: true })
      }

      dispatch(requestData({
        apiPath: currentUserApiPath,
        resolve: resolveCurrentUser,
        ...requestDataConfig,
        handleFail: this.handleFailLogin,
        handleSuccess: this.handleSuccessLogin
      }))
    }

    handleFailLogin = (state, action) => {
      if (!isRequired) {
        this.setState(
          { canRenderChildren: true },
          () => {
            if (handleFail) handleFail(state, action, this.props)
          }
        )
        return
      }

      if (handleFail) {
        handleFail(state, action, this.props)
      }

    }

    handleSuccessLogin = (state, action) => {
      const { payload: { datum } } = action

      this.setState(
        {
          canRenderChildren: true,
          currentUser: resolveCurrentUser(datum)
        },
        () => {
          if (handleSuccess) handleSuccess(state, action, this.props)
        }
      )
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
    initialCurrentUser: PropTypes.shape(),
  }

  return withDispatcher(_withLogin)
}
