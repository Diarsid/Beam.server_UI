var React =
    require("react");
var ReactDOM =
    require('react-dom');
var Provider =
    require('react-redux').Provider;
var Router =
    require('react-router').Router;
var Route =
    require('react-router').Route;

/* custom modules */

var LandingPage =
    require("./view/components/root/landing-page.js");
var MainPage =
    require("./view/components/root/main-page.js");
var WelcomePageContainer =
    require("./view/components/root/welcome-page-container.js");
var LoginPage =
    require("./view/components/root/login-page.js");
var ErrorPageContainer =
    require("./view/components/root/error-page-container.js");
var RegistrationPage =
    require("./view/components/root/registration-page.js");
var actions =
    require("./state/actions/actions.js");
var appStore =
    require("./state/store/app-store.js");
var dispatch = appStore.dispatch;
var ajaxJwtValidation =
    require("./network/prepared-ajax-calls/validate-jwt-call.js");
var storage =
    require("./state/store/app-local-storage.js");
var hooks =
    require("./global-util/router-navigation.js").routesHooks;
var routes =
    require("./global-util/router-navigation.js").routes;
var navigateTo =
    require("./global-util/router-navigation.js").navigateTo;
var authStatusListener =
    require("./global-util/authentication-status.js").listenToUserStatus;
var appUrlState =
    require("./global-util/app-url-state.js");
var userStatusListener =
    require("./state/listeners/jwt-refresh-listener.js");
var preparedHistory =
    require("./global-util/prepared-history.js");

/* module code */

function mainLog(message) {
    console.log('[APP] [MAIN] ' + message);
}

var jwtValidationCallbacks = {
    onStart : function () {
    },
    onJwtValid : function () {
        dispatch(actions.loggedInAction(storage.parseUserFromJwt()));
        //navigateTo(routes.mainRoute);
    },
    onJwtInvalid : function () {
        storage.deleteJwt();
        //navigateTo(routes.welcomeRoute);
    },
    onJwtExpired : function () {
        storage.deleteJwt();
        //navigateTo(routes.loginRoute);
    }
};

function connectGlobalListenerToState() {
    var globalStateSubscription = appStore.subscribe(() => {
        authStatusListener(appStore.getState());
        userStatusListener(appStore.getState());
    });
}

function initialAppUserInfoProcessing() {
    if ( storage.hasJwt() ) {
        ajaxJwtValidation(storage.getJwt(), {
            onStart : () => {},
            onJwtValid : () => {dispatch(actions.loggedInAction(storage.parseUserFromJwt()));},
            onJwtInvalid : () => {
                dispatch(actions.autologinFailedAction());
                storage.deleteJwt();
            },
            onJwtExpired : () => {
                dispatch(actions.autologinFailedAction());
                storage.deleteJwt();
            }
        });
    } else {
        dispatch(actions.autologinFailedAction());
    }
    //else {
    //    navigateTo(routes.welcomeRoute);
    //}
}

function renderView() {
    ReactDOM.render(
        <Provider store={appStore} >
            <Router history={preparedHistory}>
                <Route
                    path={routes.landingRoute}
                    component={LandingPage} />
                <Route
                    path={routes.welcomeRoute}
                    onEnter={hooks.welcomeRoute.onEnterHook}
                    onLeave={hooks.welcomeRoute.onLeaveHook}
                    component={WelcomePageContainer} />
                <Route
                    path={routes.mainRoute}
                    onEnter={hooks.mainRoute.onEnterHook}
                    onLeave={hooks.mainRoute.onLeaveHook}
                    component={MainPage} />
                <Route
                    path={routes.loginRoute}
                    onEnter={hooks.loginRoute.onEnterHook}
                    onLeave={hooks.loginRoute.onLeaveHook}
                    component={LoginPage} />
                <Route
                    path={routes.registrationRoute}
                    onEnter={hooks.registrationRoute.onEnterHook}
                    onLeave={hooks.registrationRoute.onLeaveHook}
                    component={RegistrationPage} />
                <Route
                    path={routes.errorRoute}
                    onEnter={routes.errorRoute.onEnterHook}
                    onLeave={routes.errorRoute.onLeaveHook}
                    component={ErrorPageContainer} />
            </Router>
        </Provider>,
        document.getElementById('content')
    );
}

function initialNavigation() {
    if ( appUrlState.relativePath == "" ) {
        navigateTo(routes.welcomeRoute);
    } else {
        switch ( appUrlState.relativePath ) {
            case routes.loginRoute :
                navigateTo(routes.loginRoute);
                break;
            case routes.registrationRoute :
                navigateTo(routes.registrationRoute);
                break;
            case routes.welcomeRoute :
                navigateTo(routes.welcomeRoute);
                break;
            case routes.mainRoute :
                navigateTo(routes.mainRoute);
                break;

            default :
                navigateTo(routes.welcomeRoute);
                break;
        }
    }
}

function startApp() {
    mainLog("start app...");
    dispatch(actions.appStartsAction());
    initialAppUserInfoProcessing();
    connectGlobalListenerToState();
    renderView();
    initialNavigation();
}

startApp();